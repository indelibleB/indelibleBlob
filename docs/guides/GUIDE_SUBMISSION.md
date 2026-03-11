# Guide: DApp Store Submission & Branding 🏁🤳

This guide outlines the final requirements for submitting **Indelible Blob** to the Solana dApp Store.

## 1. Compliance Checklist
- [x] **Package Identification**: `com.indelible.blob` (Updated in `app.json`).
- [x] **Cleartext Traffic**: Allowed in `AndroidManifest.xml` for local debugging/testnet.
- [x] **Versioning**: Ensure `versionCode` and `versionName` are incremented for each submission.
- [x] **Permissions**: Only requesting essential permissions (Camera, Location, Audio, Sensors).

## 2. Branding Assets
The following assets are locked and located in `mobile/assets/`:
*   **App Icon**: High-contrast holographic icon (Deep Space Purple).
*   **Adaptive Background**: Optimized for Android layered icons.
*   **Splash Screen**: Branded landing experience for Solana Seeker.

## 3. Submission Workflow
1.  **Generate Release Build**:
    ```bash
    npx expo run:android --variant release
    ```
2.  **Generate Store Assets**: Capture screenshots on the Seeker physical device to showing the **Diagnostics Hub** and **Sovereign Mode** in action.
3.  **Submission Form**: Use the Solana DApp Store publisher portal. Include the **"Digital Truth Machine"** narrative in the description.

---

## 🎨 Branding locked: Deep Space Purple
The application's identity is anchored in the synergy of Solana Purple and Electric Green, representing the fusion of "Sovereign Privacy" and "Trusted Verification."
