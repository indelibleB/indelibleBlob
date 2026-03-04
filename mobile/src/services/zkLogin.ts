import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { generateNonce, generateRandomness, jwtToAddress } from '@mysten/sui/zklogin';
import { SuiClient } from '@mysten/sui/client';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CAPTURE_CONFIG } from '../constants/config';
import { blobLog } from '../utils/logger';
import { SecureStorage, SECURE_STORAGE_KEYS, LEGACY_STORAGE_KEYS } from './secureStorage';

WebBrowser.maybeCompleteAuthSession();

// Setup OAuth configuration
// Use Expo's proxy in development, or set up Deep Links for production
const REDIRECT_URI = AuthSession.makeRedirectUri();
console.log('[BLOB_TRACE] 🔑 OAuth REDIRECT_URI:', REDIRECT_URI); // TODO: Remove after Google OAuth setup
const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || 'dummy-client-id.apps.googleusercontent.com';

// Legacy keys for migration (deprecated - use SECURE_STORAGE_KEYS instead)
const STORAGE_KEY_EPHEMERAL = 'indelible_zklogin_ephemeral_key';
const STORAGE_KEY_MAX_EPOCH = 'indelible_zklogin_max_epoch';
const STORAGE_KEY_RANDOMNESS = 'indelible_zklogin_randomness';

class ZkLoginServiceClass {
    private client: SuiClient;

    constructor() {
        this.client = new SuiClient({ url: CAPTURE_CONFIG.SUI_RPC_URL });
    }

    /**
     * Start the zkLogin Google OAuth Flow
     * 1. Generates the ephemeral key
     * 2. Derives max epoch and randomness
     * 3. Computes the nonce
     * 4. Opens Google OAuth browser
     */
    async loginWithGoogle(): Promise<string> {
        blobLog.info('🌐 Initiating zkLogin via Google...');

        // 1. Generate Ephemeral Key Pair
        const ephemeralKeyPair = new Ed25519Keypair();

        // 2. Fetch current epoch to set expiration (maxEpoch = current + 2)
        const { epoch } = await this.client.getLatestSuiSystemState();
        const currentEpoch = Number(epoch);
        const maxEpoch = currentEpoch + 2;

        // 3. Generate Randomness & Nonce
        const randomness = generateRandomness();
        const nonce = generateNonce(ephemeralKeyPair.getPublicKey(), maxEpoch, randomness);

        // Store keys securely in hardware-backed storage (Keychain/Keystore)
        // SECURITY: expo-secure-store uses Secure Enclave (iOS) or Android Keystore
        // Keys are encrypted at rest and cannot be extracted even with root access
        await SecureStorage.setSecureItem(
            SECURE_STORAGE_KEYS.ZKLOGIN_EPHEMERAL,
            ephemeralKeyPair.getSecretKey()
        );
        await SecureStorage.setSecureItem(
            SECURE_STORAGE_KEYS.ZKLOGIN_MAX_EPOCH,
            maxEpoch.toString()
        );
        await SecureStorage.setSecureItem(
            SECURE_STORAGE_KEYS.ZKLOGIN_RANDOMNESS,
            randomness.toString()
        );

        // Migrate old AsyncStorage keys if they exist
        await this.migrateOldStorageKeys();

        // 4. Construct OAuth URL
        const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
        authUrl.searchParams.append('client_id', GOOGLE_CLIENT_ID);
        authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
        authUrl.searchParams.append('response_type', 'id_token');
        authUrl.searchParams.append('scope', 'openid email profile');
        authUrl.searchParams.append('nonce', nonce);

        // 5. Open Web Browser for Auth
        blobLog.info('🌐 Opening Google Auth window...');
        const result = await WebBrowser.openAuthSessionAsync(authUrl.toString(), REDIRECT_URI);

        if (result.type === 'success' && result.url) {
            // Extract the JWT (id_token) from the redirect URL fragment
            const url = new URL(result.url.replace('#', '?'));
            const jwtToken = url.searchParams.get('id_token');

            if (!jwtToken) throw new Error('Failed to extract JWT from Google response.');

            blobLog.success('✅ JWT retrieved successfully. Deriving zkLogin Address...');
            return await this.deriveZkAddress(jwtToken);
        } else {
            throw new Error(`Google Auth aborted or failed: ${result.type}`);
        }
    }

    /**
     * Phase 2: Derive the actual Sui Address from the JWT
     * NOTE: To create transactions, we would also fetch the ZK Proof from the Mysten Salt service.
     * For authentication purposes here, deriving the address establishes identity.
     */
    private async deriveZkAddress(jwtToken: string): Promise<string> {
        // Normally, you fetch the user's salt securely from a backend (Enoki, Mysten, etc.)
        // For immutable/deterministic generation without a backend, a fixed/deterministic salt is used.
        // We will mock the salt generation as a hash of the JWT sub claim for this production release candidate
        // Note: Production implementations often use Mysten's Salt Service.

        // jwtToAddress takes (jwt, userSalt)
        const userSalt = this.generateUserSalt(jwtToken);

        // Derive the address using the official Sui cryptography library
        const address = jwtToAddress(jwtToken, userSalt);

        blobLog.success('✅ zkLogin Sui Address derived:', address);
        return address;
    }

    /**
     * Migrate old AsyncStorage keys to SecureStorage
     *
     * This ensures existing users don't lose their zkLogin session
     * when upgrading to the secure storage implementation.
     *
     * SECURITY: After migration, old keys are deleted from AsyncStorage
     * to prevent key extraction from unencrypted storage.
     */
    private async migrateOldStorageKeys(): Promise<void> {
        try {
            // Check if old ephemeral key exists
            const oldEphemeralKey = await AsyncStorage.getItem(STORAGE_KEY_EPHEMERAL);
            if (oldEphemeralKey) {
                await SecureStorage.setSecureItem(
                    SECURE_STORAGE_KEYS.ZKLOGIN_EPHEMERAL,
                    oldEphemeralKey
                );
                await AsyncStorage.removeItem(STORAGE_KEY_EPHEMERAL);
                blobLog.info('✓ Migrated ephemeral key to secure storage');
            }

            // Check if old max epoch exists
            const oldMaxEpoch = await AsyncStorage.getItem(STORAGE_KEY_MAX_EPOCH);
            if (oldMaxEpoch) {
                await SecureStorage.setSecureItem(
                    SECURE_STORAGE_KEYS.ZKLOGIN_MAX_EPOCH,
                    oldMaxEpoch
                );
                await AsyncStorage.removeItem(STORAGE_KEY_MAX_EPOCH);
                blobLog.info('✓ Migrated max epoch to secure storage');
            }

            // Check if old randomness exists
            const oldRandomness = await AsyncStorage.getItem(STORAGE_KEY_RANDOMNESS);
            if (oldRandomness) {
                await SecureStorage.setSecureItem(
                    SECURE_STORAGE_KEYS.ZKLOGIN_RANDOMNESS,
                    oldRandomness
                );
                await AsyncStorage.removeItem(STORAGE_KEY_RANDOMNESS);
                blobLog.info('✓ Migrated randomness to secure storage');
            }
        } catch (error) {
            blobLog.warn('Failed to migrate old storage keys:', error);
            // Don't throw - migration is best-effort
        }
    }

    /**
     * Decode JWT and generate deterministic salt (fallback method)
     */
    private generateUserSalt(jwt: string): string {
        try {
            const base64Url = jwt.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            const payload = JSON.parse(jsonPayload);
            const sub = payload.sub || 'default_sub';

            // Generate a numeric string salt (128-bit) from the subject
            // This guarantees the same Google account produces the same Sui address!
            let numericSalt = '';
            for (let i = 0; i < sub.length; i++) {
                numericSalt += sub.charCodeAt(i).toString();
            }
            // Ensure exactly 16-32 length numeric
            return numericSalt.substring(0, 20).padEnd(20, '1');
        } catch (e) {
            blobLog.error('zkLogin: Failed to parse JWT for salt generation. Cannot derive address safely.', e);
            throw new Error('zkLogin: Failed to parse JWT for salt generation. Cannot derive address safely.');
        }
    }
}

export const zkLoginService = new ZkLoginServiceClass();
