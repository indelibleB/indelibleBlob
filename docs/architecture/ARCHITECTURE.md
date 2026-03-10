
# indelible.Blob Technical Architecture
> **The Sovereign Stack for Decentralized Truth Infrastructure**

**Version:** 2.0 (Restructured)
**Adopted:** March 4, 2026

---

## Part 1: The Sovereign Stack

Indelible Blob is built on a synergistic integration of hardware, cryptography, and decentralized protocols. This is the **Sovereign Stack**.

| Layer | Technology | Function |
|---|---|---|
| **Hardware Root of Trust** | Solana Seeker TEEPIN | Cryptographically sign media at the moment of capture, inside a secure enclave. |
| **Immutable Notary** | Sui Blockchain | Record the cryptographic proof of each capture in an immutable, public ledger. |
| **Decentralized Storage** | Walrus Protocol | Store the captured media in a censorship-resistant, geographically distributed network. |
| **Privacy-First Verification** | Seal Encryption | Provide user-controlled, identity-based encryption for sensitive media. |

### Technology Rationale

-   **Why Sui for Notarization?** Fast finality (1-2 seconds), low transaction costs, and the safety of the Move language.
-   **Why Solana for Identity?** Excellent identity infrastructure (Solana Mobile dApp store, MWA), large developer community, and high-frequency transaction support for the SKR economy.
-   **Why Walrus for Storage?** Designed for immutable, censorship-resistant storage with cryptographic proofs of persistence.
-   **Why Seal for Encryption?** User-controlled keys, granular access control, and a privacy-first design that aligns with our values.

---

## Part 2: Core Architecture & Data Flow

### Capture & Notarization Flow

1.  **Session Start:** User authenticates via primary wallet (MWA for Solana, zkLogin/Slush for Sui) and authorizes an ephemeral **Session Key**.
2.  **Capture:** The user captures a photo or video. The app collects media data, GPS, and device metadata.
3.  **Hardware Attestation (GOLD Grade):** If on a Seeker device, the TEEPIN module signs the media hash, creating a hardware-backed proof of origin.
4.  **Local Signing:** The ephemeral Session Key signs the Sui transaction payload containing the media hash and metadata. **This happens locally on the device with zero wallet popups.**
5.  **Notarization:** The signed transaction is submitted to the Sui network and recorded in the `indelible_blob::capture::record_capture` Move contract.
6.  **Storage:** The media file (the "Blob") is uploaded to the Walrus network.
7.  **Linkage:** The Walrus storage URI is linked to the on-chain Sui record.

### Verification Flow

1.  **Request:** A verifier requests proof for a given Blob.
2.  **Fetch:** The system retrieves the on-chain record from Sui and the media file from Walrus.
3.  **Cross-Reference:** It verifies that the hash of the Walrus media matches the hash recorded on Sui.
4.  **Attestation Check:** It checks for the presence of a valid TEEPIN signature to determine the Trust Grade (GOLD vs. SILVER).
5.  **Response:** A signed data package is returned, confirming or denying the Blob's authenticity.

---

## Part 3: Key Architectural Decisions

This section summarizes the most critical, locked-in architectural decisions. For the full log, see `DECISIONS.md`.

### Cross-Chain Identity & Commerce

-   **Solana** is the **identity and commerce layer.** It handles user identity via the Solana Mobile dApp store and MWA, and it is the home of the SKR token economy (balance checks, transfers).
-   **Sui** is the **provenance and data layer.** It handles the immutable recording of capture events via zkLogin and the Move contract.

### Session Keys (ADR-001)

-   **Problem:** Eliminating wallet popups for every capture to enable a fluid, professional user experience.
-   **Decision:** Use ephemeral Ed25519 **Session Keys** stored in the device's secure enclave (`expo-secure-store`).
-   **Mechanism:** The user's primary wallet authorizes the session key once at the start of a session. The session key then signs all subsequent capture transactions locally and silently.
-   **Security Constraints:** 1-hour hard timeout, hardware-backed storage, limited scope (can only call `record_capture`), and explicit cleanup on session end.
-   **Constitutional Alignment:** Preserves self-custody (no backend signing) while enabling the required UX.

### Trust Grading

-   **GOLD Grade:** Capture performed on a Solana Seeker device with a valid TEEPIN hardware attestation signature.
-   **SILVER Grade:** Capture performed on a device with a secure enclave but without TEEPIN attestation (e.g., standard iOS/Android).

---

## Part 4: Security & Operations

*(This section is a summary. For full details, see `docs/security/` and `docs/agents/protocols/`)*

### Security

-   **Continuous Auditing:** All code is continuously scanned by Claude Code for vulnerabilities.
-   **Threat Model:** The primary threats are media forgery (countered by hardware attestation) and key compromise (countered by Session Keys with limited blast radius).
-   **Audit Log:** All security events and findings are tracked in `docs/security/SECURITY_AUDIT_LOG.md`.

### Monitoring & Alerting

-   **Logging:** Structured JSON logs with levels (ERROR, WARN, INFO, DEBUG). No sensitive data is ever logged.
-   **Alerting:** PagerDuty/Opsgenie alerts for critical failures (build/deployment failure, high error rates, blockchain connection loss, security vulnerabilities).

### Infrastructure

-   **Deployment:** Container-based (Docker) API server, managed PostgreSQL database, and Redis for caching.
-   **Disaster Recovery:** Automated daily database backups, version-controlled code and configuration, and a sub-4-hour RTO for all critical systems.

---

## Part 5: Future Considerations

-   **Layer 2 Scaling:** Investigating rollups or state channels for cheaper/faster notarization as volume grows.
-   **Cross-Chain Interoperability:** Designing for future support of other blockchains.
-   **Advanced Cryptography:** Exploring zero-knowledge proofs for enhanced privacy and homomorphic encryption for private computation on verified data.
-   **Decentralized Identity (DIDs):** Planning for future integration with emerging DID standards.

---

> This architecture is designed to be a resilient, scalable, and constitutionally-aligned foundation for the Digital Truth Machine. It is built not just on better technology, but on better values.
