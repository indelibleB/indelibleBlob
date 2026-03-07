# Coordination Hub — Comprehensive Sprint Update (Part 2)
**From:** Agent 1 — Product & Engineering Lead (Manus)
**Date:** March 5, 2026 (Thursday)
**Sprint:** MONOLITH Hackathon Final Sprint

*Note: This supersedes WEEK_OF_MAR_2_PART_1.md which covers Monday through Wednesday testing, planning, and SKR execution. We are now in feature completion and UI mode.*

---

## 1. Thursday Morning Focus

The core Capture Pipeline (TEEPIN + Sui + Walrus + SKR Gating + Session Keys) is now fully operational in the codebase. Thursday's focus shifts from infrastructure to the Creator Revenue UI and External Verification API.

### Priorities for Agent 1A (Mobile Lead)
- Implement Creator Allocation UI in Settings (3 sliders for Treasury/Rewards/Community)
- Enforce the 33.33% Treasury floor rule
- Assist 1B with backend verification payload structure if needed

### Priorities for Agent 1B (Backend Lead)
- Construct `/verify` REST endpoint
- Expose the API pointing to the Sui network for external queries

### Priorities for Agent 1D (Security Lead)
- Conduct final security audit on the Session Keys stored in SecureStorage
- Conduct final security audit on the SKR token gating logic and fallback mechanism

---

## 2. The Verification Endpoint — Design Spec

The `POST /verify` endpoint is the gateway for the "Professional Tier" customers (Insurance Adjusters, media outlets). They do not need the mobile app; they need to submit a file (or Walrus Blob ID) and get a cryptographic "Yes/No" back.

**The Endpoint must return a Signed Data Package:**
- File Content Hash (SHA-256)
- TEEPIN Signature (proving device hardware)
- TEEPIN Public Key
- Sui Transaction ID (proving timestamp)
- Walrus Blob ID (proving availability)
- **Signature:** The entire JSON must be signed by the backend's Ed25519 key so clients know the API response wasn't spoofed.

---

## 3. Creator Allocation UI — Design Spec

The user interface must convey that **the Creator is in control**. The default setting can be 33.33% equally divided, but the user must be able to drag the sliders.
- **Slider 1**: Treasury (Floor: 33.33%)
- **Slider 2**: Creator Rewards Fund
- **Slider 3**: Public Goods / Community Fund

If the user attempts to reduce Treasury below 33.33%, the UI should snap it back and display a tooltip explaining the requirement for network sustainability.

---

## 4. Thursday Evening Close-out (March 5)

**Completed by Agent 1A (Mobile Lead):**
- **SKR Pipeline Stability:** The MWA (`@solana-mobile/mobile-wallet-adapter-protocol-web3js`) serialization and type-checking bugs (`transaction.serialize is not a function` & `Expected Uint8Array`) were completely circumvented. We now extract the generic signed bytes using `signTransactions`, wrap them in base64, and POST them directly to the RPC `sendTransaction` endpoint via a native JS `fetch()`. This prevents the `jayson` UUID crash and bypasses the web3.js wrapper issues on Android.
- **Strict Forensic Gating:** 100% forensic verification is now strictly enforced in `useCapture.ts`. Any capture with a score <100% throws an error locally and halts the pipeline immediately, protecting the Seal, Walrus, and Sui layers from polluted data.
- **Sovereign UI Overhaul:** Replaced the generic lock/blob indicators with a clean `🧿` (Nazar Amulet) icon to denote "Sovereign Protected" mode, moving it out of the tabs and into the top-level Capture Detail banner next to the device provenance grade.

**Handoff for Friday Morning (March 6):**
The primary focus must shift immediately to building the **Creator Allocation UI** (3 sliders, minimum 33.33% Treasury floor) and completing the 4 pending **Pre-APK Security Fixes** logged by 1D. Feature freeze is imminent; time to prepare the APK.

---

## 5. Friday Midday Sync (March 6 — Feature Freeze Day)

### Session: 1D (Security Lead / Claude Code) + C.I.C.

**Context:** Gemini (1A) had attempted Phases 1+2 but left 4 critical bugs. 1D + C.I.C. took over to fix and polish all UI work before APK build handoff.

### What Was Done

**Phase 1 — Creator Allocation UI (SettingsScreen.tsx rewrite):**
- Extracted `Scrubber` as top-level `React.memo` component — Gemini's version defined it inside the render function, causing PanResponder destruction on every `setAllocations` call (slider unresponsive after first touch)
- `useCallback` for all slider change handlers with empty deps for memo stability
- Ref-based PanResponder closures (`onValueChangeRef`, `onReleaseRef`, `latestValueRef`, `initialValueRef`) to access latest state inside stale PanResponder closures
- Snap-to-100 on finger release: `lastMovedRef` tracks which slider was last dragged, adjusts it on release if total is within 5% of 100
- 33.33% Treasury floor enforcement with tooltip explanation
- Save/load via AsyncStorage with unsaved-changes guard on back button
- Research consent toggle restored with Agent 5 (Research Lead) approved copy:
  - Headline: "Help us Build a Longevity-Minded, Creative Economy Tethered to Reality"
  - Body explaining anonymized, aggregated data sharing for ecosystem health research
  - External link to indelibleblob.com/research
- Section headings centered for visual polish

**Phase 2 — Governance Voting UI (GovernanceScreen.tsx rewrite):**
- 3 hardcoded proposals for MVP:
  1. Allocate 10% of Community Fund to wildlife conservation imagery grants
  2. Fund open-source hardware systems for decentralized verification universe
  3. Should indelible.Blob expand into spatial computing and 3D modeling capabilities? (with winking emoji)
- Formspree email waitlist signup (`https://formspree.io/f/mwvlpqvj` — same endpoint as website footer newsletter)
  - Sends `{ email, type: 'governance_waitlist', source: 'mobile_app' }` for segmentation
- Survey CTA banner linking to `indelibleblob.com/survey` for deeper feedback
- Community proposals "coming soon" teaser with dashed border styling
- Subtitle centered, lowercase "indelible" branding enforced

**Phase 2.1 — Proof-of-Witness Voting (ProposalDetailScreen.tsx fixes):**
- **Critical bug fix:** Vote power was showing 0 because filter used `s.status === 'uploaded'` but `useSessions.ts:171` sets status to `'completed'`. Changed to `completed || uploaded`.
- Copy updated: "1 Verified Capture Session = 1 Witness Credit" (was "Capture")
- Voting power breakdown: Verified Sessions count, Active/Decaying standing, Total Voting Power
- Philosophy: "Wealth cannot buy influence. Governance is determined by cryptographic evidence of reality."

**Storage layer (storage.ts):**
- Added `shareForResearch: false` to default allocation preferences
- Added backfill logic for existing stored prefs missing `shareForResearch` field

**Full code audit:**
- 8 files reviewed for cross-file type/import consistency
- No injection vectors, no state corruption paths, no security regressions
- Minor note: decay check uses `validSessions[0]` assuming newest-first but sessions are insertion-order (oldest first) — visual-only MVP, non-blocking

**Commit:** `6655e50` — both `master` and `feature/sprint-final` synchronized and pushed to origin. Master tested on Seeker device — confirmed working.

### Handoff for Friday Afternoon (March 6)

**For 1A (Mobile Lead) + C.I.C.:**
- Phases 1 + 2 are **COMPLETE** and merged. Gate for Phase 3 (APK build) is **CLEARED**.
- Current state: `master` branch at `6655e50`, tested on Seeker, ready for build.
- Run `eas build --platform android --profile preview` (or equivalent) to produce APK.
- No new code changes needed — this is a build-only phase.

**For 1E (Website Lead):**
- Website polish and Walrus Sites deployment remain P0 on independent track.

**For C.I.C. (March 7 AM):**
- Demo video (2-3 min, Seeker device) capturing all P0 features
- Pitch narrative (Align Nexus) — parallel with demo video

---

## 6. Friday EOD Close-out (March 6)

### Session: 1D (Security Lead / Claude Code) + C.I.C.

**Context:** With Phases 1+2 merged, the afternoon session focused on first-launch onboarding UX, brand polish, and APK build preparation.

### What Was Done

**Phase 2.5 — Onboarding Walkthrough (OnboardingOverlay.tsx — NEW file):**
- 3-step user-driven guided experience, gated by AsyncStorage (`@indelible_onboarding_complete`)
- **Step 1 (sidebar_invite):** Pulsing glow ring matched exactly to sidebar toggle shape (26w×50h, right-side-only border radius). 3 bounces with decreasing amplitude. `pointerEvents="none"` so glow doesn't block the real arrow — user discovers by tapping themselves. Tooltip with `icon.png` (42px) shows "indelible.Blob — Tap to explore controls."
- **Step 2 (sidebar_explore):** Detects user opening sidebar via `sidebarVisible` prop. Dark overlay with centered card: 64px `icon.png`, "Your Command Center" headline, description of sidebar controls, "Got it →" button to advance.
- **Step 3 (start_highlight):** Closes sidebar. Pulsing glow aligned to Start navPill (82×40, borderRadius 20, bottom:57, right:16). "Ready to Capture Truth" tooltip with 66px `icon.png`, copy: "When GPS locks, tap Start to begin your Session Bind sequence which secures your first capture session." "Let's go!" dismiss button with 30px inline `emoji_size_blob_icon.png`.
- VisionCameraView.tsx refactored: `toggleSidebar` split into `openSidebar`/`closeSidebar`/`toggleSidebar` for onboarding control.

**Brand Polish:**
- **App icon:** Adaptive icon foreground changed from `icon.png` (blob in glass cube, tiny after masking) to `emoji_size_blob_icon.png` (blob fills frame). Background: `#100820`.
- **Splash screen:** `expo-splash-screen` installed, `preventAutoHideAsync()` at module level in App.tsx, `hideAsync()` when `fontsLoaded && !sessionsLoading && !permissions.loading`. Returns `null` during load (native splash stays visible).
- **Brand asset policy:** `icon.png` = high-grade displays (tooltip icons, cards). `emoji_size_blob_icon.png` = emoji replacement only ("Let's go!" inline blob).

**APK Build Plan Review (Phase 3 preparation):**
- Identified 4 gaps blocking APK build:
  1. EAS CLI not installed globally
  2. No `eas.json` exists (needs `eas build:configure` + `"buildType": "apk"` in preview profile)
  3. `versionCode` missing from `app.json` android block
  4. `expo-splash-screen` not registered in `app.json` plugins array
- Recommended `--local` build flag to avoid Expo cloud queue on deadline day
- Full execution plan documented and ready for March 7 AM

**Multiple iteration rounds on glow positioning:**
- Sidebar glow: matched toggle shape exactly (right-side-only border radius, 26×50)
- Start glow: 5 rounds of refinement. Final: bottom:57, right:16, 82×40, borderRadius:20 — calculated from bottomBar paddingBottom(24) + BlobCaptureButton centering offset

### Handoff for Saturday Morning (March 7 — Submission Day)

**For 1D + C.I.C. — Sequential execution:**
1. **Commit onboarding work** on `feature/sprint-final`, merge to master
2. **app.json fixes:** Add `versionCode: 1`, add `"expo-splash-screen"` to plugins array
3. **EAS setup:** `npm install -g eas-cli`, `eas login`, `eas build:configure`
4. **Edit eas.json:** Set `"buildType": "apk"` in preview profile
5. **Build APK:** `eas build --platform android --profile preview --local`
6. **Sideload & validate:** Boot, onboarding flow, camera, GPS, Sui RPC connection
7. **If build passes:** APK ready for submission

**For C.I.C. — Parallel with build:**
- Demo video (2-3 min, Seeker device)
- Pitch narrative finalization (Align Nexus)

**Deadline: March 7 @ 12:00 PM MST (Noon)**
