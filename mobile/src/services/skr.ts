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
            const connection = new Connection(CAPTURE_CONFIG.SOLANA_RPC_URL, 'confirmed');
            const ownerKey = new PublicKey(solanaAddress);
            const mintKey = new PublicKey(CAPTURE_CONFIG.SKR_MINT_ADDRESS);

            blobLog.info('🪙 Checking SKR balance for:', solanaAddress);

            // Get the Associated Token Account (ATA) for SKR
            const ata = await getAssociatedTokenAddress(mintKey, ownerKey);

            try {
                // Fetch the token account balance
                const accountInfo = await getAccount(connection, ata);
                const balanceTotal = Number(accountInfo.amount); // atomic units (multiplier applied)

                // Convert to whole SKR
                const skrBalance = balanceTotal / SKR_MULTIPLIER;
                blobLog.info(`🪙 SKR Balance: ${skrBalance} SKR`);

                // Calculate affordable captures
                const availableCaptures = Math.floor(skrBalance / CAPTURE_CONFIG.SKR_CAPTURE_COST);
                return availableCaptures;
            } catch (e: any) {
                // Token account doesn't exist = 0 balance
                if (e.name === 'TokenAccountNotFoundError') {
                    blobLog.info('🪙 SKR Balance: 0 SKR (No ATA found)');
                    return 0;
                }
                throw e;
            }

        } catch (error) {
            blobLog.error('❌ Failed to read SKR balance:', error);
            // Fail open for hackathon or fail closed? The spec says to gate if insufficient.
            // If the RPC is down, we return 0 to be safe.
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
            const connection = new Connection(CAPTURE_CONFIG.SOLANA_RPC_URL, 'confirmed');
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

                const senderKey = new PublicKey(auth.accounts[0].address);

                // 2. Derive ATA addresses
                const senderAta = await getAssociatedTokenAddress(mintKey, senderKey);
                // In a production environment with a unified treasury, you'd ensure the treasury ATA exists.
                // For this transaction, we assume the treasury already has an ATA setup.
                const recipientAta = await getAssociatedTokenAddress(mintKey, treasuryKey);

                // 3. Build Transfer Instruction
                const transferIx = createTransferInstruction(
                    senderAta,
                    recipientAta,
                    senderKey,
                    totalCostAtomic
                );

                // 4. Build and send transaction
                // NOTE: Using legacy Transaction for MWA compatibility (simpler for basic SPL transfers)
                const latestBlockhash = await connection.getLatestBlockhash();
                const transaction = new Transaction().add(transferIx);
                transaction.recentBlockhash = latestBlockhash.blockhash;
                transaction.feePayer = senderKey;

                // 5. Sign and Send via MWA
                // Convert legacy transaction to byte array for MWA
                const txBytes = transaction.serialize({ requireAllSignatures: false, verifySignatures: false });

                blobLog.info('📲 Requesting SKR Payment Signature from Seed Vault...');
                const [signatureBytes] = await wallet.signAndSendTransactions({
                    transactions: [txBytes]
                });

                // Convert signature bytes to Base58 string for logging/explorer
                const bs58 = require('bs58');
                const signatureStr = bs58.encode(signatureBytes);

                blobLog.success(`✅ SKR Payment Successful! Tx: ${signatureStr}`);
                return true;
            });

        } catch (error: any) {
            blobLog.error('❌ SKR Payment Failed:', error.message || error);
            return false;
        }
    }
}
