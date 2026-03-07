/**
 * ============================================================================
 * STORAGE SERVICE
 * ============================================================================
 * 
 * Handles all AsyncStorage operations for persistent data.
 * 
 * ARCHITECTURE:
 * - Centralized storage logic (single source of truth)
 * - Type-safe operations (TypeScript interfaces)
 * - Error handling and logging
 * - Easy to mock for testing
 * 
 * SECURITY:
 * - AsyncStorage is unencrypted - don't store sensitive data here
 * - For sensitive data (private keys), use expo-secure-store
 * - Always validate data after loading from storage
 * 
 * BEST PRACTICES:
 * - Always use try-catch for AsyncStorage operations
 * - Log errors for debugging
 * - Provide fallback values
 * - Consider data migration strategies for schema changes
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { CaptureSessionData, CreatorAllocationPreferences } from '@shared/types';
import { STORAGE_KEYS } from '../constants/config';

/**
 * Storage service class
 * 
 * PATTERN: Service class with static methods
 * - Easy to import and use: StorageService.saveSessions()
 * - Can be easily mocked for testing
 * - Encapsulates all storage logic
 */
export class StorageService {

  /**
   * Save all capture sessions to AsyncStorage
   * 
   * @param sessions - Array of capture sessions to save
   * @returns Promise<boolean> - Success status
   * 
   * ERROR HANDLING:
   * - Catches and logs any storage errors
   * - Returns false on failure (doesn't throw)
   * - Allows app to continue even if save fails
   */
  static async saveSessions(sessions: CaptureSessionData[]): Promise<boolean> {
    try {
      const jsonData = JSON.stringify(sessions);
      await AsyncStorage.setItem(STORAGE_KEYS.SESSIONS, jsonData);
      console.log('✓ Sessions saved to storage:', sessions.length);
      return true;
    } catch (error) {
      console.error('❌ Failed to save sessions:', error);
      return false;
    }
  }

  /**
   * Load all capture sessions from AsyncStorage
   * 
   * @returns Promise<CaptureSessionData[]> - Array of sessions (empty if none found)
   * 
   * DATA VALIDATION:
   * - Checks if data exists before parsing
   * - Returns empty array as safe fallback
   * - Logs success/failure for debugging
   * 
   * TODO: Add schema validation to ensure loaded data matches current types
   * (useful when app updates change data structure)
   */
  static async loadSessions(): Promise<CaptureSessionData[]> {
    try {
      const jsonData = await AsyncStorage.getItem(STORAGE_KEYS.SESSIONS);

      if (!jsonData) {
        console.log('ℹ️ No sessions found in storage');
        return [];
      }

      const sessions: CaptureSessionData[] = JSON.parse(jsonData);
      console.log('✓ Loaded sessions from storage:', sessions.length);

      // Basic validation
      if (!Array.isArray(sessions)) {
        console.warn('⚠️ Invalid sessions data format, returning empty array');
        return [];
      }

      return sessions;
    } catch (error) {
      console.error('❌ Failed to load sessions:', error);
      return [];
    }
  }

  /**
   * Clear all sessions from storage
   * 
   * USE CASE: User wants to delete all data
   * 
   * SECURITY: This is irreversible - always confirm with user first
   */
  static async clearSessions(): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.SESSIONS);
      console.log('✓ Sessions cleared from storage');
      return true;
    } catch (error) {
      console.error('❌ Failed to clear sessions:', error);
      return false;
    }
  }

  /**
   * Get storage usage statistics
   * 
   * USEFUL FOR:
   * - Showing user how much data they've captured
   * - Warning when approaching device storage limits
   * - Analytics and debugging
   */
  static async getStorageStats(): Promise<{
    sessionCount: number;
    photoCount: number;
    videoCount: number;
    estimatedSize: number;
  }> {
    try {
      const sessions = await this.loadSessions();

      const photoCount = sessions.reduce((sum, s) => sum + s.photos.length, 0);
      const videoCount = sessions.reduce((sum, s) => sum + s.videos.length, 0);

      // Estimate size (rough calculation)
      const jsonData = await AsyncStorage.getItem(STORAGE_KEYS.SESSIONS);
      const estimatedSize = jsonData ? jsonData.length : 0;

      return {
        sessionCount: sessions.length,
        photoCount,
        videoCount,
        estimatedSize,
      };
    } catch (error) {
      console.error('❌ Failed to get storage stats:', error);
      return {
        sessionCount: 0,
        photoCount: 0,
        videoCount: 0,
        estimatedSize: 0,
      };
    }
  }

  /**
   * Migrate old data format to new format
   * 
   * USE CASE: When app updates change data structure
   * 
   * PATTERN: Version-based migration
   * - Check current data version
   * - Apply migrations sequentially
   * - Save new version number
   * 
   * TODO: Implement when schema changes occur
   */
  static async migrateData(): Promise<boolean> {
    try {
      // Future implementation for data migrations
      console.log('ℹ️ No migrations needed');
      return true;
    } catch (error) {
      console.error('❌ Data migration failed:', error);
      return false;
    }
  }

  // ============================================================================
  // CREATOR ALLOCATION PREFERENCES
  // ============================================================================

  static async loadAllocationPreferences(): Promise<CreatorAllocationPreferences> {
    const defaultPrefs: CreatorAllocationPreferences = { treasury: 33.34, creator: 33.33, community: 33.33, shareForResearch: false };
    try {
      const jsonData = await AsyncStorage.getItem(STORAGE_KEYS.ALLOCATION_PREFERENCES);
      if (!jsonData) return defaultPrefs;

      const prefs: CreatorAllocationPreferences = JSON.parse(jsonData);

      // Defensive coding against corrupted storage 
      if (typeof prefs.treasury !== 'number' || typeof prefs.creator !== 'number' || typeof prefs.community !== 'number') {
        return defaultPrefs;
      }

      const sum = Math.round(prefs.treasury + prefs.creator + prefs.community);
      if (sum !== 100 || prefs.treasury < 33.33) {
        console.warn('⚠️ Invalid allocation preferences (sum != 100 or treasury < floor), resetting to default');
        return defaultPrefs;
      }

      // Backfill shareForResearch for prefs saved before this field existed
      if (typeof prefs.shareForResearch !== 'boolean') {
        prefs.shareForResearch = false;
      }

      return prefs;
    } catch (error) {
      console.error('❌ Failed to load allocation preferences:', error);
      return defaultPrefs;
    }
  }

  static async saveAllocationPreferences(prefs: CreatorAllocationPreferences): Promise<boolean> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ALLOCATION_PREFERENCES, JSON.stringify(prefs));
      return true;
    } catch (error) {
      console.error('❌ Failed to save allocation preferences:', error);
      return false;
    }
  }

  // ============================================================================
  // GOVERNANCE VOTES
  // ============================================================================

  static async loadGovernanceVotes(): Promise<Record<string, boolean>> {
    try {
      const jsonData = await AsyncStorage.getItem(STORAGE_KEYS.GOVERNANCE_VOTES);
      if (!jsonData) return {};

      const votes = JSON.parse(jsonData);

      // Defensive coding
      if (typeof votes !== 'object' || votes === null || Array.isArray(votes)) {
        return {};
      }

      return votes as Record<string, boolean>;
    } catch (error) {
      console.error('❌ Failed to load governance votes:', error);
      return {};
    }
  }

  static async saveGovernanceVote(proposalId: string): Promise<boolean> {
    try {
      const currentVotes = await this.loadGovernanceVotes();
      currentVotes[proposalId] = true;
      await AsyncStorage.setItem(STORAGE_KEYS.GOVERNANCE_VOTES, JSON.stringify(currentVotes));
      return true;
    } catch (error) {
      console.error('❌ Failed to save governance vote:', error);
      return false;
    }
  }
}

/**
 * USAGE EXAMPLES:
 * 
 * // Save sessions
 * await StorageService.saveSessions(captureSessions);
 * 
 * // Load sessions
 * const sessions = await StorageService.loadSessions();
 * 
 * // Clear all data
 * await StorageService.clearSessions();
 * 
 * // Get stats
 * const stats = await StorageService.getStorageStats();
 * console.log(`${stats.photoCount} photos, ${stats.videoCount} videos`);
 */

