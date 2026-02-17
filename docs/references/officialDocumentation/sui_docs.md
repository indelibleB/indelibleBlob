# Sui Ecosystem Documentation Reference

This document serves as a local index of official Sui documentation, summarized for the Indelible Blob development team.

**Source**: [docs.sui.io](https://docs.sui.io/)

---

## 1. Core Concepts: Move on Sui

Sui uses a variant of the Move programming language that is optimized for high throughput and low latency.

### Key Differences from Standard Move
*   **Object-Centric Storage**: Unlike other chains that use global storage (account-based), Sui stores data as **Objects**.
    *   *Standard Move*: `move_to`, `move_from` (Global resource tables).
    *   *Sui Move*: Objects have unique IDs (`UID`) and are owned by accounts, shared, or immutable.
*   **Addresses as Object IDs**: The 32-byte address type is used for both Account Addresses and Object IDs.
*   **Entry Functions**: Functions marked with `entry` can be called directly by transactions (Programmable Transaction Blocks). They are the "API" of your smart contract.

### Resources
- [Move Concepts](https://docs.sui.io/concepts/sui-move-concepts)
- [Sui Smart Contracts Platform Whitepaper](https://docs.sui.io/assets/files/sui-6251a5c5b9d2fab6b1df0e24ba7c6322.pdf)

---

## 2. Developer Guides

### Getting Started
To build on Sui, you need the binaries and the TS SDK.
*   [Install Sui](https://docs.sui.io/guides/developer/getting-started/sui-install)
*   [Hello World](https://docs.sui.io/guides/developer/getting-started/hello-world)

### Tools & SDKs
*   **Sui dApp Kit**: React components and hooks for wallet connection and transaction signing.
    *   [Documentation](https://sdk.mystenlabs.com/dapp-kit?ref=blog.sui.io)
*   **TypeScript SDK**: The core library for interacting with the Sui network.
*   **Rust SDK**: For backend services and heavy lifting.
    *   [Repository](https://github.com/MystenLabs/sui/tree/main/crates/sui-sdk)

---

## 3. Node Operators & Infrastructure

For running our own nodes (e.g., for the "Sovereign Cloud" extension).
*   [Validator Validator](https://docs.sui.io/guides/operator/validator/validator-config)
*   [Run a Full Node](https://docs.sui.io/guides/operator/sui-full-node)

---

## 4. Key Reference Links

| Resource | Description | URL |
|---|---|---|
| **Sui API** | JSON-RPC reference | [docs.sui.io/references/sui-api](https://docs.sui.io/references/sui-api) |
| **Sui Framework** | Standard library docs | [GitHub / sui-framework](https://github.com/MystenLabs/sui/tree/main/crates/sui-framework/docs) |
| **Tokenomics** | SUI token utility | [docs.sui.io/concepts/tokenomics](https://docs.sui.io/concepts/tokenomics) |
| **Cryptography** | Signing & hashing | [docs.sui.io/concepts/cryptography](https://docs.sui.io/concepts/cryptography) |
