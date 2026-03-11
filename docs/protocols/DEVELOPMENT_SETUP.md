# Development Setup Guide

**Source:** Derived from `docs/TECHNICAL_ARCHITECTURE.md` (Part 10).

## Prerequisites
-   **Node.js:** v18+
-   **Package Manager:** npm or yarn
-   **Database:** PostgreSQL 14+
-   **Cache:** Redis 7+
-   **Container:** Docker Desktop
-   **Sui:** Sui Binaries (use `tools/download-sui-binaries.sh`)

## Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/illuminatedmovement/indelible-blob.git
    cd indelible-blob
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    # For mobile
    cd mobile && npm install
    # For website
    cd website && npm install
    ```

3.  **Environment Variables**
    -   Copy `.env.example` to `.env` (if available, else create one).
    -   Configure DB and Blockchain endpoints.

4.  **Run Local Dev**
    ```bash
    npm run dev
    ```

## Testing
-   **Unit Tests:** `npm test`
-   **Integration:** `npm run test:integration`

## Troubleshooting
-   **Sui Binaries:** Ensure `tools/sui` is in your PATH.
-   **Mobile Build:** Check Android Studio / Xcode setup.
