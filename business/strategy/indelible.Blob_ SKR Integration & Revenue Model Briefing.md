# indelible.Blob: SKR Integration & Revenue Model Briefing

**Prepared by:** Manus (Coordination Hub)
**For:** Agent 3 — Business Strategy Lead
**Date:** March 1, 2026
**Context:** MONOLITH Hackathon final sprint. Submission deadline March 9, 2026. This document proposes a unified SKR token integration and consumption-side revenue model for review, refinement, and strategic validation.

---

## 1. Background

The MONOLITH hackathon offers a **$10,000 SKR bonus prize** for the best SKR token integration, in addition to the main $10,000 USDC prizes for the top 10 submissions. The C.I.C. has reviewed five proposed SKR integration options and selected three to pursue in combination: **Capture Credits (B)**, **Creator Rewards (C)**, and **Governance (D)**. A fourth option, Verification Staking (A), was evaluated and set aside — it introduced human attestation into a system designed to be trustless and automated, which contradicts indelible.Blob's core thesis.

The C.I.C. has directed that any incentive programs must be **self-sustaining** — funded by actual revenue, not by promises or pre-allocated reserves that an unfunded solo startup cannot maintain. This document proposes a structure that achieves this.

---

## 2. The Unified Model: B + C + D

The three selected options form a layered system where each serves a distinct function:

| Layer | Option | Function | Description |
|-------|--------|----------|-------------|
| **Access** | B — Capture Credits | Controls who captures and at what cost | Seeker + SKR holders capture for free. Non-Seeker users pay a small SKR fee per capture. Enterprise users pay for volume tiers. |
| **Incentive** | C — Creator Rewards | Rewards creators for producing verified content | Creators earn SKR when their verified captures generate consumption-side revenue. Rewards are a percentage of actual revenue, not a fixed pool. |
| **Control** | D — Governance | Gives SKR holders ownership over protocol economics | SKR holders vote on fee split ratios, mandatory metadata fields, verification standards, and protocol upgrades. |

The critical design principle is that **Options B and C are connected through the consumption side.** Free captures (B) generate verified content. Verified content generates consumption revenue. Consumption revenue funds creator rewards (C) and organizational operations. Governance (D) lets the community tune the economics over time.

---

## 3. Multi-Currency Payment Structure

The C.I.C. has specified that enterprise and commercial payments must be accepted in currencies that are liquid and convertible into BTC, SKR, SOL, and SUI. The proposed structure uses an SKR discount as the strategic incentive:

| Payment Method | Rate | Strategic Rationale |
|---|---|---|
| **SKR** | **Discounted** (proposed 15-20% off standard) | Drives genuine SKR demand, deepens Seeker ecosystem alignment, strengthens hackathon narrative |
| SOL | Standard | Native to Solana, high liquidity |
| SUI | Standard | Native to the provenance chain |
| BTC | Standard | Store of value, institutional credibility |
| USDC / USDT | Standard | Stablecoin bridge for volatility-averse enterprises |
| Fiat (USD) | Standard or slight premium | Covers conversion friction; see Question 4 below |

On the backend, incoming tokens would be managed through a multi-sig treasury wallet with periodic rebalancing via Jupiter or equivalent DEX aggregators.

---

## 4. The Consumption Side: Where Revenue Lives

### Core Principle

The C.I.C. has established that **basic verification must remain free and open-access.** The existing verification portal on the indelible.Blob website is the public good layer — anyone can verify whether a capture is authentic. This is non-negotiable and values-driven.

Revenue comes not from gating access to truth, but from **operational tooling, workflow integration, and enterprise-grade delivery** built on top of the free verification layer.

### Tier Structure

**Tier 1: Public Verification — Free, Open-Access**

The verification portal that already exists. Anyone with a capture hash or QR code can verify authenticity, view timestamp, device attestation status, blockchain transaction link, and Walrus storage confirmation. This tier shows verified/not-verified status and basic metadata. It does not include exportable documentation, API access, batch processing, or compliance-formatted deliverables.

This tier is the foundation of indelible.Blob's credibility as truth infrastructure. It must remain free to be valuable to society.

**Tier 2: Professional Verification Toolkit — Paid (Per-Use or Subscription)**

Target users are individual professionals who need more than a yes/no answer — they need *documentation* integrated into their workflows. The deliverables vary by industry segment:

| Industry Segment | User | What They Need | Deliverable |
|---|---|---|---|
| Insurance & Adjusting | Field adjusters, claims processors | Tamper-proof documentation of property damage with GPS, timestamp, device attestation for claims files | **Verification Bundle:** Capture + full metadata + chain-of-custody timeline + cryptographic proof package, formatted for claims submission |
| Journalism & Media | Photojournalists, newsroom editors | Proof of authenticity before publication, defense against deepfake accusations | **Provenance Certificate:** Embeddable verification widget or C2PA-compatible metadata sidecar that travels with the media file |
| Legal & Forensics | Attorneys, expert witnesses, law enforcement | Court-admissible evidence documentation with unbroken chain of custody | **Evidence Package:** Full forensic metadata, hash verification, device attestation report, blockchain anchoring proof, aligned with digital evidence standards |
| Real Estate & Construction | Inspectors, appraisers, project managers | Time-stamped, location-verified progress documentation | **Inspection Report Package:** Chronological capture series with GPS overlay, timestamp verification, and attestation status per image |
| Supply Chain & Logistics | Quality inspectors, customs agents | Verified visual documentation of goods condition at specific transit points | **Condition Verification Report:** Capture with location, timestamp, and attestation proof tied to shipment or lot identifiers |
| Art & Collectibles | Artists, galleries, auction houses | Provenance documentation for original works | **Authenticity Certificate:** Capture of physical work with full attestation, linked to creator identity, timestamped and immutable |

**Tier 3: Enterprise API — Paid (Volume-Based)**

Target users are organizations that need verification piped directly into existing systems without human interaction with a portal. The API provides:

1. **Verification endpoint** — Submit a capture hash, receive full verification status, metadata, and attestation chain. Integrates into claims management, content management, and evidence management platforms.
2. **Batch verification** — Submit hundreds of capture hashes, receive a structured report. Essential for insurance companies processing thousands of claims monthly.
3. **Webhook notifications** — Real-time alerts when new verified captures are tagged with an organization's project identifier. Enables monitoring for construction projects, ongoing investigations, etc.
4. **Embeddable verification widget** — JavaScript snippet for enterprises to display verification status on their own sites. News organizations would use this.
5. **Custom metadata schemas** — Enterprises define additional required metadata fields (claim number, policy ID, case reference) stored alongside standard indelible.Blob metadata.

Proposed volume-based pricing:

| Tier | Monthly Verifications | Standard Price | SKR Price (Discounted) |
|---|---|---|---|
| Starter | Up to 100 | $49/mo | ~15-20% discount equivalent |
| Professional | Up to 1,000 | $199/mo | ~15-20% discount equivalent |
| Enterprise | Up to 10,000 | $799/mo | ~15-20% discount equivalent |
| Custom | 10,000+ | Contact | Negotiated |

---

## 5. Verification Deliverable Formats

The C.I.C. has identified that a static PDF is insufficient — it severs the connection to the living proof chain and can itself be tampered with, undermining the core value proposition. The proposed alternatives:

| Format | Description | Best For |
|---|---|---|
| **Signed Data Package** | JSON or CBOR bundle containing all verification data, digitally signed by indelible.Blob's protocol key. Machine-readable, tamper-evident, independently re-verifiable at any time. | Enterprise API consumers, legal/forensic use cases |
| **Verification Link with Cryptographic Anchor** | URL with capture hash embedded. Resolves to live verification page. Hash allows independent verification against blockchain even if indelible.Blob website goes down. | Journalism, general professional use |
| **C2PA Sidecar File** | Metadata sidecar following the Coalition for Content Provenance and Authenticity standard. Embeds directly into JPEG/PNG metadata. Interoperable with Adobe, Microsoft, BBC content authenticity tools. | Media industry, newsrooms, publishing |
| **QR Code + Hash on Physical Print** | QR code linking to on-chain verification plus printed hash for independent verification. Physical document becomes a pointer to immutable digital proof. | Legal proceedings, insurance claims requiring physical documentation |

---

## 6. Revenue Flow and Sustainability Model

The following diagram describes how revenue flows through the system:

```
CREATORS ──(capture for free or low SKR cost)──→ VERIFIED CONTENT ON-CHAIN
                                                          │
                                                          ▼
                                              PUBLIC VERIFICATION (Free)
                                                          │
                                                          ▼
                                              CONSUMPTION SIDE (Revenue)
                                              ┌───────────────────────┐
                                              │ Tier 2: Pro Toolkit   │
                                              │ Tier 3: Enterprise API│
                                              │                       │
                                              │ Paid in: SKR (disc.)  │
                                              │ SOL | SUI | BTC | USD │
                                              └───────────┬───────────┘
                                                          │
                                                    Revenue Split
                                              (ratios governed by SKR
                                               holders via Option D)
                                                          │
                                          ┌───────────────┼───────────────┐
                                          ▼               ▼               ▼
                                      Treasury       Creator Pool    Community Pool
                                     (operations)    (Option C —     (growth, grants,
                                                     rewards to       ecosystem dev)
                                                     creators whose
                                                     captures were
                                                     consumed)
```

**Why this is sustainable for an unfunded startup:** Creator rewards (Option C) are a percentage of actual consumption revenue — not a pre-funded pool. If consumption is zero, rewards owed are zero. As consumption grows, rewards grow proportionally. The organization never carries unfunded liabilities. Governance (Option D) distributes the responsibility for economic tuning to the community rather than concentrating it on the founder.

---

## 7. Questions Requiring Business Strategy Lead Analysis

The following questions are unresolved and require your strategic input:

**Question 1: Fee Split Ratios — What's Defensible?**

The three-way split (Treasury / Creator Pool / Community Pool) needs starting percentages. If the first 6 months generate $5,000/month in verification revenue, what split keeps the organization solvent while making creator rewards meaningful enough to incentivize participation? There is a minimum viable treasury percentage below which the organization cannot function, and a minimum viable creator reward below which the incentive is meaningless. Where do those thresholds sit?

**Question 2: Pricing Sensitivity by Segment**

The industry segments listed have wildly different willingness-to-pay and purchasing processes. An insurance company processing 10,000 claims per month has a very different price sensitivity than a freelance photojournalist. Which 1-2 segments represent the highest revenue potential with the shortest sales cycle for an unfunded solo startup? We need to know where the first dollar comes from, not just where the biggest market is.

**Question 3: The SKR Discount — How Deep?**

The proposed 15-20% discount for SKR payments needs validation. The right discount depends on how much strategic value the Solana Mobile ecosystem alignment provides versus how much margin can be sacrificed. If the relationship capital and dApp Store featuring are worth more than the discount costs, go deeper. If margins are too thin, go shallower. This should be framed as a customer acquisition cost calculation, not just a pricing decision.

**Question 4: Fiat Premium — Will It Alienate Enterprise Customers?**

Many enterprise procurement departments can only pay in fiat — they literally cannot issue purchase orders in SKR. Should fiat carry a surcharge to nudge enterprises toward crypto rails, or should fiat be priced at standard with the SKR discount serving as the sole incentive? The question is whether a fiat premium is a revenue enhancer or a deal-killer for the enterprise segment.

**Question 5: C2PA Compatibility — Strategic or Premature?**

C2PA is the emerging industry standard for content provenance, backed by Adobe, Microsoft, BBC, and others. Integrating with C2PA positions indelible.Blob within a broader ecosystem and enables interoperability with major platforms. However, C2PA does not require blockchain — it could be seen as a competing approach to the same problem. Does C2PA alignment strengthen the competitive position (interoperability) or dilute it (association with a non-blockchain standard)?

**Question 6: The Marketplace Question — When, Not If**

The consumption-side model described here is essentially a marketplace where verified content has economic value. But the Anchor marketplace program (Agent 1B) is deferred as post-hackathon. What is the minimum viable marketplace — just the API + verification bundles (no peer-to-peer content licensing), or does the business model require a content marketplace from day one?

---

## 8. Additional Context

The C.I.C. has indicated they have additional ideas for the consumption side that have not yet been shared. This document should be treated as a working draft to be refined once those ideas are integrated.

The public verification portal already exists as a first iteration on the indelible.Blob website. The C.I.C. has explicitly stated this layer must remain free and open-access — this is a values decision grounded in the Constitution, not a pricing decision subject to revision.

---

*This document is part of the MONOLITH hackathon final sprint preparation. All proposals are subject to refinement based on engineering feasibility assessment and C.I.C. direction.*
