# Decisions Log

Use this file to track **Strategic** and **Values-Related** decisions.
See `docs/OPERATIONS_MANUAL.md` for the decision-making process.

## Template

### Decision: [Title]
**Date:** YYYY-MM-DD
**Status:** [Proposed/Approved/Rejected]
**Context:** Why is this decision needed?
**Choice:** What are we doing?
**Rationale:** How does this align with our Constitution?

---

## Decision History

### Decision: Path A — Solana-Primary Cross-Chain Architecture

**Date:** 2026-02-25
**Status:** Approved
**Decision Type:** Strategic (Leadership Approval)
**Decided By:** Founder + Claude Code (1D) + Mobile Lead (1A)

**Context:** The team evaluated multiple architectural paths for how indelible.Blob should distribute responsibilities across blockchains. The core question: which chain serves as the primary identity and attestation layer, and how do the others complement it? This decision was forced by the Solana Monolith Hackathon deadline (first week of March 2026) and the need to ship a production-grade dApp on Solana Seeker.

Three paths were considered:

- **Path A (Chosen):** Solana-primary for identity, attestation, and commerce. Sui for immutable provenance metadata. Walrus for censorship-resistant storage.
- **Path B (Rejected):** Sui-primary with Solana as secondary attestation layer.
- **Path C (Rejected):** Single-chain consolidation on either Solana or Sui.

**Choice:** Path A — Solana-primary + Sui data layer + Walrus storage.

Each blockchain serves a specific, non-overlapping purpose:

| Chain | Responsibility | Justification |
|-------|---------------|---------------|
| **Solana** | Creator identity (MWA), hardware attestation (TEEPIN via Seeker Seed Vault), SOL payments, creator reputation, Anchor marketplace program | Only chain with native hardware enclave access on Seeker devices. MWA provides self-custodial signing. TEEPIN signatures are Solana-native. |
| **Sui** | Immutable provenance metadata (20-field `Capture` object), SUI payments for discovery layer, cross-chain verification queries | High throughput, low cost, Move language safety for immutable records. Object-centric model maps naturally to capture records. |
| **Walrus** | Censorship-resistant blob storage (photos, videos, encrypted media) | Decentralized storage on Sui ecosystem. No single point of failure for media files. |
| **Seal** | User-controlled encryption for Sovereign Mode | Identity-based encryption using Solana address as public key. User controls decryption threshold. |

**Cross-chain economic flow:** Sui users can discover and purchase Solana-attested captures using SUI, funneling new liquidity to Solana creators. This positions indelible.Blob as an ecosystem bridge rather than an isolated dApp on either chain.

**Rejected alternatives:**

- **Path B** was rejected because Solana Seeker hardware attestation (TEEPIN) is Solana-native. Making Sui primary would require bridging attestation signatures cross-chain, adding latency and trust assumptions.
- **Path C** was rejected because no single chain provides all three requirements: hardware attestation (Solana), cheap immutable metadata (Sui), and decentralized storage (Walrus).

**Rationale (Constitutional Alignment):**

- **Truth Above All:** Each chain is used for what it does best. No forcing a chain into a role it was not designed for.
- **Decentralization:** Multi-chain architecture eliminates single-chain dependency. If one chain experiences downtime, the others continue operating.
- **Ethical Technology:** Self-custody enforced on both chains. Solana via MWA Seed Vault, Sui via Slush wallet. No custodial backend signing — this was explicitly rejected by Claude Code as a values violation.

**Implications:**

- Backend Lead (1B) builds Solana Anchor marketplace program (`list_capture`, `purchase_capture`, `delist_capture`).
- Mobile Lead (1A) maintains dual wallet integration: MWA (Solana) + Slush (Sui).
- Smart contract on Sui (`indelible_blob::capture::record_capture`) remains the provenance recording layer.
- All transaction signing is self-custodial. Server-side signing is permanently prohibited.

---

### Decision: Session Keys Architecture for Zero-Popup Capture UX

**Date:** 2026-02-25
**Status:** Approved
**Decision Type:** Strategic (Leadership Approval)
**Decided By:** Founder + Claude Code (1D) + Mobile Lead (1A)

**Context:** The capture pipeline requires a Sui blockchain transaction for every photo or video captured (`record_capture()`). Without optimization, each capture triggers a wallet approval popup via Slush, destroying the rapid-capture UX that field professionals (insurance adjusters, journalists) require. The team needed an architecture that enables zero-popup captures while maintaining self-custody and security guarantees.

The core tension: **UX speed vs. security rigor.** Every wallet popup is a security confirmation. Removing popups means delegating signing authority. The question was how to delegate safely.

**Choice:** Ephemeral Ed25519 Session Keys with strict security constraints.

**How it works:**

1. **Session start:** User authenticates via primary wallet (MWA for Solana, Slush for Sui). This is the only popup.
2. **Key generation:** An ephemeral Ed25519 keypair is generated and stored in `expo-secure-store` (hardware-backed Keychain/Keystore, not AsyncStorage).
3. **Gas funding:** User transfers a small amount of SUI (0.1 SUI, enough for ~10-30 captures) to the session key's derived Sui address. One-time transfer per session.
4. **Capture signing:** Each capture's Sui transaction is signed locally by the ephemeral keypair. No wallet popup. No network round-trip for approval.
5. **Session end:** Ephemeral keypair is explicitly deleted from secure storage. Remaining gas is not recoverable (acceptable loss at 0.1 SUI scale).

**Security constraints (non-negotiable):**

| Constraint | Enforcement |
|-----------|-------------|
| 1-hour hard timeout | `expiresIn: 3600` on secure storage. No extension. |
| Sui-only scope | Session key can only call `indelible_blob::capture::record_capture()`. Cannot access user funds on primary wallet. |
| Hardware-backed storage | `expo-secure-store` with `WHEN_UNLOCKED` access level. Keys stored in Secure Element (iOS) or TEE (Android). |
| Explicit cleanup | `SecureStorage.deleteSecureItem()` called on session end and app background. |
| Separate address | Session key derives its own Sui address. Blast radius limited to the 0.1 SUI gas deposit. |
| Audit trail | All session key operations (generation, signing, deletion) logged for forensic review. |

**Files modified:**

- `mobile/src/services/identity.ts` — `generateSessionKey()`, session lifecycle management
- `mobile/src/hooks/useCapture.ts` — Pass ephemeral keypair instead of wallet callback to `SuiService.recordCapture()`
- `shared/services/sui.ts` — Accept `Ed25519Keypair` parameter, sign transactions locally

**Analogy (from Claude Code):** Hotel key card. You issue a temporary credential with limited access. You can deactivate it anytime. If someone steals the key card, they can only access one room for one hour.

**Rejected alternatives:**

- **Backend signing proxy:** Rejected. Violates self-custody principle. Server holding signing keys is a custodial pattern incompatible with Constitution values.
- **Pre-signed transaction batches:** Rejected. Requires predicting transaction parameters (GPS, hash, timestamp) before capture occurs. Not feasible.
- **Unlimited session duration:** Rejected. 1-hour hard limit is a security requirement. Longer sessions increase blast radius if key is compromised.

**Rationale (Constitutional Alignment):**

- **Truth Above All:** Session key signs the real transaction with real data. No simulation, no proxy. The blockchain record is authentic.
- **Decentralization:** User controls authorization. The primary wallet issues the session. The session key cannot escalate privileges.
- **Ethical Technology:** Privacy preserved. Session key cannot access user funds, browsing history, or other wallet data. Limited blast radius protects users from key compromise.

**Implications:**

- Sui smart contract does NOT need modification. Session key calls `record_capture()` with the same parameters. The `creator` field reflects the session key address, not the primary wallet. Linking session key to primary identity is handled off-chain via the session bind signature.
- Future consideration: `session_bind_signature` field may be added to the Move contract to enable on-chain verification that the session key was authorized by the primary wallet. Deferred post-hackathon.
- Security Lead (1D) must audit all Session Keys code before merge. Checklist: secure storage, timeout enforcement, cleanup, no key logging, separate address, audit trail.

---

*Last Updated: 2026-02-26 by Agent 1 (Product & Engineering Lead)*
