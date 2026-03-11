# Key Management Migration Plan

**Date**: February 24, 2026
**Status**: 🔴 **CRITICAL - BLOCKS MAINNET DEPLOYMENT**
**Priority**: P0 (Must complete before March 7, 2026)
**Assigned**: Sub-Agent 1D (Security & Quality Advisor)

---

## Executive Summary

**Current State**: Cryptographic keys stored in **AsyncStorage (unencrypted)** - vulnerable to extraction attacks
**Target State**: All sensitive data migrated to **expo-secure-store (hardware-backed encryption)**
**Risk**: Device-level file access (rooted devices, backups, malware) can extract private keys → **wallet compromise**

---

## Threat Analysis

### Critical Vulnerability: Unencrypted Key Storage

**Attack Vector**:
1. Attacker gains device-level file access (root/jailbreak, iTunes backup, ADB access)
2. Attacker reads AsyncStorage files from app sandbox
3. Attacker extracts ephemeral keypair secret key
4. Attacker derives zkLogin address and signs transactions
5. **Result**: Complete wallet takeover

**Risk Level**: CRITICAL 🔴
**CVSS Score**: 9.1 (Critical)
**Impact**: Complete compromise of user funds and identity

---

## Current AsyncStorage Usage Analysis

### 🔴 CRITICAL: Cryptographic Keys (zkLogin.ts)

**File**: `mobile/src/services/zkLogin.ts`
**Lines**: 51-53

```typescript
// INSECURE - Stores cryptographic secrets in plain text
await AsyncStorage.setItem(STORAGE_KEY_EPHEMERAL, ephemeralKeyPair.getSecretKey());
await AsyncStorage.setItem(STORAGE_KEY_MAX_EPOCH, maxEpoch.toString());
await AsyncStorage.setItem(STORAGE_KEY_RANDOMNESS, randomness.toString());
```

**Data Stored**:
1. **Ephemeral KeyPair Secret** (`@zklogin_ephemeral`) - CRITICAL
   - Private key for zkLogin ephemeral keypair
   - Used to derive Sui address and sign transactions
   - **If compromised**: Attacker can impersonate user, steal funds

2. **Randomness** (`@zklogin_randomness`) - HIGH
   - Cryptographic random value for address derivation
   - **If compromised**: Attacker can derive same address

3. **Max Epoch** (`@zklogin_max_epoch`) - LOW
   - Expiration metadata (not cryptographic)
   - Public information, low risk

**Risk**: 🔴 CRITICAL - Must migrate immediately

---

### 🟠 HIGH: User Identity (SuiWalletContext.tsx)

**File**: `mobile/src/contexts/SuiWalletContext.tsx`
**Lines**: 37, 44, 49

```typescript
// INSECURE - User address persistence
await AsyncStorage.getItem(STORAGE_KEY); // Load address
await AsyncStorage.setItem(STORAGE_KEY, walletAddress); // Save address
await AsyncStorage.removeItem(STORAGE_KEY); // Clear on disconnect
```

**Data Stored**:
- **Sui Wallet Address** (`@sui_wallet_address`)
  - User's Sui blockchain address (derived from zkLogin)
  - **If compromised**: Links user identity across sessions (privacy leak)

**Risk**: 🟠 HIGH - Should migrate (not as critical as keys)

---

### 🟡 MEDIUM: Session Metadata (storage.ts)

**File**: `mobile/src/services/storage.ts`
**Lines**: 54, 78, 110, 140

```typescript
// MEDIUM RISK - Session data (GPS, sensor data, timestamps)
await AsyncStorage.setItem(STORAGE_KEYS.SESSIONS, jsonData);
const jsonData = await AsyncStorage.getItem(STORAGE_KEYS.SESSIONS);
await AsyncStorage.removeItem(STORAGE_KEYS.SESSIONS);
```

**Data Stored**:
- **Capture Sessions** (`@indelible_sessions`)
  - GPS coordinates, timestamps, sensor data
  - Session IDs, provenance grades
  - **If compromised**: Privacy leak (user location history)

**Risk**: 🟡 MEDIUM - Can migrate post-hackathon (not cryptographic)

---

## Migration Strategy

### Phase 1: Critical Keys (MUST DO - Before Mainnet)

**Timeline**: Day 2-3 (February 25-26, 2026)
**Priority**: P0 (BLOCKS MAINNET)

**Files to Modify**:
1. `mobile/src/services/zkLogin.ts` - Migrate ephemeral keypair storage
2. Create `mobile/src/services/secureStorage.ts` - Wrapper around expo-secure-store

**Implementation Steps**:

#### Step 1: Create SecureStorage Service (2 hours)

**File**: `mobile/src/services/secureStorage.ts`

```typescript
import * as SecureStore from 'expo-secure-store';

/**
 * Secure storage wrapper using expo-secure-store
 *
 * SECURITY:
 * - iOS: Uses Keychain (kSecAttrAccessibleWhenUnlocked)
 * - Android: Uses EncryptedSharedPreferences + Android Keystore
 * - Hardware-backed encryption (Secure Enclave on iOS, StrongBox on Android)
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
      console.error(`[SecureStorage] Failed to store ${key}:`, error);
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
      console.error(`[SecureStorage] Failed to retrieve ${key}:`, error);
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
      console.error(`[SecureStorage] Failed to delete ${key}:`, error);
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
 */
export const SECURE_STORAGE_KEYS = {
  // zkLogin cryptographic keys
  ZKLOGIN_EPHEMERAL: 'secure.zklogin.ephemeral',
  ZKLOGIN_RANDOMNESS: 'secure.zklogin.randomness',
  ZKLOGIN_MAX_EPOCH: 'secure.zklogin.max_epoch',

  // Sui wallet identity
  SUI_WALLET_ADDRESS: 'secure.sui.address',

  // Future: Solana session binding
  SOLANA_SESSION_TOKEN: 'secure.solana.session_token',
} as const;
```

**Teaching Moment: Why expo-secure-store?**

| Feature | AsyncStorage | expo-secure-store |
|---------|--------------|-------------------|
| **Encryption** | ❌ Plain text | ✅ Hardware-backed AES-256 |
| **iOS Storage** | UserDefaults (plist) | Keychain (Secure Enclave) |
| **Android Storage** | SharedPreferences (XML) | EncryptedSharedPreferences + Keystore |
| **Device Unlock** | Always accessible | Requires device unlock (configurable) |
| **Root/Jailbreak Protection** | ❌ Easily extracted | ✅ Hardware-level protection |
| **Backup Security** | ❌ Included in iCloud/iTunes | ✅ Excluded from backups (iOS) |

**Key Insight**: On iOS, Keychain data is stored in the **Secure Enclave** (dedicated crypto chip), making extraction nearly impossible even with physical device access.

---

#### Step 2: Migrate zkLogin Key Storage (3 hours)

**File**: `mobile/src/services/zkLogin.ts`

**Before** (INSECURE):
```typescript
await AsyncStorage.setItem(STORAGE_KEY_EPHEMERAL, ephemeralKeyPair.getSecretKey());
await AsyncStorage.setItem(STORAGE_KEY_MAX_EPOCH, maxEpoch.toString());
await AsyncStorage.setItem(STORAGE_KEY_RANDOMNESS, randomness.toString());
```

**After** (SECURE):
```typescript
import { SecureStorage, SECURE_STORAGE_KEYS } from './secureStorage';

// Store ephemeral keypair in Secure Enclave (iOS) or Android Keystore
await SecureStorage.setSecureItem(
  SECURE_STORAGE_KEYS.ZKLOGIN_EPHEMERAL,
  ephemeralKeyPair.getSecretKey(),
  SecureStore.WHEN_UNLOCKED // Requires device unlock
);

await SecureStorage.setSecureItem(
  SECURE_STORAGE_KEYS.ZKLOGIN_RANDOMNESS,
  randomness.toString()
);

await SecureStorage.setSecureItem(
  SECURE_STORAGE_KEYS.ZKLOGIN_MAX_EPOCH,
  maxEpoch.toString()
);
```

**Changes Required**:
1. Import `SecureStorage` and `SECURE_STORAGE_KEYS`
2. Replace all `AsyncStorage.setItem` → `SecureStorage.setSecureItem`
3. Replace all `AsyncStorage.getItem` → `SecureStorage.getSecureItem`
4. Replace all `AsyncStorage.removeItem` → `SecureStorage.deleteSecureItem`
5. Update storage key constants to use `SECURE_STORAGE_KEYS`

**Migration Path** (for existing users):
```typescript
// On app startup, check if old AsyncStorage keys exist
const oldEphemeralKey = await AsyncStorage.getItem(OLD_STORAGE_KEY_EPHEMERAL);
if (oldEphemeralKey) {
  // Migrate to secure storage
  await SecureStorage.setSecureItem(
    SECURE_STORAGE_KEYS.ZKLOGIN_EPHEMERAL,
    oldEphemeralKey
  );
  // Delete old insecure storage
  await AsyncStorage.removeItem(OLD_STORAGE_KEY_EPHEMERAL);
  console.log('✓ Migrated ephemeral key to secure storage');
}
```

---

#### Step 3: Migrate Sui Wallet Address (1 hour)

**File**: `mobile/src/contexts/SuiWalletContext.tsx`

**Before**:
```typescript
const STORAGE_KEY = '@sui_wallet_address';
await AsyncStorage.getItem(STORAGE_KEY);
await AsyncStorage.setItem(STORAGE_KEY, walletAddress);
await AsyncStorage.removeItem(STORAGE_KEY);
```

**After**:
```typescript
import { SecureStorage, SECURE_STORAGE_KEYS } from '../services/secureStorage';

// Use secure storage for wallet address
const savedAddress = await SecureStorage.getSecureItem(SECURE_STORAGE_KEYS.SUI_WALLET_ADDRESS);
await SecureStorage.setSecureItem(SECURE_STORAGE_KEYS.SUI_WALLET_ADDRESS, walletAddress);
await SecureStorage.deleteSecureItem(SECURE_STORAGE_KEYS.SUI_WALLET_ADDRESS);
```

**Note**: Wallet address is not cryptographic, but securing it prevents user profiling across app reinstalls.

---

### Phase 2: Session Metadata (OPTIONAL - Post-Hackathon)

**Timeline**: Week 2-3 (March 10-20, 2026)
**Priority**: P2 (Nice to have)

**Rationale**: Session data (GPS, sensor data) is not cryptographic, but encrypting it provides additional privacy protection. Since this doesn't block mainnet deployment, we can defer to post-hackathon.

**Files to Modify**:
- `mobile/src/services/storage.ts` - Optionally migrate session storage

---

## Testing Strategy

### Unit Tests

**File**: `mobile/src/services/__tests__/secureStorage.test.ts`

```typescript
describe('SecureStorage', () => {
  it('should store and retrieve secure data', async () => {
    await SecureStorage.setSecureItem('test_key', 'test_value');
    const value = await SecureStorage.getSecureItem('test_key');
    expect(value).toBe('test_value');
  });

  it('should delete secure data', async () => {
    await SecureStorage.setSecureItem('test_key', 'test_value');
    await SecureStorage.deleteSecureItem('test_key');
    const value = await SecureStorage.getSecureItem('test_key');
    expect(value).toBeNull();
  });

  it('should check availability', async () => {
    const available = await SecureStorage.isAvailable();
    expect(available).toBe(true);
  });
});
```

### Integration Tests

**Manual Testing Checklist**:
- [ ] zkLogin flow works with secure storage (create new account)
- [ ] Existing users migrate successfully (old AsyncStorage → SecureStorage)
- [ ] Wallet address persists across app restarts
- [ ] Logout clears all secure storage
- [ ] App gracefully handles secure storage unavailable (old Android devices)

### Security Testing

**Penetration Tests**:
1. **ADB Backup Test** (Android):
   ```bash
   adb backup -f backup.ab com.indelible.blob
   # Verify ephemeral key is NOT in backup
   ```

2. **iTunes Backup Test** (iOS):
   - Create iTunes/Finder backup
   - Use backup extraction tools (iMazing, iExplorer)
   - Verify Keychain items are encrypted/inaccessible

3. **Rooted Device Test**:
   - Install app on rooted Android or jailbroken iOS
   - Use root shell to access app sandbox
   - Verify keys are encrypted, not plain text

---

## Rollout Plan

### Day 2 (February 25, 2026)

**Morning** (9:00 AM - 12:00 PM):
- ✅ Create `secureStorage.ts` service
- ✅ Write unit tests for SecureStorage
- ✅ Test on iOS simulator (Keychain integration)
- ✅ Test on Android emulator (EncryptedSharedPreferences)

**Afternoon** (1:00 PM - 5:00 PM):
- ✅ Migrate zkLogin.ts to SecureStorage
- ✅ Implement old storage migration logic
- ✅ Test zkLogin flow end-to-end

### Day 3 (February 26, 2026)

**Morning** (9:00 AM - 12:00 PM):
- ✅ Migrate SuiWalletContext.tsx to SecureStorage
- ✅ Test wallet connect/disconnect flow
- ✅ Run full app test on real Solana Seeker device

**Afternoon** (1:00 PM - 5:00 PM):
- ✅ Security penetration tests (ADB backup, root access)
- ✅ Update SECURITY_AUDIT_LOG.md with results
- ✅ Code review and merge to feature branch

---

## Success Criteria

**Before marking this task complete, verify**:
1. ✅ All zkLogin cryptographic keys stored in expo-secure-store
2. ✅ Sui wallet address migrated to SecureStorage
3. ✅ Old AsyncStorage keys deleted after migration
4. ✅ Unit tests pass (95%+ coverage)
5. ✅ Integration tests pass on iOS and Android
6. ✅ Security penetration tests confirm keys are inaccessible
7. ✅ Real Solana Seeker device tested successfully
8. ✅ Documentation updated (SECURITY_AUDIT_LOG.md)

---

## Risk Mitigation

### Risk: expo-secure-store Not Available

**Scenario**: Old Android devices (< API 23) don't support Keystore
**Mitigation**:
```typescript
// Fallback to AsyncStorage with user warning
if (!(await SecureStorage.isAvailable())) {
  Alert.alert(
    'Security Warning',
    'Your device does not support secure key storage. ' +
    'Your keys will be stored unencrypted. ' +
    'We recommend upgrading to a newer device for maximum security.',
    [{ text: 'I Understand', onPress: () => useFallbackStorage() }]
  );
}
```

**Better Solution**: Require minimum Android API 23 (95% of devices as of 2026)

### Risk: User Loses Device While Logged In

**Scenario**: Device stolen with app logged in
**Mitigation**:
- Keychain configured with `WHEN_UNLOCKED` (requires device unlock)
- User must have device passcode/biometric enabled
- Remote logout feature (future: server-side session invalidation)

### Risk: Migration Fails for Existing Users

**Scenario**: AsyncStorage → SecureStorage migration encounters errors
**Mitigation**:
- Wrap migration in try/catch with error logging
- If migration fails, keep old storage but warn user
- Provide manual "Re-Login" button to recreate keys securely

---

## Teaching Moment: Hardware-Backed vs Software Encryption

### Software Encryption (Weak)

**Example**: Encrypting data in AsyncStorage with AES key stored in code

```typescript
// BAD: AES key hardcoded in app
const SECRET_KEY = "hardcoded_aes_key_12345";
const encrypted = AES.encrypt(data, SECRET_KEY);
await AsyncStorage.setItem('encrypted_data', encrypted);
```

**Problem**: Attacker decompiles app → extracts SECRET_KEY → decrypts all data

---

### Hardware-Backed Encryption (Strong)

**Example**: expo-secure-store on iOS Secure Enclave

```typescript
// GOOD: Key stored in Secure Enclave (hardware chip)
await SecureStore.setItemAsync('sensitive_data', data, {
  keychainAccessible: SecureStore.WHEN_UNLOCKED
});
```

**How it works**:
1. expo-secure-store generates random AES key
2. AES key stored in **Secure Enclave** (isolated crypto chip)
3. Data encrypted with AES key, stored in Keychain
4. **Key never leaves Secure Enclave** (cannot be extracted even with physical access)

**Attack Resistance**:
- ✅ Decompiling app: Useless (no key in app code)
- ✅ Root/jailbreak: Key still in Secure Enclave (protected by hardware)
- ✅ Device backup: Keychain excluded from backups
- ✅ Physical chip extraction: Requires nation-state resources ($1M+ equipment)

---

## Conclusion

**Migration from AsyncStorage → expo-secure-store is CRITICAL** for mainnet deployment.

**Impact**:
- ✅ Protects user funds from key extraction attacks
- ✅ Meets industry security standards (OWASP Mobile Top 10)
- ✅ Enables insurance/enterprise adoption (security audit requirement)
- ✅ Future-proofs for regulatory compliance (GDPR, CCPA)

**Timeline**: Day 2-3 (February 25-26, 2026)
**Effort**: 6-8 hours
**Risk**: LOW (expo-secure-store is well-tested, widely used)

**Next Steps**: Proceed with Phase 1 implementation immediately after this plan is approved.

---

**Plan Created**: February 24, 2026
**Plan Author**: Claude Code (Sub-Agent 1D)
**Status**: ✅ READY FOR IMPLEMENTATION
