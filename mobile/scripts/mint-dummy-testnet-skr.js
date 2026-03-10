const { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } = require('@solana/web3.js');
const { createMint, getOrCreateAssociatedTokenAccount, mintTo } = require('@solana/spl-token');

// -------------------------------------------------------------
// USER: PASTE YOUR SEEKER PUBLIC WALLET ADDRESS HERE
// -------------------------------------------------------------
const SEEKER_WALLET_ADDRESS = "6NV9JzS33PALSvaEYwRDmKHUtb14rcc3q5GJUvGveMvf"; // e.g. "7xK..."

// 1 SKR = 1,000,000 decimals
const DECIMALS = 6;
// Mint 1000 SKR for testing
const MINT_AMOUNT = 1000 * Math.pow(10, DECIMALS);

async function main() {
    if (SEEKER_WALLET_ADDRESS === "PASTE_YOUR_ADDRESS_HERE") {
        console.error("❌ ERROR: You must replace PASTE_YOUR_ADDRESS_HERE with your actual Seeker MWA public address.");
        process.exit(1);
    }

    const connection = new Connection("https://api.testnet.solana.com", "confirmed");

    // 1. Generate an ephemeral wallet to act as the "Mint Authority"
    console.log("🔑 Generating temporary Mint Authority...");
    const mintAuthority = Keypair.generate();

    // 2. Airdrop some Testnet SOL to the Mint Authority to pay for deployment fees
    console.log(`💧 Requesting Testnet SOL airdrop for deployment (${mintAuthority.publicKey.toBase58()})...`);
    try {
        const airdropSignature = await connection.requestAirdrop(
            mintAuthority.publicKey,
            LAMPORTS_PER_SOL
        );
        await connection.confirmTransaction(airdropSignature);
        console.log("✅ Airdrop successful!");
    } catch (e) {
        console.log(`\n⚠️  Automated Airdrop Failed (Testnet RPC is likely rate-limiting your IP).`);
        console.log(`\n======================================================`);
        console.log(`💡 MANUALLY FUND THIS SCRIPT TO PROCEED:`);
        console.log(`Please open your Phantom/Solflare wallet and send 0.05 Testnet SOL to:`);
        console.log(`👉  ${mintAuthority.publicKey.toBase58()}`);
        console.log(`======================================================\n`);
        console.log(`⏳ Waiting for deposit... (Polling every 3 seconds)`);

        while (true) {
            const balance = await connection.getBalance(mintAuthority.publicKey);
            if (balance > 0) {
                console.log(`✅ Deposit received! Balance: ${balance / LAMPORTS_PER_SOL} SOL`);
                break;
            }
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }

    // 3. Create the Dummy Token
    console.log("🪙 Deploying Dummy SKR Token to Testnet...");
    const mint = await createMint(
        connection,
        mintAuthority,
        mintAuthority.publicKey,
        null,
        DECIMALS
    );
    console.log(`✅ DUMMY SKR TOKEN DEPLOYED! Address: ${mint.toBase58()}`);
    console.log("\n=======================================================");
    console.log(`1️⃣ IMPORTANT: Copy this Token Address into mobile/src/constants/config.ts as SKR_MINT_ADDRESS:`);
    console.log(`   ${mint.toBase58()}`);
    console.log("=======================================================\n");

    // 4. Create an Associated Token Account (ATA) for the Seeker Wallet
    const seekerPublicKey = new PublicKey(SEEKER_WALLET_ADDRESS);
    console.log(`💼 Creating Token Account for your Seeker wallet...`);
    const seekerTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        mintAuthority,
        mint,
        seekerPublicKey
    );

    // 5. Mint tokens to the Seeker Wallet
    console.log(`💸 Minting 1000 Dummy SKR to your Seeker wallet...`);
    await mintTo(
        connection,
        mintAuthority,
        mint,
        seekerTokenAccount.address,
        mintAuthority,
        MINT_AMOUNT
    );

    console.log(`\n🎉 SUCCESS! Your Seeker wallet now has 1000 Dummy SKR!`);
    console.log(`You can now test the SKR Gateway and Payment logic on your physical device.`);
}

main().catch(console.error);
