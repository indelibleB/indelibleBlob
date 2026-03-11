'''# indelible.Blob Decision Log
> **Canonical Record of All Significant Architectural and Product Decisions**

**Version:** 2.0 (Restructured)
**Maintained by:** Agent 1 — Product & Engineering Lead

---

This document serves as the immutable log of all major decisions made for the indelible.Blob project. It provides context, rationale, and consequences for each choice, ensuring all agents (current and future) understand *why* the system is built the way it is.

## Decision Template

```markdown
### ADR-XXX: [Title of Decision]

**Date:** YYYY-MM-DD
**Status:** [Proposed / Accepted / Deprecated / Superseded]
**Decided By:** [Agent(s) or Founder]

**Context:**
(What was the problem, technical constraint, or business requirement? What was the core tension or trade-off being considered?)

**Decision:**
(What was the chosen path? Be specific. Describe the mechanism or outcome clearly.)

**Consequences & Rationale:**
(What are the pros and cons of this decision? How does it align with the Constitution? What were the rejected alternatives and why?)
```

---

## Log of Decisions

### ADR-001: Ephemeral Session Keys for Zero-Popup Capture UX

**Date:** 2026-02-26
**Status:** Accepted
**Decided By:** Founder, Agent 1 (P&E Lead), Agent 1D (Security Lead), Agent 1A (Mobile Lead)

**Context:**
The capture pipeline requires a Sui blockchain transaction for every photo or video (`record_capture()`). Without optimization, each capture would trigger a wallet approval popup, destroying the rapid-capture UX that field professionals (insurance adjusters, journalists) require. The core tension was **UX speed vs. security rigor.**

**Decision:**
Implement ephemeral Ed25519 **Session Keys** with strict, non-negotiable security constraints.

**Mechanism:**
1.  **Session Start:** User authenticates via their primary wallet (MWA, zkLogin, etc.). This is the **only** wallet interaction required per session.
2.  **Key Generation:** An ephemeral Ed25519 keypair is generated and stored in the device’s hardware-backed secure storage (`expo-secure-store`).
3.  **Gas Funding:** The user makes a one-time transfer of a small amount of SUI (e.g., 0.1 SUI) to the session key’s derived address to fund its transactions.
4.  **Local Signing:** For the duration of the session, the ephemeral key signs all `record_capture()` transactions locally and silently. **Zero popups.**
5.  **Session End:** The key is explicitly deleted from secure storage.

**Consequences & Rationale:**

| Security Constraint | Enforcement Mechanism |
|---|---|
| **1-Hour Hard Timeout** | `expiresIn: 3600` on secure storage. No extensions. |
| **Limited Scope** | The session key can *only* call the `record_capture()` function. It has no access to the user’s primary funds. |
| **Hardware-Backed Storage** | Keys are stored in the Secure Enclave (iOS) or TEE (Android), not in general app storage. |
| **Limited Blast Radius** | The key only controls its own derived address, limiting any potential loss to the small gas deposit. |

*   **Constitutional Alignment:** This decision perfectly aligns with our values. It preserves **Self-Custody** (no backend signing proxy), enables a professional-grade UX required for our **Mission**, and implements **Ethical Technology** by strictly limiting the key’s power and lifespan.
*   **Rejected Alternatives:**
    *   *Backend Signing Proxy:* Rejected. Violates self-custody.
    *   *Pre-signed Transaction Batches:* Rejected. Not feasible as transaction parameters (GPS, hash) are not known in advance.

---

### ADR-002: Cross-Chain Architecture for Identity and Provenance

**Date:** 2026-02-25
**Status:** Accepted
**Decided By:** Founder, Agent 1 (P&E Lead)

**Context:**
The project requires both a strong identity/commerce layer and a high-performance, low-cost data/provenance layer. A single chain presented trade-offs.

**Decision:**
Adopt a hybrid, cross-chain architecture.

-   **Solana:** The **Identity & Commerce Layer.** Home of the user’s primary identity (via Solana Mobile dApp Store and MWA) and the SKR token economy.
-   **Sui:** The **Provenance & Data Layer.** Home of the immutable capture records (`record_capture()` transactions), leveraging the Move language for safety and low transaction costs.

**Consequences & Rationale:**
This architecture plays to the strengths of both ecosystems. Solana provides a rich, mobile-native identity and token ecosystem. Sui provides a purpose-built, high-throughput ledger for data notarization. This separation of concerns allows us to build the best possible product without being limited by the constraints of a single chain.

---

### ADR-003: Creator-Directed Allocation Revenue Model

**Date:** 2026-03-02
**Status:** Accepted
**Decided By:** Founder

**Context:**
The initial revenue model proposed a fixed 70/20/10 split for platform revenue (Treasury/Creator Rewards/Community Fund). This was simple but lacked user agency and did not align with our value of **Self-Custody & User Control**.

**Decision:**
Replace the fixed split with **Creator-Directed Allocation**.

**Mechanism:**
1.  A **33.33% Treasury floor** is non-negotiable. This ensures organizational viability.
2.  Each creator has full discretion to allocate the remaining **66.67%** of their generated revenue between the Creator Rewards pool and the Community Fund, using a simple three-slider UI.

**Consequences & Rationale:**
*   **Constitutional Alignment:** Directly embodies our values of user control and transparency.
*   **Social Entrepreneurship Research Instrument:** Transforms revenue distribution into a live experiment in decentralized economic governance. The aggregated, anonymized allocation data becomes a valuable public good, fulfilling our mission to contribute to the ecosystem beyond our product.
*   **Product Differentiation:** This is a unique and compelling feature that no competitor offers. It is a core part of our story for the hackathon and beyond.
'''
