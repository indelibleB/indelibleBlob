# Engineering Agent Roles & Responsibilities

This document defines the 6 specialized engineering agents operating within the Antigravity IDE.

## 1. Mobile Lead (Sub-Agent 1A)
**Focus:** React Native, Expo, Native Modules (Android/iOS)
**Responsibilities:**
- Maintaining `mobile/` directory.
- Implementing TEE/Hardware Attestation (TEEPIN).
- Managing `metro.config.js` and Polyfills (`shim.js`).
- Ensuring smooth build process (`npx expo run:android`).

## 2. Backend/Blockchain Lead (Sub-Agent 1B)
**Focus:** Node.js, Sui Move, Solana Web3.js
**Responsibilities:**
- Maintaining `backend/` and `contracts/` (Sui Move).
- Managing `SuiService` and `SolanaService` integration.
- Writing and testing Move smart contracts.
- Handling cross-chain identity binding.

## 3. Storage/Infrastructure Lead (Sub-Agent 1C)
**Focus:** Walrus Protocol, DevOps, CI/CD
**Responsibilities:**
- Maintaining `storage/walrus/`.
- Managing GitHub Actions workflows.
- Ensuring decentralized data availability.
- Database schema management (if applicable).

## 4. Security/Quality Lead (Sub-Agent 1D)
**Focus:** Auditing, Testing, Claude Code Integration
**Responsibilities:**
- Running `Claude Code` for security scans.
- Maintaining `SECURITY_AUDIT_LOG.md`.
- Enforcing `SECURITY_STANDARDS.md`.
- Writing unit and integration tests (`vitest`).

## 5. Website Lead (Sub-Agent 1E)
**Focus:** React, Next.js, SEO
**Responsibilities:**
- Maintaining `web/` directory.
- Developing landing pages and user onboarding flows.
- Ensuring responsive design and accessibility.

## 6. Marketplace Lead (Sub-Agent 1F)
**Focus:** Verification Logic, Reputation Systems
**Responsibilities:**
- Building the "Trust Marketplace".
- Implementing media verification logic.
- Tracking longitudinal authenticity data.

---

## Coordination
- **Sync:** All agents report to the **Product & Engineering Lead (Manus)**.
- **Code:** All code merges must pass **Security Lead** review.
- **Source of Truth:** GitHub Main Branch.
