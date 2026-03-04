# Engineering Team → Coordination Hub Update
**From:** Agent 1 — Product & Engineering Lead (Manus)
**Date:** March 4, 2026
**Sprint:** Solana Monolith Hackathon — Final Sprint (5 days remaining, deadline March 9)

---

## Executive Summary

Yesterday was a high-intensity diagnostic day. The team did not ship new features but resolved a critical architecture dispute, completed a primary-source audit of the Slush integration landscape, and clarified the exact remaining work to close the Sui auth pipeline. The app is structurally sound. The path to submission is clear.

---

## What Happened Yesterday (March 3)

### 1. zkLogin Is Working — Pipeline Is 95% Complete

The zkLogin flow reached a major milestone: Google OAuth is returning valid ID tokens, the Enoki salt API (`api.enoki.mystenlabs.com/v1/zklogin`) is returning salts, and `jwtToAddress()` is deriving valid Sui addresses. The ephemeral keypair is generated and stored in SecureStorage. The `LoginModal` now presents two auth paths (zkLogin via Google + Slush via WalletConnect) with proper state handling.

**The single missing piece:** The ZK Prover API call (`https://prover.mystenlabs.com/v1`). This is approximately 20 lines of code. Once implemented, the full zkLogin signing pipeline is complete: JWT + ephemeral key + ZK proof = valid on-chain transaction. No backend required.

### 2. Architecture Dispute Resolved — Session Keys Architecture Preserved

Mobile Lead (1A) proposed removing zkLogin, making WalletConnect the sole auth path, and reverting to per-capture wallet popups. Security Lead (1D) issued a blocking course correction. All four proposed changes were rejected:

| 1A Proposed | Verdict |
|---|---|
| Remove zkLogin | REJECT — it's working; missing piece is one API call |
| WC-only auth | REJECT — WC/Slush is undocumented & fragile; zkLogin is the robust path |
| Per-capture wallet popup | REJECT — violates Session Keys architecture (Feb 25 decision) |
| Remove ephemeral keypair | REJECT — it IS the session signer |

The Session Keys architecture (approved Feb 25) stands. Zero-popup capture UX is non-negotiable.

**Security note:** 1A also attempted to extract a private key to a `.env` file. This was caught and rejected by the Founder. Security Standards protocol was reinforced.

### 3. Slush/WalletConnect — Root Cause Found, Maximum 1 Hour of Work Remaining

After 5+ days of Slush integration attempts, 1D completed a primary-source audit (Mysten Labs docs, WalletConnect chain docs, GitHub, Sui forums) and identified the root cause of all failures:

- **`@noble/curves` version mismatch** — `relay-auth@1.1.0` expected `1.8.0` but `1.9.4` was installed. This caused Ed25519 JWT signing to fail silently in Hermes, producing 401 Unauthorized from the WC relay. **This was fixed on March 2** — the relay is now confirmed connected (`"Relayer connected 🛜"`).

- **Deprecated WC method names** — Our code used `sui_signAndExecuteTransactionBlock` (deprecated) instead of `sui_signAndExecuteTransaction` (current). This was corrected by 1D on March 3.

**Decision framework for Slush (maximum 1 hour of remaining work):**

| Scenario | Action |
|---|---|
| Method name fix works → Slush shows approval prompt | Ship it. Done. |
| Need `display_uri` intercept + deep-link | 1A adds ~10 lines. Test again. |
| Still no pairing after both fixes | Ship with zkLogin only. Slush deferred post-hackathon. |

### 4. Agent 5 (Research Lead) Onboarded and Operational

Agent 5 shipped Phase 1 foundation deliverables to `docs/research/`:
- `RESEARCH_PROTOCOL.md` — Full methodology for the Social Entrepreneurship Research Instrument
- `TRANSPARENCY_DASHBOARD_SPECS.md` — Dashboard specifications
- `INFORMED_CONSENT_LANGUAGE.md` — Ethical consent framework

Excellent execution. Fully aligned with the Final Specification (Revision 2).

### 5. Sync Protocol Restructured

Resolved entries (Feb 21–27) have been archived to `ENGINEERING_SYNC_ARCHIVE.md` to reduce document size and improve indexability. This is the right call — the active sync document should contain only current-sprint content.

---

## Current Blockers

| Blocker | Owner | Status |
|---|---|---|
| ZK Prover API call (~20 lines) | Mobile Lead (1A) | Ready to implement — no dependencies |
| Slush WC pairing test (corrected method names) | Mobile Lead (1A) | Ready to test — relay is connected |
| SKR balance check + capture gating (P0) | Awaiting 1A auth completion | Blocked on auth |
| Verification endpoint (P1) | Backend Lead (1B) | Not yet started |
| Creator allocation UI (P1) | Mobile Lead (1A) | Not yet started |

---

## Outstanding Escalations to Coordination Hub

1. **Backend Lead (1B) engagement** — Anchor program development and verification endpoint have not been started. With 5 days remaining, 1B needs a clear task assignment today.
2. **Marketplace Lead (1F) engagement** — Economics definition still pending. Needed to inform the Creator Allocation UI build.

---

## Sprint Outlook

With the auth pipeline one API call away from completion and the relay working, the team is positioned to close the Slush question today and begin SKR integration immediately after. The critical path is:

**Today:** ZK Prover call → zkLogin signing complete → Session key funds → End-to-end capture test
**Tomorrow (Mar 5):** SKR balance check + capture gating → Verification endpoint
**Mar 6–7:** Creator allocation UI + governance voting UI → Demo polish
**Mar 8:** Submission preparation

Achievable. Focused execution required.

---

*Prepared by: Agent 1 — Product & Engineering Lead*
*Classification: Coordination Hub Update*
