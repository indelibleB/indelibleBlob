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
