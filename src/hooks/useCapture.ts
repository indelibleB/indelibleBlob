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
import { WalrusService } from '../services/walrus';
import { SuiService } from '../services/sui';
import { hashFile } from '../utils/helpers';
import type { CapturedPhoto, CapturedVideo, UploadStatus } from '../types';

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
    onStatusChange?: (status: UploadStatus, capture: CapturedPhoto | CapturedVideo) => void
  ): Promise<boolean> => {
    const captureId = capture.uri;
    
    try {
      console.log('🔄 Starting capture processing pipeline...');
      
      // Add to processing queue
      setProcessingQueue(prev => [...prev, captureId]);
      
      // ========================================================================
      // STEP 1: UPLOADING TO WALRUS
      // ========================================================================
      
      console.log('📤 Step 1/3: Uploading to Walrus...');
      updateStatus(captureId, 'uploading');
      onStatusChange?.('uploading', capture);
      
      const walrusData = await WalrusService.uploadFile(capture.uri);
      
      if (!walrusData) {
        throw new Error('Walrus upload failed');
      }
      
      console.log('✅ Walrus upload successful:', walrusData.blobId);
      
      // Update capture with Walrus data
      const captureWithWalrus = {
        ...capture,
        walrusData,
        uploadStatus: 'stored' as UploadStatus,
      };
      
      updateStatus(captureId, 'stored');
      onStatusChange?.('stored', captureWithWalrus);
      
      // ========================================================================
      // STEP 2: COMPUTING CONTENT HASH
      // ========================================================================
      
      console.log('🔐 Step 2/3: Computing content hash...');
      const contentHash = await hashFile(capture.uri);
      
      const captureWithHash = {
        ...captureWithWalrus,
        contentHash,
      };
      
      console.log('✅ Content hash computed:', contentHash);
      
      // ========================================================================
      // STEP 3: RECORDING ON SUI
      // ========================================================================
      
      console.log('⛓️  Step 3/3: Recording on Sui blockchain...');
      updateStatus(captureId, 'verifying');
      onStatusChange?.('verifying', captureWithHash);
      
      const suiData = await SuiService.recordCapture(captureWithHash, walrusData);
      
      if (!suiData) {
        throw new Error('Sui recording failed');
      }
      
      console.log('✅ Sui recording successful:', suiData.digest);
      
      // Update capture with Sui data
      const finalCapture = {
        ...captureWithHash,
        suiData,
        uploadStatus: 'verified' as UploadStatus,
      };
      
      updateStatus(captureId, 'verified');
      onStatusChange?.('verified', finalCapture);
      
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
    
    const promises = captures.map(capture => 
      processCapture(capture, onStatusChange)
    );
    
    const results = await Promise.all(promises);
    
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