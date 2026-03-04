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
