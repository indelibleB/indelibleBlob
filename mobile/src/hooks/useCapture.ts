/**
 * ============================================================================
 * useCapture Hook
 * ============================================================================
 * 
 * Manages capture processing pipeline: upload to Walrus → record on Sui.
 * 
 * RESPONSIBILITIES:
 * - Upload captures to Walrus testnet
 * - Record metadata on Sui blockchain
 * - Update capture status throughout pipeline
 * - Handle errors and retries
 * - Queue multiple captures for processing
 * 
 * USAGE:
 * const { processCapture, processingQueue } = useCapture();
 */

import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { WalrusService } from '@shared/services/walrus';
import { SuiService } from '@shared/services/sui';
import * as Haptics from 'expo-haptics';
// LAZY IMPORT: @mysten/seal crashes Hermes with "property is not configurable"
// when loaded at module init time. Defer to runtime only when sovereign mode is used.
// import { SealService } from '@shared/services/seal';
import { blobLog } from '../utils/logger';
import { CAPTURE_CONFIG } from '../constants/config';
import { IdentityService } from '../services/identity';
import { SolanaService } from '../services/solana';
import { SensorService } from '../services/sensors';
import { TrustManager } from '../services/trust';
import { SensorForensics } from '../services/forensics';
import { hashFile } from '../utils/helpers';
import { useSuiWallet } from '../contexts/SuiWalletContext';
import { useSlushWallet } from './useSlushWallet';
// Gas manager no longer needed — Enoki sponsors all transactions
// import { activeGasManager } from '../services/gas';
import type { CapturedPhoto, CapturedVideo, UploadStatus, Capture } from '@shared/types';
import { readAsStringAsync } from 'expo-file-system';
import { Buffer } from 'buffer';
import { applyWatermark } from '../utils/watermark';
import { appendBumper } from '../utils/video_bumper';
import { createFingerprint } from '../utils/neural_hash';
import { SecureStorage, SECURE_STORAGE_KEYS } from '../services/secureStorage';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { decodeSuiPrivateKey } from '@mysten/sui/cryptography';
import { getZkLoginSignature } from '@mysten/sui/zklogin';

export function useCapture() {
  const { client } = useSuiWallet();
  const { provider } = useSlushWallet();

  // ============================================================================
  // STATE
  // ============================================================================

  const [processingQueue, setProcessingQueue] = useState<string[]>([]);
  const [processingStatus, setProcessingStatus] = useState<Record<string, UploadStatus>>({});

  // ============================================================================
  // UPDATE CAPTURE STATUS
  // ============================================================================

  const updateStatus = useCallback((captureUri: string, status: UploadStatus) => {
    setProcessingStatus(prev => ({
      ...prev,
      [captureUri]: status,
    }));
  }, []);

  // ============================================================================
  // PROCESS SINGLE CAPTURE
  // ============================================================================

  const processCapture = useCallback(async (
    capture: CapturedPhoto | CapturedVideo,
    isSovereign: boolean = false,
    onStatusChange?: (status: UploadStatus, capture: CapturedPhoto | CapturedVideo) => void
  ): Promise<boolean> => {
    const captureId = capture.uri;

    try {
      blobLog.info('🔄 Starting capture processing pipeline...');

      // Add to processing queue
      setProcessingQueue(prev => [...prev, captureId]);

      // ========================================================================
      // STEP 1: COMPUTING CONTENT HASH & TEEPIN ATTESTATION
      // ========================================================================

      blobLog.info('🛡️  Step 1/4: Computing content hash & TEEPIN signature...');
      updateStatus(captureId, 'verifying');

      // [NEW] Apply Verification Stamp (Watermark/Resize)
      // This ensures the hash represents the "Stamped" version
      // [NEW] Unified Signify Pipeline
      // 1. Photos: Apply "Glassmorphic Passport" (Watermark)
      // 2. Videos: Append "Holographic Bumper" (Outro)
      let visualStampedUri = capture.uri[0] === 'f' ? capture.uri : `file://${capture.uri}`; // Ensure file:// prefix

      if (capture.uri.endsWith('.mp4')) {
        visualStampedUri = await appendBumper(capture.uri);
      } else {
        visualStampedUri = await applyWatermark(capture.uri);
      }

      const contentHash = await hashFile(visualStampedUri);

      if (isSovereign) {
        blobLog.info(`🛡️ 🛡️ Requesting TEEPIN Hardware Attestation for hash: ${contentHash}`);
      }

      let teepinSignature = '';
      let teepinPublicKey = '';

      // Fetch current identity to grab the bound Seed Vault address
      const currentIdentity = IdentityService.getCurrentUser();
      const isGoldGrade = currentIdentity?.provenanceGrade === 'GOLD' && currentIdentity?.solanaAddress;

      if (isGoldGrade && currentIdentity) {
        // [ARCHITECTURE FIX]: We ALREADY bound this session to the Seed Vault when "Start Session" was pressed.
        // We do NOT want to interrupt the user with an active MWA popup for every single photo.
        // The individual capture transactions will be compiled and signed in the background/batch at the end of the session.
        teepinSignature = currentIdentity.sessionBindSignature || 'pending_batch_signature';
        teepinPublicKey = currentIdentity.solanaAddress || '';
        blobLog.info('ℹ️ Attaching bound session identity to capture (No active MWA popup required)');
      } else {
        blobLog.info('ℹ️ Skipping TEEPIN attestation (not GOLD grade)');
      }

      // [NEW] Get Device Trust Profile
      const trustProfile = await TrustManager.getDeviceProfile();
      const currentSensors = SensorService.getSensorData();

      // [NEW] Run Forensics Check
      let forensicScore = 100;
      let anomalies: string[] = [];
      if (currentSensors) {
        const result = await SensorForensics.validateMovement(currentSensors, capture.gpsData);
        forensicScore = result.confidence;
        anomalies = result.anomalies;
      }

      // [SECURITY REQUIREMENT] Fail early if validation checks fail
      if (forensicScore < 100) {
        blobLog.error(`❌ Forensic validation failed (Score: ${forensicScore}%). Anomalies: ${anomalies.join(', ')}`);
        throw new Error(`Strict Forensic Validation Failed: ${anomalies[0] || 'Unknown anomaly detected'}`);
      }
      blobLog.success(`✅ Forensic validation passed: ${forensicScore}%`);

      // [NEW] Generate Neural Fingerprint (pHash) for Video/Image
      const visualUri = capture.uri.endsWith('.mp4') ? visualStampedUri : visualStampedUri; // For video, we might want to hash a frame?
      // NOTE: For Video, we currently hash the *Video File* with SHA-256. 
      // For pHash, we need a thumbnail. we will generate one if it's a video.
      let fingerprint = '0000000000000000';
      try {
        if (capture.uri.endsWith('.mp4')) {
          // TODO: Extract frame for video fingerprinting. using '000' for now or the thumbnail if available?
          // For now, we skip pHash for video until we add frame extraction.
          blobLog.info('⚠️ Video pHash pending frame extraction implementation.');
        } else {
          fingerprint = await createFingerprint(visualStampedUri);
        }
      } catch (e) {
        blobLog.warn('Fingerprint skipped', e);
      }

      const captureWithAttestation = {
        ...capture,
        contentHash,
        neuralHash: fingerprint, // <--- ADDED
        isSovereign,
        teepinSignature,
        teepinPublicKey,
        sensorData: currentSensors,
        provenanceGrade: trustProfile.grade,
        forensicScore,
        anomalies,
      };

      // ========================================================================
      // IDENTITY (needed for both Seal encryption and Sui recording)
      // ========================================================================

      const identityUser = IdentityService.getCurrentUser();
      const suiAddr = typeof identityUser?.suiAddress === 'string' ? identityUser.suiAddress : null;
      const solAddr = typeof identityUser?.solanaAddress === 'string' ? identityUser.solanaAddress : null;
      const creatorAddress = suiAddr || '0x0000000000000000000000000000000000000000000000000000000000000000';

      // ========================================================================
      // STEP 2: PRIVACY LAYER (SEAL ENCRYPTION)
      // ========================================================================

      let walrusData;
      let sealNonce: Uint8Array | undefined;

      if (isSovereign) {
        blobLog.info('🔒 Step 2/4: Encrypting capture via Seal (Sovereign Mode)...');
        updateStatus(captureId, 'uploading');

        // Lazy import: @mysten/seal crashes Hermes at module init, so load only when needed
        const { SealService } = await import('@shared/services/seal');

        // Generate unique nonce for this capture (CSPRNG, 32 bytes)
        sealNonce = SealService.generateNonce();
        blobLog.info(`    Generated Seal nonce: ${Array.from(sealNonce.slice(0, 4)).map(b => b.toString(16).padStart(2, '0')).join('')}...`);

        // Read file as base64 and convert to bytes
        blobLog.info('    Reading file for encryption...');
        const base64 = await readAsStringAsync(capture.uri, { encoding: 'base64' });
        const bytes = new Uint8Array(Buffer.from(base64, 'base64'));

        const { encryptedObject } = await SealService.getInstance().encrypt(
          bytes,
          creatorAddress,
          sealNonce
        );
        blobLog.info('✅ Capture encrypted client-side via Seal IBE');

        // Upload encrypted data to Walrus
        walrusData = await WalrusService.uploadData(encryptedObject);
      } else {
        blobLog.info('📤 Step 2/4: Uploading public capture to Walrus...');
        updateStatus(captureId, 'uploading');
        walrusData = await WalrusService.uploadFile(capture.uri);
      }

      if (!walrusData) {
        throw new Error('Walrus upload failed');
      }

      blobLog.success(`✅ Walrus upload successful: ${walrusData.blobId}`);

      const captureWithWalrus = {
        ...captureWithAttestation,
        walrusData,
        sealNonce: sealNonce ? Array.from(sealNonce) : undefined,
        uploadStatus: 'stored' as UploadStatus,
        recordedAt: Date.now(),
      };

      // Provide success feedback for storage
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      updateStatus(captureId, 'stored');
      onStatusChange?.('stored', captureWithWalrus as CapturedPhoto | CapturedVideo);

      // ========================================================================
      // STEP 3: RECORDING ON SUI
      // ========================================================================

      blobLog.info('⛓️  Step 3/4: Recording metadata on Sui blockchain...');
      updateStatus(captureId, 'verifying');
      onStatusChange?.('verifying', captureWithWalrus);

      // Gas is handled by Enoki Sponsored Transactions — no faucet needed
      blobLog.info('⛓️  Step 3a: Using Enoki sponsored transactions (gas-free for user)');

      const keypair = undefined; // Legacy local keypair removed

      blobLog.info('   👤 Identity Context:', {
        user: identityUser,
        creator: creatorAddress,
        suiAddressValid: typeof suiAddr === 'string',
        solanaAddressValid: typeof solAddr === 'string',
        hasKeypair: false,
        keypairAddress: undefined
      });

      // Use Ephemeral Session Key if available
      const ephemeralSender = identityUser?.ephemeralKeypair?.getPublicKey().toSuiAddress();

      // Record captures metadata including TEEPIN signature
      blobLog.info('⛓️  Step 3 ENTER: Calling SuiService.recordCapture...');
      const suiData = await SuiService.recordCapture(
        captureWithWalrus,
        walrusData,
        creatorAddress,
        async (txArgs) => {
          // ====================================================================
          // ZKLOGIN: Silently sign & execute using Ephemeral Key + ZK Proof
          // ====================================================================

          // HACK/NOTE: The `IdentityService` currently doesn't store the `ephemeralKeypair` 
          // in memory after the Slush pivot. We MUST look for the ZK proof in SecureStorage
          // to determine if we are in a zkLogin session.
          const zkProofStr = await SecureStorage.getSecureItem(SECURE_STORAGE_KEYS.ZKLOGIN_PROOF);

          if (zkProofStr) {
            // ================================================================
            // ENOKI SPONSORED TRANSACTION + ZKLOGIN
            // ================================================================
            //
            // ⚠️ HACKATHON TESTNET DEMO — SECURITY ARCHITECTURE NOTE ⚠️
            //
            // The ENOKI_SPONSOR_KEY (private) is embedded client-side here
            // ONLY for this Monolith hackathon testnet demonstration.
            //
            // PRODUCTION ARCHITECTURE:
            // - Private sponsor key lives on a backend server (e.g. Vercel
            //   Edge Function) that proxies sponsorship requests
            // - Mobile app sends unsigned txKindBytes to our backend
            // - Backend authenticates the user, applies rate limits, and
            //   calls Enoki's sponsor API with the private key
            // - This prevents key extraction from decompiled APKs
            //
            // This testnet-only key will be BURNED and permanently revoked
            // before any mainnet deployment. A fresh private key will be
            // generated and secured server-side with proper infrastructure.
            //
            // ================================================================
            blobLog.info('📦 Using Enoki Sponsored Transaction + zkLogin...');
            let currentStep = '3b: setSender';

            try {
              const ENOKI_SPONSOR_KEY = process.env.EXPO_PUBLIC_ENOKI_SPONSOR_KEY;
              if (!ENOKI_SPONSOR_KEY) {
                throw new Error('Missing ENOKI_SPONSOR_KEY for sponsored transactions');
              }

              // Step 3b: Set sender
              txArgs.transaction.setSender(creatorAddress);

              // Step 3c: Build transaction KIND bytes (no gas — Enoki sponsors it)
              currentStep = '3c: build txKind';
              const txKindBytes = await txArgs.transaction.build({ client, onlyTransactionKind: true });
              blobLog.info('📦 Step 3c: Transaction kind built OK, size:', txKindBytes.length);

              // Step 3d: Request sponsorship from Enoki
              currentStep = '3d: Enoki sponsor';
              const sponsorRes = await fetch('https://api.enoki.mystenlabs.com/v1/transaction-blocks/sponsor', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${ENOKI_SPONSOR_KEY}`,
                },
                body: JSON.stringify({
                  network: 'testnet',
                  transactionBlockKindBytes: Buffer.from(txKindBytes).toString('base64'),
                  sender: creatorAddress,
                  allowedAddresses: [creatorAddress],
                }),
              });

              if (!sponsorRes.ok) {
                const errText = await sponsorRes.text();
                throw new Error(`Enoki sponsor failed (${sponsorRes.status}): ${errText}`);
              }

              const sponsorData = await sponsorRes.json();
              const { digest, bytes: sponsoredTxBytes } = sponsorData.data || sponsorData;
              blobLog.info('📦 Step 3d: Enoki sponsorship received, digest:', digest);

              // Step 3e: Rehydrate ephemeral keypair
              currentStep = '3e: rehydrate keypair';
              const ephemeralKeySecret = await SecureStorage.getSecureItem(SECURE_STORAGE_KEYS.ZKLOGIN_EPHEMERAL);
              const maxEpochStr = await SecureStorage.getSecureItem(SECURE_STORAGE_KEYS.ZKLOGIN_MAX_EPOCH);

              if (!ephemeralKeySecret || !maxEpochStr) {
                throw new Error('Missing ephemeral key data for ZK Execution');
              }

              const { secretKey } = decodeSuiPrivateKey(ephemeralKeySecret);
              const ephemeralKeyPair = Ed25519Keypair.fromSecretKey(secretKey);

              // Step 3f: Parse ZK proof
              currentStep = '3f: parse zkProof';
              const zkProofRaw = JSON.parse(zkProofStr);
              const zkProof = zkProofRaw.data || zkProofRaw;

              // Step 3g: Sign the SPONSORED tx bytes with ephemeral key
              currentStep = '3g: ephemeral sign';
              const sponsoredBytes = Uint8Array.from(Buffer.from(sponsoredTxBytes, 'base64'));
              const { signature: ephemeralSig } = await ephemeralKeyPair.signTransaction(sponsoredBytes);

              // Step 3h: Assemble zkLogin signature
              currentStep = '3h: zkLoginSig';
              const zkLoginSig = getZkLoginSignature({
                inputs: {
                  proofPoints: zkProof.proofPoints,
                  issBase64Details: zkProof.issBase64Details,
                  headerBase64: zkProof.headerBase64,
                  addressSeed: zkProof.addressSeed,
                },
                maxEpoch: Number(maxEpochStr),
                userSignature: ephemeralSig,
              });

              // Step 3i: Execute sponsored transaction via Enoki
              currentStep = '3i: Enoki execute';
              const execRes = await fetch(`https://api.enoki.mystenlabs.com/v1/transaction-blocks/sponsor/${digest}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${ENOKI_SPONSOR_KEY}`,
                },
                body: JSON.stringify({
                  signature: zkLoginSig,
                }),
              });

              if (!execRes.ok) {
                const errText = await execRes.text();
                throw new Error(`Enoki execute failed (${execRes.status}): ${errText}`);
              }

              const execData = await execRes.json();
              const txDigest = execData.data?.digest || execData.digest || digest;
              blobLog.success('✅ Step 3i: Sponsored transaction executed! Digest:', txDigest);

              // Fetch full effects for the caller
              return await client.getTransactionBlock({
                digest: txDigest,
                options: { showEffects: true, showObjectChanges: true },
              });

            } catch (stepErr: any) {
              throw new Error(`[Step ${currentStep}] ${stepErr?.message || stepErr}`);
            }

          } else {
            // ====================================================================
            // FALLBACK: WalletConnect native app popup
            // ====================================================================
            blobLog.info('📲 Prompting user to sign via WalletConnect...');
            if (!provider) {
              throw new Error('WalletConnect provider not initialized. Cannot sign transaction.');
            }

            const rawTxBytes = await txArgs.transaction.build({ client });
            const txB64 = Buffer.from(rawTxBytes).toString('base64');

            return await provider.request({
              method: 'sui_signAndExecuteTransaction',
              params: {
                transaction: txB64,
                address: creatorAddress,
                options: { showEffects: true, showObjectChanges: true }
              }
            }, 'sui:testnet');
          }
        },
        undefined // We don't send the ephemeralSender here, we let the smart contract rely on the true zkLogin derived address
      );

      if (!suiData) {
        throw new Error('Sui recording failed');
      }

      blobLog.info('✅ Sui recording successful:', suiData.digest);

      // Update capture with Sui data
      const finalCapture = {
        ...captureWithWalrus,
        suiData,
        uploadStatus: 'verified' as UploadStatus,
      };

      updateStatus(captureId, 'verified');
      onStatusChange?.('verified', finalCapture);

      // Provide final "On-Chain" tactile confirmation
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // ========================================================================
      // COMPLETE
      // ========================================================================

      blobLog.info('🎉 Capture processing complete!');
      blobLog.info('  - Walrus Blob ID:', walrusData.blobId);
      blobLog.info('  - Walrus URL:', `${CAPTURE_CONFIG.WALRUS_AGGREGATOR_URL}/v1/blobs/${walrusData.blobId}`);
      blobLog.info('  - Sui Transaction:', suiData.digest);
      blobLog.info('  - Sui Explorer:', `https://suiscan.xyz/testnet/tx/${suiData.digest}`);
      blobLog.info('  - Content Hash:', contentHash);

      // Remove from processing queue
      setProcessingQueue(prev => prev.filter(id => id !== captureId));

      return true;

    } catch (error) {
      blobLog.error('❌ Capture processing failed:', error);

      updateStatus(captureId, 'failed');
      onStatusChange?.('failed', capture);

      // Remove from processing queue
      setProcessingQueue(prev => prev.filter(id => id !== captureId));

      Alert.alert(
        'Processing Failed',
        `Failed to process capture: ${error instanceof Error ? error.message : 'Unknown error'}`
      );

      // Re-throw strict errors so the UI can handle the retry logic
      if (error instanceof Error && error.message.includes('Strict Provenance')) {
        throw error;
      }

      return false;
    }
  }, [updateStatus]);

  // ============================================================================
  // PROCESS MULTIPLE CAPTURES IN PARALLEL
  // ============================================================================

  const processBatch = useCallback(async (
    captures: (CapturedPhoto | CapturedVideo)[],
    onStatusChange?: (status: UploadStatus, capture: CapturedPhoto | CapturedVideo) => void
  ): Promise<boolean[]> => {
    blobLog.info(`🔄 Processing batch of ${captures.length} captures...`);

    // OPTIMIZED: Run in batches of 3 to prevent memory/network overload
    const BATCH_SIZE = 3;
    const results: boolean[] = [];

    for (let i = 0; i < captures.length; i += BATCH_SIZE) {
      const batch = captures.slice(i, i + BATCH_SIZE);
      const batchPromises = batch.map(capture =>
        processCapture(capture, false, onStatusChange)
      );
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    const successCount = results.filter(r => r).length;
    blobLog.info(`✅ Batch processing complete: ${successCount}/${captures.length} successful`);

    return results;
  }, [processCapture]);

  // ============================================================================
  // GET CAPTURE STATUS
  // ============================================================================

  const getStatus = useCallback((captureUri: string): UploadStatus => {
    return processingStatus[captureUri] || 'local';
  }, [processingStatus]);

  // ============================================================================
  // CLEAR PROCESSING QUEUE
  // ============================================================================

  const clearQueue = useCallback(() => {
    setProcessingQueue([]);
    setProcessingStatus({});
    blobLog.info('🧹 Processing queue cleared');
  }, []);

  // ============================================================================
  // RETURN HOOK API
  // ============================================================================

  return {
    // State
    processingQueue,
    processingStatus,

    // Actions
    processCapture,
    processBatch,
    getStatus,
    clearQueue,
  };
}