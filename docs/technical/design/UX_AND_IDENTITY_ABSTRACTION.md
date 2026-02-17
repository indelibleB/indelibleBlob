# Indelible Blob: Unified Identity & Session Abstraction

> **Design Principle**: The user takes a verified photo. They never "manage two chains."

---

## 1. Session Lifecycle

```
User taps "Start Session"
  → Step 1: Authenticate via Sui (one-time per install)
      ├─ zkLogin (Google, Apple, Facebook, Twitch) → web2 users
      └─ Wallet Connect (Slush, etc.)              → web3 users
  → Step 2: Hardware Attestation (automatic per session)
      ├─ Seeker detected: MWA Seed Vault prompt → link Solana address → GOLD
      ├─ Android StrongBox: KeyStore attestation  → SILVER
      └─ iOS Secure Enclave: AppAttest            → SILVER
  → Step 3: Session starts
  → Toast: "🟢 Gold — Hardware Secured" / "🔵 Silver — Device Attested"
```

**No software-only fallback.** Devices without hardware attestation can capture for personal use but produces carry no provenance grade. This is a deliberate integrity decision — software verification is trivially spoofable and would undermine the trust model.

---

## 2. Abstraction Layers

### Layer A — Sui Authentication (User-Facing)

The only user-facing identity step. Occurs once per install; session persists until logout.

**For web2 users (zkLogin)**:
- User taps "Sign in with Google" (or Apple/Facebook/Twitch)
- Sui's Enoki SDK handles the OAuth flow under the hood
- Produces a Sui address derived from the user's social identity
- User never sees a seed phrase or chain name

**For web3 users (Wallet Connect)**:
- User taps "Connect Wallet"
- Standard Sui wallet connect flow (Slush, Sui Wallet, etc.)
- User approves in their wallet app

**Result**: A stable Sui address for all the user's assets, licensing, and marketplace activity. This is their public identity.

### Layer B — Hardware Attestation (Automatic)

Happens silently after Sui auth. **Not a user choice** — determined by device detection.

| Device | Detection | Attestation Method | Grade |
|---|---|---|---|
| Solana Seeker | MWA available + model match | Seed Vault signature via `loginSolana()` | **GOLD** |
| Android (StrongBox) | `isInsideSecureHardware()` | Hardware Key Attestation certificate chain | **SILVER** |
| iOS (A11+) | `DCAppAttestService.isSupported` | AppAttest + DeviceCheck attestation object | **SILVER** |
| Other devices | None of the above | **Session blocked** — cannot start capture | **DENIED** |

> [!IMPORTANT]
> **Hardware attestation is a hard gate.** If a device cannot provide hardware-level attestation, the user cannot start a capture session. There is no software fallback, no "unverified" tier. Every capture in the ecosystem carries provenance or it doesn't exist. Allowing unverified content would directly undermine the trust model.

The Seeker path requires a one-time MWA Seed Vault approval (hardware security requirement). The Solana address is then tethered to the authenticated Sui identity for the session.

### Layer C — Gas Abstraction
- Sui Gas Station sponsors all capture transactions
- User only touches crypto for marketplace actions (buy license, withdraw earnings)

---

## 3. Implementation Status

### Sui Authentication — Needs Real Implementation

| Component | Status | Notes |
|---|---|---|
| zkLogin via Enoki SDK | ❌ Not built | `@mysten/enoki` handles OAuth → Sui address |
| Wallet Connect | ❌ Not built | `@mysten/wallet-standard` for Slush/etc. |
| Current `loginSui()` | ⚠️ Placeholder | Creates disposable Ed25519 keypair — not a real user identity |

### Seeker Path (GOLD) — Launch Priority

| Component | Status | Notes |
|---|---|---|
| MWA authorization | ✅ Complete | `identity.ts` → `loginSolana()` |
| MWA availability check | ⚠️ Stubbed | `solana.ts` → needs real detection |
| Unified orchestrator | ❌ Not built | `initializeIdentity()` |

### Platform TEE (SILVER) — Follow-up

| Component | Status | Notes |
|---|---|---|
| Android KeyStore attestation | ❌ Not built | React Native native module needed |
| iOS AppAttest | ❌ Not built | React Native native module needed |
| TrustManager detection | ⚠️ Heuristic only | Needs real hardware checks |

---

## 4. Platform TEE — Design Spec

### Android: Hardware Key Attestation

**Mechanism**: Generate a key inside StrongBox/TEE, request attestation certificate chain signed by Google's Hardware Attestation Root.

```typescript
interface AndroidAttestation {
  generateAttestationKey(challenge: Uint8Array): Promise<{
    publicKey: string;           // Base64 DER-encoded public key
    certificateChain: string[];  // X.509 cert chain → Google Root
    isStrongBox: boolean;        // true = dedicated HSM
  }>;
  signWithAttestationKey(data: Uint8Array): Promise<string>;
}
```

**Implementation**: Native module using `android.security.keystore` with `setAttestationChallenge()` and `setIsStrongBoxBacked(true)` with TEE fallback.

### iOS: AppAttest + DeviceCheck

**Mechanism**: Generate a key inside the Secure Enclave, Apple servers issue attestation object proving hardware binding and app integrity.

```typescript
interface iOSAttestation {
  isSupported(): Promise<boolean>;
  generateKey(): Promise<string>;
  attestKey(keyId: string, clientDataHash: Uint8Array): Promise<string>;
  generateAssertion(keyId: string, clientDataHash: Uint8Array): Promise<string>;
}
```

**Implementation**: Native module using `DCAppAttestService.shared`.

---

## 5. On-Chain Identity Mapping

The Sui object metadata binds all identity layers:

```
SuiObject {
  owner: "0x..."               // Sui address from Layer A (zkLogin or wallet)
  hardware_attestation: {
    type: "TEEPIN" | "StrongBox" | "SecureEnclave"
    public_key: "..."          // Hardware-bound public key
    signature: "..."           // Hardware signature over content hash
    certificate_chain: [...]   // For third-party verification
  }
  provenance_grade: "GOLD" | "SILVER"
  solana_address?: "..."       // Only if Seeker (MWA-linked)
}
```
