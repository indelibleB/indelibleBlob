# 🌐 Unified Signify Pipeline: The "Digital Passport"

**Goal**: Align Photo and Video verification under a single "Indelible Container" philosophy.
**Core Principle**: Do not *overwrite* the visual truth. *Extend* the canvas to carry the proof.

---

## 1. The Disconnect (Current State)
*   **Photo**: We currently "burn" the logo *over* the pixels (`watermark.ts`).
    *   *Issue*: Technically alters the evidence. Obscures potentially relevant details (bottom-right corner).
*   **Video (Proposed)**: We append a "Bumper" *after* the content.
    *   *Advantage*: Preserves 100% of the original stream.

## 2. The Solution: "The Indelible Frame" 🖼️

We shift from **Watermarking** (Overlay) to **Pass-porting** (Canvas Extension).

### For Photos: "The Data Strip" (Polaroid Style)
Instead of stamping the logo *on* the image, we expand the canvas (e.g., add 60px of black space at the bottom/side).

*   **Visuals**:
    *   **The Strip**: A clean "Nutrition Label" bar at the bottom.
    *   **Content**: Indelible Blob Logo + **Visual Hash (QR/Data Matrix)**.
*   **Mechanism**:
    1.  Capture Photo (1080x1920).
    2.  Check Provenance (Hardware Sig).
    3.  Compute Hash of the *original* 1080x1920 pixels.
    4.  **Generative Expand**: Create new canvas (1080x1980).
    5.  Place Original at (0,0).
    6.  Place "Data Strip" at (0, 1920).
*   **Validation**:
    *   The QR code contains the hash of the *top portion* (the image).
    *   Any cropping of the strip removes the claim (invalidates the "Passport").
    *   Any modification of the image mismatches the QR.

### For Videos: "The Holographic Bumper"
(As previously discussed)
*   **Visuals**: 3-second Outro Card.
*   **Content**: Logo + **Dynamic Hash Code**.
*   **Mechanism**: Concatenation (`-c copy`).

---

## 3. Why This Wins 🏆

1.  **Integrity**: The "Subject" (the captured moment) remains untouched byte-for-byte (in the video case) or pixel-for-pixel (in the photo case, relative to the canvas).
2.  **Consistency**: Both media types now feel like "Evidence Cards" or "NFTs" rather than just stamped files.
3.  **Machine Readable**: The "Secret Signifier" (QR/Data Matrix) is machine-readable by the Validation Portal camera.
    *   *Demo*: Point the Validator App at a printed Indelible Photo -> Instant green checkmark.

## 4. Implementation Impact

### `watermark.ts` (Refactor)
*   **Current**: `overlay: { top: ... }`
*   **New**: `resizeCanvas` -> `drawOriginal` -> `drawStrip`.
*   *Complexity*: Low. `expo-image-manipulator` supports this perfectly.

### `useCapture.ts` (Logic)
*   Hashing logic might need to be "Payload Aware" (Hash the *content area* vs hash the *result file*).
    *   *Sovereign Decision*: We technically hash the **Result File** (Image + Strip). Ideally, the Strip *contains* the hash of the Image.
    *   This creates a circular dependency (Hash Image -> Gen Strip -> Hash Final).
    *   *Fix*: The "Signifier" is just a visual representation. The **Blockchain Record** is the ultimate truth. The QR code just helps the *human/portal* quick-link to that record.

---

## Recommendation
Adopt the **"Digital Passport"** strategy for **Photos** immediately.
It is cleaner, more professional, and technically superior to the "Burn-in" watermark.
