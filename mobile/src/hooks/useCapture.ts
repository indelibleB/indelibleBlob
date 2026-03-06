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
import { SealService } from '@shared/services/seal';
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
      console.log('🔄 Starting capture processing pipeline...');

      // Add to processing queue
      setProcessingQueue(prev => [...prev, captureId]);

      // ========================================================================
      // STEP 1: COMPUTING CONTENT HASH & TEEPIN ATTESTATION
      // ========================================================================

      console.log('🛡️  Step 1/4: Computing content hash & TEEPIN signature...');
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
          console.log('⚠️ Video pHash pending frame extraction implementation.');
        } else {
          fingerprint = await createFingerprint(visualStampedUri);
        }
      } catch (e) {
        console.warn('Fingerprint skipped', e);
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
        console.log('✅ Capture encrypted client-side via Seal IBE');

        // Upload encrypted data to Walrus
        walrusData = await WalrusService.uploadData(encryptedObject);
      } else {
        console.log('📤 Step 2/4: Uploading public capture to Walrus...');
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

      console.log('⛓️  Step 3/4: Recording metadata on Sui blockchain...');
      updateStatus(captureId, 'verifying');
      onStatusChange?.('verifying', captureWithWalrus);

      const keypair = undefined; // Legacy local keypair removed

      console.log('   👤 Identity Context:', {
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
            console.log('📦 Delegating signature to Background Ephemeral Key & ZK Proof...');

            // The sender is the zkLogin-derived address
            txArgs.transaction.setSender(creatorAddress);
            const rawTxBytes = await txArgs.transaction.build({ client });

            // Rehydrate the ephemeral keypair and session data
            const ephemeralKeySecret = await SecureStorage.getSecureItem(SECURE_STORAGE_KEYS.ZKLOGIN_EPHEMERAL);
            const maxEpochStr = await SecureStorage.getSecureItem(SECURE_STORAGE_KEYS.ZKLOGIN_MAX_EPOCH);
            const randomnessStr = await SecureStorage.getSecureItem(SECURE_STORAGE_KEYS.ZKLOGIN_RANDOMNESS);

            if (!ephemeralKeySecret || !maxEpochStr || !randomnessStr) {
              throw new Error('Capture failed: Missing ephemeral key data for ZK Execution');
            }

            // getSecretKey() returns bech32 (suiprivkey1q...), not raw bytes
            const { secretKey } = decodeSuiPrivateKey(ephemeralKeySecret);
            const ephemeralKeyPair = Ed25519Keypair.fromSecretKey(secretKey);

            const zkProofRaw = JSON.parse(zkProofStr);

            // Enoki wraps proof in { data: { ... } }, public prover does not
            const zkProof = zkProofRaw.data || zkProofRaw;

            // [SECURITY FIX L-3] Sensitive object structures shouldn't be logged in prod
            // console.log('🔑 ZK Proof keys:', Object.keys(zkProof));
            // console.log('🔑 Has proofPoints:', !!zkProof.proofPoints);
            // console.log('🔑 Has addressSeed:', !!zkProof.addressSeed);

            // Sign the transaction bytes with the local ephemeral key
            const { signature: ephemeralSig } = await ephemeralKeyPair.signTransaction(rawTxBytes);

            // Assemble the mathematical proof that the ephemeral key is authorized
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

            // Execute it directly without prompting the user!
            return await client.executeTransactionBlock({
              transactionBlock: rawTxBytes,
              signature: zkLoginSig,
              options: { showEffects: true, showObjectChanges: true }
            });

          } else {
            // ====================================================================
            // FALLBACK: WalletConnect native app popup
            // ====================================================================
            console.log('📲 Prompting user to sign via WalletConnect...');
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

      console.log('✅ Sui recording successful:', suiData.digest);

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

      console.log('🎉 Capture processing complete!');
      console.log('  - Walrus Blob ID:', walrusData.blobId);
      console.log('  - Walrus URL:', `${CAPTURE_CONFIG.WALRUS_AGGREGATOR_URL}/v1/blobs/${walrusData.blobId}`);
      console.log('  - Sui Transaction:', suiData.digest);
      console.log('  - Sui Explorer:', `https://suiscan.xyz/testnet/tx/${suiData.digest}`);
      console.log('  - Content Hash:', contentHash);

      // Remove from processing queue
      setProcessingQueue(prev => prev.filter(id => id !== captureId));

      return true;

    } catch (error) {
      console.error('❌ Capture processing failed:', error);

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
    console.log(`🔄 Processing batch of ${captures.length} captures...`);

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
    console.log(`✅ Batch processing complete: ${successCount}/${captures.length} successful`);

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
    console.log('🧹 Processing queue cleared');
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