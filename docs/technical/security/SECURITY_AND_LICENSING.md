# Indelible Blob: Security, Ownership & Licensing 🛡️💼

This document explores the end-to-end trust model of Indelible Blob, addressing how media is owned, licensed, and protected against sophisticated attacks.

## 1. The Anchor of Ownership: The Sui Object Model
In Indelible Blob, every "Capture" is not just a file; it is an **On-Chain Object** on the Sui blockchain.

*   **Initial Ownership**: When the Stamper processes a capture, it creates a `CaptureRecord` object. The creator's Sui/Solana address is set as the initial owner.
*   **Transferability**: Because this is a native Sui object, it can be transferred, sold, or locked into a contract (Kiosk) just like any other digital asset.

## 2. Hybrid Identity: Solana MWA + Sui zkLogin
A common point of confusion is how the two ecosystems interact. They are not competing "logins"; they are layered security features.

### The Identity Layers:
1.  **Hardware Layer (Solana MWA)**: Your Seeker device has a unique Solana-based hardware identity. We use **MWA (Mobile Wallet Adapter)** to request a signature from the Secure Element to prove that *this specific piece of hardware* saw the pixels. This signature is the **"Stamper's Seal."**
2.  **Network Layer (Sui zkLogin)**: The Sui blockchain handles the storage and licensing (Kiosks). We use **zkLogin** to make it easy for users to own a Sui account without a seed phrase. It is the **"Notary's Seal."**

### Why both?
We use MWA to sign the **Attestation Payload** (The Truth), and zkLogin to sign the **Transaction** (The Notarization). This allows a user to "bind" their Seeker's hardware proof to their permanent Sui assets, even if they aren't "Solana power users."

## 2. Licensing & Revenue Allocation (The V1.5 Roadmap)
Licensing is handled through a **Decentralized Licensing Layer** (Move Smart Contracts).

### How it Works:
1.  **Listing**: The owner places the `CaptureRecord` into a **Sui Kiosk**.
2.  **Policy Definition**: The owner defines a `LicensingPolicy` (e.g., "$100 for Commercial Use," "Attribution Required").
3.  **The License Object**: When a user purchases a license, the contract issues a `UsageLicense` object. This object holds a reference to the `CaptureRecord` but remains separate.
4.  **Revenue Splitting**: Sui Move allows for programmatic revenue allocation. If a news org pays for a license, the funds can be split between the creator, the protocol, and any participating verification nodes automatically.

## 3. The "Truth Bridge": Steganography & Hashing
A critical question arises: *How does an average user know which photo to trust?*

### The SHA-256 Math Problem
Every file on a computer has a hash (a "digital fingerprint"). 
*   **The Original**: When the Seeker captures a photo, we hash it and register that hash (e.g., `H1`) on Sui.
*   **The Screenshot**: If someone screenshots that photo, the resulting file has a *different* hash (`H2`). 
*   **The Verification**: When a user wants to know if an image is real, they drop it into a "Truth Scanner." Our code hashes the file in their hand and asks Sui: "Do you have a record for `H1`?" If they have the screenshot, the answer is "No."

### Steganographic Watermarking (The "Hidden Label")
Hashing is great for detection, but **Steganographic Watermarking (LSB)** is for **recovery**.

*   **How LSB Works**: We slightly nudge the "Least Significant Bit" of the pixel colors in the image. For example, if a pixel's blue value is `10110011`, we might change the last bit to `1` or `0` to encode a piece of data (like the Sui Digest ID).
*   **Invisible to Humans**: These changes are so microscopic that the human eye sees no difference.
*   **The Purpose**: If a verified photo is downloaded, edited, and re-uploaded, the SHA-256 hash will break. However, a "Truth Scanner" can still scan the pixel data and "read" the hidden Sui Digest ID. It tells the user: *"This image was based on Verified Asset #8293, but it has been tampered with since then."*

## 4. The User Verification Experience (UX)
We don't expect users to read hex codes. Trust is built through the **Indelible Verification Portal**.

1.  **The Scanner**: A simple drag-and-drop web/mobile interface.
2.  **Result A (Authentic)**: 🟢 **VERIFIED ORIGINAL**. Captured by Seeker #123 on [Date]. 100% Unaltered.
3.  **Result B (Modified)**: 🟡 **VERIFIED ORIGIN / MODIFIED**. Based on a real capture from [Date], but the pixels have been changed.
4.  **Result C (Fake)**: 🔴 **NO RECORD FOUND**. This image was not captured via the Indelible Blob ecosystem.

---

## 5. Provenance vs. Forensics: The Chain of Reality
A common question in digital evidence is: *"If the dApp creates instantaneous, immutable proof, why do we need 'Forensics' and 'Confidence Scores'?"*

The answer lies in the distinction between **Digital Integrity** and **Physical Truth**.

### 🛡️ Provenance (Digital Integrity)
Provenance is the **Chain of Custody**. It proves that the data was born inside a secure hardware cryptoprocessor (TEEPIN or Secure Enclave). 
*   **What it proves**: The file is an "Original." It hasn't been photoshopped or tampered with since the shutter closed.
*   **STRICT MODE**: The app now enforces a **Hardware-Only** policy. If the TEEPIN attestation fails, the capture is aborted. There is no software fallback.
*   **The Premises**: The dApp ecosystem provides this *instantaneously* and *immutably*.

### 🔍 Forensics (Physical Reality)
Forensics is the **Chain of Truth**. It addresses the **Analog Hole**—the gap between the world and the camera lens.
*   **The Threat**: A user could display a high-resolution, AI-generated fake on a professional monitor and take a photo of it with a real Seeker. 
*   **The Result**: The **Provenance** would be **GOLD/VALID** (it is a real, original photo from a real Seeker). However, the *content* is a lie.
*   **The Solution**: We use **Forensic Hardening** (IMU/GPS correlation, LiDAR depth mapping) to prove that the light hitting the sensor came from a 3D physical scene in a specific location, not a 2D screen.

> [!IMPORTANT]
> Provenance proves the **File** is real. Forensics proves the **Scene** was real. Both are required for absolute trust.

---

## 6. Closing the Loopholes: Anti-Spoofing & Security

### The "False Prophet" Attack (Fake Media presented as Valid)
**The Scenario**: An actor shows a Photoshoped image but claims it is "Indelible Verified."

**The Defense (The Verification Bridge)**:
*   **Hash Matching**: The "Indelible Label" on a piece of media is tied to its **SHA-256 Content Hash**. To verify, a consumer (or automated bot) hashes the presented image. 
*   **Blockchain Query**: That hash is looked up on Sui. If the image was altered by even one pixel, the hash will NOT match any on-chain `CaptureRecord`.
*   **TEEPIN Enforcement**: The signature on the `CaptureRecord` is generated by the **hardware enclave (TEEPIN)**. A hacker can sign a fake image with a generic wallet, but the Sui contract will only grant the "Hardware-Backed" status if the signature comes from a recognized TEEPIN public key range.

### The "Deepfake App" Attack (Fake Verification App)
**The Scenario**: Someone creates a fake verification tool that says "TRUSTED" for everything.

**The Defense**:
*   **Open Proofs**: The verification protocol is open-source. High-stakes consumers (Journalists, Courts) will run their own verification nodes or use third-party "Trust Aggregators" that directly query the Sui RPC, bypassing any potentially compromised UI.
*   **The "Digital Glass" Overlay**: Official Indelible dApps use a specific "Holographic" UI pattern that is difficult to replicate in simple screenshots.

## 4. Risks & Mitigations (Threat Model)

| Threat | Risk | Mitigation |
| :--- | :--- | :--- |
| **TEEPIN Exploitation** | High | Hardware-level secure element (Seeker) is physically isolated from the OS. |
| **Meta-Data Spoofing** | Medium | Forensic data (GPS/Sensors) is included in the signed hash. Altering GPS breaks the signature. |
| **Walrus Downtime** | Low | Data is erasure-coded across N global nodes. No central point of failure. |
| **Private Key Theft** | High | Keys reside in the Seeker's Seed Vault; never exposed to the main Indelible app. |

---

> [!IMPORTANT]
> Trust in Indelible Blob is not based on "trusting the developer." It is based on **Independent Verification**: the ability for any third party to reproduce the math (hashing) and check it against the ledger (Sui) specifically in a user friendly manner that also builds the users own understanding and confidence. 
