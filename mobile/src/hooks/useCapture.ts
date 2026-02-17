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
import type { CapturedPhoto, CapturedVideo, UploadStatus, Capture } from '@shared/types';
import { readAsStringAsync } from 'expo-file-system';
import { Buffer } from 'buffer';
import { applyWatermark } from '../utils/watermark';
import { appendBumper } from '../utils/video_bumper';
import { createFingerprint } from '../utils/neural_hash';

export function useCapture() {
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

      // Only request TEEPIN Hardware Attestation if user has GOLD (Seeker/MWA) identity
      const currentIdentity = IdentityService.getCurrentUser();
      const isGoldGrade = currentIdentity?.provenanceGrade === 'GOLD' && currentIdentity?.solanaAddress;

      if (isGoldGrade) {
        try {
          const attestation = await SolanaService.signCaptureHash(contentHash);
          if (attestation) {
            teepinSignature = attestation.signature;
            teepinPublicKey = attestation.publicKey;
            blobLog.success(`✅ TEEPIN Signature generated`);
          }
        } catch (error) {
          blobLog.warn('⚠️ TEEPIN Hardware Attestation failed:', error);

          if (CAPTURE_CONFIG.STRICT_PROVENANCE) {
            throw new Error('Strict Provenance Check Failed: Hardware Signature Required. Please retry.');
          }
        }
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
      // STEP 2: PRIVACY LAYER (SEAL ENCRYPTION)
      // ========================================================================

      let walrusData;

      if (isSovereign) {
        blobLog.info('🔒 Step 2/4: Encrypting capture via Seal...');
        updateStatus(captureId, 'uploading');

        // Read file as base64 and convert to bytes
        blobLog.info('    Reading file for encryption...');
        const base64 = await readAsStringAsync(capture.uri, { encoding: 'base64' });
        const bytes = new Uint8Array(Buffer.from(base64, 'base64'));

        // Encrypt via Seal using user email/identity
        const user = IdentityService.getCurrentUser();
        const identity = user?.solanaAddress || 'anonymous-seeker';

        const encryptedBytes = await SealService.getInstance().encrypt(bytes, identity);
        console.log('✅ Capture encrypted client-side');

        // Upload encrypted data
        walrusData = await WalrusService.uploadData(encryptedBytes);
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

      const identityUser = IdentityService.getCurrentUser();
      const creatorAddress = identityUser?.suiAddress || identityUser?.solanaAddress || 'anonymous-seeker';
      const keypair = IdentityService.getSuiKeypair();

      console.log('   👤 Identity Context:', {
        user: identityUser,
        creator: creatorAddress,
        hasKeypair: !!keypair,
        keypairAddress: keypair?.toSuiAddress()
      });

      // Record captures metadata including TEEPIN signature
      const suiData = await SuiService.recordCapture(captureWithWalrus, walrusData, creatorAddress, keypair);

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
      console.log('  - Sui Transaction:', suiData.digest);
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