import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { SealClient, DemType } from '@mysten/seal';
import { CAPTURE_CONFIG } from '../constants/config';
import { Buffer } from 'buffer';

// KemType is not exported from the root in some versions of the SDK
// Defaulting to 0 (BonehFranklinBLS12381DemCCA)
const DEFAULT_KEM_TYPE = 0;

/**
 * SealService handles identity-based encryption and decryption using the Mysten Seal SDK.
 * Optimized for mobile dApp "Sovereign Mode".
 */
export class SealService {
    private static instance: SealService;
    private sealClient: SealClient | null = null;
    private suiClient: SuiClient;

    // Confirmed Seal Testnet configuration
    private static readonly SEAL_SERVER_CONFIGS = [
        { objectId: '0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75', weight: 1 },
        { objectId: '0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8', weight: 1 },
    ];

    // Seal Package ID on Sui Testnet
    private static readonly SEAL_PACKAGE_ID = '0x58dce5d91278bceb65d44666ffa225ab397fc3ae9d8398c8c779c5530bd978c2';

    private constructor() {
        // Initialize Sui Client (Testnet)
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
     * Initializes the SealClient.
     */
    private async ensureInitialized() {
        if (!this.sealClient) {
            this.sealClient = new SealClient({
                suiClient: this.suiClient as any,
                serverConfigs: SealService.SEAL_SERVER_CONFIGS,
            });
        }
    }

    /**
     * Encrypts data for a specific identity.
     * 
     * @param data The data to encrypt (string or Uint8Array)
     * @param identity The identity authorized to decrypt (e.g., a wallet address)
     * @returns The encrypted object as a Uint8Array
     */
    public async encrypt(data: string | Uint8Array, identity: string): Promise<Uint8Array> {
        await this.ensureInitialized();

        let dataBuffer: Uint8Array;
        if (typeof data === 'string') {
            dataBuffer = new Uint8Array(Buffer.from(data, 'utf-8'));
        } else {
            dataBuffer = data;
        }

        try {
            console.log('🔒 Encrypting blob for identity:', identity);
            const { encryptedObject } = await this.sealClient!.encrypt({
                kemType: DEFAULT_KEM_TYPE as any,
                demType: DemType.AesGcm256,
                threshold: 1, // Using threshold 1 for the 2-server testnet setup for high reliability
                packageId: SealService.SEAL_PACKAGE_ID,
                id: identity,
                data: dataBuffer,
            });

            return encryptedObject;
        } catch (error) {
            console.error('❌ Seal Mobile Encryption failed:', error);
            throw error;
        }
    }
}
