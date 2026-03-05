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

---

## 1D Security Review: Seal Encryption Implementation Plan — March 4, 2026

**From:** Sub-Agent 1D (Security/Quality Lead)
**To:** Mobile Lead (1A)
**Re:** Seal Encryption Layer implementation plan for Sovereign Mode (P0-4)

---

### Acknowledgment

1A, the course correction on zkLogin was well executed. The ZK prover integration in `useZkLogin.ts`, the silent signing path in `useCapture.ts`, and the session flow reorder in `App.tsx` (Layer A before Layer B) are architecturally sound. The `display_uri` interceptor in `SuiWalletContext.tsx` is also correctly implemented. Good work.

---

### Overall Verdict: APPROVED — With Corrections Below

The Seal plan is well-researched and follows the correct patterns from the Seal documentation. Deploy after addressing these corrections.

---

### 1. Move Contract (`sovereign_blob.move`) — APPROVED

Security properties verified:

- `SovereignBlob` with `key, store` — correct abilities for an owned object
- `seal_approve(id, &SovereignBlob)` — validates key ID match. This is the on-chain access control gate Seal key servers call before releasing decryption keys
- `store_entry` creates owned object with `creator: ctx.sender()` — only the transaction sender owns it
- `SovereignBlob` has `store` ability (transferable), but `seal_approve` checks the `creator` field, not the current owner — **transfer does not grant decryption**. Correct security property.

**Correction required:** Verify that `compute_key_id()` output format matches what `SealClient.encrypt()` expects. The Seal SDK computes the key ID as `[package_id_bytes][creator_bytes][nonce_bytes]` — compare your implementation against the reference `private_data.move` in the [MystenLabs/seal repo](https://github.com/MystenLabs/seal) before deploying. If the format doesn't match, encryption and decryption will use different key IDs and decryption will silently fail.

---

### 2. Hermes Compatibility — Correction on Approach Order

1A correctly identifies `@mysten/seal` crashes Hermes. The three proposed options are reasonable.

**Recommended order:**

1. **First (15 min):** Try the existing `shared/services/seal.ts` as-is. The crash may be at import, instantiation, or `encrypt()`. Identify the exact failure point.

2. **If import crash (15 min):** Use Metro `resolveRequest` to patch the specific `Object.defineProperty` call in the `@mysten/seal` source that Hermes rejects. This is surgical and low-risk.

3. **If patch fails:** WebView bridge. Serialize data to a hidden WebView running the Seal SDK in V8/JSC context. This is reliable but adds overhead for large media files.

4. **Do NOT attempt to replicate IBE from scratch using `@noble/curves/bls12-381`.** Boneh-Franklin IBE is a complex cryptographic construction. Reimplementing it introduces far more risk than patching or bridging the existing SDK. Use the SDK.

**Time-box the Hermes investigation to 30 minutes total.** If not resolved, go straight to WebView bridge.

---

### 3. SealService (`seal.ts`) — Corrections Required

**Problem 1: Wrong `id` parameter.**

Current code (line 77-78):
```typescript
id: identity,  // This is a string like a Solana address
```

Correct (per Seal `private_data` pattern):
```typescript
id: computeKeyId(sovereignBlobPackageId, creatorSuiAddress, nonce)
// Where the id bytes = [package_id + creator_address + nonce]
```

The `id` must match what `sovereign_blob::compute_key_id()` produces on-chain. Mismatched IDs = decryption key mismatch = silent failure.

**Problem 2: Wrong `packageId`.**

Current `SEAL_PACKAGE_ID` (`0x58dce5...`) is the Seal *protocol's* package ID. The `packageId` parameter in `encrypt()` must be your *application's* deployed `sovereign_blob` package ID — the one that contains your `seal_approve` function. These are different packages.

After deploying `sovereign_blob.move`, update `seal.ts` to use the new package ID.

---

### 4. Nonce Generation — Security Requirements

The plan correctly specifies 32-byte random nonces. Requirements:

- **MUST use CSPRNG:** `crypto.getRandomValues(new Uint8Array(32))` — works in React Native because `react-native-get-random-values` is imported at the top of `App.tsx`
- **MUST be unique per capture** — nonce reuse in IBE leaks the symmetric key. Two captures with the same nonce and identity produce the same ciphertext key.
- **Store nonce in capture metadata** for later decryption

---

### 5. SecureStorage Key Hygiene — Fix Required (10 min)

The zkLogin implementation stores three values using bare string keys that bypass the `SECURE_STORAGE_KEYS` constants:

```typescript
// useZkLogin.ts lines 150-152:
await SecureStorage.setSecureItem('zklogin_proof', ...);
await SecureStorage.setSecureItem('zklogin_salt', ...);
await SecureStorage.setSecureItem('zklogin_jwt', ...);

// useCapture.ts line 267:
const zkProofStr = await SecureStorage.getSecureItem('zklogin_proof');
```

These should use the centralized constants in `secureStorage.ts`. Add:

```typescript
// In SECURE_STORAGE_KEYS:
ZKLOGIN_PROOF: 'secure.zklogin.proof',
ZKLOGIN_SALT: 'secure.zklogin.salt',
ZKLOGIN_JWT: 'secure.zklogin.jwt',
```

Then update `useZkLogin.ts` and `useCapture.ts` to reference `SECURE_STORAGE_KEYS.ZKLOGIN_PROOF` etc. Note the `secure.` prefix — the current bare strings don't have it, so they're in a different keyspace than the other zkLogin keys stored in SecureStorage.

**Why this matters:** `SECURE_STORAGE_KEYS` is the canonical inventory of all sensitive data at rest. If it's not in the constant, it's invisible to security audits.

---

### 6. Pipeline Integration — Missing Steps

Current sovereign path (`useCapture.ts` lines 178-195) encrypts and uploads. What's missing:

1. **Generate nonce** (32 bytes, CSPRNG) per sovereign capture
2. **Compute correct Seal identity** from `[packageId + creatorAddress + nonce]`
3. **After Walrus upload:** call `sovereign_blob::store_entry(nonce, blobId)` on Sui — this creates the owned `SovereignBlob` object required for later decryption
4. **Store nonce** in capture metadata

Step 3 should use the same zkLogin signing path that `record_capture` already uses — ephemeral key + ZK proof, no wallet popup.

---

### 7. Security Constraints Verification (per SPRINT_STATUS P0-5)

Checking the constraints listed in `WEEK_OF_MAR_2.md` Section 7:

| Constraint | Status |
|------------|--------|
| Encryption key derived from user's Sui address — never stored server-side | ✅ IBE derives key from identity (address + nonce). No key storage. |
| Seal key servers are threshold-based (2-of-2 testnet) | ✅ Confirmed in `seal.ts` lines 20-23: two server configs, weight 1 each |
| Decryption requires active zkLogin session — cannot be delegated to session key | ⚠️ **Verify.** Seal `decrypt()` requires a `SessionKey` object built from a PTB calling `seal_approve`. The signer for this PTB must own the `SovereignBlob` object. If the zkLogin address owns it, only the zkLogin identity can decrypt. The ephemeral session key can sign the PTB if it has zkLogin authority. This should work but needs testing. |
| Sovereign Blobs never transmitted unencrypted | ✅ Architecture correct — encrypt before Walrus upload, decrypt after download |

---

### Implementation Order

| Step | Task | Time | Priority |
|------|------|------|----------|
| 1 | Add zkLogin keys to `SECURE_STORAGE_KEYS` constants | 10 min | P0 |
| 2 | Test `@mysten/seal` import on Hermes, identify crash point | 15 min | P0 |
| 3 | Deploy `sovereign_blob.move` (verify key ID format against reference first) | 20 min | P0 |
| 4 | Update `SealService.encrypt()` with correct identity + new package ID | 15 min | P0 |
| 5 | Wire nonce generation + `store_entry` into capture pipeline | 30 min | P0 |
| 6 | If Seal SDK crashes: Metro patch or WebView bridge | 30 min | P1 (conditional) |
| 7 | DiagnosticsHub updates | 15 min | P2 |

**Total P0: ~90 minutes.** Conditional P1 adds 30 min if Hermes patch needed.

---

### Summary

1A is cleared to implement. The plan is fundamentally correct. The three corrections that matter most:

1. **Key ID format** — verify `compute_key_id()` matches Seal SDK expectation before deploying
2. **Package ID** — use your deployed `sovereign_blob` package ID, not the Seal protocol package ID
3. **SecureStorage constants** — add the three bare zkLogin keys to `SECURE_STORAGE_KEYS`

Everything else is sound. Execute.

---

**Prepared by:** Sub-Agent 1D (Security/Quality Lead)
**Date:** March 4, 2026
**Classification:** P0-4 + P0-5 — Seal review complete, 1A cleared to implement

---

## 1D SKR Payment Architecture — Full Implementation Spec

**Date:** March 4, 2026 PM
**Decision Status:** LOCKED (C.I.C. + 1D alignment)
**Classification:** P0-1 + P0-2 — SKR balance gating + payment transfer

---

### Design Principle

SKR payment follows the **same zero-interruption contract as Session Keys**. The capture phase is sacred — no wallet popups, no balance checks, no payment prompts. Everything that requires user interaction happens at session boundaries.

---

### Session Start: Layer C (SKR Gate)

Insert after Layer B (MWA Session Bind) in `App.tsx handleStartSession`:

```
Layer A: Sui wallet check (zkLogin)          ← existing
Layer B: MWA Session Bind (TEEPIN)           ← existing
Layer C: SKR Gate (NEW)                      ← insert here
GPS lock                                     ← existing
Camera opens
```

**Implementation in `handleStartSession` (App.tsx):**

```typescript
// Layer C: SKR Balance Gate
const profile = await TrustManager.getDeviceProfile();
if (profile.grade === 'GOLD') {
  // Seeker free tier — skip SKR entirely
  sessionState.skrRequired = false;
  sessionState.availableCaptures = Infinity;
} else {
  // Paid tier — read SKR balance
  const solanaAddr = IdentityService.getCurrentUser()?.solanaAddress;
  if (!solanaAddr) {
    // Non-Seeker without MWA — use a Solana address from another source or block
    throw new Error('SKR payment requires a connected Solana wallet.');
  }
  const balance = await SkrService.getBalance(solanaAddr);
  const costPerCapture = CAPTURE_CONFIG.SKR_CAPTURE_COST;
  const available = Math.floor(balance / costPerCapture);

  if (available <= 0) {
    Alert.alert('Insufficient SKR', 'Your SKR balance cannot cover a capture. Please add SKR to continue.');
    return; // Block session start
  }

  sessionState.skrRequired = true;
  sessionState.availableCaptures = available;
  sessionState.skrCostPerCapture = costPerCapture;
  sessionState.capturesTaken = 0;
}
```

**Key points:**
- `getBalance()` is a Solana RPC call — no MWA popup, no user interaction
- Use `@solana/spl-token` `getAssociatedTokenAddress()` to compute the ATA deterministically
- Handle case where user has never held SKR (empty ATA array → balance 0, not an error)
- Validate that returned mint matches `SKRbvo6Gf7GondiT3BbTfuRDPqLWei4j2Qy2NPGZhW3`

---

### During Capture: Counter Management

In `useCapture.ts processCapture()`, add before Step 1:

```typescript
// SKR capture counter
if (sessionState.skrRequired) {
  const remaining = sessionState.availableCaptures - sessionState.capturesTaken;

  if (remaining <= 0) {
    // Graceful auto-end: preserve all captures, end session
    blobLog.warn('SKR balance depleted. Auto-ending session.');
    Alert.alert(
      'Session Complete',
      `Your SKR balance has been reached. ${sessionState.capturesTaken} captures saved successfully.`,
      [{ text: 'OK', onPress: () => endSession() }]
    );
    return false;
  }

  if (remaining === 1) {
    // Subtle warning — don't block, just inform
    blobLog.info('⚠️ Last capture available in current SKR balance.');
    // Optional: show non-blocking toast
  }

  sessionState.capturesTaken++;
}
```

**Critical constraint:** NEVER discard or delete captures due to payment state. Every capture taken is the user's property regardless of payment status.

---

### Session End: Post-Settlement

When the user presses "End Session" or auto-end triggers:

```typescript
// Calculate total owed
const totalOwed = sessionState.capturesTaken * sessionState.skrCostPerCapture;

if (totalOwed > 0 && sessionState.skrRequired) {
  try {
    // Single MWA popup: SPL transfer to treasury
    const txSig = await SkrService.transferForCapture(
      totalOwed,
      IdentityService.getCurrentUser()?.solanaAddress!
    );
    blobLog.success(`SKR payment complete: ${totalOwed} SKR. Tx: ${txSig}`);
  } catch (error) {
    // Payment failed — captures are STILL SAVED
    blobLog.error('SKR payment failed:', error);
    // Mark captures as payment_pending
    await markCapturesPaymentPending(sessionState.captureIds);
    // Retry logic on next session start
    Alert.alert(
      'Payment Pending',
      `${sessionState.capturesTaken} captures saved. SKR payment of ${totalOwed} will be retried on next session.`
    );
  }
}
```

---

### SkrService Implementation (`mobile/src/services/skr.ts`)

```typescript
// Key design decisions:
// 1. Use getAssociatedTokenAddress() — don't scan all token accounts
// 2. Validate mint in response — don't trust RPC blindly
// 3. MWA transact() for transfer — same pattern as identity.ts session bind
// 4. Treasury address from config — NOT hardcoded in service

import { Connection, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress, getAccount } from '@solana/spl-token';
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { CAPTURE_CONFIG } from '../constants/config';

const SKR_MINT = new PublicKey('SKRbvo6Gf7GondiT3BbTfuRDPqLWei4j2Qy2NPGZhW3');

export class SkrService {
  private static connection = new Connection(CAPTURE_CONFIG.SOLANA_RPC_URL, 'confirmed');

  static async getBalance(solanaAddress: string): Promise<number> {
    const owner = new PublicKey(solanaAddress);
    const ata = await getAssociatedTokenAddress(SKR_MINT, owner);
    try {
      const account = await getAccount(SkrService.connection, ata);
      // Validate mint matches — defense in depth
      if (!account.mint.equals(SKR_MINT)) {
        throw new Error('Mint mismatch in SKR token account');
      }
      return Number(account.amount) / 1e9; // Assuming 9 decimals — verify
    } catch (e: any) {
      if (e.name === 'TokenAccountNotFoundError') {
        return 0; // User has never held SKR
      }
      throw e;
    }
  }

  static async transferForCapture(amount: number, fromAddress: string): Promise<string> {
    // MWA transact() — single popup at session end
    return await transact(async (wallet) => {
      const auth = await wallet.authorize({
        cluster: CAPTURE_CONFIG.SOLANA_NETWORK as any,
        identity: {
          name: 'indelible.Blob',
          uri: 'https://indelible-blob.walrus.site',
          icon: 'favicon.ico',
        },
      });

      // Build SPL transfer instruction
      // Treasury address from config (C.I.C. provides this)
      const treasuryPubkey = new PublicKey(CAPTURE_CONFIG.SKR_TREASURY_WALLET);
      // ... build and sign SPL transfer transaction
      // Return transaction signature

      // Implementation detail: use createTransferInstruction from @solana/spl-token
      // Amount in smallest units (lamports equivalent for SPL)
      throw new Error('TODO: 1A implements SPL transfer instruction here');
    });
  }
}
```

---

### Config Additions (`mobile/src/constants/config.ts`)

Add to `CAPTURE_CONFIG`:

```typescript
// SKR configuration
SKR_MINT_ADDRESS: 'SKRbvo6Gf7GondiT3BbTfuRDPqLWei4j2Qy2NPGZhW3',
SKR_TREASURY_WALLET: process.env.EXPO_PUBLIC_SKR_TREASURY_WALLET || '', // C.I.C. provides
SKR_CAPTURE_COST: 0.5, // Placeholder — Agent 3 determines final pricing
```

Add to `shared/types/index.ts` `AppConfig`:

```typescript
SKR_MINT_ADDRESS?: string;
SKR_TREASURY_WALLET?: string;
SKR_CAPTURE_COST?: number;
```

---

### Session State Extension

The session needs to track SKR state. Add to session context or `useCapture` hook state:

```typescript
interface SkrSessionState {
  skrRequired: boolean;
  availableCaptures: number;
  skrCostPerCapture: number;
  capturesTaken: number;
  captureIds: string[];    // Track for payment_pending marking
  paymentStatus: 'not_required' | 'pending' | 'completed' | 'failed';
}
```

---

### Security Constraints (1D Enforcement)

| Constraint | Rationale |
|------------|-----------|
| Balance read is RPC-only — no MWA popup | Preserves zero-interruption capture UX |
| Validate mint address in response | Prevents token confusion attacks (wrong SPL token) |
| Treasury wallet from config/env — never in service code | Separation of concerns; C.I.C. controls funds |
| Payment failure never deletes captures | User property rights; captures are already hashed/stamped |
| `payment_pending` state persisted | Retry on next session; no silent data loss |
| GOLD grade bypass via TrustManager | Cannot be spoofed — requires MWA session bind (hardware) |
| SKR decimal precision | Verify SKR uses 9 decimals before production. Wrong divisor = wrong balance. |

---

### Open Items (Require Non-1A Decisions)

| Item | Owner | Decision Needed |
|------|-------|-----------------|
| Treasury wallet Solana pubkey | C.I.C. | Generate dedicated testnet keypair. Multisig (Squads) for mainnet. |
| Capture cost in SKR | Agent 3 | Set initial pricing. Configurable constant, not hardcoded. |
| SKR token decimals | 1A | Verify on-chain. Assumed 9 — if wrong, balance calculations break. |
| Payment retry UX | 1A | What happens if user opens app with `payment_pending` captures? Prompt before new session? |

---

### Implementation Order

| Step | Task | Time | Prereq |
|------|------|------|--------|
| 1 | Add SKR config constants to `config.ts` + types | 10 min | None |
| 2 | Build `SkrService.getBalance()` | 20 min | Step 1 |
| 3 | Wire Layer C gate into `handleStartSession` | 20 min | Step 2 |
| 4 | Add capture counter to `useCapture.ts` | 15 min | Step 3 |
| 5 | Build auto-end + warning UX | 15 min | Step 4 |
| 6 | Build `SkrService.transferForCapture()` | 30 min | Treasury wallet address |
| 7 | Wire post-settlement into session end | 15 min | Step 6 |
| 8 | Add `payment_pending` persistence + retry | 20 min | Step 7 |

**Total: ~2.5 hours.** Steps 1–5 can begin immediately (no treasury wallet needed). Steps 6–8 blocked on C.I.C. treasury wallet decision.

---

**Prepared by:** Sub-Agent 1D (Security/Quality Lead)
**Date:** March 4, 2026 PM
**Classification:** P0-1 + P0-2 — SKR payment architecture locked, 1A cleared to implement Steps 1–5 immediately



# --- ARCHIVED SPRINT STATUS (MARCH 4 EOD) ---

# SPRINT STATUS — indelible.Blob
> **This is the single source of truth for current sprint state. Updated daily by Agent 1. One read = full picture.**
> Detailed history lives in `docs/coordination/WEEK_OF_MAR_2_PART_1.md`, `docs/coordination/WEEK_OF_MAR_2_PART_2.md`, and `docs/coordination/ENGINEERING_SYNC_ARCHIVE.md`.

---

## Sprint: MONOLITH Hackathon Final Sprint
**Submission Target:** March 7, 2026 @ 12:00 PM MST (Noon) | **Days Remaining:** 3.5
**Hard Deadline:** March 9, 2026 @ 00:00 UTC
**Last Updated:** March 4, 2026 PM by 1D (Claude Code) — SKR payment architecture decision locked

---

## 🎉 MILESTONE: Full Capture-to-Chain Pipeline Confirmed — March 4, 2026

End-to-end pipeline verified on live Seeker device:
- ✅ TEEPIN GOLD grade attestation
- ✅ zkLogin: ZK Proof derived, Sui address `0xcf674ec930b7ce3f18bcfbad638cc854a14ebe8215187479cc5f9c8b5d7669dd`
- ✅ Session bind: zero wallet popups during capture
- ✅ Neural fingerprint: 23–75ms
- ✅ Walrus upload: `dyejKf7s-6RQV12NILkS4lMLsxnLqavY5Prh8xnhcqg`
- ✅ Sui on-chain recording: `GST9BVMuuvH4GqEJA1wneEG1xvQ9aijs3J6grNXFKYzb`
- ✅ Video capture: full pipeline processed

**The core product works. All remaining work is features, polish, and presentation.**

---

## Build Status

| Component | Status | Owner | Notes |
|---|---|---|---|
| TEEPIN hardware attestation | ✅ Done | 1A | GOLD grade confirmed on Seeker |
| MWA (Solana) wallet connection | ✅ Done | 1A | Session binding functional |
| zkLogin — full pipeline | ✅ Done | 1A | ZK Prover, Enoki, address derivation all working |
| Session Keys (zero-popup capture) | ✅ Done | 1A | Confirmed in live test |
| Neural Fingerprinting (pHash) | ✅ Done | 1A | 23–75ms on device |
| BlobMark Glassmorphic Passport | ✅ Done | 1A | Applied to all captures |
| Walrus uploads | ✅ Done | 1C | Stable, testnet confirmed |
| Sui blockchain recording | ✅ Done | 1A | Live transaction verified |
| Trust Grading (GOLD/SILVER) | ✅ Done | 1A | Strict enforcement active |
| Hybrid Identity (MWA + Session Delegate) | ✅ Done | 1A | Complete |
| Gas Management | ✅ Done | 1A | GasManager operational |
| **SKR balance check + capture gating** | 🟠 **P0 — Architecture Locked** | 1A | Per-session gating at session start. See SKR decision below. |
| **SKR transfer for paid captures** | 🟠 **P0 — Architecture Locked** | 1A | Post-settle at session end via MWA. See SKR decision below. |
| **Seal Encryption Layer (Sovereign Mode)** | ✅ Done | 1A + 1D | Deployed, tested on device. Photo + video encrypted on Seeker. |
| **Security audit (SKR + Seal + Session Keys)** | 🔴 **P0** | 1D + Claude Code | Seal review done; SKR + Session Keys audit remaining by Mar 5 EOD |
| **Android APK (final build)** | 🔴 **P0** | 1A | Mar 6 EOD |
| **Website polish** | 🔴 **P0** | 1E | Mar 6 EOD |
| **Walrus Sites deployment** | 🔴 **P0** | 1E + 1C | Mar 6 EOD — becomes submission URL |
| Verification endpoint (`POST /verify`) | 🟠 P1 | 1B | Mar 6 |
| Signed Data Package (JSON + Ed25519) | 🟠 P1 | 1B | Mar 6 |
| Creator Allocation UI (3 sliders + 33.33% floor) | 🟠 P1 | 1A | Mar 6 |
| Governance voting UI | 🟠 P1 | 1A | Mar 6 |
| Slush/WalletConnect pairing | 🟡 P1 (max 1hr) | 1A | Drop if not resolved quickly |
| Seal granular access controls (share, time-lock, NFT-gate) | 🟣 P2 — Post-Hackathon | 1A + 1D | Extend `sovereign_blob.move` with allowlist/expiry/NFT checks in `seal_approve`. UI: share controls on gallery view. |
| Demo video (2–3 min, Seeker device) | 🔴 **P0** | C.I.C. | Mar 7 AM |
| Pitch narrative (Align Nexus) | 🔴 **P0** | Agent 3 + Agent 4 | Mar 7 AM |

---

## 1D Seal Encryption Review — March 4 PM

**Verdict: APPROVED with 4 required corrections before implementation.**

1A's Seal implementation plan is architecturally sound. The `sovereign_blob.move` contract + `SealService` + UI toggle approach is correct. Fix these before writing code:

| # | Issue | Fix |
|---|-------|-----|
| 1 | **Key ID computation** | Must be `[package_id_bytes ∥ creator_address_bytes ∥ nonce_bytes]` — NOT a string concat. Use `bcs.serialize()` to match Move's `seal_approve` verification. |
| 2 | **Package ID in SealService** | `packageId` param must be your deployed `sovereign_blob` package ID, NOT the Seal protocol ID (`0x58dce5...`). The Seal SDK routes to the right `seal_approve` function via this. |
| 3 | **SecureStorage key hygiene** | zkLogin stores `zklogin_proof`, `zklogin_salt`, `zklogin_jwt` as bare strings. Add these to `SECURE_STORAGE_KEYS` enum in `secureStorage.ts`. All secrets must go through the constants. |
| 4 | **Nonce generation** | Use `crypto.getRandomValues(new Uint8Array(32))` for per-capture nonce. Never reuse nonces — each capture needs a unique encryption identity. |

**1A action items**: Read `WEEK_OF_MAR_2.md` for full technical details, then begin implementation with corrections applied.

---

## 1D SKR Payment Architecture Decision — March 4 PM

**Decision: Per-session gating with post-settlement. LOCKED.**

SKR payment follows the same zero-interruption principle as Session Keys. All authorization happens before the capture screen opens. All payment happens after the session ends.

**Flow:**
1. **Session start** (Layer C, after MWA bind): Read SKR balance via RPC. Compute `availableCaptures = floor(balance / costPerCapture)`. If zero → block session, show "Insufficient SKR." GOLD (Seeker) users skip entirely (free tier).
2. **During capture**: Decrement counter per capture. Warn at last capture. Auto-end session gracefully when balance depleted — all captures preserved.
3. **Session end**: Tally `actualCaptures × costPerCapture`. Execute single SPL transfer via MWA. If transfer fails → captures still saved, mark `payment_pending`, retry next session.

**1A critical constraints:**
- NO wallet popups during capture — this is the Session Keys guarantee
- NO data loss on payment failure — captures are the user's property
- Balance check is a Solana RPC read (no MWA needed) — bundle into existing `handleStartSession`
- SPL transfer uses same MWA `transact()` pattern as `identity.ts` session bind
- Treasury wallet address: **Needs C.I.C. decision.** Use dedicated testnet keypair for hackathon, multisig (Squads) for mainnet.
- Capture cost in SKR: **Needs Agent 3 decision.** Set configurable placeholder for now.

**1A action items**: Read `WEEK_OF_MAR_2.md` for full implementation spec, then build `SkrService` + integrate into session flow.

---

## Final Sprint Schedule

| Day | Date | Focus | Hard Cutoff |
|---|---|---|---|
| **Day 1** | March 4 (today) | SKR integration + Seal encryption layer | EOD: Auth + SKR gating complete |
| **Day 2** | March 5 | Verification endpoint + Creator Allocation UI + Security audit | EOD: All P0 features complete |
| **Day 3** | March 6 | Website polish + Walrus Sites deployment + Demo recording prep | EOD: APK built, website live |
| **Day 3.5** | March 7 AM | Demo video, pitch narrative, submission creation | 12:00 PM MST: Submit |

**March 6 EOD = Feature Freeze. No new code after that point.**

---

## Decisions — Locked (Do Not Revisit This Sprint)

| Decision | Outcome |
|---|---|
| Session Keys architecture | Immutable. Zero-popup capture is non-negotiable. |
| zkLogin as primary auth | Ship with zkLogin. Slush is P1 with 1-hour time cap. |
| Public verification | Free forever. Constitutional value. |
| Seal Sovereign Mode | P0 — ships with first launch. |
| Revenue model | Creator-Directed Allocation. 33.33% Treasury floor. |
| SKR discount | 25% off for SKR payment. No fiat premium. |
| SKR payment architecture | Per-session: balance gate at session start, auto-end on depletion, SPL transfer at session end. Zero popups during capture. |
| Walrus Sites for website | Deploy to mainnet. This is the submission URL. |
| Beachhead market | Insurance & Adjusting. Verification Bundle is MVP product. |
| Cross-chain architecture | Solana (identity + commerce) + Sui (provenance) + Walrus (storage). Locked. |

---

## Agent Roster

| Agent | Role | Sprint Status |
|---|---|---|
| Coordination Hub (Manus) | Cross-agent synthesis + C.I.C. partner | Active |
| Agent 1 (Manus) | Product & Engineering Lead | Active |
| 1A (Antigravity) | Mobile Lead | Active — executing SKR + Seal |
| 1B (Antigravity) | Backend/Blockchain Lead | Active — verification endpoint |
| 1C (Antigravity) | Storage/Infrastructure Lead | Active — Walrus Sites deployment |
| 1D (Antigravity) | Security/Quality Lead | Active — audit all new code |
| 1E (Antigravity) | Website Lead | Active — final sprint activated |
| Claude Code | Security advisor + pair programmer | Active via IDE extension |
| Agent 3 (Manus) | Business Strategy Lead | Active — pitch narrative |
| Agent 4 (Manus) | Content & Communications Lead | Active — demo script |
| Agent 5 (Manus) | Research Lead | Phase 2 post-hackathon |
