# Claude Code Instructions suited for indelible.Blob

## Project Overview
**indelible.Blob** is a decentralized truth infrastructure using Sui (notarization), Solana (identity), and Walrus (storage) to prove media authenticity at capture.

## Agent Roles & Domains
Claude Code operates as a **Security & Quality Advisor** (Sub-Agent 1D) and must respect these domains:

- **Mobile Lead (1A):** `mobile/`, React Native, TEEPIN
- **Backend/Blockchain Lead (1B):** `backend/` (if enabled), `contracts/`, Sui/Solana SDKs
- **Storage Lead (1C):** Walrus integration, Infrastructure
- **Security Lead (1D):** `CLAUDE.md`, Security Audits, Encryption
- **Website Lead (1E):** `website/`, Next.js
- **Marketplace Lead (1F):** Marketplace logic

## File Boundaries
- **Do not modify** `docs/CONSTITUTION.md` or `docs/OPERATIONS_MANUAL.md` without explicit user request.
- **Do not modify** `docs/decisions/DECISIONS.md` unless recording a decision.
- **Strictly Observe** `docs/protocols/SECURITY_STANDARDS.md`.

## Security Checklist
Before any commit, verify:
1.  **No Secrets:** Check for API keys, mnemonics, or private keys.
2.  **Encryption:** Ensure Seal encryption is used for sensitive user data.
3.  **Input Validation:** Sanitize all inputs in API and Smart Contracts.
4.  **Dependencies:** Check for known vulnerabilities in `package.json`.

## Coding Standards
- **Language:** TypeScript (preferred), Rust (for Sui/Solana contracts).
- **Style:** Prettier + ESLint defaults.
- **Commits:** Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`).

## Commands
- **Test:** `npm test`
- **Build Mobile:** `cd mobile && npm run android`
- **Build Web:** `cd website && npm run build`
- **Lint:** `npm run lint`
