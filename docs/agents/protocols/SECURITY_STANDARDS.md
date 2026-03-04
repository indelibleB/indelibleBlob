# Security Standards

**Version:** 1.0
**Source:** Derived from `docs/TECHNICAL_ARCHITECTURE.md` (Part 5).

## 1. Cryptography
-   **Media Encryption:** AES-256 (via Seal SDK).
-   **Transit:** TLS 1.3 for all connections.
-   **Signatures:** ECDSA / Ed25519 (blockchain standard).

## 2. Key Management
-   **User Control:** Keys must be generated and stored on the user's device (or TEE).
-   **No Custody:** Backend must NEVER store raw user private keys.
-   **Rotation:** Support key rotation mechanisms.

## 3. Authentication & Authorization
-   **Tokens:** JWT (15 min expiry) + Refresh Tokens (7 days).
-   **RBAC:** Role-Based Access Control for all API endpoints.
-   **Least Privilege:** Grant minimum necessary permissions.

## 4. Vulnerability Management
-   **Continuous Scanning:** Claude Code scans every PR.
-   **Dependencies:** Automated audit (`npm audit`) on build.
-   **Pen Testing:** Quarterly reviews (simulated).

## 5. Deployment Security
-   **Secrets:** Use environment variables (`.env`). NEVER commit `.env`.
-   **Headers:** Secure HTTP headers (HSTS, CSP, X-Frame-Options).
-   **Logs:** Sanitize logs (no PII, no keys).
