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
import { getFaucetHost, requestSuiFromFaucetV1, FaucetRateLimitError } from '@mysten/sui/faucet';
import { CAPTURE_CONFIG } from '../constants/config';
import { blobLog } from '../utils/logger';

// Thresholds in MIST (1 SUI = 1,000,000,000 MIST)
const MIN_BALANCE_MIST = 50_000_000; // 0.05 SUI

export class GasManager {
    private client: SuiClient;

    constructor() {
        this.client = new SuiClient({ url: CAPTURE_CONFIG.SUI_RPC_URL || 'https://fullnode.testnet.sui.io:443' });
    }

    /**
     * Check balance and top up if needed (Testnet only).
     * Returns the confirmed balance in SUI, or throws if gas cannot be secured.
     *
     * @param address Sui Address to check
     * @param onStatus Optional callback for UI status updates
     */
    async ensureGas(address: string, onStatus?: (msg: string) => void): Promise<number> {
        if (!address) throw new Error('No address provided for gas check');

        const network = CAPTURE_CONFIG.SUI_NETWORK || 'testnet';
        const status = (msg: string) => { onStatus?.(msg); blobLog.info(msg); };

        try {
            status(`⛽ Checking ${network} balance...`);
            const balanceCtx = await this.client.getBalance({ owner: address });
            let balance = BigInt(balanceCtx.totalBalance);
            let suiBalance = Number(balance) / 1_000_000_000;

            status(`⛽ Balance: ${suiBalance.toFixed(4)} SUI`);

            if (balance < BigInt(MIN_BALANCE_MIST)) {
                if (network === 'mainnet') {
                    throw new Error(`Insufficient gas on mainnet (${suiBalance.toFixed(4)} SUI). Please fund your wallet.`);
                }

                // Attempt auto-faucet, but don't hard-fail if rate-limited
                status('💧 Requesting testnet faucet...');
                const faucetOk = await this.requestFaucet(address);

                if (faucetOk) {
                    // Wait for tokens to land
                    status('⏳ Waiting for tokens to arrive...');
                    const confirmed = await this.waitForBalance(address, MIN_BALANCE_MIST, 20_000);
                    if (confirmed.funded) {
                        suiBalance = confirmed.balance;
                        status(`✅ Funded: ${suiBalance.toFixed(4)} SUI`);
                    } else {
                        // Faucet said OK but tokens haven't landed yet — let tx attempt anyway
                        blobLog.warn('⚠️ Faucet drip sent but not confirmed yet. Proceeding to attempt tx...');
                        suiBalance = confirmed.balance;
                    }
                } else {
                    // Faucet failed (rate limited) — check if a previous drip landed
                    status('⏳ Faucet unavailable. Checking for previous funding...');
                    const recheck = await this.waitForBalance(address, MIN_BALANCE_MIST, 5_000);
                    if (recheck.funded) {
                        suiBalance = recheck.balance;
                        status(`✅ Gas ready: ${suiBalance.toFixed(4)} SUI`);
                    } else {
                        throw new Error(
                            `Wallet needs testnet SUI (${suiBalance.toFixed(4)} SUI).\n\n` +
                            `Auto-faucet is rate-limited. To fund manually:\n` +
                            `1. Copy your Sui address from the sidebar\n` +
                            `2. Visit https://faucet.sui.io\n` +
                            `3. Paste your address and request SUI\n` +
                            `4. Retry your capture once funded`
                        );
                    }
                }
            } else {
                status(`✅ Gas ready: ${suiBalance.toFixed(4)} SUI`);
            }

            return suiBalance;
        } catch (error: any) {
            blobLog.error('❌ [Sui] Gas Check Failed:', error);
            throw error;
        }
    }

    /**
     * Poll balance until it meets the minimum threshold or times out.
     * Checks every 2 seconds.
     */
    private async waitForBalance(
        address: string,
        minMist: number,
        timeoutMs: number
    ): Promise<{ funded: boolean; balance: number }> {
        const start = Date.now();
        const interval = 2000;

        while (Date.now() - start < timeoutMs) {
            await new Promise(r => setTimeout(r, interval));
            try {
                const ctx = await this.client.getBalance({ owner: address });
                const balance = BigInt(ctx.totalBalance);
                const sui = Number(balance) / 1_000_000_000;
                blobLog.info(`⏳ Balance poll: ${sui.toFixed(4)} SUI`);
                if (balance >= BigInt(minMist)) {
                    return { funded: true, balance: sui };
                }
            } catch (e) {
                blobLog.warn('⏳ Balance poll error (retrying):', e);
            }
        }

        // Final check
        try {
            const ctx = await this.client.getBalance({ owner: address });
            const sui = Number(BigInt(ctx.totalBalance)) / 1_000_000_000;
            return { funded: BigInt(ctx.totalBalance) >= BigInt(minMist), balance: sui };
        } catch {
            return { funded: false, balance: 0 };
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
     * Request tokens from Sui Testnet Faucet using official SDK.
     * Retries on rate limit with exponential backoff.
     */
    private async requestFaucet(address: string, maxRetries: number = 3): Promise<boolean> {
        const network = (CAPTURE_CONFIG.SUI_NETWORK || 'testnet') as 'testnet' | 'devnet' | 'localnet';

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                await requestSuiFromFaucetV1({
                    host: getFaucetHost(network),
                    recipient: address,
                });
                blobLog.success(`💧 [Sui/${network}] Faucet Drip Successful!`);
                return true;
            } catch (error: any) {
                if (error instanceof FaucetRateLimitError && attempt < maxRetries) {
                    const waitSec = 3 * attempt;
                    blobLog.warn(`⏳ [Sui] Faucet rate-limited. Retrying in ${waitSec}s (attempt ${attempt}/${maxRetries})...`);
                    await new Promise(r => setTimeout(r, waitSec * 1000));
                    continue;
                }
                blobLog.error(`❌ [Sui] Faucet Error (attempt ${attempt}/${maxRetries}):`, error?.message || error);
                if (attempt < maxRetries) {
                    await new Promise(r => setTimeout(r, 2000 * attempt));
                    continue;
                }
                return false;
            }
        }
        return false;
    }
}

export const activeGasManager = new GasManager();
