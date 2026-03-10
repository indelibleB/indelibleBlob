/**
 * ============================================================================
 * GAS MANAGER (The "Gas Tank")
 * ============================================================================
 * 
 * AUTOMATED FAUCET & BALANCE MANAGEMENT
 * 
 * Responsibilities:
 * - Check SUI balance for the active Session Delegate
 * - Automatically request gas from Testnet Faucet if low
 * - Alert user if Mainnet gas is critical (Future)
 */

import { SuiClient } from '@mysten/sui/client';
import { CAPTURE_CONFIG } from '../constants/config';
import { blobLog } from '../utils/logger';

// Thresholds in MIST (1 SUI = 1,000,000,000 MIST)
const MIN_BALANCE_MIST = 50_000_000; // 0.05 SUI
const FAUCET_URL = 'https://faucet.testnet.sui.io/gas';

export class GasManager {
    private client: SuiClient;

    constructor() {
        this.client = new SuiClient({ url: CAPTURE_CONFIG.SUI_RPC_URL || 'https://fullnode.testnet.sui.io:443' });
    }

    /**
     * Check balance and top up if needed (Testnet only)
     * @param address Sui Address to check
     */
    async ensureGas(address: string): Promise<boolean> {
        if (!address) return false;

        try {
            const balanceCtx = await this.client.getBalance({ owner: address });
            const balance = BigInt(balanceCtx.totalBalance);

            blobLog.info(`⛽ [Sui] Balance Check: ${Number(balance) / 1_000_000_000} SUI`);

            if (balance < BigInt(MIN_BALANCE_MIST)) {
                // If on Testnet/Devnet, auto-drip
                if (CAPTURE_CONFIG.SUI_NETWORK !== 'mainnet') {
                    blobLog.warn('📉 [Sui] Low Gas Detected. Requesting Faucet...');
                    return await this.requestFaucet(address);
                } else {
                    blobLog.warn('⚠️ [Sui] Low Gas on Mainnet! Please fund your wallet.');
                    return false;
                }
            }

            return true;
        } catch (error) {
            blobLog.error('❌ [Sui] Gas Check Failed:', error);
            return false;
        }
    }

    /**
     * Check Solana balance and top up if needed (Devnet/Testnet only)
     * @param address Solana Public Key
     */
    async ensureSolanaGas(address: string): Promise<boolean> {
        if (!address) return false;

        try {
            // Lazy import to avoid hoisting issues/cycles
            const { Connection, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');

            const connection = new Connection(CAPTURE_CONFIG.SOLANA_RPC_URL, 'confirmed');
            const pubKey = new PublicKey(address);

            const balance = await connection.getBalance(pubKey);
            blobLog.info(`⛽ [Solana] Balance Check: ${balance / LAMPORTS_PER_SOL} SOL`);

            const MIN_SOL_BALANCE = 0.05 * LAMPORTS_PER_SOL;

            if (balance < MIN_SOL_BALANCE) {
                if (CAPTURE_CONFIG.SOLANA_NETWORK === 'devnet' || CAPTURE_CONFIG.SOLANA_NETWORK === 'testnet') {
                    blobLog.warn('📉 [Solana] Low Gas. Requesting Airdrop...');
                    const signature = await connection.requestAirdrop(pubKey, 1 * LAMPORTS_PER_SOL);

                    // Confirm it
                    const latestBlockHash = await connection.getLatestBlockhash();
                    await connection.confirmTransaction({
                        blockhash: latestBlockHash.blockhash,
                        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
                        signature
                    });

                    blobLog.success('💧 [Solana] Airdrop Successful! (+1 SOL)');
                    return true;
                } else {
                    blobLog.warn('⚠️ [Solana] Low Gas on Mainnet! Please fund your wallet.');
                    return false;
                }
            }
            return true;

        } catch (error) {
            blobLog.error('❌ [Solana] Gas Check Failed:', error);
            return false;
        }
    }

    /**
     * Request tokens from Sui Testnet Faucet
     */
    private async requestFaucet(address: string): Promise<boolean> {
        try {
            const response = await fetch(FAUCET_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    FixedAmountRequest: {
                        recipient: address,
                    },
                }),
            });

            if (response.ok) {
                blobLog.success('💧 [Sui] Faucet Drip Successful! (+ SUI)');
                return true;
            } else {
                const text = await response.text();
                blobLog.warn(`⚠️ [Sui] Faucet Request Failed: ${response.status}`, text);
                return false;
            }
        } catch (error) {
            blobLog.error('❌ [Sui] Faucet Network Error:', error);
            return false;
        }
    }
}

export const activeGasManager = new GasManager();
