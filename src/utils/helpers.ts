/**
 * ============================================================================
 * UTILITY FUNCTIONS
 * ============================================================================
 * 
 * Common helper functions used throughout the app.
 * 
 * BEST PRACTICE:
 * - Pure functions (no side effects)
 * - Well-tested (easy to unit test)
 * - Reusable across components
 * - Clear, descriptive names
 */

import * as FileSystem from 'expo-file-system/legacy';
import * as Crypto from 'expo-crypto';
import { Audio } from 'expo-av';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { UploadStatus } from '../types';
import { COLORS } from '../constants/config';

// ============================================================================
// FILE OPERATIONS
// ============================================================================

/**
 * Hash file content using SHA-256
 * 
 * USE CASE: Create content hash for blockchain verification
 * 
 * @param fileUri - Local file URI
 * @returns Promise<string> - SHA-256 hash (hex string)
 */
export async function hashFile(fileUri: string): Promise<string> {
  try {
    const fileContent = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64
    });
    
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      fileContent
    );
    
    return hash;
  } catch (error) {
    console.error('❌ File hashing failed:', error);
    return '';
  }
}

/**
 * Get file size in bytes
 * 
 * @param fileUri - Local file URI
 * @returns Promise<number> - File size in bytes
 */
export async function getFileSize(fileUri: string): Promise<number> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    return fileInfo.exists && 'size' in fileInfo ? fileInfo.size : 0;
  } catch (error) {
    console.error('❌ Failed to get file size:', error);
    return 0;
  }
}

/**
 * Format file size for display
 * 
 * @param bytes - File size in bytes
 * @returns string - Formatted size (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

// ============================================================================
// VIDEO OPERATIONS
// ============================================================================

/**
 * Get video duration from file
 * 
 * @param videoUri - Local video file URI
 * @returns Promise<number> - Duration in seconds
 */
export async function getVideoDuration(videoUri: string): Promise<number> {
  try {
    const { sound } = await Audio.Sound.createAsync(
      { uri: videoUri },
      { shouldPlay: false }
    );
    
    const status = await sound.getStatusAsync();
    await sound.unloadAsync();
    
    if (status.isLoaded && status.durationMillis) {
      return Math.round(status.durationMillis / 1000);
    }
    
    return 0;
  } catch (error) {
    console.error('❌ Failed to get video duration:', error);
    return 0;
  }
}

/**
 * Generate video thumbnail
 * 
 * @param videoUri - Local video file URI
 * @param timeMs - Time in video to capture thumbnail (default: 0)
 * @returns Promise<string | null> - Thumbnail URI or null if failed
 */
export async function generateVideoThumbnail(
  videoUri: string,
  timeMs: number = 0
): Promise<string | null> {
  try {
    console.log('🎬 Generating thumbnail for:', videoUri);
    
    const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
      time: timeMs,
      quality: 0.8,
    });
    
    console.log('✅ Thumbnail generated:', uri);
    return uri;
  } catch (error) {
    console.error('❌ Thumbnail generation failed:', error);
    return null;
  }
}

// ============================================================================
// TIME FORMATTING
// ============================================================================

/**
 * Format duration in seconds to MM:SS
 * 
 * @param seconds - Duration in seconds
 * @returns string - Formatted time (e.g., "3:45")
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format timestamp to readable date/time
 * 
 * @param timestamp - Unix timestamp (milliseconds)
 * @param includeTime - Include time in output (default: true)
 * @returns string - Formatted date/time
 */
export function formatTimestamp(timestamp: number, includeTime: boolean = true): string {
  const date = new Date(timestamp);
  
  if (includeTime) {
    return date.toLocaleString();
  }
  
  return date.toLocaleDateString();
}

/**
 * Get relative time (e.g., "2 hours ago")
 * 
 * @param timestamp - Unix timestamp (milliseconds)
 * @returns string - Relative time string
 */
export function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
}

// ============================================================================
// STATUS HELPERS
// ============================================================================

/**
 * Get color for upload status
 * 
 * @param status - Upload status
 * @returns string - Color hex code
 */
export function getStatusColor(status: UploadStatus): string {
  switch (status) {
    case 'local': return COLORS.local;
    case 'uploading': return COLORS.uploading;
    case 'stored': return COLORS.stored;
    case 'verifying': return COLORS.verifying;
    case 'verified': return COLORS.verified;
    case 'failed': return COLORS.failed;
    default: return COLORS.textSecondary;
  }
}

/**
 * Get icon for upload status
 * 
 * @param status - Upload status
 * @returns string - Emoji icon
 */
export function getStatusIcon(status: UploadStatus): string {
  switch (status) {
    case 'local': return '📱';
    case 'uploading': return '⬆️';
    case 'stored': return '💾';
    case 'verifying': return '🔍';
    case 'verified': return '✅';
    case 'failed': return '❌';
    default: return '❓';
  }
}

/**
 * Get human-readable status text
 * 
 * @param status - Upload status
 * @returns string - Status description
 */
export function getStatusText(status: UploadStatus): string {
  switch (status) {
    case 'local': return 'Local Only';
    case 'uploading': return 'Uploading...';
    case 'stored': return 'Stored on Walrus';
    case 'verifying': return 'Recording on Sui...';
    case 'verified': return 'Verified On-Chain';
    case 'failed': return 'Upload Failed';
    default: return 'Unknown';
  }
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate session name
 * 
 * @param name - Session name to validate
 * @returns { valid: boolean; error?: string }
 */
export function validateSessionName(name: string): {
  valid: boolean;
  error?: string;
} {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Session name cannot be empty' };
  }
  
  if (name.length > 50) {
    return { valid: false, error: 'Session name too long (max 50 characters)' };
  }
  
  return { valid: true };
}

/**
 * Validate GPS accuracy
 * 
 * @param accuracy - GPS accuracy in meters
 * @returns boolean - True if acceptable
 */
export function isAccuracyAcceptable(accuracy: number): boolean {
  return accuracy > 0 && accuracy < 1000; // Between 1cm and 1km
}

// ============================================================================
// STRING UTILITIES
// ============================================================================

/**
 * Truncate string with ellipsis
 * 
 * @param str - String to truncate
 * @param maxLength - Maximum length
 * @returns string - Truncated string
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}

/**
 * Generate random ID
 * 
 * @returns string - Random alphanumeric ID
 */
export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================================================
// ARRAY UTILITIES
// ============================================================================

/**
 * Chunk array into smaller arrays
 * 
 * @param array - Array to chunk
 * @param size - Chunk size
 * @returns Array of chunks
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Sort array by timestamp (newest first)
 * 
 * @param items - Array of items with timestamp property
 * @returns Sorted array
 */
export function sortByTimestamp<T extends { timestamp: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => b.timestamp - a.timestamp);
}

// ============================================================================
// ASYNC UTILITIES
// ============================================================================

/**
 * Sleep for specified duration
 * 
 * @param ms - Duration in milliseconds
 * @returns Promise that resolves after duration
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry async operation with exponential backoff
 * 
 * @param fn - Async function to retry
 * @param maxRetries - Maximum number of retries
 * @param baseDelay - Base delay in milliseconds
 * @returns Promise with result
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (i < maxRetries) {
        const delay = baseDelay * Math.pow(2, i);
        console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms...`);
        await sleep(delay);
      }
    }
  }
  
  throw lastError;
}

