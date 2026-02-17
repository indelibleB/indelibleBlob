# 🧠 Research: Neural Fingerprinting (The Invisible Anchor)

**Goal**: Identify "Indelible Blobs" across the internet (e.g., on Twitter/Instagram) even if the file has been re-encoded, resized, or stripped of metadata.
**Core Tech**: Perceptual Hashing (pHash) / Neural Hash.

---

## 1. The Problem: "The Social Media Gap" 💔
**Why isn't SHA-256 enough?**

*   **The Scenario**:
    1.  Alice captures a verified video on the CLI app.
    2.  Hash: `0xe3b0...` (The "True" ID).
    3.  Alice uploads it to **Twitter/X**.
    4.  **Twitter compresses it**. The file size drops from 50MB to 5MB. The pixels change slightly.
    5.  **The Link Breaks**: The new hash is `0x7fa2...`.
    6.  **The Failure**: If Bob downloads the Twitter video and queries `0x7fa2...` on Sui, the blockchain says **"Unknown File"**. The verification is lost.

*   **The Gap**: We have a "Perfect" chain of custody for the *Safe*, but it breaks as soon as the media leaves the *Safe* into the real world.

## 2. The Solution: "The Visual Anchor" (pHash) ⚓
**How Neural Fingerprinting reconnects the link.**

*   **The Mechanism**:
    *   Instead of hashing the *Filesize/Bytes*, we hash the **Visual Structure** (average color, gradients, shapes).
    *   Twitter compression changes the *bytes*, but it preserves the *image* (it still looks like a sunset).
*   **The Result**:
    *   `pHash(Original)` = `101010`
    *   `pHash(TwitterCopy)` = `101011` (99% Match).
*   **The New Flow**:
    1.  Bob scans the Twitter video.
    2.  The Indexer looks for *matches* similar to `101011`.
    3.  It finds `101010` (The Original).
    4.  **Status**: "Verified (Compressed Copy of 0xe3b0...)".

---

## 3. Algorithm Candidates

### A. Block Mean Value (BMH) / pHash
*   **Mechanism**:
    1.  Resize to 32x32 grayscale.
    2.  Compute DCT (Discrete Cosine Transform).
    3.  Keep low frequencies (structural shapes).
    4.  Generate 64-bit hash based on frequency mean.
*   **Pros**: Fast, pure math, no AI model weights needed.
*   **Cons**: Can be fooled by rotation or heavy cropping.

### B. Neural Hash (CLIP / ResNet embeddings)
*   **Mechanism**: Run image through a MobileNet/CLIP model. Extract the vector from the penultimate layer.
*   **Pros**: Extremely robust. Understands "Content" (e.g., "A dog on a beach").
*   **Cons**: Heavy (requires shipping a 20MB+ model in the app/extension).

### Recommendation: **pHash (DCT)**
For Mobile + Browser Extension, **pHash** is the sweet spot. It is lightweight (kB), fast (ms), and robust enough for "Social Media Re-encoding".

---

## 4. The Role of the JS Library 📚
You asked: *How do these libraries relate to the solution?*

Think of the **JS Library** as the **Translator**.
1.  **Input**: It takes the raw pixel data from the camera (Red, Green, Blue values).
2.  **Math**: It runs the **Discrete Cosine Transform (DCT)** algorithm.
    *   *Simplification*: It blurs the image, turns it to grayscale, and measures the "average structural patterns" (e.g., "Top left is bright, bottom right is dark").
3.  **Output**: It spits out a **Hex String** (e.g., `0x8f3a...`).
    *   This string is the **Fingerprint**.

---

## 5. FAQ: "How does a Thumbnail protect a Video?" 🎥
You asked: *How does hashing just a thumbnail allow for the provenance of videos?*

**Critically important distinction:**
*   **SHA-256 (The Vault)**: Hashes *every single second* of the video. This is the **Proof**.
*   **pHash (The Map)**: Hashes only the *visual signature* (Thumbnail). This is the **Search Key**.

**The Workflow:**
1.  **The Attack**: Someone takes your 4K video, cuts the last 10 seconds, and posts it on Twitter.
2.  **The Detection**:
    *   The **pHash** of the Twitter video (based on its visual frames) matches your original's pHash.
    *   **Result**: "We found the original source video!"
3.  **The Verdict**:
    *   We compare the Twitter video's SHA-256 to your Original SHA-256.
    *   **Mismatch**: "This video is a **Modification** of [Link to Your Original]."

**The pHash doesn't prove the video is perfect; it proves the video belongs to you so we can *check* if it's perfect.**

---

## 5. Implementation Strategy: "The Micro-Resize Technique" 🔬
To avoid heavy native modules or slow canvas operations, we will use a **Pure JS** pipelines optimized by native resizing.

### The Pipeline
1.  **Native Resize**: Use `expo-image-manipulator` to shrink the original image to **32x32 pixels** (Tiny!).
    *   *Why*: pHash only cares about low-frequency patterns. 32x32 is plenty of data (1024 pixels).
    *   *Speed*: Instant.
2.  **Base64 Read**: Use `expo-file-system` to read this tiny file.
3.  **Pure JS Decode**: Use a lightweight decoder (e.g., `jpeg-js`) to get the RGB values of the 1024 pixels.
4.  **Compute Hash**: Run the DCT/Mean logic on this small array.
    *   *Result*: A 64-bit Hex String (The Fingerprint).

### Required Libraries
*   `expo-image-manipulator` (Already installed).
*   `expo-file-system` (Already installed).
*   `jpeg-js` (Pure JS JPEG decoder).
*   `blockhash-core` (Pure JS perceptual hash logic).

This approach keeps our app lightweight and compatible with Expo Go/Prebuild without custom native code.

---

## 5. Next Steps
1.  Implement **pHash** generation in `mobile/`.
2.  Update `SuiService` to store `pHash` in the metadata.
3.  Build the "Verifier" logic to compare pHashes.
