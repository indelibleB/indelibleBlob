/**
 * ============================================================================
 * SKR SERVICE (Commerce Layer)
 * ============================================================================
 * 
 * Handles SKR token (SPL) balance reads and transfers.
 * 
 * ARCHITECTURE (Per-Session Gating + Post-Settlement):
 * 1. Session start: Read SKR balance to compute `availableCaptures`.
 * 2. Session end: Execute single MWA `transact()` to pay for `capturesConsumed`.
 * 
 * 1 SKR = 1,000,000 decimals (standard SPL).
 */

import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferInstruction, getAccount } from '@solana/spl-token';
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { CAPTURE_CONFIG } from '../constants/config';
import { blobLog } from '../utils/logger';

// 1 SKR usually has 6 decimals, but we'll fetch MINT info dynamically if needed.
// For now, assuming 6 decimals which is standard for most SPL tokens.
const SKR_DECIMALS = 6;
const SKR_MULTIPLIER = Math.pow(10, SKR_DECIMALS);

export class SkrService {
    /**
     * Resolve a Solana address that may be base58 OR base64-encoded raw bytes.
     * MWA Seed Vault returns raw bytes which identity.ts stores as base64.
     */
    private static resolvePublicKey(address: string): PublicKey {
        // Base64 indicators: contains +, /, or ends with =
        if (address.includes('/') || address.includes('+') || address.endsWith('=')) {
            const bytes = Buffer.from(address, 'base64');
            return new PublicKey(bytes);
        }
        return new PublicKey(address);
    }

    /**
     * Get the available captures based on the user's SKR balance.
     * @param solanaAddress The user's Solana public key connect via MWA
     * @returns The number of captures they can afford
     */
    static async getAvailableCaptures(solanaAddress: string): Promise<number> {
        if (!CAPTURE_CONFIG.SKR_MINT_ADDRESS || !CAPTURE_CONFIG.SKR_CAPTURE_COST) {
            blobLog.warn('⚠️ SKR Configuration missing. Assuming 0 balance.');
            return 0;
        }

        try {
            // MWA stores the address as base64-encoded raw bytes.
            const ownerKey = this.resolvePublicKey(solanaAddress);

            blobLog.info('🪙 Checking SKR balance for:', ownerKey.toBase58());

            // Use raw fetch() to bypass jayson/uuid crash in React Native.
            const response = await fetch(CAPTURE_CONFIG.SOLANA_RPC_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'getTokenAccountsByOwner',
                    params: [
                        ownerKey.toBase58(),
                        { mint: CAPTURE_CONFIG.SKR_MINT_ADDRESS },
                        { encoding: 'jsonParsed' },
                    ],
                }),
            });

            const json = await response.json();

            if (json.error) {
                blobLog.error('❌ RPC error reading SKR balance:', json.error.message);
                return 0;
            }

            const accounts = json.result?.value || [];
            if (accounts.length === 0) {
                blobLog.info('🪙 SKR Balance: 0 SKR (No token account found)');
                return 0;
            }

            // Parse the token balance from the parsed account data
            const tokenAmount = accounts[0]?.account?.data?.parsed?.info?.tokenAmount;
            const balanceTotal = Number(tokenAmount?.amount || 0);

            // Convert to whole SKR
            const skrBalance = balanceTotal / SKR_MULTIPLIER;
            blobLog.info(`🪙 SKR Balance: ${skrBalance} SKR`);

            // Calculate affordable captures
            const availableCaptures = Math.floor(skrBalance / CAPTURE_CONFIG.SKR_CAPTURE_COST);
            return availableCaptures;

        } catch (error) {
            blobLog.error('❌ Failed to read SKR balance:', error);
            return 0;
        }
    }

    /**
     * Settle the session by transferring SKR for the captures consumed.
     * @param capturesConsumed The number of paid captures taken this session
     * @returns boolean indicating success
     */
    static async settleSessionCaptures(capturesConsumed: number): Promise<boolean> {
        if (capturesConsumed <= 0) return true;

        if (!CAPTURE_CONFIG.SKR_MINT_ADDRESS || !CAPTURE_CONFIG.SKR_TREASURY_WALLET || !CAPTURE_CONFIG.SKR_CAPTURE_COST) {
            blobLog.error('❌ SKR Configuration missing. Cannot settle.');
            return false;
        }

        const totalCostSkr = capturesConsumed * CAPTURE_CONFIG.SKR_CAPTURE_COST;
        const totalCostAtomic = totalCostSkr * SKR_MULTIPLIER;

        blobLog.info(`💸 Settling SKR: ${totalCostSkr} SKR for ${capturesConsumed} captures...`);

        try {
            const mintKey = new PublicKey(CAPTURE_CONFIG.SKR_MINT_ADDRESS);
            const treasuryKey = new PublicKey(CAPTURE_CONFIG.SKR_TREASURY_WALLET);

            return await transact(async (wallet) => {
                // 1. Authorize MWA connection
                const auth = await wallet.authorize({
                    cluster: CAPTURE_CONFIG.SOLANA_NETWORK as any,
                    identity: {
                        name: 'indelible.Blob',
                        uri: 'https://indelible-blob.walrus.site',
                        icon: 'favicon.ico',
                    },
                });

                const senderKey = this.resolvePublicKey(auth.accounts[0].address);

                // 2. Derive ATA addresses
                const senderAta = await getAssociatedTokenAddress(mintKey, senderKey, true);
                // In a production environment with a unified treasury, you'd ensure the treasury ATA exists.
                // For this transaction, we assume the treasury already has an ATA setup.
                const recipientAta = await getAssociatedTokenAddress(mintKey, treasuryKey, true);

                // 3. Build Transfer Instruction
                const transferIx = createTransferInstruction(
                    senderAta,
                    recipientAta,
                    senderKey,
                    totalCostAtomic
                );

                // 4. Build and send transaction
                // Use raw fetch() to get blockhash (bypass jayson/uuid crash)
                const blockhashResponse = await fetch(CAPTURE_CONFIG.SOLANA_RPC_URL!, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        jsonrpc: '2.0',
                        id: 1,
                        method: 'getLatestBlockhash',
                        params: [{ commitment: 'confirmed' }],
                    }),
                });
                const blockhashJson = await blockhashResponse.json();
                const recentBlockhash = blockhashJson.result?.value?.blockhash;

                if (!recentBlockhash) {
                    throw new Error('Failed to fetch recent blockhash from RPC');
                }

                // Use VersionedTransaction since MWA web3js adapter internals expect it
                const { TransactionMessage, VersionedTransaction } = require('@solana/web3.js');

                const messageV0 = new TransactionMessage({
                    payerKey: senderKey,
                    recentBlockhash: recentBlockhash,
                    instructions: [transferIx],
                }).compileToV0Message();

                const transaction = new VersionedTransaction(messageV0);

                // 5. Sign the Transaction (Option A: Bypass MWA wrapper bug)
                // We use signTransactions to get the signed bytes back, then submit to RPC ourselves.
                // The wallet adapter for 'signTransactions' expects base64 encoded strings in the lowest level API, 
                // but the web3.js wrapper still expects Transaction objects. We'll pass the transaction object.
                blobLog.info('📲 Requesting SKR Signing from Seed Vault...');

                const [signedTx] = await wallet.signTransactions({
                    transactions: [transaction]
                });

                // 6. Submit to RPC directly
                blobLog.info('📡 Submitting signed transaction to RPC...');

                // MWA returns a fully signed VersionedTransaction. We serialize it to send to the RPC.
                const rawTxBytes = signedTx.serialize();
                const rawTxBase64 = Buffer.from(rawTxBytes).toString('base64');

                const rpcResponse = await fetch(CAPTURE_CONFIG.SOLANA_RPC_URL!, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        jsonrpc: '2.0',
                        id: 1,
                        method: 'sendTransaction',
                        params: [
                            rawTxBase64,
                            { encoding: 'base64', preflightCommitment: 'confirmed' }
                        ]
                    })
                });

                const rpcJson = await rpcResponse.json();

                if (rpcJson.error) {
                    blobLog.error('❌ RPC Submission Error:', rpcJson.error);
                    throw new Error(rpcJson.error.message || 'RPC Error');
                }

                const signatureStr = rpcJson.result;
                blobLog.success(`✅ SKR Payment Successful! Tx: ${signatureStr}`);

                return true;
            });

        } catch (error: any) {
            blobLog.error('❌ SKR Payment Failed:', error.message || error);
            return false;
        }
    }
}
