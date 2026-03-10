# Guide: Infrastructure Verification & Testing 📡🔬

To ensure a successful launch, we must move from "App Appearance" to "Protocol Performance." This guide details how to verify the decentralized ecosystem on real Testnets.

## 1. The Connectivity Diagnostics Hub
The app includes a built-in diagnostic tool to verify the decentralized pipeline.
*   **How to access**: Camera View -> Sidebar -> **📡 Diagnostics**.
*   **What it checks**:
    *   **Sui (L1)**: RPC reachability and sync status.
    *   **Walrus (Blob)**: Status of both Publisher and Aggregator nodes.
    *   **Solana (Identity)**: RPC connectivity for hardware metadata.
    *   **TEEPIN**: Readiness of the Secure Element for signing.

## 2. Manual "Full Loop" Verification
Perform this test once per build variant to ensure the "Lens to Ledger" path is intact.

1.  **Capture**: Take a photo or video (ensure Sovereign Mode is **ON** for full encryption testing).
2.  **Verify Traces**: Open the log console (via ADB or Metro) and look for:
    *   `🛡️ Requesting TEEPIN Hardware Attestation`
    *   `🔒 Encrypted blob via Seal`
    *   `📦 Transaction Block constructed`
3.  **View Certificate**: In the Library, tap the capture and select **"📜 View Certificate"**.
    *   Verify the Walrus link opens the image in a browser.
    *   Verify the Sui Transaction digest links to a real record on the testnet explorer.

## 3. Environment Troubleshooting
If connections fail in the Diagnostics Hub:
*   **Sui/Solana**: Check `.env` for the correct RPC URLs. Ensure your device has internet access.
*   **Walrus**: Testnet nodes occasionally go down; check the official Walrus status if the Hub shows "Unreachable."
*   **Metro Link**: If the app fails to load the bundle on Seeker, verify `adb reverse tcp:8081 tcp:8081` is active on the host.

---

> [!IMPORTANT]
> A green status in the Diagnostics Hub is the mandatory prerequisite for moving from Testnet to Mainnet.
