/**
 * ============================================================================
 * IDENTITY SERVICE - OMNI-CHAIN
 * ============================================================================
 * 
 * Manages user identity across Sui (zkLogin) and Solana (MWA).
 */

import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { Connection, PublicKey } from '@solana/web3.js';
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { CAPTURE_CONFIG } from '../constants/config';
import { blobLog } from '../utils/logger';
import { activeGasManager } from './gas';

import { TrustManager } from './trust';
import { ProvenanceGrade } from '@shared/types';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fromB64 } from '@mysten/sui/utils';

// [UPDATED] Interface to include Binding Signature
export interface UserIdentity {
    suiAddress: string | null;
    solanaAddress: string | null;
    sessionBindSignature: string | null; // [NEW] "Half B" Verification Proof
    method: 'wallet-standard' | 'mwa' | 'local';
    provenanceGrade: ProvenanceGrade;
}

const STORAGE_KEY_SOLANA_ADDR = 'indelible_solana_addr';

class IdentityServiceClass {
    // REMOVED: private keypair: Ed25519Keypair | null = null;
    private currentUser: UserIdentity | null = null;
    private client: SuiClient;

    constructor() {
        this.client = new SuiClient({ url: CAPTURE_CONFIG.SUI_RPC_URL || 'https://fullnode.testnet.sui.io:443' });
    }

    // REMOVED: loginSui() - We now use Wallet Standard via App.tsx

    /**
     * Clear all identity state (Logout)
     */
    async logout() {
        blobLog.info('🚪 Logging out...');
        this.currentUser = null;
    }

    /**
     * Unified Identity Orchestrator (v3)
     * 
     * Flow:
     *   1. App.tsx passes connected Sui Wallet Account (Layer A).
     *   2. TrustManager checks hardware.
     *   3. If Seeker: Trigger MWA "Session Bind" (Layer B).
     *      - Sign message: "Indelible Bind: <SuiAddr>_<Time>"
     *   4. Gate: If hardware matches, upgrade to GOLD.
     */
    async initializeIdentity(walletAccount: any): Promise<UserIdentity> {
        blobLog.info('🔐 Initializing Unified Identity (Cross-Chain Bind)...');

        if (!walletAccount?.address) {
            throw new Error('No Sui Wallet connected.');
        }

        // Step 1: Establish Layer A (Sui)
        const suiAddress = walletAccount.address;

        let solanaAddress: string | null = null;
        let sessionBindSignature: string | null = null;
        let grade: ProvenanceGrade = 'SILVER'; // Default to Silver if generic device

        // Step 2: Detect Hardware
        const profile = await TrustManager.getDeviceProfile();
        blobLog.info(`   📱 Device Trust Profile:`, JSON.stringify(profile, null, 2));

        // Step 3: Seeker Handshake (Layer B)
        if (profile.hasMWA) {
            blobLog.info('   🛡️ Seeker Detected — Initiating Session Bind...');
            try {
                // MWA "Session Bind" Handshake
                const bindResult = await this.performSessionBind(suiAddress);

                solanaAddress = bindResult.solanaAddress;
                sessionBindSignature = bindResult.signature;
                grade = 'GOLD';

                blobLog.success('   ✅ Session Bound to Seeker!');
                blobLog.info('      Sig:', sessionBindSignature.substring(0, 16) + '...');

            } catch (e) {
                blobLog.error('   ❌ MWA Bind Failed:', e);
                // Strict Gate: If it looks like a Seeker but refuses to sign, we downgrade or block.
                // For v3 Plan, we block if it's supposed to be verified.
                if (CAPTURE_CONFIG.STRICT_PROVENANCE) {
                    throw new Error('Hardware Binding Failed: Seeker refused session signature.');
                }
                blobLog.warn('   ⚠️ Downgraded to SILVER (Bind failed)');
            }
        }

        // Step 4: Finalize User State
        this.currentUser = {
            suiAddress,
            solanaAddress,
            sessionBindSignature,
            method: 'wallet-standard',
            provenanceGrade: grade,
        };

        return this.currentUser;
    }

    /**
     * Perform the "Session Bind" Handshake via MWA
     * Signs: "Indelible Bind: <SuiAddress>_<Timestamp>"
     */
    private async performSessionBind(suiAddress: string): Promise<{ solanaAddress: string, signature: string }> {
        blobLog.info('📲 Requesting Bind Signature from Seed Vault...');

        const timestamp = Date.now().toString();
        const message = `Indelible Bind: ${suiAddress}_${timestamp}`;
        const messageBytes = new TextEncoder().encode(message);

        return await transact(async (wallet) => {
            // 1. Authorize (Connect)
            const auth = await wallet.authorize({
                cluster: CAPTURE_CONFIG.SOLANA_NETWORK as any,
                identity: {
                    name: 'indelible.Blob',
                    uri: 'https://indelible-blob.walrus.site',
                    icon: 'favicon.ico',
                },
            });

            // 2. Sign Message
            // Note: MWA signMessages returns array of signed payloads
            const [signedMsg] = await wallet.signMessages({
                addresses: [auth.accounts[0].address],
                payloads: [messageBytes],
            });

            // Convert raw signature to Base64 for storage
            const signatureBase64 = Buffer.from(signedMsg).toString('base64');

            return {
                solanaAddress: auth.accounts[0].address,
                signature: signatureBase64
            };
        });
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isAuthenticated() {
        return !!this.currentUser?.suiAddress;
    }
}

export const IdentityService = new IdentityServiceClass();
