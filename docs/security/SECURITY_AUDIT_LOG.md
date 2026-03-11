# Security Audit Log

## Initial Scan - 2026-02-21

### Critical Issues
- None found in initial baseline.

### High Issues
- None found in initial baseline.

### Medium Issues
- None found in initial baseline.

### Remediation Plan

| Issue | Severity | Owner | Timeline | Status |
|-------|----------|-------|----------|--------|
| None | N/A | N/A | N/A | [ ] |

---

## Pre-APK Security Audit — 2026-03-05

**Auditor:** 1D (Claude Code — Security & Quality Lead)
**Scope:** Full mobile codebase (`mobile/src/` — 11 files deep audit)
**Result:** TESTNET APPROVED with 4 pre-APK fixes assigned to 1A

### Findings

| ID | Severity | File | Issue | Status |
|----|----------|------|-------|--------|
| H-1 | HIGH | `services/seal.ts` | Fixed AES-GCM IV reuse across encryptions | Deferred (post-hackathon) |
| H-2 | HIGH | `hooks/useZkLogin.ts:154` | JWT not deleted from SecureStorage after ZK proof stored | FIXED (1A) |
| H-3 | HIGH | `components/Camera/VisionCameraView.tsx:399` | Sidebar Disconnect button not blocked during active session | FIXED (1A) |
| M-1 | MEDIUM | `hooks/useZkLogin.ts:14-15` | Dummy fallback Google Client IDs in production | FIXED (1A) |
| M-2 | MEDIUM | `services/trust.ts` | TEEPIN attestation certificate not validated | Deferred (post-hackathon) |
| M-3 | MEDIUM | `services/trust.ts` | Android StrongBox check uses model name heuristic | Deferred (post-hackathon) |
| M-4 | MEDIUM | `contracts/sui/sovereign_blob.move` | Nonce length not validated | Deferred (post-hackathon) |
| L-1 | LOW | Multiple files | AsyncStorage used for non-sensitive session data (acceptable) | Deferred (post-hackathon) |
| L-2 | LOW | `services/seal.ts` | Seal key server network hardcoded | Deferred (post-hackathon) |
| L-3 | LOW | Multiple files | Sensitive console.log statements in production | FIXED (1A) |
| L-4 | LOW | `hooks/useZkLogin.ts` | Ephemeral key epoch expiry not detected | Deferred (post-hackathon) |

**Full report:** See `docs/security/DEPENDENCY_AUDIT.md` for npm audit results.

---

## Pre-APK Production Log Hardening — 2026-03-07

**Auditor:** 1D (Claude Code — Security & Quality Lead)
**Scope:** Full mobile codebase (`mobile/src/` — all .ts/.tsx files)
**Result:** APPROVED — Zero console output in production APK

### What Was Done

**1. `__DEV__` guard on `blobLog` utility** (`mobile/src/utils/logger.ts`)
- All 5 logging methods (`info`, `warn`, `error`, `success`, `step`) wrapped in `if (__DEV__)` guard
- React Native provides `__DEV__` as `true` in Metro dev mode, `false` in production APK builds
- Effect: Zero console output ships to end users

**2. Raw `console.*` → `blobLog.*` migration** (17 files modified)
- **Services** (5 files): `secureStorage.ts`, `storage.ts`, `solana.ts`, `location.ts`, `SuiWalletContext.tsx`
- **Hooks** (5 files): `useCamera.ts`, `usePermissions.ts`, `useVisionCamera.ts`, `useSessions.ts`, `useCapture.ts`
- **Components** (4 files): `CameraView.tsx`, `CaptureDetail.tsx`, `GovernanceScreen.tsx`, `ProposalDetailScreen.tsx`, `IdentityModal.tsx`
- **Utils** (3 files): `watermark.ts`, `neural_hash.ts`, `video_bumper.ts`
- Total: ~100+ raw `console.log/warn/error` calls converted to `blobLog` equivalents

**3. Dead code cleanup**
- `zkLogin.ts:17`: Removed commented-out `console.log` of OAuth redirect URI (had `TODO: Remove` — completed)
- `storage.ts:279`: Updated JSDoc usage example from `console.log` to `blobLog.info` for copy-paste safety
- `MigrationTest.tsx`: Deleted temporary testing component + empty `Testing/` directory

### Final Verification

```
Grep result for console.(log|warn|error) in mobile/src/:
  - logger.ts:17 — if (__DEV__) console.log(...)  ← CORRECT (implementation)
  - logger.ts:20 — if (__DEV__) console.warn(...)  ← CORRECT (implementation)
  - logger.ts:23 — if (__DEV__) console.error(...) ← CORRECT (implementation)
  - logger.ts:26 — if (__DEV__) console.log(...)  ← CORRECT (implementation)
  - logger.ts:29 — if (__DEV__) console.log(...)  ← CORRECT (implementation)
```

**Zero raw `console.*` calls remain outside of `logger.ts`.**

### Security Impact

| Risk | Before | After |
|------|--------|-------|
| GPS coordinates leaked to console | YES (location.ts:135) | NO |
| Wallet addresses leaked to console | YES (SuiWalletContext.tsx:88) | NO |
| Capture pipeline data leaked | YES (useCapture.ts:253, 381-385) | NO |
| Session data leaked | YES (useSessions.ts, 20+ locations) | NO |
| OAuth redirect URI leak potential | YES (zkLogin.ts:17, commented but present) | REMOVED |

---

## HashRouter URL Migration — 2026-03-07

**Auditor:** 1D (Claude Code — Security & Quality Lead)
**Scope:** All `Linking.openURL()` calls in mobile codebase
**Result:** 7 URLs updated across 5 files

### Context

Website lead (1E) is switching from `BrowserRouter` to `HashRouter` for Walrus Sites static hosting compatibility. All mobile deep links must use `/#/` format to prevent 404s on direct navigation.

### Changes

| File | Old URL | New URL |
|------|---------|---------|
| `SettingsScreen.tsx:308` | `indelibleblob.com/research/consent` | `indelibleblob.com/#/research/consent` |
| `CaptureDetail.tsx:168` | `indelible-blob.com/verify?id=${id}` | `indelible-blob.com/#/verify?id=${id}` |
| `CaptureDetail.tsx:312` | `indelibleblob.com/teepin` | `indelible-blob.com/#/teepin` |
| `CameraView.tsx:398` | `indelible-blob.com/sovereign-guide` | `indelible-blob.com/#/sovereign-guide` |
| `GovernanceScreen.tsx:149` | `indelibleblob.com/survey` | `indelibleblob.com/#/survey` |
| `VisionCameraView.tsx:486` | `indelible-blob.com/session-bind-guide` | `indelible-blob.com/#/session-bind-guide` |
| `VisionCameraView.tsx:509` | `indelible-blob.com/sovereign-guide` | `indelible-blob.com/#/sovereign-guide` |

**Verification:** `grep` for old-format URLs returns zero matches in `mobile/src/`.

---

## Website Security Review (1E Plan) — 2026-03-07

**Auditor:** 1D (Claude Code — Security & Quality Lead)
**Scope:** Website codebase (`website/src/` — providers, pages, components, data)
**Result:** 6 issues identified, 1 CRITICAL deployment blocker discovered

### Round 1 — Codebase Review

| ID | Severity | File | Issue |
|----|----------|------|-------|
| W-1 | CRITICAL | `providers/WalletProvider.tsx:26` | `UnsafeBurnerWalletAdapter` generates throwaway Solana keys in localStorage |
| W-2 | HIGH | `pages/Survey.tsx:145` | `console.log('Encrypted survey:', encrypted)` leaks encrypted data to browser console |
| W-3 | HIGH | `pages/Survey.tsx:148-150, 174-177` | Silent encryption failure shows green "Thank you!" success toast |
| W-4 | MEDIUM | `index.html` | No Content Security Policy meta tag for Walrus static hosting |
| W-5 | MEDIUM | `App.tsx` + pages | Double Navigation/Footer rendering (global + per-page duplicates) |
| W-6 | LOW | Multiple components | Hardcoded URLs (Calendly, Formspree) scattered across components |

### Round 2 — Deployment Blocker

| ID | Severity | File | Issue |
|----|----------|------|-------|
| W-7 | CRITICAL | `main.tsx:16` | `BrowserRouter` requires server-side redirects; Walrus Sites is static-only → 404 on direct navigation to `/survey`, `/verify`, etc. |

### Pre-Deployment Conditions (APPROVED with 3 gates)

1. Remove `UnsafeBurnerWalletAdapter` (W-1)
2. Fix Survey.tsx silent failure + console.log (W-2, W-3)
3. Switch `BrowserRouter` → `HashRouter` for Walrus compatibility (W-7)

---

## Scan History

- 2026-02-21: Initial baseline scan
- 2026-03-05: Full P0-5 security audit (11 files, 0 critical, testnet APPROVED)
- 2026-03-07: Pre-APK production log hardening (17 files, 100+ console calls eliminated)
- 2026-03-07: HashRouter URL migration (7 URLs, 5 files)
- 2026-03-07: Website security review (6 issues + 1 CRITICAL deployment blocker)
