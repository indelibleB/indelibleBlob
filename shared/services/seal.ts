import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { encrypt, getAllowlistedKeyServers, retrieveKeyServers } from '@mysten/seal';
import { gcm } from '@noble/ciphers/aes';
import { CAPTURE_CONFIG } from '../constants/config';

/**
 * ============================================================================
 * SealService — Identity-Based Encryption for Sovereign Mode
 * ============================================================================
 * 
 * Uses the Mysten Seal SDK for threshold-based IBE encryption.
 * Access control is enforced by sovereign_blob::seal_approve on-chain.
 * 
 * HERMES COMPATIBILITY:
 * The SDK's built-in AesGcm256 uses crypto.subtle which doesn't exist in
 * React Native Hermes. We replace it with HermesAesGcm256 using @noble/ciphers
 * (pure-JS AES-GCM implementation that works on any JS engine).
 * 
 * KEY ID FORMAT (per Seal protocol):
 * We provide: [creator_address_bytes ∥ nonce_bytes]
 * Seal prepends [packageId] automatically.
 */

// Fixed IV matching the SDK's AES implementation
const SEAL_IV = Uint8Array.from([138, 55, 153, 253, 198, 46, 121, 219, 160, 128, 89, 7, 214, 156, 148, 220]);

/**
 * Hermes-compatible AES-GCM-256 encryption input.
 * Drop-in replacement for @mysten/seal's AesGcm256 that uses
 * @noble/ciphers instead of crypto.subtle.
 * 
 * Implements the EncryptionInput interface:
 * - generateKey(): returns 32-byte random AES key
 * - encrypt(key): returns Ciphertext enum (Aes256Gcm variant)
 */
class HermesAesGcm256 {
    readonly plaintext: Uint8Array;
    readonly aad: Uint8Array;

    constructor(msg: Uint8Array, aad: Uint8Array) {
        this.plaintext = new Uint8Array(msg);
        this.aad = aad;
    }

    async generateKey(): Promise<Uint8Array> {
        // 32-byte random key via crypto.getRandomValues (works in Hermes)
        const key = new Uint8Array(32);
        crypto.getRandomValues(key);
        return key;
    }

    async encrypt(key: Uint8Array): Promise<any> {
        // Use @noble/ciphers AES-GCM (pure JS, no crypto.subtle needed)
        const aes = gcm(key, SEAL_IV, this.aad);
        const ciphertext = aes.encrypt(this.plaintext);
        return {
            Aes256Gcm: {
                blob: Array.from(ciphertext),
                aad: this.aad.length > 0 ? Array.from(this.aad) : [],
            }
        };
    }
}

export class SealService {
    private static instance: SealService;
    private suiClient: SuiClient;
    private keyServers: Awaited<ReturnType<typeof retrieveKeyServers>> | null = null;

    private static SOVEREIGN_BLOB_PACKAGE_ID = CAPTURE_CONFIG.SOVEREIGN_BLOB_PACKAGE_ID || '';

    private constructor() {
        const rpcUrl = CAPTURE_CONFIG.SUI_RPC_URL || getFullnodeUrl('testnet');
        this.suiClient = new SuiClient({ url: rpcUrl });
    }

    public static getInstance(): SealService {
        if (!SealService.instance) {
            SealService.instance = new SealService();
        }
        return SealService.instance;
    }

    /**
     * Compute the IBE key ID: [creator_address_bytes][nonce_bytes]
     */
    public static computeKeyId(creatorAddress: string, nonce: Uint8Array): Uint8Array {
        const addrHex = creatorAddress.startsWith('0x') ? creatorAddress.slice(2) : creatorAddress;
        const addressBytes = new Uint8Array(addrHex.match(/.{1,2}/g)!.map(b => parseInt(b, 16)));
        const keyId = new Uint8Array(addressBytes.length + nonce.length);
        keyId.set(addressBytes, 0);
        keyId.set(nonce, addressBytes.length);
        return keyId;
    }

    /**
     * Generate a cryptographically secure random nonce (32 bytes).
     */
    public static generateNonce(): Uint8Array {
        const nonce = new Uint8Array(32);
        crypto.getRandomValues(nonce);
        return nonce;
    }

    private async ensureKeyServers() {
        if (this.keyServers) return this.keyServers;
        const objectIds = getAllowlistedKeyServers('testnet');
        const servers = await retrieveKeyServers({
            objectIds,
            client: this.suiClient as any,
        });
        this.keyServers = servers;
        console.log(`🔐 Seal: Retrieved ${servers.length} key servers`);
        return servers;
    }

    /**
     * Encrypt data for Sovereign Mode using Hermes-compatible AES-GCM.
     */
    public async encrypt(
        data: Uint8Array,
        creatorAddress: string,
        nonce: Uint8Array
    ): Promise<{ encryptedObject: Uint8Array; key: Uint8Array }> {
        const keyServers = await this.ensureKeyServers();

        if (!SealService.SOVEREIGN_BLOB_PACKAGE_ID) {
            throw new Error('Seal: SOVEREIGN_BLOB_PACKAGE_ID not configured.');
        }

        const id = SealService.computeKeyId(creatorAddress, nonce);
        const pkgHex = SealService.SOVEREIGN_BLOB_PACKAGE_ID.startsWith('0x')
            ? SealService.SOVEREIGN_BLOB_PACKAGE_ID.slice(2)
            : SealService.SOVEREIGN_BLOB_PACKAGE_ID;
        const packageIdBytes = new Uint8Array(pkgHex.match(/.{1,2}/g)!.map(b => parseInt(b, 16)));

        console.log('🔒 Seal: Encrypting for identity:', {
            creator: creatorAddress.slice(0, 10) + '...',
            nonceHex: Array.from(nonce.slice(0, 4)).map(b => b.toString(16).padStart(2, '0')).join(''),
            keyIdLength: id.length,
        });

        try {
            // Use HermesAesGcm256 instead of SDK's AesGcm256 (crypto.subtle unavailable)
            const result = await encrypt({
                keyServers,
                threshold: 1,
                packageId: packageIdBytes,
                id,
                encryptionInput: new HermesAesGcm256(data, new Uint8Array(0)),
            });

            console.log('✅ Seal: Encryption complete, encrypted size:', result.encryptedObject.length);
            return result;
        } catch (error) {
            console.error('❌ Seal: Encryption failed:', error);
            throw error;
        }
    }

    public static getPackageId(): string {
        return SealService.SOVEREIGN_BLOB_PACKAGE_ID;
    }
}
