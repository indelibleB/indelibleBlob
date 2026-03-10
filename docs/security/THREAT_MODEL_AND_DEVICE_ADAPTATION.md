# Indelible Blob: Threat Model & Device Adaptation 🧬🔬

This document stress-tests our security assumptions and outlines how Indelible Blob scales beyond the Solana Seeker to the global mobile ecosystem.

## 1. Stress Test: 5 "System Shattering" Scenarios

| Scenario | The Threat | The Result | The Indelible Defense |
| :--- | :--- | :--- | :--- |
| **1. The Analog Hole** | A user takes a 4K photo of a high-res deepfake on a monitor. | TEEPIN signs it as "Raw Capture" of a fake. | **Fusion Validation**: We correlate **LiDAR** depth maps and **Motion Sensors**. A re-photographed monitor is a flat 2D plane with localized screen refresh "beats" (Moire patterns) that our forensic engine flags as "Low Integrity." |
| **2. GPS/Signal Injection** | An actor spoofs GPS signals via SDR (Software Defined Radio). | TEEPIN signs the "Fake" location. | **Environmental Consensus**: We cross-reference GPS with **Cellular Triangulation** and **IMU (Inertial Measurement Unit)**. If the GPS says "Speed: 60mph" but the accelerometer says "Static," the attestation is rejected. |
| **3. TEE Data Extraction** | A hardware zero-day leaks the Seeker's private signing key. | Hacker signs fake images as if they were a Seeker. | **On-Chain Revocation**: The Sui contract maintains a **Protocol Registry** of TEE public keys. If a chip range is compromised, its certificate is "Burned" on-chain, rendering all future signatures from that chip invalid instantly. |
| **4. The "Parasite" Screenshot** | A user screenshots a photo to bypass licensing/terms. | Bypasses Kiosk revenue model. | **Authentication vs. DRM**: We don't stop the screenshot; we break its trust. A screenshot carries no **Steganographic Watermark** (LSB embedding of the Sui Digest). Without the "Digital Proof of Origin," the file is legally inadmissible and commercially valueless. |
| **5. Relayer Compromise** | The backend is hacked to swap file hashes before submission. | Verification is corrupted. | **End-to-End Payload Signing**: The Seeker's hardware signs the **entire Move call payload**. The relayer cannot alter the `walrus_blob_id` or `content_hash` without breaking the user's cryptographic signature, making the hack detectable by the Sui nodes themselves. |

---

## 2. Beyond Seeker: Hardware Attestation for All

The Seeker is our "Gold Standard," but the **"Stamper"** protocol is designed for the wider world.

### Apple (iOS) Coordination: "App Attest" 🍎
*   **Hardware**: **Secure Enclave** (A11+ for full features).
*   **Mechanism**: Indelible uses the **DeviceCheck** framework. The app generates a key inside the Enclave, and Apple's servers issue an **Attestation Object** proving the key is hardware-bound and the app is untampered.
*   **Trust Grade**: **Silver**. It ensures the "Source" is a genuine iPhone, though it can't verify raw sensor signals as purely as the Seeker's TEEPIN.

### Standard Android Coordination: "StrongBox" 🤖
*   **Hardware**: **StrongBox Keymaster** (Dedicated HSM like Google Titan M).
*   **Mechanism**: Uses **Hardware Key Attestation**. The app requests a certificate chain from the hardware that is signed by the **Google Hardware Attestation Root**.
*   **Trust Grade**: **Silver/Gold**. If StrongBox is present (Pixel 3+, high-end Galaxy), the security is nearly identical to Seeker. If only TEE is present, it is flagged as Silver.

### Legacy/Low-End Devices
*   **Grade**: **Bronze**. Verified at the software level (Play Integrity / App Attest fallback). Suitable for "verified creation" but not "forensic evidence."

---

## 3. Hardening Mechanism Feasibility Report

| Mechanism | Feasibility | Implementation Path |
| :--- | :--- | :--- |
| **LiDAR/Depth Fusion** | **High (iOS Pro)** | Use `react-native-vision-camera` Frame Processors to grab depth maps. |
| **IMU-GPS Correlation** | **Very High** | Cross-reference `expo-sensors` (Accel) with `expo-location` (GPS) client-side. |
| **On-Chain Revocation** | **Very High** | Sui Move contract maintains a `Table` of compromised Key IDs. |
| **End-to-End Signing** | **Very High** | Standard cryptographic wash: Seeker signs MD5/SHA of the Sui Transaction. |
| **Steganographic Watermark** | **Medium** | Least Significant Bit (LSB) embedding. Requires heavy computational work in Frame Processors. |

---

## 3. Cross-Chain Synergy: Sui & Solana
While we use Sui for the **Asset Layer** (Kiosk), the Solana ecosystem remains our **Identity Root**.

*   **Identity Mapping**: A user's Solana Seeker NFT (The Hardware Identity) is mapped to their Sui Account via **zkLogin**.
*   **The Bridge**: When a licensing payout happens on a **Sui Kiosk**, the contract can verify the Solana address of the beneficiary.
*   **Cross-Chain Verification**: The "Verification Bridge" allows an app on Solana to query the Sui blockchain to prove that the media displayed was captured by that specific Seeker device.

---

## 4. The "Screenshot" Problem: Authentication vs. DRM

> [!WARNING]
> Indelible Blob is a protocol for **AUTHENTICATION**, not **DRM**.

*   **DRM (Digital Rights Management)** tries to stop people from copying data (a losing battle).
*   **Authentication** proves where data came from.

If someone screenshots a verified photo, they have a file. But that file **fails the math**. 
*   The metadata (GPS/TEEPIN signature) is gone.
*   The hash is different.
*   The On-Chain Proof is broken.

**The Commercial Value**: A news organization will not pay for a screenshot. They pay for the **Verified Record** that protects them from legal libel and reputation damage. The screenshot is "noise"; the Indelible Blob is "evidence."
