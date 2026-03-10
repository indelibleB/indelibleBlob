/**
 * ============================================================================
 * WALRUS SERVICE - DECENTRALIZED STORAGE
 * ============================================================================
 */

import * as FileSystem from 'expo-file-system';
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
 */
class WalrusServiceClass {

  /**
   * Upload raw data buffer to Walrus storage
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
        body: data as any,
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
   * Upload a file to Walrus storage
   */
  async uploadFile(fileUri: string): Promise<WalrusData> {
    const publisherUrl = CAPTURE_CONFIG.WALRUS_PUBLISHER_URL;

    console.log('📤 Uploading to Walrus...');
    console.log('   Publisher URL:', publisherUrl);
    console.log('   File URI:', fileUri);

    try {
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        throw new Error('File does not exist');
      }

      console.log('   Reading file as base64...');
      const base64Data = await FileSystem.readAsStringAsync(fileUri, {
        encoding: 'base64',
      });

      console.log('   Converting to binary...');
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const uploadUrl = `${publisherUrl}/v1/blobs`;
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/octet-stream',
        },
        body: bytes as any,
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new WalrusUploadError(
          `Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`,
          uploadResponse.status,
          errorText
        );
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
      console.error('❌ Walrus upload failed:', error);
      if (error instanceof WalrusUploadError) throw error;
      throw new WalrusUploadError(error instanceof Error ? error.message : 'Unknown error', 500);
    }
  }

  /**
   * Get the URL to retrieve a blob from Walrus
   */
  getBlobUrl(blobId: string): string {
    const aggregatorUrl = CAPTURE_CONFIG.WALRUS_AGGREGATOR_URL;
    return `${aggregatorUrl}/v1/blobs/${blobId}`;
  }

  /**
   * Check if a blob exists in Walrus
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
   */
  async downloadBlob(blobId: string): Promise<Uint8Array> {
    try {
      const url = this.getBlobUrl(blobId);
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Download failed: ${response.status}`);
      const arrayBuffer = await response.arrayBuffer();
      return new Uint8Array(arrayBuffer);
    } catch (error) {
      console.error('❌ Blob download failed:', error);
      throw error;
    }
  }

  /**
 * Check health of Walrus connection
 * Note: Walrus has no dedicated /status endpoint. We test reachability
 * by fetching the root URL — any HTTP response (even 4xx) means the
 * server is up. Only network errors (timeouts, DNS) mean it's down.
 */
  static async checkHealth(): Promise<{ publisher: boolean; aggregator: boolean }> {
    const testReachable = async (url: string): Promise<boolean> => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        await fetch(url, { method: 'GET', signal: controller.signal });
        clearTimeout(timeout);
        return true; // Any HTTP response = server is reachable
      } catch {
        return false; // Network error or timeout = unreachable
      }
    };

    try {
      const [publisher, aggregator] = await Promise.all([
        testReachable(CAPTURE_CONFIG.WALRUS_PUBLISHER_URL),
        testReachable(CAPTURE_CONFIG.WALRUS_AGGREGATOR_URL),
      ]);
      return { publisher, aggregator };
    } catch {
      return { publisher: false, aggregator: false };
    }
  }
}

export const WalrusService = new WalrusServiceClass();
