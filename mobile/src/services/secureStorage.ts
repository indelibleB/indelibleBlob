import * as SecureStore from 'expo-secure-store';
import { blobLog } from '../utils/logger';

/**
 * Secure storage wrapper using expo-secure-store
 *
 * SECURITY:
 * - iOS: Uses Keychain with kSecAttrAccessibleWhenUnlocked
 * - Android: Uses EncryptedSharedPreferences + Android Keystore
 * - Hardware-backed encryption (Secure Enclave on iOS, StrongBox on Android)
 *
 * WHY THIS MATTERS:
 * AsyncStorage stores data in plain text, making cryptographic keys vulnerable
 * to extraction via device backups, root/jailbreak access, or malware.
 *
 * expo-secure-store uses hardware-backed encryption that protects keys even
 * when the device is compromised. On iOS, keys are stored in the Secure Enclave
 * (dedicated crypto chip) making extraction nearly impossible.
 */
export class SecureStorage {
  /**
   * Store sensitive data securely
   *
   * @param key - Storage key
   * @param value - Value to store
   * @param keychainAccessible - iOS Keychain accessibility (default: WHEN_UNLOCKED)
   */
  static async setSecureItem(
    key: string,
    value: string,
    keychainAccessible: SecureStore.KeychainAccessibilityConstant = SecureStore.WHEN_UNLOCKED
  ): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value, {
        keychainAccessible, // iOS: requires device unlock
        requireAuthentication: false, // Don't require biometrics for every access
      });
    } catch (error) {
      blobLog.error(`[SecureStorage] Failed to store ${key}:`, error);
      throw new Error(`Secure storage failed for ${key}`);
    }
  }

  /**
   * Retrieve sensitive data securely
   *
   * @param key - Storage key
   * @returns Stored value or null
   */
  static async getSecureItem(key: string): Promise<string | null> {
    try {
      const value = await SecureStore.getItemAsync(key);
      return value;
    } catch (error) {
      blobLog.error(`[SecureStorage] Failed to retrieve ${key}:`, error);
      return null;
    }
  }

  /**
   * Remove sensitive data securely
   *
   * @param key - Storage key
   */
  static async deleteSecureItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      blobLog.error(`[SecureStorage] Failed to delete ${key}:`, error);
      throw new Error(`Secure deletion failed for ${key}`);
    }
  }

  /**
   * Check if secure storage is available
   *
   * @returns true if secure storage is supported on device
   */
  static async isAvailable(): Promise<boolean> {
    try {
      // Test by writing and reading a dummy value
      const testKey = '__secure_storage_test__';
      await SecureStore.setItemAsync(testKey, 'test');
      const result = await SecureStore.getItemAsync(testKey);
      await SecureStore.deleteItemAsync(testKey);
      return result === 'test';
    } catch {
      return false;
    }
  }
}

/**
 * Storage keys for sensitive data
 *
 * NAMING CONVENTION:
 * - Prefix with 'secure.' to distinguish from old AsyncStorage keys
 * - Use dot notation for namespacing (e.g., secure.zklogin.ephemeral)
 */
export const SECURE_STORAGE_KEYS = {
  // zkLogin cryptographic keys
  ZKLOGIN_EPHEMERAL: 'secure.zklogin.ephemeral',
  ZKLOGIN_RANDOMNESS: 'secure.zklogin.randomness',
  ZKLOGIN_MAX_EPOCH: 'secure.zklogin.max_epoch',
  ZKLOGIN_PROOF: 'secure.zklogin.proof',
  ZKLOGIN_SALT: 'secure.zklogin.salt',
  ZKLOGIN_JWT: 'secure.zklogin.jwt',

  // Sui wallet identity
  SUI_WALLET_ADDRESS: 'secure.sui.address',

  // Solana session binding
  SOLANA_SESSION_TOKEN: 'secure.solana.session_token',

  // Seal encryption nonces (per-capture, stored in capture metadata)
  SEAL_LAST_NONCE: 'secure.seal.last_nonce',
} as const;

/**
 * Legacy AsyncStorage keys (for migration)
 *
 * These are the OLD keys that need to be migrated to secure storage.
 * After migration, these keys should be deleted from AsyncStorage.
 */
export const LEGACY_STORAGE_KEYS = {
  ZKLOGIN_EPHEMERAL: '@zklogin_ephemeral',
  ZKLOGIN_RANDOMNESS: '@zklogin_randomness',
  ZKLOGIN_MAX_EPOCH: '@zklogin_max_epoch',
  SUI_WALLET_ADDRESS: '@sui_wallet_address',
} as const;
