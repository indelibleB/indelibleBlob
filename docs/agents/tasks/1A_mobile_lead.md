# 1A Mobile Lead — Active Tasks
**Date:** Friday, March 6, 2026 — FEATURE FREEZE DAY

## ⛔ RULES FOR THIS SESSION
1. **NO autonomous commits.** Every code change must be proposed to C.I.C. first.
2. **NO changes outside the Phase you are working on.** Do not refactor, rename, or "improve" existing code.
3. **NO deleting files.** If you think a file should be deleted, ask C.I.C.
4. **Work one Phase at a time.** Do not start Phase 2 until Phase 1 is approved and committed.


## ✅ COMPLETED (March 4-5)
- Seal Encryption Layer (HermesAesGcm256 + sovereign_blob)
- SKR Token Integration (SkrService, balance reads, MWA transfers)
- Capture Gating (consumed captures tracking, auto-end, post-settle)
- SKR Settlement Pipeline (raw fetch() JSON-RPC bypassing jayson UUID crash)
- Sovereign UI Polish (Nazar Amulet 🧿, clean thumbnails)
- Strict Forensic Validation (100% score enforcement in useCapture)
- Pre-APK Security Fixes: H-2 (JWT delete), H-3 (disconnect block), L-3 (console.log gating), M-1 (dummy client ID removal)
- Master + sprint-final validated on Seeker device

## ✅ COMPLETED (March 6 Morning — by 1D + C.I.C.)

### Phase 1: Creator Allocation UI ✅ (Merged on `6655e50`)
- 3 linked sliders in SettingsScreen.tsx (Treasury 33.33% floor, Creator, Community)
- Snap-to-100 on finger release (adjusts last-moved slider if within 5% of 100)
- Save/load via AsyncStorage (`STORAGE_KEYS.ALLOCATION_PREFERENCES`)
- Unsaved-changes guard on back button (`handleBack` with Alert confirmation)
- Research consent toggle with Agent 5 approved copy and external link
- Headline: "Help us Build a Longevity-Minded, Creative Economy Tethered to Reality"
- **Scrubber extracted as top-level React.memo** — critical fix for PanResponder survival across re-renders

### Phase 2: Governance Voting UI ✅ (Merged on `6655e50`)
- GovernanceScreen.tsx with 3 hardcoded proposals:
  1. Wildlife conservation imagery grants (10% community fund)
  2. Open-source hardware systems for decentralized verification
  3. Spatial computing and 3D modeling expansion (with winking emoji)
- ProposalDetailScreen.tsx with Proof-of-Witness voting power:
  - 1 Verified Capture Session = 1 Witness Credit
  - Decay indicator (inactive > 7 days)
  - Vote stored via `StorageService.saveGovernanceVote()`
- Formspree email waitlist (`https://formspree.io/f/mwvlpqvj`) for community proposals launch notification
- Survey CTA linking to `indelibleblob.com/survey`
- Community proposals "coming soon" teaser with dashed border
- **Bug fix:** Vote power filter changed from `'uploaded'` to `'completed' || 'uploaded'`

## ✅ COMPLETED (March 6 Afternoon/EOD — by 1D + C.I.C.)

### Onboarding & Brand Polish ✅ (Uncommitted on `feature/sprint-final`)
- **3-step guided onboarding walkthrough** — user-driven, gated by AsyncStorage (`ONBOARDING_COMPLETE`).
- **App icon sizing** — adaptive icon foreground swapped to `emoji_size_blob_icon.png` in `app.json`.
- **Splash screen** — `expo-splash-screen` wired in `App.tsx` (prevent/hide async on load), native splash set to `#100820`.
- **Brand polish** — refined `icon.png` and `emoji_size_blob_icon.png` usage, adjusted glow rings and navPill sizing.

## 🔴 REMAINING P0 TASK (March 7 AM - Deadline Day)

### Phase 3: Android APK Build
- **Goal:** Produce final standalone `.apk` or local build.
- **Identified Gaps (RESOLVED March 7 AM):**
  - ✅ Install EAS CLI globally (`npm install -g eas-cli`)
  - ✅ Run `eas build:configure` to generate `eas.json` (added `"buildType": "apk"`)
  - ✅ Add `versionCode` to `app.json` android block
  - ✅ Add `expo-splash-screen` plugin to `app.json` plugins array
- **Execution:** Ready to run `eas build --platform android --profile preview --local` (or standard cloud build).
- **Approval gate:** C.I.C. triggers build.

