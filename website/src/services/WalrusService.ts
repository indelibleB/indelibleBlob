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

import { CAPTURE_CONFIG } from '@shared/constants/config';
import type { WalrusData } from '@shared/types';

/**
 * Custom error class for Walrus upload failures
 */
export class WalrusUploadError extends Error {
  statusCode?: number;
  responseBody?: string;

  constructor(message: string, statusCode?: number, responseBody?: string) {
    super(message);
    this.name = 'WalrusUploadError';
    this.statusCode = statusCode;
    this.responseBody = responseBody;
  }
}

/**
 * Walrus Service Class
 * 
 * Provides methods to interact with Walrus decentralized storage.
 */
class WalrusServiceClass {

  /**
   * Upload raw data buffer to Walrus storage
   * 
   * @param data - Uint8Array of data to upload
   * @returns WalrusData with blob ID and metadata
   */
  async uploadData(data: Uint8Array): Promise<WalrusData> {
    const publisherUrl = CAPTURE_CONFIG.WALRUS_PUBLISHER_URL;
    console.log('📤 Uploading raw buffer to Walrus...');

    try {
      const uploadUrl = `${publisherUrl}/v1/blobs`;
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/octet-stream',
        },
        body: data as unknown as BodyInit,
      });

      if (!uploadResponse.ok) {
        throw new WalrusUploadError(`Upload failed: ${uploadResponse.status}`);
      }

      const uploadResult = await uploadResponse.json();
      let blobId: string;
      let size: number = 0;

      if (uploadResult.newlyCreated) {
        blobId = uploadResult.newlyCreated.blobObject.blobId;
        size = uploadResult.newlyCreated.blobObject.size;
      } else if (uploadResult.alreadyCertified) {
        blobId = uploadResult.alreadyCertified.blobId;
      } else {
        throw new WalrusUploadError('Unexpected response format', 500);
      }

      return {
        blobId,
        url: this.getBlobUrl(blobId),
        size,
        uploadedAt: Date.now(),
      };
    } catch (error) {
      console.error('❌ Walrus buffer upload failed:', error);
      throw error;
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

