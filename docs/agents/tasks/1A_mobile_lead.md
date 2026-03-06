# 1A Mobile Lead — Active Tasks
**Date:** Friday, March 6, 2026 — FEATURE FREEZE DAY

## ✅ COMPLETED (March 4-5)
- Seal Encryption Layer (HermesAesGcm256 + sovereign_blob)
- SKR Token Integration (SkrService, balance reads, MWA transfers)
- Capture Gating (consumed captures tracking, auto-end, post-settle)
- SKR Settlement Pipeline (raw fetch() JSON-RPC bypassing jayson UUID crash)
- Sovereign UI Polish (Nazar Amulet 🧿, clean thumbnails)
- Strict Forensic Validation (100% score enforcement in useCapture)
- Pre-APK Security Fixes: H-2 (JWT delete), H-3 (disconnect block), L-3 (console.log gating), M-1 (dummy client ID removal)
- Master + sprint-final validated on Seeker device

## 🔴 TODAY'S P0 TASKS (March 6 — Sequential, C.I.C. approval required per phase)

### Phase 1: Creator Allocation UI
- **What:** New screen/section in Settings with 3 linked sliders
  - Slider 1: Treasury (floor: 33.33%) — protocol operational fund, sustains the business/network
  - Slider 2: Creator Rewards Fund — returns to the creator who captured the content
  - Slider 3: Public Goods / Community Fund — ecosystem grants, community initiatives
- **Behavior:** All 3 must sum to 100%. When Treasury is snapped to floor, redistribute remainder across other 2.
- **Persist:** Save allocation to session metadata (AsyncStorage for MVP)
- **Demo note:** "On-chain treasury distribution in mainnet."
- **Files likely touched:** New component + Settings screen integration
- **Approval gate:** C.I.C. reviews code diff BEFORE commit

### Phase 2: Governance Voting UI
- **What:** Simple proposals list + cast vote button
  - Display 2-3 hardcoded sample proposals (MVP)
  - User taps "Vote" → registers locally (AsyncStorage)
  - Show vote count per proposal
- **Demo note:** "On-chain tallying engine in development."
- **Files likely touched:** New component + navigation integration
- **Approval gate:** C.I.C. reviews code diff BEFORE commit

### Phase 3: Android APK Build
- **What:** `eas build --platform android --profile preview` or equivalent
- **Gate:** Phases 1 + 2 merged and tested on Seeker
- **Approval gate:** C.I.C. triggers build

## ⛔ RULES FOR THIS SESSION
1. **NO autonomous commits.** Every code change must be proposed to C.I.C. first.
2. **NO changes outside the Phase you are working on.** Do not refactor, rename, or "improve" existing code.
3. **NO deleting files.** If you think a file should be deleted, ask C.I.C.
4. **Work one Phase at a time.** Do not start Phase 2 until Phase 1 is approved and committed.
