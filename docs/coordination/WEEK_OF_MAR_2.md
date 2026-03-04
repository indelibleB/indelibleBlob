# Coordination Hub — Comprehensive Sprint Update
**From:** Agent 1 — Product & Engineering Lead (Manus)
**Date:** March 4, 2026
**Sprint:** MONOLITH Hackathon Final Sprint — **5 days remaining (deadline: March 9, 2026 @ 00:00)**
**Supersedes:** `docs/coordination/2026-03-04-engineering-update.md` (earlier partial update — this document is the authoritative version)

---

## 1. Context: What We Are Building and Why

This section is written for any agent joining or re-syncing mid-sprint. It is not background noise — it is the strategic foundation every implementation decision must be anchored to.

### The Product

**indelible.Blob** is a mobile-first, hardware-attested media capture and verification dApp built natively for the Solana Seeker device and the Solana dApp Store. It allows users to capture photos and videos with cryptographic proof of authenticity — anchored to the Seeker's TEEPIN hardware security module, recorded immutably on Sui, and stored on Walrus. The result is a "Blob": a piece of media that cannot be credibly denied, altered, or fabricated after the fact.

The tagline: **"Signify & Verify."** Every capture is signed at the moment of creation. Every signature is verifiable forever.

### The Hackathon

We are competing in the **MONOLITH — A Solana Mobile Hackathon** (2nd edition), organized by Solana Mobile and Radiants. 580 participants, 54 submissions in the Mobile track. The top 10 each receive **10,000 USDC**. There is an additional **$10,000 SKR bonus** for Best SKR Integration. The submission window closes **March 9, 2026 at 00:00** — 5 days from now.

**Judging criteria (four pillars):**
1. Stickiness & Product Market Fit — resonance with the Seeker community, habit-forming daily engagement
2. User Experience — intuitive, polished, native-feeling mobile design
3. Innovation / X-Factor — novelty, creative differentiation
4. Presentation & Demo Quality — clear communication, demo showcases core concept and USPs

**Strategic posture:** We are not trying to win 1st place. We are building to land in the top 10 out of 54. The flat prize structure makes this the correct goal. Our differentiation is the only dApp combining Solana Seeker hardware attestation + Sui data availability + Walrus storage + a live SKR economic model.

---

## 2. The SKR Integration & Revenue Model — Final Specification (Revision 2)

This is the most important product decision made in the last two days. All agents must understand this model. It is the authoritative specification for all remaining engineering and presentation work.

### The Three-Layer SKR Model

SKR (the native asset of the Solana Mobile Seeker ecosystem) is integrated across three functional layers:

| Layer | Function | Mechanism |
|---|---|---|
| **Access** | Capture Credits | SKR balance gates paid captures; Seeker device users receive a free tier |
| **Incentive** | Creator Rewards | Creators earn SKR from a rewards pool funded by platform revenue |
| **Control** | Governance | SKR holders vote on platform parameters (Treasury floor, epoch length, reward multipliers) |

### The Revenue Architecture

Three tiers of revenue generation:

| Tier | Product | Price | Target |
|---|---|---|---|
| Free | Public verification (any Blob, forever) | $0 | Everyone — this is the accountability layer and the network effect engine |
| Professional | Verification Bundle (insurance, legal, media) | $5–$10/bundle | Insurance adjusters, legal professionals, journalists |
| Enterprise | API access (volume-based) | Custom | Platforms, insurers, law firms |

**SKR discount:** 25% off standard price for SKR payment. This is a CAC investment and ecosystem alignment signal, not a margin sacrifice. Fiat carries no premium — the discount is the sole pricing variable.

**Beachhead market:** Insurance & Adjusting. $80B annual fraud problem, clear ROI, shorter sales cycle with independent firms. The Verification Bundle is the MVP product for this market.

### Creator-Directed Allocation (Replaces Fixed 70/20/10)

This is the most significant product decision of the last two days, made by the C.I.C. (Founder).

**The old model:** Fixed 70% Treasury / 20% Creator Rewards / 10% Community Fund.

**The new model:** Each creator sets their own allocation preferences across the same three pools. The only constraint is a **33.33% Treasury floor** (one-third equal share — mathematically clean, ensures organizational viability). Creators control the remaining 66.67% freely.

**Why this matters:**
- Transforms revenue distribution from an administrative decision into a distributed values expression
- Every creator's allocation preference is a data point on how people in a decentralized economy choose to balance self-interest, community investment, and organizational sustainability
- This behavioral data is the foundation of the **Social Entrepreneurship Research Instrument** (see Section 3)
- The three-slider UI (Treasury / Creator Rewards / Community Fund) with a 33.33% floor constraint is a P1 build item for this sprint

**Key decisions log (all locked):**

| Decision | Outcome | Authority |
|---|---|---|
| SKR integration approach | Options B + C + D combined; Option A (human attestation) rejected | C.I.C. |
| Revenue split model | Creator-Directed Allocation replaces fixed 70/20/10 | C.I.C. |
| Treasury floor | 33.33% (one-third equal share) | C.I.C. |
| Public verification | Free forever. Non-negotiable. | C.I.C. |
| Beachhead market | Insurance & Adjusting | Agent 3 |
| SKR discount depth | 25% off standard price | Agent 3 |
| Fiat premium | None. SKR discount is the sole pricing variable. | Agent 3 |
| C2PA compatibility | Strategic imperative — build it | Agent 3 |
| Marketplace scope | API is the MVM (Minimum Viable Marketplace) | Agent 3 |

---

## 3. The Social Entrepreneurship Research Instrument

Agent 5 (Research Lead) has been onboarded and is operational. This is not a side project — it is a core product differentiator and a long-term organizational asset.

**The instrument:** The Creator-Directed Allocation UI generates real behavioral data on how creators in a decentralized economy distribute economic value. This data is collected with full informed consent, anonymized, and made available through the Transparency Dashboard. It positions indelible.Blob as a contributor to public knowledge on distributed economic governance.

**Agent 5 Phase 1 deliverables (shipped March 3):**
- `docs/research/RESEARCH_PROTOCOL.md` — Full methodology
- `docs/research/TRANSPARENCY_DASHBOARD_SPECS.md` — Dashboard specifications
- `docs/research/INFORMED_CONSENT_LANGUAGE.md` — Ethical consent framework
- `docs/research/README.md` — Directory index

**For the hackathon presentation:** The research instrument is a **present, not build** item. It is a story we tell in the demo — "we are not just building a photo app, we are building infrastructure for truth and a living experiment in distributed economic governance." This directly serves the Innovation / X-Factor judging criterion.

---

## 4. The Technical Architecture — Locked Decisions

The following architectural decisions are finalized and must not be revisited during this sprint.

### Cross-Chain Identity & Commerce

| Chain | Role |
|---|---|
| **Solana** | Identity anchor (MWA), commerce layer (SOL + SKR payments), hardware attestation (TEEPIN → GOLD grade) |
| **Sui** | Provenance recording layer (immutable `record_capture` transactions), zkLogin identity |
| **Walrus** | Censorship-resistant media storage (public and Seal-encrypted blobs) |

### Session Keys Architecture (Approved Feb 25 — Immutable)

At session start, the user's primary wallet (Google Auth via zkLogin OR Slush via WalletConnect) authorizes an ephemeral Ed25519 keypair generated and stored in the Seeker's secure enclave. This session key signs all `record_capture` Sui transactions silently in the background for 1 hour. **Zero wallet popups during capture.** This is non-negotiable — it is the core UX differentiator.

### Trust Grading

| Grade | Requirements | Meaning |
|---|---|---|
| **GOLD** | Seeker device + MWA wallet connection | Hardware-attested, maximum trust |
| **SILVER** | Secure enclave only (no MWA) | Software-attested, high trust |

GOLD grade is the target for all Seeker users. The TEEPIN hardware attestation is confirmed operational.

### C2PA Positioning

C2PA (Coalition for Content Provenance and Authenticity) and blockchain are complementary, not competing. C2PA metadata can be stripped; blockchain records cannot. The hybrid approach — C2PA sidecar + on-chain anchor — is the competitive moat. This is a **present** item for the hackathon demo, not a build item for this sprint.

---

## 5. Engineering Status — What the Team Has Built

### Confirmed Operational (as of March 3)

- **TEEPIN hardware attestation** — Real-time hardware signatures on Seeker device. GOLD grade confirmed.
- **Walrus uploads** — Stable for both public and Seal-encrypted blobs.
- **MWA (Solana)** — Wallet connection and session binding functional.
- **zkLogin (Sui)** — Google OAuth → Enoki salt API → `jwtToAddress()` → valid Sui address derivation. Ephemeral keypair generated and stored in SecureStorage. **Working.**
- **Hybrid Identity** — MWA (Solana) linked with persistent Ed25519 Session Delegate (Sui). Complete.
- **BlobMark watermark** — Glassmorphic "Passport" strip applied to all photos.
- **Video playback** — Native full-size player integrated.
- **Export Hub** — Sharing functionality for verified media.
- **Connectivity Hub** — In-app diagnostics for real-time infrastructure verification.
- **Deep Space Purple theme** — Locked across splash, icon, and UI.

### In Progress

- **zkLogin signing pipeline** — 95% complete. The single missing piece is the ZK Prover API call (`https://prover.mystenlabs.com/v1`). This is ~20 lines of code. Once implemented, the full pipeline is: JWT + ephemeral key + ZK proof = valid on-chain transaction.
- **Slush/WalletConnect integration** — Relay is now connected (confirmed March 2: `"Relayer connected 🛜"`). Deprecated WC method names corrected March 3. Maximum 1 hour of work remaining to confirm pairing.
- **Neural Fingerprinting (pHash)** — Pivoted from LSB steganography. In progress.

### Not Yet Started (P0 — Required for Submission)

| Component | Description | Dependency |
|---|---|---|
| SKR balance check | SPL token balance read via Solana RPC; gates paid captures; free tier for Seeker | Auth pipeline completion |
| SKR capture credits | SPL token transfer via MWA for paid captures | Auth pipeline completion |

### Not Yet Started (P1 — Build if Time)

| Component | Description |
|---|---|
| Verification endpoint (`POST /verify`) | REST API querying Sui, Walrus, Solana for a given Blob |
| Signed Data Package | JSON + Ed25519 signature for verification responses |
| Creator allocation UI | Three-slider interface with 33.33% Treasury floor constraint |
| Basic governance voting UI | SKR balance check + on-chain vote recording |

### Present in Demo (Not Build)

Creator Rewards flywheel, Research Instrument framework, C2PA hybrid positioning, Enterprise pricing tiers, multi-currency payments, peer-to-peer marketplace roadmap.

---

## 6. The Blocking Issue — Status as of March 3 EOD

The team spent 24+ hours on the Slush wallet integration. Here is the complete picture:

**Root cause (confirmed):** `@noble/curves` version mismatch caused the WalletConnect relay JWT signing to fail silently in Hermes (React Native's JS engine), producing 401 Unauthorized from the relay. Fixed March 2 by pinning `@noble/curves@1.8.0`. Relay is now connected.

**Secondary issue (fixed March 3):** Deprecated WC method names (`sui_signAndExecuteTransactionBlock` → `sui_signAndExecuteTransaction`, etc.) were corrected by 1D.

**Current state:** The relay connects. The method names are correct. The next test will determine whether Slush shows a pairing approval prompt. If it does, integration is complete. If not, one additional fix (intercepting `display_uri` and deep-linking to `suiwallet://wc?uri=...`) takes approximately 10 lines and 1 hour.

**Decision framework (maximum 1 hour of remaining Slush work):**

| Scenario | Action |
|---|---|
| Slush shows approval prompt after method name fix | Ship it. Done. |
| Need `display_uri` intercept + deep-link | 1A adds ~10 lines. Test again. |
| Still no pairing after both fixes | Ship with zkLogin only. Slush deferred post-hackathon. |

**Architecture integrity note:** During this session, 1A proposed removing zkLogin, reverting to per-capture wallet popups, and making WalletConnect the sole auth path. All four proposals were rejected by 1D (Security Lead) and upheld by the Founder. The Session Keys architecture is immutable. Zero-popup capture UX is non-negotiable.

---

## 7. Critical Path to Submission (5 Days)

| Day | Priority | Owner |
|---|---|---|
| **March 4 (today)** | ZK Prover API call → zkLogin signing complete; Slush pairing test; fund zkLogin testnet address | 1A |
| **March 4 (today)** | Backend Lead (1B) task assignment — verification endpoint + Anchor scaffolding | Agent 1 → 1B |
| **March 5** | SKR balance check + capture gating (P0); end-to-end capture test on Seeker | 1A |
| **March 6** | Verification endpoint (`POST /verify`); Signed Data Package | 1B |
| **March 6–7** | Creator allocation UI (3 sliders + floor); governance voting UI | 1A |
| **March 7–8** | Demo preparation; submission materials; presentation polish | All agents |
| **March 8** | Final submission | Founder |

---

## 8. Outstanding Escalations to All Agents

**Agent 1B (Backend/Blockchain Lead):** You have not yet received a formal task assignment for this sprint. Your P1 scope is the verification endpoint (`POST /verify`) and Signed Data Package. Expect a task file update today. The Anchor program scaffolding is deferred to post-hackathon.

**Agent 1F (Marketplace Lead):** Economics definition is still pending. The Creator-Directed Allocation model (Section 2 above) is now the authoritative revenue model. Your input is needed on the allocation database schema and the three-slider UI constraints. Coordinate with 1A.

**Agent 5 (Research Lead):** Phase 1 foundation deliverables received and confirmed. Phase 2 scope: begin drafting the Transparency Dashboard data model aligned with `docs/research/TRANSPARENCY_DASHBOARD_SPECS.md`. Coordinate with 1A on the Creator Allocation UI data output format.

**All agents:** The demo is a judging criterion equal in weight to the product itself. Every agent should be thinking about how their component is communicated in a 3-minute demo. Begin drafting your component's demo narrative now.

---

## 9. Values Reminder

We are not just building a photo app. We are building infrastructure for truth in an age of synthetic media. Every architectural decision — hardware attestation, zero-popup UX, free public verification, Creator-Directed Allocation, the research instrument — flows from this.

**Public verification is free forever.** This is a constitutional value, not a pricing decision. It is the accountability layer that creates the network effect and makes the product credible to society.

**Truth above all. Decentralization. Self-custody. Ethical technology. Transparency.**

These are not aspirational. They are operational constraints on every decision made in this sprint.

---

*Prepared by: Agent 1 — Product & Engineering Lead (Manus)*
*Classification: Coordination Hub — Comprehensive Sprint Update*
*Replaces: `docs/coordination/2026-03-04-engineering-update.md`*
# indelible.Blob — Final Sprint Coordination Sync

**Classification:** All Agents — Mandatory Read

**From:** Coordination Hub (Manus) + C.I.C.

**Date:** March 4, 2026

**Sprint Deadline:** March 7, 2026 @ 12:00 PM MST (Noon) — **3.5 days remaining**

**Submission Window Closes:** March 8, 2026 @ 00:00 UTC (hard deadline)

**Filed at:** `docs/coordination/WEEK_OF_MAR_2.md` (append)

---

## 🎉 Milestone: Full Capture-to-Chain Pipeline Confirmed

**This is the most important update of the entire project.**

As of March 4, 2026, the complete capture-to-chain pipeline is confirmed operational on a live Solana Seeker device. The following was verified end-to-end in a single session:

| Step | Result |
| --- | --- |
| TEEPIN Hardware Attestation | ✅ GOLD grade — `"Solana Seeker Hardware Enclave (TEEPIN) Active"` |
| zkLogin (Google OAuth → Enoki → ZK Proof → Sui Address) | ✅ Address `0xcf674ec930b7ce3f18bcfbad638cc854a14ebe8215187479cc5f9c8b5d7669dd` derived |
| Session Bind (Seed Vault signature, zero popups) | ✅ `T6EMYtbPyu0CyLVp...` — no MWA popup during capture |
| Neural Fingerprint (pHash) | ✅ Generated in 23–75ms |
| BlobMark Glassmorphic Passport | ✅ Applied to all captures |
| Walrus Upload | ✅ Blob ID `dyejKf7s-6RQV12NILkS4lMLsxnLqavY5Prh8xnhcqg` |
| Sui Blockchain Recording | ✅ Digest `GST9BVMuuvH4GqEJA1wneEG1xvQ9aijs3J6grNXFKYzb` |
| Video capture (4.7s, 1080p) | ✅ Full pipeline processed |

**The core product works.** Every remaining task is polish, features, and presentation. The team should internalize this: we are shipping a working product, not a demo.

---

## The Schedule — Non-Negotiable

With a noon March 7 submission target, we have **3.5 days** structured as follows:

| Day | Date | Focus | Hard Cutoff |
| --- | --- | --- | --- |
| **Day 1** | March 4 (today) | SKR integration + Seal encryption layer | EOD: Auth + SKR gating complete |
| **Day 2** | March 5 | Verification endpoint + Creator Allocation UI + Security audit | EOD: All P0 features complete |
| **Day 3** | March 6 | Website polish + Walrus Sites deployment + Demo recording | EOD: APK built, website live |
| **Day 3.5** | March 7 AM | Submission creation, pitch video, final polish | 12:00 PM MST: Submit |

**March 6 EOD is the feature freeze. It may even be nice to accelerate the feature freeze to March 6 at 1 MST as a buffer for final debugging and final freeze by March 6 EOD.** No new code after that point. March 7 morning is exclusively for submission materials.

---

## Complete Task List by Priority

### P0 — Must Ship (Required for Submission)

These are non-negotiable. If any P0 item is not complete by March 6 EOD, we ship without it and document the gap honestly.

| # | Task | Owner | Target | Notes |
| --- | --- | --- | --- | --- |
| P0-1 | **SKR balance check** — SPL token read via Solana RPC; gates paid captures; Seeker holders get free tier | 1A | March 4 EOD | Depends on auth pipeline (now complete) |
| P0-2 | **SKR capture credits** — SPL token transfer via MWA for paid captures | 1A | March 4 EOD | Follows P0-1 |
| P0-3 | **Seeker device detection** — TEEPIN boolean for free tier gating | 1A | March 4 (exists in `trust.ts`, wire to SKR gate) | Already in codebase |
| P0-4 | **Seal Encryption Layer — "Sovereign Mode"** | 1A + 1D | March 5 EOD | See full scope below |
| P0-5 | **Security audit of all new code** (SKR, Seal, Session Keys) | 1D | March 5 EOD | Claude Code assisted |
| P0-6 | **Android APK build** — final production build, tested on Seeker | 1A | March 6 EOD | Must run clean on device |
| P0-7 | **Website polish** — final copy, verified captures showcase, live verification portal | 1E | March 6 EOD | See website scope below |
| P0-8 | **Walrus Sites deployment** — website published to Walrus mainnet, publicly accessible | 1E + 1C | March 6 EOD | See deployment scope below |
| P0-9 | **Demo video** (2–3 min, capture → attestation → Walrus → Sui → verify) | C.I.C. + all agents | March 7 AM | Recorded on Seeker device |
| P0-10 | **Submission text** — pitch narrative for Align Nexus platform | Agent 3 + Agent 4 | March 7 AM | Draft exists, needs finalization |
| P0-11 | **GitHub repository** — clean, documented, submission-ready | 1A + Agent 1 | March 6 EOD | README updated, no debug artifacts |

### P1 — Build If Time (Strengthens Submission)

These are high-value but not blockers. Attempt in order. Stop when time runs out.

| # | Task | Owner | Target | Notes |
| --- | --- | --- | --- | --- |
| P1-1 | **Verification endpoint** (`POST /verify`) — REST API querying Sui, Walrus, Solana | 1B | March 6 | Enables live demo of verification flow |
| P1-2 | **Signed Data Package** — JSON + Ed25519 signature for verification responses | 1B | March 6 | Follows P1-1 |
| P1-3 | **Creator Allocation UI** — three-slider interface with 33.33% Treasury floor | 1A | March 6 | Present in demo even if not fully wired |
| P1-4 | **Basic governance voting UI** — SKR balance check + on-chain vote recording | 1A | March 6 | Mockup acceptable for demo |
| P1-5 | **Slush wallet integration** — if one more fix resolves pairing | 1A | March 5 | Decision: max 1 hour; ship zkLogin only if blocked |

### Present in Demo (Not Build)

These are story elements for the pitch deck and demo narrative. No engineering required.

- Creator Rewards flywheel diagram

- Social Entrepreneurship Research Instrument framework

- C2PA hybrid positioning ("C2PA can be stripped; blockchain cannot")

- Enterprise API pricing tiers and multi-currency payment model

- Peer-to-peer marketplace roadmap (post-hackathon)

---

## Seal Encryption Layer — Full Scope (P0-4)

**Why this is P0:** Seal is the "Sovereign Mode" that makes indelible.Blob a privacy-first product, not just a transparency tool. It is the feature that differentiates us from every other media verification product. Without it, we are a notarization app. With it, we are a self-sovereign truth infrastructure.

**What already exists:**

- `shared/services/seal.ts` — SealClient initialized, `encrypt()` method implemented with AES-GCM-256, threshold-1, testnet server configs confirmed

- `website/src/services/SealService.ts` — Web implementation exists

**What needs to be built (mobile integration):**

| Component | Description | File(s) |
| --- | --- | --- |
| **Sovereign Mode toggle** | UI switch in capture settings — "Public Blob" vs. "Sovereign Blob (Seal-encrypted)" | New component in `mobile/src/components/` |
| **Seal encrypt on capture** | When Sovereign Mode is active, encrypt the media file using `SealService.encrypt(file, userSuiAddress)` before Walrus upload | Modify `mobile/src/services/capture.ts` or equivalent pipeline file |
| **Encrypted Walrus upload** | Upload the encrypted blob (not the raw file) to Walrus when in Sovereign Mode | Modify Walrus upload step in pipeline |
| **Sui access policy** | Record the Seal policy ID on-chain alongside the Walrus Blob ID in `record_capture()` — so only the authorized identity can decrypt | Modify `contracts/sui/sources/indelible_blob.move` or the Sui recording step |
| **Decryption on view** | When the owner views a Sovereign Blob, call `SealService.decrypt()` using their zkLogin/session identity | New flow in gallery/viewer |
| **Trust grade indicator** | Sovereign Blobs display a distinct "🔒 Sovereign" badge alongside the existing GOLD/SILVER grade | UI update |

**Security constraints (1D must verify):**

- Encryption key is derived from the user's Sui address (identity-based encryption) — never stored server-side

- Seal key servers are threshold-based (2-of-2 testnet config already in `seal.ts`) — no single point of failure

- Decryption requires the user's active zkLogin session — cannot be delegated to a session key

- Sovereign Blobs are never transmitted unencrypted — encrypt before upload, decrypt after download

**Seal SDK reference:** `@mysten/seal` package, `SealClient.encrypt()` and `SealClient.decrypt()` methods. Package ID `0x58dce5d91278bceb65d44666ffa225ab397fc3ae9d8398c8c779c5530bd978c2` (testnet).

---

## Website & Walrus Sites Deployment Scope (P0-7, P0-8)

**Website polish (1E — March 6 EOD):**

- Final hero copy: "Signify & Verify. The decentralized truth infrastructure for the age of synthetic media."

- Live verification portal (already exists — ensure it queries the testnet Sui contract correctly)

- Showcase of verified captures from the successful March 4 test session (Walrus URLs + Sui explorer links)

- SKR integration section: Capture Credits, Creator Rewards, Governance — brief, visual

- Sovereign Mode explainer: what it is, why it matters

- Team/mission section aligned with Constitution values

- Mobile download CTA (links to APK / dApp Store listing)

**Walrus Sites deployment (1E + 1C — March 6 EOD):**

The website must be deployed to Walrus mainnet using the `site-builder` CLI tool. This makes it censorship-resistant and permanently accessible — a direct embodiment of our values and a compelling story for the judges.

Steps:

1. Build the website to a static output directory (`npm run build` or equivalent)

1. Install `site-builder` binary (Ubuntu x86_64 mainnet binary from Mysten)

1. Configure `~/.config/walrus/sites-config.yaml` with mainnet context

1. Run `site-builder publish <build-directory>` — returns a Site Object ID and portal URL

1. Record the portal URL (format: `https://<site-object-id>.walrus.site` ) in the submission

1. Update `docs/SPRINT_STATUS.md` with the live URL

**The Walrus Sites URL becomes part of the submission.** It is the proof that we don't just talk about decentralization — we deploy to it.

---

## Submission Materials — March 7 AM (Hard Deadline: 12:00 PM MST)

All submission materials must be ready before noon. The following is the complete checklist:

| Item | Owner | Status | Notes |
| --- | --- | --- | --- |
| Android APK | 1A | Not yet built | Final build March 6 EOD |
| GitHub repository (clean) | Agent 1 | In progress | README update needed |
| Demo video (2–3 min) | C.I.C. | Not started | Record on Seeker, show full pipeline |
| Pitch narrative (Align Nexus text) | Agent 3 + Agent 4 | Draft exists | Finalize March 7 AM |
| Walrus Sites URL | 1E + 1C | Not yet deployed | Deploy March 6 |
| Sui Explorer link (verified capture) | 1A | ✅ Available now | `GST9BVMuuvH4GqEJA1wneEG1xvQ9aijs3J6grNXFKYzb` |
| SKR bonus prize eligibility | 1A | Pending P0-1/P0-2 | Must have functional SKR integration |

**Demo video narrative (suggested arc — 2.5 minutes):**

1. **Hook (0:00–0:20):** "A deepfake just went viral. The damage is done before anyone can verify it. What if truth was provable at the moment of capture?"

1. **The capture (0:20–1:00):** Open indelible.Blob on Seeker. Show GOLD grade. Take a photo. Show zero popups. Show the BlobMark passport applied.

1. **The chain (1:00–1:40):** Show the Walrus upload completing. Show the Sui transaction recording on-chain. Show the Sui Explorer link — live, verifiable.

1. **The verification (1:40–2:10):** Open the public verification portal. Paste the Blob ID. Show the full chain of custody — device, identity, timestamp, GPS, hash.

1. **The vision (2:10–2:30):** "This is not just a photo app. This is the protocol for reality."

---

## Agent Assignments — Final Sprint

| Agent | Primary Focus | Secondary Focus | Hard Deadline |
| --- | --- | --- | --- |
| **1A (Mobile Lead)** | SKR integration (P0-1, P0-2, P0-3) → Seal Sovereign Mode (P0-4) → Creator Allocation UI (P1-3) | Slush (max 1hr, then drop) | March 6 EOD: APK built |
| **1B (Backend Lead)** | Verification endpoint + Signed Data Package (P1-1, P1-2) | Coordinate with 1A on API contract | March 6 EOD |
| **1C (Storage/Infra Lead)** | Walrus Sites deployment support (P0-8) | Ensure testnet Walrus stability | March 6 EOD: Site live |
| **1D (Security Lead)** | Audit all new code: SKR, Seal, Session Keys (P0-5) | Claude Code assisted review | March 5 EOD: Audit complete |
| **1E (Web Lead)** | Website polish (P0-7) + Walrus Sites build prep | Coordinate with 1C on deployment | March 6 EOD: Site deployed |
| **Agent 3 (Business Strategy)** | Finalize pitch narrative for Align Nexus | Review SKR bonus prize eligibility criteria | March 7 AM |
| **Agent 4 (Content)** | Demo video script finalization | Social announcement draft (post-submission) | March 7 AM |
| **Agent 5 (Research)** | Transparency Dashboard data model (coordinate with 1A on allocation UI output format) | Phase 2 research protocol | Post-hackathon |
| **Claude Code** | Security review of Seal integration + SKR token handling | Architecture consistency check | March 5 EOD |

---

## Decisions — Locked, Do Not Revisit

The following decisions are final. Any agent proposing to reopen these during the sprint should be redirected to post-hackathon discussion.

| Decision | Outcome |
| --- | --- |
| Session Keys architecture | Immutable. Zero-popup capture is non-negotiable. |
| zkLogin as primary auth | Ship with zkLogin. Slush is P1 with a 1-hour time cap. |
| Public verification | Free forever. No exceptions. |
| Seal Sovereign Mode | P0 — must ship with first launch. |
| Creator-Directed Allocation | 33.33% Treasury floor. Three-slider UI. |
| Walrus Sites for website | Deploy to mainnet. This is the submission URL. |
| Submission deadline | March 7, 12:00 PM MST. Non-negotiable. |

---

## Values Reminder

We are shipping infrastructure for truth in an age of synthetic media. The capture-to-chain pipeline working on a real Seeker device is proof that this is not a concept — it is a product. Every hour of the next 3.5 days is in service of getting that product in front of the world.

**Truth above all. Decentralization. Self-custody. Ethical technology. Transparency.**

---

*Prepared by: Coordination Hub (Manus) in partnership with C.I.C.**Pending C.I.C. approval before dissemination to all agents.**Upon approval: append to **`docs/coordination/WEEK_OF_MAR_2.md`** and update **`docs/SPRINT_STATUS.md`**.*

