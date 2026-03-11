# Threat Model: indelible.Blob

**Version**: 1.0
**Date**: February 24, 2026
**Author**: Claude Code (Sub-Agent 1D - Security & Quality Advisor)
**Sprint**: Day 1 - Solana Monolith Hackathon Security Hardening

---

## Executive Summary

This threat model analyzes indelible.Blob's attack surface across its multi-blockchain architecture (Sui, Solana, Walrus). We use the **STRIDE framework** to systematically identify threats and vulnerabilities.

**Key Finding**: indelible.Blob's defense-in-depth architecture (hardware attestation + blockchain immutability + sensor forensics) provides strong protection against common attack vectors. Primary risks center on key management, GPS spoofing, and blockchain RPC trust.

---

## System Architecture Overview

### Components

```
┌─────────────────────────────────────────────────────────────┐
│                    MOBILE APPLICATION                        │
│  React Native (iOS/Android) + Expo                          │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Camera     │  │   Sensors    │  │   Location   │     │
│  │  (Vision)    │  │  (IMU/Mag)   │  │   (GPS/RTK)  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Identity Layer (zkLogin + MWA)               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
        ┌───────────────────┼───────────────────┐
        ↓                   ↓                   ↓
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│  Sui Blockchain│   │Solana (TEEPIN)│   │Walrus Storage │
│  (Metadata)    │   │  (Identity)   │   │  (Blobs)      │
└───────────────┘   └───────────────┘   └───────────────┘
        ↓                   ↓                   ↓
┌────────────────────────────────────────────────────────────┐
│              Blockchain Layer Security                      │
│  - Immutable records (Sui Move contracts)                  │
│  - Hardware signatures (Solana TEEPIN)                     │
│  - Decentralized storage (Walrus erasure coding)           │
└────────────────────────────────────────────────────────────┘
```

### Trust Boundaries

1. **User Device** ↔ Mobile App (AsyncStorage, device sensors)
2. **Mobile App** ↔ Blockchain RPCs (network communication)
3. **Mobile App** ↔ Walrus Storage (blob upload/download)
4. **User** ↔ Identity Providers (Google OAuth, MWA wallets)
5. **Smart Contracts** ↔ On-chain data (Move execution)

---

## STRIDE Threat Analysis

### S - Spoofing (Identity/Authentication)

#### Threat S.1: Hardware Attestation Bypass

**Description**: Attacker attempts to fake GOLD-grade provenance without Solana Seeker hardware.

**Attack Vector**:
- Root/jailbreak device to spoof MWA presence
- Emulator with modified system properties
- Replay captured TEEPIN signatures from legitimate device

**Impact**: HIGH
- Attacker could mint "verified" captures without hardware backing
- Undermines trust in GOLD-grade system

**Mitigations**:
- ✅ **Current**: TEEPIN signature verification before Sui recording
- ✅ **Current**: Signature includes timestamp (prevents replay beyond session)
- ⏳ **Needed**: Validate TEEPIN public key matches known Solana Seeker hardware keys
- ⏳ **Needed**: Implement signature nonce to prevent replay attacks

**Residual Risk**: MEDIUM
- Requires sophisticated attack (hardware key extraction)
- TEEPIN signatures are hardware-bound (Secure Enclave)

---

#### Threat S.2: GPS Spoofing via Mock Location Apps

**Description**: Attacker uses mock location apps to fake GPS coordinates.

**Attack Vector**:
- Enable Developer Options on Android
- Install mock location app (Fake GPS, GPS Joystick)
- Inject arbitrary coordinates while capturing

**Impact**: MEDIUM
- Attacker can claim capture occurred at false location
- Undermines location-based authenticity

**Mitigations**:
- ✅ **Current**: SensorForensics.validateMovement() - IMU-GPS correlation
  - Detects if GPS moves but accelerometer shows no motion
  - Calculates forensic confidence score (0-100)
- ✅ **Current**: RTK precision flagging (high-accuracy GPS)
- ⏳ **Needed**: Android mock location detection APIs
- ⏳ **Needed**: iOS location simulation detection

**Residual Risk**: LOW-MEDIUM
- Forensics layer catches most mock location attacks
- Sophisticated attacker could physically move device while injecting GPS

---

#### Threat S.3: zkLogin Account Takeover

**Description**: Attacker compromises user's Google account to access zkLogin wallet.

**Attack Vector**:
- Phishing user's Google credentials
- Session hijacking (stolen OAuth tokens)
- Google account recovery abuse

**Impact**: HIGH
- Attacker gains full access to Sui wallet
- Can create captures attributed to victim

**Mitigations**:
- ✅ **Current**: Ephemeral keypair rotation (zkLogin standard)
- ✅ **Current**: JWT expiry enforced
- ⏳ **Needed**: Device binding (require same device for wallet access)
- ⏳ **Needed**: Biometric re-authentication for sensitive operations

**Residual Risk**: MEDIUM
- User education required (2FA on Google account)
- zkLogin inherits Google security model

---

### T - Tampering (Data Modification)

#### Threat T.1: Blockchain Data Modification

**Description**: Attacker attempts to modify capture metadata after recording.

**Attack Vector**:
- Exploit Sui smart contract vulnerability
- Compromise RPC node to return false data
- Wallet signature forgery

**Impact**: CRITICAL (if successful)
- Undermines entire authenticity guarantee
- Loss of trust in system

**Mitigations**:
- ✅ **Current**: Sui blockchain immutability (cannot modify object after creation)
- ✅ **Current**: Move language memory safety (no buffer overflows)
- ✅ **Current**: Object ownership model (only creator can transfer Capture)
- ⏳ **Needed**: External smart contract audit (pre-mainnet)
- ⏳ **Needed**: Transaction verification (confirm object creation on-chain)

**Residual Risk**: VERY LOW
- Move's security guarantees prevent most attacks
- Blockchain immutability is cryptographic

---

#### Threat T.2: Walrus Blob Corruption

**Description**: Attacker modifies media blob after upload to Walrus.

**Attack Vector**:
- Compromise Walrus storage node
- Erasure coding reconstruction attack
- Blob ID collision

**Impact**: MEDIUM
- User downloads corrupted media
- Integrity check would fail (content hash mismatch)

**Mitigations**:
- ✅ **Current**: Content hash (SHA-256) stored on Sui blockchain
  - Sui record contains hash of original file
  - Any modification breaks hash verification
- ✅ **Current**: Walrus erasure coding (Byzantine fault tolerance)
- ✅ **Current**: Blob ID uniqueness guaranteed by Walrus protocol

**Residual Risk**: VERY LOW
- Walrus protocol designed for tamper resistance
- Hash verification detects any modification

---

#### Threat T.3: Man-in-the-Middle (MITM) on Network Traffic

**Description**: Attacker intercepts network traffic between app and blockchain RPCs.

**Attack Vector**:
- Compromised WiFi network
- DNS hijacking
- SSL stripping

**Impact**: MEDIUM
- Attacker could inject false blockchain responses
- Transaction replay attacks

**Mitigations**:
- ✅ **Current**: TLS 1.3 enforced (React Native networking)
- ✅ **Current**: HTTPS for all Walrus/Sui/Solana RPC calls
- ⏳ **Needed**: Certificate pinning for critical endpoints
- ⏳ **Needed**: RPC response signature verification

**Residual Risk**: LOW
- TLS provides strong channel security
- Certificate pinning would eliminate MITM risk

---

### R - Repudiation (Non-repudiable Actions)

#### Threat R.1: Creator Denies Capture Authorship

**Description**: User claims they did not create a capture attributed to them.

**Attack Vector**:
- Stolen device used to create captures
- Compromised wallet keys
- Social engineering ("I was hacked")

**Impact**: LOW (System Design Strength)
- Blockchain record is immutable proof
- Cryptographic signatures prove authorship

**Mitigations**:
- ✅ **Current**: Sui transaction signature (creator address)
- ✅ **Current**: TEEPIN hardware signature (device binding)
- ✅ **Current**: Blockchain timestamp (irrefutable timing)
- ✅ **Current**: GPS + sensor data (contextual evidence)

**Residual Risk**: VERY LOW
- Multiple layers of cryptographic proof
- Repudiation is mathematically improbable

---

### I - Information Disclosure (Data Leakage)

#### Threat I.1: AsyncStorage Key Extraction

**Description**: Attacker extracts wallet private keys from device storage.

**Attack Vector**:
- Root/jailbreak device
- ADB backup extraction (Android)
- File system access on compromised device
- Malware with storage permissions

**Impact**: CRITICAL
- Full wallet access
- All future captures attributed to attacker
- Sovereign Mode encryption bypassed (if Solana key extracted)

**Mitigations**:
- ⚠️ **Current**: AsyncStorage (UNENCRYPTED - HIGH RISK)
  - Keys stored in plain text in app sandbox
  - Accessible on rooted/jailbroken devices
- 🚨 **URGENT**: Migrate to expo-secure-store (Day 3-4 priority)
  - Hardware-backed keychain (iOS Keychain, Android Keystore)
  - Secure Element protection (iOS) or TEE (Android)

**Residual Risk**: HIGH (current) → LOW (after migration)
- **This is the #1 security priority for hackathon sprint**
- Migration to secure storage eliminates attack vector

---

#### Threat I.2: Sovereign Mode Encryption Bypass

**Description**: Attacker decrypts Sovereign Mode media without user's private key.

**Attack Vector**:
- Cryptographic weakness in Seal encryption
- Key extraction (see I.1)
- Threshold server compromise (Mysten Seal)

**Impact**: HIGH
- Sensitive media exposed
- Privacy violation

**Mitigations**:
- ✅ **Current**: Seal identity-based encryption (AES-256)
- ✅ **Current**: Threshold encryption (1-of-2 servers)
- ✅ **Current**: User's Solana address as identity (only user's key decrypts)
- ⏳ **Needed**: Audit Seal implementation (verify correct usage)
- ⏳ **Needed**: Test decryption flow end-to-end

**Residual Risk**: LOW
- Seal uses industry-standard cryptography
- Mysten security reputation is strong

---

#### Threat I.3: Sensor Data Privacy Leakage

**Description**: Captured sensor data reveals sensitive user information.

**Attack Vector**:
- GPS coordinates expose home/work locations
- Sensor patterns (gait analysis) identify individual
- Metadata correlation across captures

**Impact**: MEDIUM
- Privacy implications for users
- Potential surveillance concerns

**Mitigations**:
- ✅ **Current**: Sovereign Mode (encrypt entire capture including metadata)
- ✅ **Current**: User controls which captures to upload
- ⏳ **Needed**: Privacy mode (fuzzy GPS coordinates to general area)
- ⏳ **Needed**: Metadata minimization option

**Residual Risk**: MEDIUM
- User education required
- Sovereign Mode provides opt-in protection

---

### D - Denial of Service (Availability)

#### Threat D.1: Gas Exhaustion Attack

**Description**: Attacker drains user's Sui gas funds, preventing captures.

**Attack Vector**:
- Spam captures until gas depleted
- Transaction griefing (force expensive operations)
- Front-running user transactions

**Impact**: MEDIUM
- User cannot create new captures
- Service disruption

**Mitigations**:
- ⏳ **Needed**: Gas balance check before session start
- ⏳ **Needed**: Low balance warning (< 10 captures remaining)
- ⏳ **Needed**: Rate limiting (hybrid burst + sustained)
  - Burst: 30 photos in 30 seconds
  - Sustained: 200 photos per 10 minutes
  - GOLD-grade: No sustained limit (hardware-verified users trusted)

**Residual Risk**: LOW
- Rate limiting prevents spam
- Gas balance warnings alert user

---

#### Threat D.2: Walrus Storage Quota Exhaustion

**Description**: Attacker fills Walrus storage quota with junk data.

**Attack Vector**:
- Spam large media files
- Blob ID squatting
- Epoch expiry timing attacks

**Impact**: LOW
- Storage costs increase
- Walrus epochs limit exposure (5 epochs = ~5 days on testnet)

**Mitigations**:
- ✅ **Current**: Walrus epoch expiry (automatic cleanup)
- ⏳ **Needed**: Client-side storage quota monitoring
- ⏳ **Needed**: Blob size limits (max 100MB per capture)

**Residual Risk**: VERY LOW
- Walrus protocol handles quota management
- Epoch expiry prevents long-term spam

---

#### Threat D.3: Blockchain RPC Unavailability

**Description**: Sui/Solana RPC nodes go offline, preventing captures.

**Attack Vector**:
- RPC provider downtime
- Network congestion
- DDoS on RPC endpoints

**Impact**: MEDIUM
- User cannot record captures on-chain
- Service disruption

**Mitigations**:
- ⏳ **Needed**: RPC failover (multiple providers)
  - Primary: Official Sui/Solana RPCs
  - Fallback: Community RPC nodes
- ⏳ **Needed**: Offline mode (queue captures for later upload)
- ⏳ **Needed**: RPC health monitoring

**Residual Risk**: MEDIUM
- Blockchain dependency is architectural
- Offline mode would mitigate completely

---

### E - Elevation of Privilege (Access Control)

#### Threat E.1: STRICT_PROVENANCE Bypass

**Description**: Attacker bypasses GOLD/SILVER grade requirement to capture on UNTRUSTED device.

**Attack Vector**:
- Disable STRICT_PROVENANCE flag
- Mock TrustManager.getDeviceProfile() response
- Client-side code modification

**Impact**: MEDIUM
- Allows unverified captures
- Undermines provenance grading system

**Mitigations**:
- ✅ **Current**: STRICT_PROVENANCE enforced in IdentityService
- ⏳ **Needed**: Server-side provenance validation (when backend exists)
- ⏳ **Needed**: Code obfuscation in production builds

**Residual Risk**: MEDIUM
- Client-side enforcement can be bypassed
- Blockchain record still contains provenance grade (verifiable by others)

---

#### Threat E.2: Smart Contract Admin Takeover

**Description**: Attacker gains admin privileges on Sui smart contracts.

**Attack Vector**:
- Private key compromise (deployer wallet)
- Smart contract upgrade exploit
- Governance attack (if DAO implemented)

**Impact**: CRITICAL
- Full control over contract logic
- Could mint fake captures or modify ownership

**Mitigations**:
- ✅ **Current**: Move contracts are immutable after deployment (no upgrade capability)
- ✅ **Current**: No admin functions in current contract
- ⏳ **Needed**: Multi-sig for future contract deployments
- ⏳ **Needed**: Timelock for governance actions (if implemented)

**Residual Risk**: VERY LOW
- Immutable contracts prevent most attacks
- No admin privileges to exploit

---

## Attack Surface Mapping

### 1. Mobile Application

**Entry Points**:
- Camera capture (user input)
- GPS coordinates (system input)
- Sensor data (system input)
- User-entered session names (text input)

**Sensitive Assets**:
- Wallet private keys (AsyncStorage ⚠️)
- Session state (AsyncStorage ⚠️)
- Captured media (device storage)
- User identity (zkLogin JWT)

**Attack Vectors**:
- Malware with storage permissions
- Rooted/jailbroken device exploitation
- Network MITM attacks
- Mock location injection

---

### 2. Blockchain Layer (Sui)

**Entry Points**:
- `record_capture()` function (public entry point)
- RPC API calls (network)

**Sensitive Assets**:
- Capture objects (metadata records)
- Transaction signatures (proof of authorship)

**Attack Vectors**:
- Smart contract vulnerability exploitation
- RPC node compromise
- Transaction replay attacks

---

### 3. Identity Layer (Solana/TEEPIN)

**Entry Points**:
- MWA session binding (cross-chain signature)
- TEEPIN attestation request

**Sensitive Assets**:
- TEEPIN hardware signatures
- Solana wallet addresses
- Session bind signatures

**Attack Vectors**:
- MWA protocol vulnerability
- TEEPIN signature replay
- Solana wallet compromise

---

### 4. Storage Layer (Walrus)

**Entry Points**:
- Blob upload (PUT request)
- Blob download (GET request)

**Sensitive Assets**:
- Encrypted media (Sovereign Mode)
- Blob IDs (references in Sui)

**Attack Vectors**:
- Blob corruption
- Storage node compromise
- Blob ID collision

---

## Risk Matrix

| Threat | Likelihood | Impact | Risk Level | Priority |
|--------|-----------|--------|------------|----------|
| I.1: AsyncStorage Key Extraction | HIGH | CRITICAL | 🔴 CRITICAL | P0 |
| S.1: Hardware Attestation Bypass | MEDIUM | HIGH | 🟠 HIGH | P1 |
| T.1: Blockchain Data Modification | VERY LOW | CRITICAL | 🟡 MEDIUM | P2 |
| S.2: GPS Spoofing | MEDIUM | MEDIUM | 🟡 MEDIUM | P2 |
| T.3: MITM Network Traffic | LOW | MEDIUM | 🟢 LOW | P3 |
| D.1: Gas Exhaustion Attack | LOW | MEDIUM | 🟢 LOW | P3 |
| I.2: Sovereign Mode Bypass | VERY LOW | HIGH | 🟢 LOW | P3 |
| E.1: STRICT_PROVENANCE Bypass | MEDIUM | MEDIUM | 🟡 MEDIUM | P2 |

---

## Mitigation Roadmap

### 🔴 Critical Priority (Day 3-4)

**1. AsyncStorage → expo-secure-store Migration**
- Files: `SuiWalletContext.tsx`, `storage.ts`, `identity.ts`
- Impact: Eliminates #1 attack vector
- Effort: 6 hours

**2. TEEPIN Signature Verification Hardening**
- Validate public key matches known Seeker keys
- Implement signature nonce (replay prevention)
- Effort: 2 hours

### 🟠 High Priority (Day 5-6)

**3. Gas Balance Monitoring**
- Pre-session gas check
- Low balance warnings
- Effort: 1 hour

**4. Rate Limiting Implementation**
- Hybrid burst + sustained limits
- GOLD-grade bonus (no sustained limit)
- Effort: 3 hours

**5. Smart Contract Audit Preparation**
- Document entry points and invariants
- Create security test suite
- Effort: 8 hours

### 🟡 Medium Priority (Post-Hackathon)

**6. Certificate Pinning**
- Pin Sui/Solana RPC certificates
- Effort: 2 hours

**7. RPC Failover**
- Multiple RPC providers
- Automatic fallback
- Effort: 4 hours

**8. Offline Mode**
- Queue captures for later upload
- Effort: 1 week

---

## Compliance & Standards

### Security Standards Adherence

**Per `docs/protocols/SECURITY_STANDARDS.md`**:

| Requirement | Status | Notes |
|------------|--------|-------|
| AES-256 Encryption | ✅ PASS | Seal SDK |
| TLS 1.3 | ✅ PASS | React Native default |
| ECDSA/Ed25519 Signatures | ✅ PASS | Sui/Solana native |
| Hardware Key Storage | ⚠️ IN PROGRESS | Day 3-4 migration |
| Input Validation | ⏳ PLANNED | Day 3-4 Zod schemas |

### Mainnet Readiness

- ✅ **Blockchain immutability**: Sui/Solana provide guarantees
- ⚠️ **Key management**: Migration to secure storage required
- ✅ **Cryptographic proofs**: TEEPIN + blockchain signatures
- ⏳ **Smart contract audit**: Scheduled for Day 5-6
- ⏳ **Penetration testing**: Scheduled for Day 9-10

---

## Assumptions & Dependencies

### Assumptions

1. **Sui blockchain security**: We trust Sui's consensus and Move runtime
2. **Walrus protocol integrity**: We trust Walrus erasure coding and Byzantine fault tolerance
3. **TEEPIN security**: We trust Solana Seeker's Secure Enclave implementation
4. **RPC honesty**: We trust official Sui/Solana RPC nodes (mitigation: failover)

### External Dependencies

1. **Google OAuth security** (zkLogin): Inherits Google's security model
2. **Mysten Seal servers**: Threshold encryption requires 1-of-2 servers operational
3. **Blockchain uptime**: Depends on Sui/Solana network availability
4. **Walrus testnet stability**: May differ from mainnet characteristics

---

## Conclusion

**Overall Security Posture**: STRONG with ONE CRITICAL gap (AsyncStorage key management)

**Strengths**:
- Multi-layer defense (hardware + blockchain + forensics)
- Blockchain immutability prevents tampering
- TEEPIN hardware attestation (GOLD-grade)
- Forensics layer catches GPS spoofing

**Critical Action Items**:
1. 🔴 Migrate to expo-secure-store (Day 3-4) - BLOCKS MAINNET
2. 🟠 Smart contract audit (Day 5-6) - REQUIRED for mainnet
3. 🟡 Rate limiting + gas monitoring (Day 5-6) - UX improvement

**Mainnet Readiness**: **APPROVED** after AsyncStorage migration and smart contract audit

---

**Status**: ✅ DAY 1 TASK 2 COMPLETE

**Next Steps**:
1. Review threat model with founder
2. Prioritize mitigations for Day 3-4 sprint
3. Setup automated security scanning (Task 3)

---

*Threat model created by Claude Code (Sub-Agent 1D) on February 24, 2026*
*Using STRIDE framework and indelible.Blob architectural knowledge*
