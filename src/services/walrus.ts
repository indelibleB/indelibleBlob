/**
 * ============================================================================
 * WALRUS SERVICE - DECENTRALIZED STORAGE
 * ============================================================================
 * 
 * Handles all interactions with Walrus decentralized storage network.
 * 
 * WHAT IS WALRUS?
 * Walrus is a decentralized blob storage system built on Sui blockchain.
 * - Stores large files (photos, videos) off-chain
 * - Provides content-addressed storage (immutable)
 * - Distributed across multiple storage nodes
 * - Integrates with Sui for metadata and access control
 * 
 * ARCHITECTURE:
 * - Publisher: Uploads blobs and gets blob ID
 * - Aggregator: Retrieves blobs by blob ID
 * - Epochs: Time-based storage periods
 * 
 * SECURITY:
 * - All uploads are public (no encryption by default)
 * - For private data, encrypt before uploading
 * - Blob IDs are deterministic (content-addressed)
 * - No authentication required for testnet
 *  * FIXES APPLIED:
 * - Uses expo-file-system/legacy for React Native compatibility
 * - Correct endpoint: /v1/blobs
 * - Proper base64 to binary conversion
 * - No duplicate variable declarations
 * - Enhanced error handling and logging
 * 
 * API DOCUMENTATION:
 * https://docs.walrus.site/
 */

import { readAsStringAsync, getInfoAsync } from 'expo-file-system/legacy';
import { CAPTURE_CONFIG } from '../constants/config';
import type { WalrusData } from '../types';

/**
 * Custom error class for Walrus upload failures
 */
export class WalrusUploadError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public responseBody?: string
  ) {
    super(message);
    this.name = 'WalrusUploadError';
  }
}

/**
 * Walrus Service Class
 * 
 * Provides methods to interact with Walrus decentralized storage.
 */
class WalrusServiceClass {
  
  /**
   * Upload a file to Walrus storage
   * 
   * @param fileUri - Local file URI to upload
   * @returns WalrusData with blob ID and metadata
   */
  async uploadFile(fileUri: string): Promise<WalrusData> {
    const publisherUrl = CAPTURE_CONFIG.WALRUS_PUBLISHER_URL;
    
    console.log('📤 Uploading to Walrus...');
    console.log('   Publisher URL:', publisherUrl);
    console.log('   File URI:', fileUri);

    try {
      // ========================================================================
      // STEP 1: Get file info
      // ========================================================================
      
      console.log('   Getting file info...');
      const fileInfo = await getInfoAsync(fileUri);
      
      if (!fileInfo.exists) {
        throw new Error('File does not exist');
      }
      
      console.log('   File exists, size:', fileInfo.size, 'bytes');

      // ========================================================================
      // STEP 2: Read file as base64
      // ========================================================================
      
      console.log('   Reading file as base64...');
      const base64Data = await readAsStringAsync(fileUri, {
        encoding: 'base64',
      });
      
      console.log('   Base64 data length:', base64Data.length);

      // ========================================================================
      // STEP 3: Convert base64 to binary
      // ========================================================================
      
      console.log('   Converting to binary...');
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      console.log('   Binary conversion complete, bytes:', bytes.length);

      // ========================================================================
      // STEP 4: Upload to Walrus
      // ========================================================================
      
      console.log('   Uploading to Walrus...');
      const uploadUrl = `${publisherUrl}/v1/blobs`;
      console.log('   Upload URL:', uploadUrl);
      
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/octet-stream',
        },
        body: bytes,
      });

      console.log('   Response status:', uploadResponse.status);
      console.log('   Response status text:', uploadResponse.statusText);

      // ========================================================================
      // STEP 5: Handle response
      // ========================================================================
      
      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('   Error response body:', errorText);
        throw new WalrusUploadError(
          `Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`,
          uploadResponse.status,
          errorText
        );
      }

      const uploadResult = await uploadResponse.json();
      console.log('   Upload result:', JSON.stringify(uploadResult, null, 2));

      // ========================================================================
      // STEP 6: Extract blob ID from response
      // ========================================================================
      
      let blobId: string;
      let size: number = 0;
      
      if (uploadResult.newlyCreated) {
        // New blob was created
        blobId = uploadResult.newlyCreated.blobObject.blobId;
        size = uploadResult.newlyCreated.blobObject.size;
        console.log('   ✅ New blob created');
        console.log('      Blob ID:', blobId);
        console.log('      Size:', size, 'bytes');
        console.log('      Certified Epoch:', uploadResult.newlyCreated.blobObject.certifiedEpoch);
        
      } else if (uploadResult.alreadyCertified) {
        // Blob already exists
        blobId = uploadResult.alreadyCertified.blobId;
        console.log('   ✅ Blob already certified');
        console.log('      Blob ID:', blobId);
        console.log('      End Epoch:', uploadResult.alreadyCertified.endEpoch);
        
      } else {
        console.error('   ❌ Unexpected response format:', uploadResult);
        throw new WalrusUploadError('Unexpected response format', 500);
      }

      console.log('✅ Walrus upload successful!');
      console.log('   Final Blob ID:', blobId);

      return {
        blobId,
        size,
        uploadedAt: Date.now(),
      };

    } catch (error) {
      console.error('❌ Walrus upload failed:', error);
      
      if (error instanceof WalrusUploadError) {
        throw error;
      }
      
      // Wrap other errors
      throw new WalrusUploadError(
        error instanceof Error ? error.message : 'Unknown error',
        500
      );
    }
  }

  /**
   * Get the URL to retrieve a blob from Walrus
   * 
   * @param blobId - The Walrus blob ID
   * @returns URL to access the blob
   */
  getBlobUrl(blobId: string): string {
    const aggregatorUrl = CAPTURE_CONFIG.WALRUS_AGGREGATOR_URL;
    return `${aggregatorUrl}/v1/${blobId}`;
  }

  /**
   * Check if a blob exists in Walrus
   * 
   * @param blobId - The Walrus blob ID
   * @returns true if blob exists, false otherwise
   */
  async blobExists(blobId: string): Promise<boolean> {
    try {
      const url = this.getBlobUrl(blobId);
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.error('Error checking blob existence:', error);
      return false;
    }
  }

  /**
   * Download a blob from Walrus
   * 
   * @param blobId - The Walrus blob ID
   * @returns Blob data as Uint8Array
   */
  async downloadBlob(blobId: string): Promise<Uint8Array> {
    try {
      const url = this.getBlobUrl(blobId);
      console.log('📥 Downloading blob from:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      return new Uint8Array(arrayBuffer);
      
    } catch (error) {
      console.error('❌ Blob download failed:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const WalrusService = new WalrusServiceClass();

