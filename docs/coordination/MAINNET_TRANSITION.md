# Mainnet Transition Plan — indelible.Blob

Moving from our current Testnet/Devnet architecture to Production Mainnet is fundamentally an exercise in flipping configuration switches, but those switches point to real economic infrastructure that must be carefully orchestrated.

This document tracks the requirements for the final transition.

## The "Flipping Switches" Analogy
Yes, it is largely as simple as changing `SOLANA_NETWORK = 'mainnet-beta'` and `SUI_NETWORK = 'mainnet'`. However, *before* those switches can be flipped, the corresponding infrastructure must be deployed on the target networks.

### 1. Solana Layer (Identity & Commerce)
**Current:** Devnet/Testnet RPC, Testnet SKR Mint
**Mainnet Requirement:**
- [ ] Create a production Squads Multisig to act as the `SKR_TREASURY_WALLET`.
- [ ] Ensure the application uses the official Mainnet SKR Mint Address (`SKRbvo6Gf7GondiT3BbTfuRDPqLWei4j2Qy2NPGZhW3`).
- [ ] Update `SOLANA_RPC_URL` to a production-grade RPC provider (e.g., Helius, Triton) to ensure reliability during capture payments.

### 2. Sui Layer (Data Provenance & Access Control)
**Current:** Testnet RPC, Testnet Package IDs, Testnet zkLogin Prover
**Mainnet Requirement:**
- [ ] Deploy `indelible_blob.move` to Sui Mainnet. Pay deployment gas in real SUI.
- [ ] Deploy `sovereign_blob.move` (Seal policy) to Sui Mainnet. Pay deployment gas in real SUI.
- [ ] Enoki / zkLogin: Switch Enoki portal to "Mainnet" mode. The zkLogin prover URL and salt endpoints must point to production.
- [ ] Update `config.ts` with the new Mainnet Package IDs.
- [ ] Fund the Gas Station (Sponsor address) with real SUI to cover users' transaction fees, or implement a fee-charging mechanism.

### 3. Walrus Layer (Storage)
**Current:** Testnet Publisher/Aggregator URLs
**Mainnet Requirement:**
- [ ] Switch `WALRUS_PUBLISHER` and `WALRUS_AGGREGATOR` to Mainnet endpoints.
- [ ] Purchase WAL tokens on Mainnet to fund storage costs.
- [ ] Note: As of early 2026, Walrus Mainnet requires purchasing storage epochs. Ensure the publisher wallet is sufficiently funded.

### 4. Seal Encryption Layer (Sovereign Mode)
**Current:** Testnet Key Servers (2-of-2 threshold)
**Mainnet Requirement:**
- [ ] Switch `retrieveKeyServers` / `getAllowlistedKeyServers` to use `'mainnet'`.
- [ ] Mainnet key servers may have a different threshold (e.g., 2-of-3 or 3-of-4). Update `threshold: 1` in `encrypt()` to the appropriate secure threshold for Mainnet.

### 5. Gas & Cost Management (Does NOT Exist on Testnet)

On testnet, gas is free and infinite. On mainnet, every transaction costs real money. This is the single biggest operational difference.

**What must be built:**
- [ ] `GasManager.ensureGas()` currently auto-drips from Sui faucet. On mainnet there is no faucet. Replace with user-facing "Low SUI balance" warning.
- [ ] `GasManager.ensureSolanaGas()` currently auto-airdrops SOL. Must be disabled on mainnet entirely.
- [ ] Users need SOL for SPL transfers (SKR payment gas ~0.000005 SOL per transfer). If they have SKR but no SOL, payment fails. Must handle this edge case.
- [ ] Estimate per-session gas cost across both chains (Sui recording + Solana SKR transfer) and communicate to users before session start.

**Potential solution — Sui Sponsored Transactions (P2):**
Sui supports a pattern where the platform pays gas on behalf of users. This lets users capture without holding SUI. Requires a funded hot wallet on the platform side. Significant UX improvement but adds operational complexity (monitoring wallet balance, refilling).

### 6. Operational Infrastructure (Does NOT Exist on Testnet)

| Requirement | Why It Matters | Priority |
|-------------|---------------|----------|
| **Transaction success monitoring** | Alert if >5% of Sui/Solana txs fail — indicates RPC issues or gas depletion | P0 |
| **RPC health monitoring** | Public RPCs have rate limits and downtime. Need fallback providers. | P0 |
| **Dedicated RPC providers** | `api.mainnet-beta.solana.com` and `fullnode.mainnet.sui.io` are shared infrastructure with rate limits. Production apps need Helius/QuickNode/Triton. | P0 |
| **Structured error logging** | Replace `console.log` with structured logging. Debug information must never leak to production builds. | P1 |
| **Revenue monitoring** | Dashboard: SKR inflows, gas costs, Walrus storage costs, net revenue | P1 |
| **Emergency pause** | Ability to halt SKR collection if critical bug found. Config flag or remote kill switch. | P0 |
| **Incident response plan** | Documented: who to notify, severity levels, rollback procedures | P0 |

### 7. Security Differences: Testnet vs Mainnet

| Testnet Reality | Mainnet Reality |
|-----------------|-----------------|
| Tokens have no value — mistakes are free | Real money — mistakes are irreversible |
| Nobody is trying to exploit your contracts | Attackers are financially motivated |
| You can reset/redeploy anytime | Deployed contract state is permanent |
| Faucet covers all gas | Users pay for everything |
| Console.log everything for debugging | Debug logs in production leak sensitive info |
| Single keypair treasury is fine | Multisig required — single key = single point of failure |
| RPC downtime is annoying | RPC downtime = lost revenue and user trust |

**Smart contract audit is non-negotiable before mainnet.** Both `indelible_blob.move` and `sovereign_blob.move` must be reviewed by an external auditor. Move is safer than Solidity (no reentrancy, built-in overflow protection), but access control bugs and logic errors can still cause permanent damage on mainnet.

---

## Smart Contract Audit: Methods, Firms & Process

### Why This Is Non-Negotiable

On testnet, a bug in `indelible_blob.move` means you redeploy. On mainnet, a bug means:
- Corrupted provenance records that can never be corrected (immutable chain)
- Potential loss of user funds (if access control is wrong, someone else could claim Capture objects)
- Reputational damage that undermines the entire trust premise of the product

Move is inherently safer than Solidity (no reentrancy, built-in integer overflow protection, resource-oriented ownership model), but it's not immune to **logic errors** — the most dangerous category because they pass compilation and look correct.

### What Gets Audited

| Contract | Lines | Risk Surface |
|----------|-------|-------------|
| `indelible_blob.move` | ~142 lines | `record_capture`: validates input data types, creates owned Capture objects, emits events. Risk: Can someone create a Capture they don't own? Can input fields be manipulated to corrupt provenance? |
| `sovereign_blob.move` | ~50-80 lines (est.) | `seal_approve`: controls who can decrypt Sovereign Mode captures. Risk: Can someone decrypt another user's encrypted media? Is the key ID verification correct? |

Our contracts are small (under 250 lines total). This is good — it means audits are faster and cheaper than typical DeFi protocols.

### The Three Tiers of Audit

**Tier 1: Automated Analysis (Do Now — Free)**
- **Sui Move Prover**: Formal verification tool built into the Move compiler. Proves mathematical properties about your code (e.g., "a Capture object can only be owned by its creator"). Run with `sui move prove`.
- **MoveScan**: Static analysis tool for common Move vulnerabilities.
- **Internal review**: 1D (Claude Code) has already reviewed both contracts. This is necessary but not sufficient — self-review catches obvious bugs, not subtle logic errors.
- **Cost:** $0. **Timeline:** 1-2 days.
- **What it catches:** Type errors, obvious access control issues, known vulnerability patterns.
- **What it misses:** Business logic errors, economic exploits, edge cases in complex state transitions.

**Tier 2: Professional Audit Firm (Do Before Mainnet — Required)**

Reputable firms with proven Move/Sui expertise:

| Firm | Specialty | Why They're Relevant |
|------|-----------|---------------------|
| **[OtterSec](https://osec.io)** | Deep manual reviews, Solana + Sui + Aptos. Collaborative style. | They audit both Solana and Sui — ideal for our cross-chain architecture. They can review the MWA integration patterns too. |
| **[MoveBit](https://movebit.xyz)** | First firm to integrate formal verification into Sui audits. Move-native. | Pure Move specialists. If you want the deepest Move expertise, this is the team. They also run CTFs and contribute tooling to the ecosystem. |
| **[Zellic](https://zellic.io)** | Active Sui project engagements, advanced vulnerability research. | Known for finding complex logic bugs that automated tools miss. |
| **[Certora](https://certora.com)** | Hybrid reports: mathematical verification + manual review. | If you want the strongest formal guarantees — they mathematically prove your contract behaves correctly under all inputs. |
| **[Hacken](https://hacken.io)** | Move-specific audit checklist, broad ecosystem coverage. | More affordable option with structured methodology. Good for startups. |

**Expected cost for our scope (~250 lines, 2 contracts):**
- Small Move audit: **$5,000 – $15,000** (our contracts are simple, no DeFi complexity)
- Timeline: **1-2 weeks** for contracts this size
- Rush premium: 50-100% extra for faster turnaround

**What a professional audit delivers:**
1. Line-by-line manual code review by Move security experts
2. Formal verification of critical invariants
3. Attack scenario testing (can X bypass Y?)
4. Written report with severity ratings (Critical / High / Medium / Low / Informational)
5. Re-audit of fixes (most firms include one round of fix verification)

**Tier 3: Bug Bounty Program (Do After Launch — Ongoing)**
- Platforms: [Immunefi](https://immunefi.com), [HackerOne](https://hackerone.com)
- Offer bounties for finding vulnerabilities post-launch
- Typical bounty: $500-$5,000 for critical findings (scale to our TVL)
- This is defense-in-depth — the audit catches known patterns, bounty hunters catch novel attacks
- **Cost:** Variable (only pay when bugs are found). **Timeline:** Ongoing.

### The Audit Process: Step by Step

**Step 1: Prepare the audit package**
- Freeze contract code (no changes during audit)
- Write a specification document: "Here is what the contract is supposed to do"
  - `record_capture` should: create a Capture owned by `tx_context::sender()`, emit CaptureRecorded event, accept these parameter types...
  - `seal_approve` should: verify the caller owns the SovereignBlob object, validate the key ID matches the stored creator + nonce...
- List all entry points and their expected access control
- Document known limitations or intentional design choices
- Provide test cases (if any)

**Step 2: Engage the firm**
- Submit the audit package + codebase
- Discuss scope, timeline, and cost
- Sign engagement agreement
- Auditors begin review (typically 1-2 weeks for our size)

**Step 3: Receive and address findings**
- Audit report delivered with categorized findings
- **Critical/High**: Must fix before mainnet. No exceptions.
- **Medium**: Should fix. May accept risk with documented rationale.
- **Low/Informational**: Fix if time permits. Usually code quality improvements.

**Step 4: Fix and re-verify**
- Implement fixes for all Critical/High findings
- Submit fixes to auditor for re-verification (usually included in original engagement)
- Receive final "clean" audit report

**Step 5: Publish the report**
- Make the audit report public (builds trust with users and the Sui ecosystem)
- Link from README, website, and dApp Store listing
- This is a competitive advantage — most hackathon projects never get audited

### Our Recommended Path

Given our budget and timeline:

1. **Now (hackathon sprint):** Run `sui move prove` on both contracts. 1D continues manual review. Cost: $0.
2. **Post-hackathon Week 1:** Engage **OtterSec** or **MoveBit** for a professional audit. Our contracts are small enough for a fast, affordable engagement. Budget: $5,000-$10,000.
3. **Post-launch Month 2:** Set up Immunefi bug bounty program. Budget: $500-$5,000 reserve.

### Checklist

- [ ] Run `sui move prove` on `indelible_blob.move`
- [ ] Run `sui move prove` on `sovereign_blob.move`
- [ ] Write contract specification document (what each function should do)
- [ ] Prepare audit package (frozen code + spec + test cases)
- [ ] Get quotes from 2-3 audit firms (OtterSec, MoveBit, Zellic)
- [ ] Select firm and sign engagement
- [ ] Receive audit report
- [ ] Fix all Critical/High findings
- [ ] Re-verification from auditor
- [ ] Publish audit report
- [ ] Set up bug bounty program (post-launch)

---

## Client-Side Integration Audit: Solana, Walrus & Seal

The Move smart contract audit above covers *deployed on-chain code*. But our attack surface extends well beyond the contracts. The client-side TypeScript/React Native code that orchestrates Solana MWA, Walrus uploads, and Seal encryption is equally critical — and it requires a **different audit methodology** because the code runs on the user's device, not on-chain.

### Why Client-Side Audits Are Different from Smart Contract Audits

| Dimension | Smart Contract (Move) | Client-Side Integration (TypeScript) |
|-----------|----------------------|--------------------------------------|
| **Where it runs** | On-chain validators (deterministic) | User's phone (untrusted environment) |
| **Immutability** | Deployed permanently | Updated via app store |
| **Attack surface** | Entry point functions only | Network, storage, memory, OS APIs |
| **Audit approach** | Formal verification + manual review | Penetration testing + code review |
| **Repair cost** | Requires new deployment (expensive, permanent) | App update (cheap, fast) |
| **Who audits** | Blockchain security firms (OtterSec, MoveBit) | Application security firms or internal team |

**Key insight**: Client-side bugs are cheaper to fix (just push an app update) but more likely to exist (larger codebase, more attack surface). Smart contract bugs are catastrophic but the code is smaller and Move is inherently safer. Both need rigorous review, but with different tools.

### 1. Solana Layer: MWA, TEEPIN & SPL Transfers

**What we're auditing**: The code in `mobile/src/services/solana.ts`, `identity.ts`, and the upcoming `SkrService` that handles Solana Mobile Wallet Adapter (MWA) interactions, TEEPIN hardware attestation, and SKR token transfers.

**Attack Scenarios to Test:**

| Attack | Description | Test Method |
|--------|-------------|-------------|
| **Session bind replay** | Attacker captures MWA `signMessage` payload and replays on different device | Verify session bind includes timestamp + device-specific data. Check: is `"Indelible Bind: {suiAddress}_{timestamp}"` resistant to replay? The timestamp provides freshness but has no server-side verification. |
| **TEEPIN signature forgery** | Attacker without Seeker device generates fake TEEPIN signatures | Verify signature verification checks the public key against known Solana Seeker hardware keys. Are we validating the attestation certificate chain, or just checking the signature format? |
| **SPL transfer manipulation** | Attacker modifies transfer amount or destination in transit | MWA `transact()` presents the transaction to the user for signing in the wallet app — the wallet itself is the protection. Verify we're constructing the transaction correctly (right mint, right recipient, right amount). |
| **Associated Token Account confusion** | SKR sent to wrong ATA or non-existent account | Verify `getAssociatedTokenAddress()` uses the correct mint (`SKRbvo6Gf7GondiT3BbTfuRDPqLWei4j2Qy2NPGZhW3`) and owner. Handle case where treasury ATA doesn't exist yet. |
| **Balance check race condition** | User spends SKR between our balance check and session end settlement | Balance check is at session start; settlement is at session end. Between these, user could transfer SKR elsewhere. Mitigation: check balance again before settlement, handle insufficient funds gracefully (`payment_pending`). |

**Audit Method:**
- **Internal code review** (1D + Claude Code): Review all `transact()` call sites, verify transaction construction, check error handling paths. **Cost: $0. Timeline: 1-2 days.**
- **MWA integration testing**: Test on real Seeker device with edge cases (reject transaction, timeout, wallet disconnect mid-session, switch wallets between sessions).
- **Solana-focused external audit**: Firms like **OtterSec** and **Sec3** (formerly Soteria) specialize in Solana application audits. If budget allows, include our Solana integration code in the Move contract audit scope. **Additional cost: $2,000-$5,000.**

**What to document for auditors:**
- All MWA `transact()` call sites and what each transaction does
- The session bind flow and how it maps to TEEPIN attestation
- The SPL transfer flow (amount calculation, recipient, error handling)
- How `payment_pending` state is managed across sessions

### 2. Walrus Layer: Upload Pipeline & Blob Integrity

**What we're auditing**: The code in `shared/services/walrus.ts` (and mobile equivalents) that handles blob uploads, retrieval, and integrity verification.

**Attack Scenarios to Test:**

| Attack | Description | Test Method |
|--------|-------------|-------------|
| **Man-in-the-middle on upload** | Attacker intercepts HTTPS upload and substitutes different blob data | Verify TLS certificate validation is active (React Native default). On mainnet: consider certificate pinning for Walrus publisher URLs. |
| **Blob ID mismatch** | Publisher returns a blobId that doesn't match what we uploaded | After upload, retrieve the blob and verify its hash matches the original content hash. Currently we trust the publisher's response — we should verify. |
| **Epoch expiration** | Blobs expire after purchased epochs; provenance data lost | On testnet, epochs are free and short. On mainnet, purchased epochs are longer but finite. Must either: (a) auto-renew critical blobs, or (b) store content hash on-chain so provenance survives blob expiration. We do (b) — the Sui Capture object stores `content_hash` independently. |
| **Publisher downtime** | Walrus publisher unavailable during capture session | Implement upload queue with retry. Captures should never be lost due to temporary upload failure. Currently: single attempt with timeout. |
| **Malicious publisher node** | Publisher accepts blob but doesn't store it on the Walrus network | Verify blob existence by reading from a *different* aggregator after upload. Cross-aggregator verification. |

**Audit Method:**
- **Internal review** (1D): Verify HTTPS enforcement, check upload/download flow, ensure content hash is stored on-chain independently of blob availability. **Cost: $0.**
- **Integration testing**: Upload blobs, verify via multiple aggregators, test with expired epochs, test publisher failover.
- **Walrus ecosystem resources**: As the Walrus ecosystem matures, their team may offer integration reviews for launch partners. Worth asking Mysten Labs directly.

**Mainnet-specific concern**: On testnet, the publisher and aggregator are Mysten-operated and free. On mainnet, there will be multiple independent publishers/aggregators with different reliability. We need:
- [ ] Configurable publisher/aggregator URLs (already have this)
- [ ] Fallback to alternative publisher if primary is down
- [ ] Post-upload verification against a different aggregator
- [ ] WAL token balance monitoring (alert before storage funds run out)

### 3. Seal Layer: Encryption, Key Servers & HermesAesGcm256

**What we're auditing**: The code in `shared/services/seal.ts` including our custom `HermesAesGcm256` implementation, key ID computation, nonce generation, and interaction with Seal key servers.

**This is the highest-risk client-side component.** A bug in Seal integration means either:
- (a) Sovereign Mode media can be decrypted by unauthorized parties, or
- (b) Authorized users can't decrypt their own media (permanent data loss)

Both are catastrophic. (a) violates user trust; (b) violates our Constitution (users own their data).

**Attack Scenarios to Test:**

| Attack | Description | Test Method |
|--------|-------------|-------------|
| **Key ID computation error** | Key ID doesn't match what `seal_approve` expects → nobody can decrypt | Verify byte-level key ID construction: `[package_id_bytes ∥ creator_address_bytes ∥ nonce_bytes]`. Must use BCS serialization, not string concatenation. Test: encrypt with key ID, then call `seal_approve` on-chain, verify it passes. |
| **Nonce reuse** | Two captures encrypted with same nonce → related key IDs, potential key recovery | Verify `generateNonce()` uses `crypto.getRandomValues(new Uint8Array(32))`. 32 bytes = 2^256 possible nonces — collision is astronomically unlikely. But verify it's actually called per-capture, not cached. |
| **HermesAesGcm256 implementation error** | Our custom AES-GCM wrapper produces incorrect ciphertext that can't be decrypted | **This is the #1 risk.** We replaced the SDK's `AesGcm256` with our own using `@noble/ciphers`. Test: encrypt with `HermesAesGcm256`, decrypt with the SDK's `AesGcm256` (in a Node.js environment where both work). If roundtrip succeeds, implementations are compatible. |
| **Fixed IV security** | The hardcoded `SEAL_IV` weakens encryption | **Already reviewed and approved.** The IV is fixed at `[138, 55, 153, ...]` but each encryption uses a fresh random 32-byte key from `crypto.getRandomValues`. AES-GCM security requires unique (key, IV) pairs — since the key is always unique, the fixed IV is safe. This is an unusual but valid pattern. |
| **Key server trust** | Malicious key server returns wrong decryption key | Seal uses threshold encryption (currently 2-of-2 on testnet). On mainnet, use higher threshold (2-of-3 or 3-of-4). Verify our code queries the correct number of key servers and enforces the threshold. |
| **Encryption bypass** | Attacker modifies `isSovereign` flag to skip encryption | This is a client-side toggle. On-chain, the `is_sovereign` field in the Capture object records whether encryption was applied. Verify: if `is_sovereign=true` on-chain, the blob must actually be encrypted (verify by attempting raw download). |

**Audit Method:**
- **Cryptographic review** (specialized): The `HermesAesGcm256` class is a custom cryptographic implementation. Custom crypto is always high-risk. Options:
  - **Best**: Have the `@noble/ciphers` author (Paul Miller / @paulmillr) or a cryptographer review our wrapper. Paul Miller offers paid reviews of code using his libraries.
  - **Good**: Include in the OtterSec/MoveBit audit scope — most blockchain security firms have cryptographers on staff.
  - **Minimum**: Comprehensive test suite: encrypt with our impl, decrypt with reference impl, verify compatibility across all edge cases (empty data, max-size data, non-ASCII, binary blobs).
- **Seal SDK compatibility testing**: Test against every Seal SDK version bump. If Mysten updates the encryption format, our custom implementation must stay compatible.
- **End-to-end roundtrip testing**: Encrypt on Seeker device → upload to Walrus → download on different device → decrypt. Verify media integrity. **This is the definitive test.**

**Cost estimate for Seal/crypto review**: $2,000-$5,000 if bundled with Move contract audit. Standalone cryptographic review: $3,000-$8,000.

### 4. Cross-Chain Integration: The Glue Between Chains

**What we're auditing**: The orchestration logic that ties Solana identity, Sui provenance, Walrus storage, and Seal encryption into a single capture flow.

This is where **integration bugs** live — each component works correctly in isolation, but the handoffs between them introduce risk.

**Critical Integration Points:**

| Integration | Risk | Verification |
|-------------|------|-------------|
| **Solana address → Seal key ID** | If Solana address used for TEEPIN doesn't match address used for Seal key ID, decryption fails permanently | Verify same address flows through both paths. Trace from `identity.ts` session bind through to `seal.ts` `computeKeyId()`. |
| **Content hash → Sui recording** | If hash computed before watermark differs from hash computed after, provenance is broken | Verify hash is computed on the final, watermarked/bumper'd content — the exact bytes that get uploaded to Walrus. |
| **Walrus blobId → Sui recording** | If blobId stored on Sui doesn't match actual Walrus blob, verification fails | Verify blobId from Walrus upload response is passed directly to `record_capture()` without modification. |
| **Seal encryption → Walrus upload** | If encrypted bytes are modified between Seal.encrypt() and Walrus upload, decryption fails | Verify no intermediate processing (compression, encoding) between encryption output and upload input. |
| **SKR payment → Capture recording** | If payment fails but capture records on Sui anyway, we've given away free captures | By architecture design, captures always record (no data loss). Payment failure → `payment_pending`. This is intentional — user's data rights take precedence over payment. But verify `payment_pending` is actually tracked and resolved. |

**Audit Method:**
- **End-to-end integration test suite**: Script that performs a complete capture cycle (session start → SKR gate → capture → encrypt → upload → record → session end → SKR settlement) and verifies every handoff.
- **Failure injection testing**: What happens when each component fails mid-flow? Network drops during Walrus upload? Sui RPC timeout during recording? MWA disconnect during SKR transfer? Each failure mode needs a defined recovery path.
- **Data consistency verification**: After a capture, query Sui for the Capture object, download the blob from Walrus, and verify: content_hash matches, blobId matches, is_sovereign matches encryption state, GPS data matches, TEEPIN signature is valid.

### Integration Audit Checklist

**Solana:**
- [ ] Review all MWA `transact()` call sites for correct transaction construction
- [ ] Verify TEEPIN signature verification against known hardware keys
- [ ] Test SPL transfer with insufficient balance, wrong mint, non-existent ATA
- [ ] Verify session bind freshness (timestamp-based replay prevention)
- [ ] Test wallet disconnect/reconnect during active session

**Walrus:**
- [ ] Verify HTTPS/TLS enforcement on all publisher/aggregator requests
- [ ] Implement post-upload verification (download and hash-compare)
- [ ] Test upload failure recovery (retry queue, no data loss)
- [ ] Verify content hash is computed on final content (post-watermark)
- [ ] Plan for epoch expiration monitoring on mainnet

**Seal:**
- [ ] **HermesAesGcm256 compatibility test**: encrypt with ours, decrypt with SDK reference
- [ ] Verify key ID computation matches `seal_approve` expectations (BCS serialization)
- [ ] Verify nonce is unique per capture (no caching, no reuse)
- [ ] Test threshold encryption with mainnet key server configuration
- [ ] End-to-end encrypt → upload → download → decrypt roundtrip on real device

**Cross-Chain:**
- [ ] Trace Solana address from session bind through to Seal key ID computation
- [ ] Verify blobId flows unmodified from Walrus response to Sui recording
- [ ] Verify content hash is computed on identical bytes that get uploaded
- [ ] Test every failure mode: what happens when each component fails mid-capture?
- [ ] Verify `payment_pending` tracking and resolution across sessions

### Cost Summary: Full Audit Scope

| Component | Method | Estimated Cost | Timeline |
|-----------|--------|---------------|----------|
| Move smart contracts (2 modules, ~250 lines) | External firm (OtterSec/MoveBit) | $5,000-$10,000 | 1-2 weeks |
| Solana integration (MWA, SPL, TEEPIN) | Bundle with Move audit or Sec3 | $2,000-$5,000 | 1 week |
| Seal/crypto (HermesAesGcm256, key management) | Cryptographic review | $2,000-$5,000 | 1 week |
| Walrus integration | Internal review + integration tests | $0 (internal) | 2-3 days |
| Cross-chain integration | Internal E2E test suite | $0 (internal) | 3-5 days |
| **Total** | | **$9,000-$20,000** | **2-3 weeks** |

**Budget-conscious path**: Bundle Solana + Seal review into the Move audit engagement. Most firms (OtterSec, Zellic) review the full application, not just smart contracts. Ask for a "full-stack" audit scope that includes client-side integration code. This is more cost-effective than separate engagements.

---

## The Go-Live Sequence

**Phase 1: Audit & Prepare (Post-Hackathon Week 1)**
1. Smart contract external audit (both Move modules)
2. Treasury multisig setup (Squads, 2-of-3)
3. Verify all mainnet dependencies (Walrus availability, Seal key servers, SKR mainnet mint)
4. Dedicated RPC provider accounts (Helius/QuickNode for Solana, dedicated Sui fullnode)

**Phase 2: Deploy & Test (Post-Hackathon Week 2)**
1. Deploy contracts to Sui mainnet → capture new package IDs
2. Update all config values (the actual "switch flipping")
3. End-to-end testing on mainnet with real (small) transactions
4. Gas cost measurement per capture/session
5. GasManager mainnet mode (remove faucet/airdrop code paths)

**Phase 3: Infrastructure (Post-Hackathon Weeks 3-4)**
1. Monitoring and alerting setup
2. Incident response procedures documented
3. Cost transparency UX (show users estimated costs)
4. Revenue dashboard

**Phase 4: Launch**
1. Final security review
2. Mainnet APK build (remove all testnet code paths)
3. Solana dApp Store submission
4. Public launch

---

## Key Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Walrus mainnet not ready | Cannot store blobs on mainnet | Hybrid: Sui mainnet provenance + Walrus testnet storage until ready |
| Smart contract bug on mainnet | Lost funds, corrupted provenance records | External audit before any mainnet deployment |
| Gas price spikes (Sui or Solana) | Users can't afford captures | Gas sponsorship (P2) + gas estimation warnings |
| SKR price volatility | Capture pricing unstable | Dynamic pricing config or frequent manual adjustment |
| RPC downtime | App unusable during outage | Multiple RPC providers with automatic fallback |
| Treasury key compromise | Stolen revenue | Multisig (2-of-3) — attacker needs 2 keys |

---

**Maintained by:** 1A (Mobile Lead) + 1D (Security/Quality Lead)
**Last Updated:** March 4, 2026
