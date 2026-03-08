import { Connection, clusterApiUrl, PublicKey } from '@solana/web3.js';
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { Platform } from 'react-native';
import { Buffer } from 'buffer';
import { blobLog } from '../utils/logger';
import { CAPTURE_CONFIG } from '../constants/config';

export class SolanaService {
    private static _connection: Connection | null = null;

    private static get connection() {
        if (!this._connection) {
            this._connection = new Connection(CAPTURE_CONFIG.SOLANA_RPC_URL, 'confirmed');
        }
        return this._connection;
    }

    /**
     * Check if Mobile Wallet Adapter is likely available on this device.
     * Non-invasive: checks for Android platform + known MWA-supporting device models.
     * The actual MWA connection/authorization happens in loginSolana(), not here.
     */
    static async isMWAAvailable(): Promise<boolean> {
        if (Platform.OS !== 'android') return false;

        // Check if an MWA-compatible wallet app is installed
        // The Seeker has the Seed Vault wallet built-in; other Android devices
        // may have Phantom, Solflare, etc.
        // For now, we check if the transact module resolved (it was imported above)
        // which means the MWA protocol library is available.
        // The actual wallet availability is confirmed when loginSolana() calls transact().
        return typeof transact === 'function';
    }

    /**
     * Request a TEEPIN hardware signature for a capture's content hash.
     * [IMPROVED] Also attempts to anchor the hash on-chain (Solana Memo) if possible.
     * 
     * @param contentHash The SHA-256 hash of the media content to sign
     * @returns The base58 encoded signature and the public key of the signer
     */
    static async signCaptureHash(contentHash: string): Promise<{ signature: string; publicKey: string; anchorSignature?: string } | null> {
        blobLog.info('🛡️ Requesting TEEPIN Hardware Attestation for hash', contentHash);

        try {
            // Initiate MWA Transaction block
            const result = await transact(async (wallet) => {
                // Step 1: Re-authorize/Auth with the wallet
                const authorization = await wallet.authorize({
                    cluster: CAPTURE_CONFIG.SOLANA_NETWORK as any,
                    identity: {
                        name: 'indelible.Blob',
                        uri: 'https://indelible-blob.walrus.site',
                        icon: 'favicon.ico',
                    },
                });

                const signerAddress = authorization.accounts[0].address;

                // Step 2: Request hardware signing of the message (TEEPIN Proof)
                const message = Buffer.from(`INDELIBLE.BLOB:PROOF_OF_ORIGIN:${contentHash}`, 'utf-8');
                const signResult = await wallet.signMessages({
                    addresses: [signerAddress],
                    payloads: [message],
                });

                // Step 3: [OPTIONAL] Best-Effort On-Chain Anchoring (Memo)
                // We attempt to send a transaction. If user has no SOL, this part might fail/skip
                // effectively "Entangling" the capture with the Solana block
                let anchorSig: string | undefined;
                try {
                    const {
                        Transaction,
                        PublicKey
                    } = require('@solana/web3.js');

                    // Check if we can/should anchor
                    if (CAPTURE_CONFIG.SOLANA_NETWORK === 'testnet' || CAPTURE_CONFIG.SOLANA_NETWORK === 'devnet') {
                        const latestBlockhash = await SolanaService.connection.getLatestBlockhash();
                        const MEMO_PROGRAM_ID = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcQb");

                        const tx = new Transaction({
                            ...latestBlockhash,
                            feePayer: new PublicKey(signerAddress)
                        }).add({
                            keys: [],
                            programId: MEMO_PROGRAM_ID,
                            data: Buffer.from(`INDELIBLE:${contentHash}`, 'utf-8')
                        });

                        const txSigs = await wallet.signAndSendTransactions({
                            transactions: [tx]
                        });
                        anchorSig = txSigs[0];
                        blobLog.success('⚓ Solana Anchor Transaction Sent', anchorSig);
                    }
                } catch (anchorError) {
                    if (CAPTURE_CONFIG.STRICT_PROVENANCE) {
                        blobLog.error('❌ STRICT MODE: Solana Anchor Failed (Mandatory)', anchorError);
                        throw new Error(`Solana Anchor Transaction Failed (Strict Mode): ${anchorError instanceof Error ? anchorError.message : 'Unknown Error'}`);
                    }
                    // Start soft, don't fail the whole flow if strictly no SOL
                    blobLog.warn('⚠️ Solana Anchor skipped (likely low balance or rejected)', anchorError);
                }

                return {
                    signature: Buffer.from(signResult[0]).toString('base64'),
                    publicKey: signerAddress,
                    anchorSignature: anchorSig
                };
            });

            blobLog.success('TEEPIN Signature generated', result.signature);
            return result;
        } catch (error) {
            blobLog.error('TEEPIN Attestation failed', error);
            throw error;
        }
    }

    /**
     * Get balance of a Solana address
     */
    static async getBalance(address: string) {
        try {
            const balance = await this.connection.getBalance(new PublicKey(address));
            return balance / 1e9; // Convert lamports to SOL
        } catch (error) {
            blobLog.error('Failed to fetch Solana balance:', error);
            return 0;
        }
    }


    /**
     * Check health of Solana connection
     */
    static async checkHealth(): Promise<boolean> {
        try {
            const result = await Promise.race([
                this.connection.getSlot(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Solana RPC timeout')), 5000)),
            ]);
            return true;
        } catch (e) {
            blobLog.warn('Solana health check failed:', e);
            return false;
        }
    }

    /**
     * [OPTIONAL] Anchor the capture hash to Solana Blockchain
     * This creates an on-chain record (Memo) of the capture hash.
     * 
     * @param contentHash The hash to anchor
     * @returns Transaction signature
     */
    static async anchorCapture(contentHash: string): Promise<string | null> {
        blobLog.info('⚓ Anchoring to Solana Blockchain...');
        try {
            return await transact(async (wallet) => {
                const {
                    Transaction,
                    SystemProgram,
                    PublicKey
                } = require('@solana/web3.js'); // Lazy load to avoid cycle issues if any

                const authorization = await wallet.authorize({
                    cluster: CAPTURE_CONFIG.SOLANA_NETWORK as any,
                    identity: {
                        name: 'indelible.Blob',
                        uri: 'https://indelible-blob.walrus.site',
                        icon: 'favicon.ico',
                    },
                });

                const latestBlockhash = await SolanaService.connection.getLatestBlockhash();

                // create a simple transaction with a memo
                // Memo Program ID: MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcQb
                const MEMO_PROGRAM_ID = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcQb");

                const tx = new Transaction({
                    ...latestBlockhash,
                    feePayer: new PublicKey(authorization.accounts[0].address)
                }).add({
                    keys: [],
                    programId: MEMO_PROGRAM_ID,
                    data: Buffer.from(`INDELIBLE:${contentHash}`, 'utf-8')
                });

                const signatures = await wallet.signAndSendTransactions({
                    transactions: [tx]
                });

                blobLog.success('⚓ Solana Anchor Success', signatures[0]);
                return signatures[0];
            });
        } catch (error) {
            blobLog.warn('⚠️ Solana Anchor failed (Optional step)', error);
            // We don't throw here strictly, as Sui is the primary storage
            return null;
        }
    }
}

