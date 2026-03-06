# Development Setup Guide

**Version:** 2.0 (Updated March 5, 2026)

## Prerequisites

- **Node.js:** v18+
- **Package Manager:** npm
- **Expo CLI:** `npx expo` (included via npx, no global install required)
- **Android Studio:** For Android builds and emulator (or physical Seeker device)
- **Sui CLI:** Install via `tools/download-sui-binaries.sh` or from [Sui docs](https://docs.sui.io/)
- **Solana CLI:** Install from [Solana docs](https://docs.solanalabs.com/cli/install)
- **ADB:** For Seeker device debugging (`adb reverse tcp:8081 tcp:8081`)
- **Git:** Configured with access to `github.com/illuminatedmovement/indelible-blob`

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Mobile App | React Native + Expo | iOS/Android capture interface |
| Identity (L1) | Solana (MWA + TEEPIN) | Hardware attestation + wallet signing |
| Provenance (L2) | Sui (Move contracts) | On-chain capture recording |
| Storage | Walrus | Decentralized blob storage |
| Encryption | Seal (`@mysten/seal`) | Identity-based encryption (Sovereign Mode) |
| Auth | zkLogin (Enoki + Google OAuth) | Zero-friction Sui address derivation |

## Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/illuminatedmovement/indelible-blob.git
   cd indelible-blob
   ```

2. **Install Dependencies**
   ```bash
   # Mobile app
   cd mobile && npm install

   # Website
   cd ../website && npm install
   ```

3. **Environment Configuration**
   - Copy `.env.example` to `.env` in the `mobile/` directory (if available)
   - Key environment variables:
     - `EXPO_PUBLIC_SUI_NETWORK` — `testnet` (default)
     - `EXPO_PUBLIC_WALRUS_PUBLISHER_URL` — Walrus publisher endpoint
     - `EXPO_PUBLIC_WALRUS_AGGREGATOR_URL` — Walrus aggregator endpoint
     - `EXPO_PUBLIC_ENOKI_API_KEY` — Enoki API key for zkLogin

4. **Run Mobile App (Development)**
   ```bash
   cd mobile
   npx expo start
   ```

5. **Run on Physical Seeker Device**
   ```bash
   # Ensure USB debugging enabled on Seeker
   adb reverse tcp:8081 tcp:8081
   npx expo run:android
   ```

6. **Build Release APK**
   ```bash
   npx expo run:android --variant release
   ```

## Smart Contract Development

```bash
# Build Move contracts
cd contracts/sui
sui move build

# Run Move Prover (formal verification)
sui move prove

# Deploy to testnet
sui client publish --gas-budget 100000000
```

## Troubleshooting

- **Metro bundler not connecting to Seeker:** Run `adb reverse tcp:8081 tcp:8081`
- **Sui CLI not found:** Run `tools/download-sui-binaries.sh` and ensure `tools/sui` is in your PATH
- **Walrus upload failing:** Check testnet node status; testnet nodes occasionally go down
- **TEEPIN not detected:** Requires physical Solana Seeker device with hardware enclave
- **zkLogin failing:** Verify Enoki API key and Google OAuth configuration
