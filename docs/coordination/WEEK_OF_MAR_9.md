# Coordination Hub — Week of March 9-15, 2026
**From:** Claude Code — Security & Quality Advisor
**Date:** March 15, 2026 (Sunday)
**Phase:** Hackathon Submission → Testnet Stabilization → Mainnet Transition Planning

---

## Overview

This week marked the transition from hackathon submission to testnet stabilization. The initial Monolith Hackathon submission was deployed on Monday (March 10), followed by website polish, branding updates, and a critical debugging sprint to resolve the capture processing pipeline failures that surfaced in release APK builds.

**Key Milestone:** The full capture pipeline — zkLogin → Walrus upload → Enoki Sponsored Transaction → Sui on-chain recording — is now **fully operational** on testnet with zero user-facing gas management.

---

## 1. Monday March 10 — Hackathon Submission

### Commit: `fbbedf2` — indelible.Blob Monolith Hackathon Submission

The initial submission was deployed as a single monolithic commit containing:
- React Native mobile app with VisionCamera integration
- Sui zkLogin authentication (Google OAuth → Enoki salt → ZK proof)
- Walrus decentralized storage integration
- Sui Move smart contracts (`capture::record_capture`, `sovereign_blob::store_entry`)
- Solana Seed Vault / TEEPIN hardware attestation
- Seal encryption for sovereign mode
- Session-based capture management
- GPS, accelerometer, compass sensor forensics
- Diagnostics hub, governance screen, settings

**APK:** Submitted via LFS to repository root

---

## 2. Tuesday-Wednesday March 11-12 — Website Polish

### Commit: `25d73f3` — Website polish, branding, routing, hackathon badge, survey overlay
### Commit: `810e7dd` — Merge to build-break-build
### Commit: `0e84824` — Update mobile app website URLs to indelibleblob.wal.app

Website improvements deployed to the Walrus-hosted site at `indelibleblob.wal.app`:
- Branding consistency pass
- Routing and navigation fixes
- Hackathon badge integration
- Survey overlay for user research
- Updated all mobile app `Linking.openURL()` references from `indelible-blob.com` to `indelibleblob.wal.app` (5 files, 7 URL changes)

**Note:** These URL changes were purely cosmetic string replacements in `onPress` handlers and had no impact on app functionality.

---

## 3. Thursday-Saturday March 13-15 — Capture Pipeline Debugging Sprint

### The Problem

After the URL updates, testing revealed the capture processing pipeline was crashing in release APK builds with:
```
Processing Failed
Failed to process capture: Cannot read property 'prototype' of undefined
```

This error did not surface in the original hackathon submission testing because the full on-chain transaction path may not have been exercised end-to-end in a release build at that time.

### Root Cause Analysis

**Primary Cause: Missing Hermes Polyfills**

The `@mysten/sui` SDK internally uses `@mysten/bcs` for transaction serialization, which requires `TextEncoder` and `TextDecoder`. React Native's Hermes engine does not guarantee these globals exist natively. The `text-encoding` package was listed as a dependency in `package.json` but was **never imported** — meaning the polyfill was installed but never loaded.

Additionally, `Buffer` (required by Web3 serialization) was not explicitly assigned to the global scope.

**Secondary Cause: `react-native-url-polyfill` Conflict**

WalletConnect's `@walletconnect/react-native-compat` imports `react-native-url-polyfill/auto`, which conflicts with React Native 0.74+'s built-in `URL` implementation on Hermes, causing the same "prototype of undefined" crash at module evaluation time.

**Tertiary Cause: Faucet Rate Limiting**

After fixing the polyfill crash, the app hit Sui testnet faucet rate limits (HTTP 429), preventing gas funding and blocking the transaction pipeline.

### Resolution

**Commit: `09c8e4b` — Fix capture pipeline: Hermes polyfills, Enoki sponsored transactions, cleanup**

| Fix | File | Detail |
|-----|------|--------|
| Hermes polyfills | `App.tsx` | Explicit `global.TextEncoder`, `global.TextDecoder`, `global.Buffer` assignment before any SDK loads |
| URL polyfill noop | `metro.config.js` + `shims/url-polyfill-noop.js` | Metro resolver intercepts `react-native-url-polyfill/auto` and redirects to empty stub |
| Pino stub | `metro.config.js` + `shims/pino-stub.js` | Metro resolver intercepts `pino` (WalletConnect debug logger incompatible with Hermes class syntax) |
| Enoki Sponsored Transactions | `useCapture.ts` | Replaced faucet-based gas management with Enoki sponsored transactions — eliminates all user-facing gas concerns |
| SDK faucet fallback | `gas.ts` | Refactored to use official `@mysten/sui/faucet` SDK (`requestSuiFromFaucetV1`, `getFaucetHost`, `FaucetRateLimitError`) |
| Step-context error tracking | `shared/services/sui.ts` | Wrapped Sui transaction pipeline in labeled try/catch blocks for precise crash identification |
| Copy-to-clipboard | `VisionCameraView.tsx` | Added copy button for Sui address in sidebar for manual SuiScan verification |
| Duplicate deletion | `src/services/zkLogin.ts` | Deleted 196-line duplicate — canonical implementation is `hooks/useZkLogin.ts` |
| Junk cleanup | Multiple | Removed debug logs, old stubs, PowerShell scripts, text dumps from mobile root |
| Shims organization | `mobile/shims/` | Moved polyfill stubs from mobile root to dedicated `shims/` directory |

### Enoki Sponsored Transactions Architecture

The faucet approach was replaced with Enoki Sponsored Transactions, which:
- Eliminate all gas management for end users
- Work identically on testnet and mainnet
- Use Enoki's gas pool (no user wallet funding required)
- Are scoped to our Move package's specific function calls via the Enoki portal

**Hackathon Security Note:** The Enoki private sponsor key is embedded client-side for testnet demo purposes only. Production architecture requires a backend proxy server to protect the private key. This is explicitly documented in the codebase with prominent disclaimers for judge review.

**Enoki Portal Configuration:**
- Allowed Move Call Targets:
  - `0x5faca5a917dcaf7512b2c0f0acf7cf662aff11a8767f8b41c11d53503d08e15b::capture::record_capture`
  - `0x5faca5a917dcaf7512b2c0f0acf7cf662aff11a8767f8b41c11d53503d08e15b::sovereign_blob::store_entry`

---

## 4. Git State — End of Week

### Branch: `main`
**HEAD:** `d3763c6` — Merge build-break-build: capture pipeline fixed, Enoki sponsored transactions

### Commit History (This Week)
```
d3763c6 Merge build-break-build: capture pipeline fixed, Enoki sponsored transactions
3093ec7 Normalize gradlew line endings
74660fb Update root APK to latest build with sponsored tx + polyfill fixes
3f2ca44 Add hackathon demo APK (LFS) — Enoki sponsored tx + polyfill fixes
09c8e4b Fix capture pipeline: Hermes polyfills, Enoki sponsored transactions, cleanup
0e84824 Update mobile app website URLs to indelibleblob.wal.app
810e7dd Merge build-break-build: website polish, branding, hackathon badge, survey overlay
25d73f3 Website polish: branding, routing, copy, hackathon badge, survey overlay
fbbedf2 indelible.Blob — Monolith Hackathon Submission
```

### Files Changed (Net for week)
- **23 files** modified in pipeline fix commit alone
- **+495 / -570 lines** (net reduction — cleaner codebase)
- **11 junk files deleted** from mobile root
- **2 APKs** stored via Git LFS (root + `mobile/builds/`)

---

## 5. Move Contract Status — Testnet

**Package ID:** `0x5faca5a917dcaf7512b2c0f0acf7cf662aff11a8767f8b41c11d53503d08e15b`
**Status:** ✅ Active on Sui Testnet
**Modules:**
- `capture` — `record_capture()` with 26 arguments (GPS, sensors, TEEPIN, forensics)
- `sovereign_blob` — `store_entry()` + `seal_approve()` for encrypted sovereign captures

Verified via RPC query — contract bytecode matches expected function signatures.

---

## 6. Testnet Implementation Phase — Stamp of Completion

The testnet implementation phase is now **complete**. The following capabilities are verified functional in the latest APK:

| Capability | Status | Notes |
|-----------|--------|-------|
| Google OAuth → zkLogin | ✅ | Ephemeral keypair, Enoki salt, ZK proof |
| Sui address derivation | ✅ | `jwtToAddress()` with Enoki salt |
| Photo capture | ✅ | VisionCamera integration |
| Walrus upload | ✅ | Testnet blob storage |
| Sui on-chain recording | ✅ | Via Enoki Sponsored Transaction |
| Sovereign mode (Seal encryption) | ✅ | Lazy-loaded to avoid Hermes crash |
| GPS/sensor forensics | ✅ | Latitude, longitude, altitude, accuracy, RTK, accelerometer, compass |
| TEEPIN hardware attestation | ✅ | Solana Seed Vault / device attestation |
| Session management | ✅ | Start/end sessions, capture queuing |
| Copy Sui address | ✅ | Clipboard for SuiScan verification |
| Gas abstraction | ✅ | Users never see gas — Enoki sponsors all |
| Website links | ✅ | All pointing to indelibleblob.wal.app |

---

## 7. Next Phase: Mainnet Transition

Reference: `docs/coordination/MAINNET_TRANSITION.md`

### Immediate Next Steps
1. **Backend proxy for Enoki private key** — Move sponsor key server-side (Vercel Edge Function or equivalent)
2. **Burn testnet Enoki private key** — Generate fresh mainnet key, never client-side
3. **Mainnet Move contract deployment** — Same bytecode, new package ID on mainnet
4. **Walrus mainnet migration** — Update storage endpoints
5. **Solana dApp Store submission** — Publishing pipeline for Seeker Mobile distribution

### Security Remediation Before Mainnet
- [ ] Enoki private key moved to backend
- [ ] Smart contract audit (automated + professional)
- [ ] JWT handling review (currently deleted after use — good)
- [ ] Ephemeral key rotation policy
- [ ] Rate limiting on sponsored transactions
- [ ] Content moderation pipeline for stored media

---

## 8. Lessons Learned This Week

1. **Hermes engine requires explicit global polyfills.** Simply installing a polyfill package via npm is not enough — it must be explicitly imported and assigned to `global` before any SDK that depends on it loads. This is a React Native + Web3 rite of passage.

2. **Metro production bundling behaves differently than dev.** Module evaluation is deferred in production builds, meaning import-time crashes can be delayed until the first code path that touches the lazy-loaded module — making them appear as runtime errors rather than startup crashes.

3. **Faucets are unreliable infrastructure.** Testnet faucets rate-limit aggressively and should never be the sole gas strategy. Sponsored transactions are the correct abstraction for user-facing apps on both testnet and mainnet.

4. **Step-context error tracking is essential.** Wrapping pipeline stages in labeled try/catch blocks (`[Step 3c: build tx]`) turns opaque "prototype undefined" errors into actionable diagnostics.

5. **EAS builds use local filesystem, not git.** Uncommitted changes are included in EAS cloud builds. This is a feature, not a bug — but it means you must be intentional about what's in your working directory.

---

*Next sync: Beginning of Mainnet Transition Sprint*
*Document location: `docs/coordination/WEEK_OF_MAR_9.md`*
