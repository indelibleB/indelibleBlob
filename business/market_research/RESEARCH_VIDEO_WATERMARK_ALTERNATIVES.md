# 🎬 Research: Video Watermarking Alternatives

**Goal**: "Signify to the users readily as well as secretly" (Visible Branding + Invisible Provenance)  
**Constraint**: Must be performant on mobile (avoid slow CPU encoding) and robust enough for social media.

Since "Sonic Steganography" was deemed imperfect/risky, here are three alternative technical approaches.

---

## 1. The "Holographic Bumper" (Stitched Outro) 🎞️
*The "Shot on iPhone" approach.*

**Concept**: Instead of modifying the user's video, we append a high-quality, pre-rendered 3-second "Verified by Indelible Blob" animation to the end.

### How it Verification Works (The "Dual Signal")
*   **Readily Signified**: Every video ends with a distinct, unmissable branding card.
*   **Secretly Proven**: The Bumper itself contains a **High-Density QR Code** (or Data Matrix) that encodes the **Hash of the preceding video segment**.
    *   *Mechanism*: The app calculates the hash of the user's video `H(v)`. It generates a QR code for `H(v)`. It overlays this QR on the bumper. It stitches `UserVideo + Bumper`.
    *   *Detection*: The "Validation Portal" scans the end of the video. It reads the QR to get `H(v)`. It then hashes the first `Duration - 3s` of the file. If they match, the video is authentic.

### Pros/Cons
*   **✅ Integrity**: The main video stream is copied bit-for-bit (`-c copy`). Zero quality loss.
*   **✅ Speed**: Concatenation is instant (~1s).
*   **❌ Fragility**: A user (or malicious actor) could trim off the last 3 seconds easily. (However, strict file hashing would still fail on the portal, flagging it as "Modified").

---

## 2. The "Soft-Stamp" (Subtitle Overlay) 💬
*The "Netflix" approach.*

**Concept**: We add a permanent **Subtitle Track** (ASS/SSA format) to the video container. This track displays the "indelible.Blob" logo/text in the corner.

### How it Verification Works
*   **Readily Signified**: Most modern players (VLC, YouTube, even some Twitter clients) display subtitles. The branding appears as an overlay.
*   **Secretly Proven**: The subtitle file itself contains **Hidden Metadata** (comments or non-rendering text fields) with the full cryptographic payload.
    *   *Mechanism*: `ffmpeg -i input.mp4 -i watermark.ass -c copy -c:s mov_text output.mp4`

### Pros/Cons
*   **✅ Integrity**: Zero video modification.
*   **✅ Speed**: Instant muxing.
*   **❌ UX Risk**: Players might have subtitles "Off" by default.
*   **❌ Social Risk**: Instagram/TikTok/Twitter often **strip** subtitle tracks when transcoding uploads. This fails the "Social Media Ready" requirement.

---

## 3. The "Hardware Burn" (Accelerated Encoding) 🔥
*The "Brute Force" optimized approach.*

**Concept**: We accept that we must burn pixels to be truly robust, but we use **Hardware Acceleration** to make it bearable.

### How it Verification Works
*   **Readily Signified**: A visible "indelible.Blob" watermark is permanently burned into the pixels.
*   **Secretly Proven**: The watermark is not just an image. It is a **Dynamic Data Visual**.
    *   *Idea*: A "Timecode" or "Checksum" distinct runner at the bottom (like police dashcam footage).
    *   *Mechanism*: The text string implies the hash. Only the Validator knows how to decode "A7X-99" back to the block ID.

### Performance Strategy
*   Use `ffmpeg-kit` with hardware flags:
    *   **iOS**: `-c:v h264_videotoolbox` (Uses Apple's media engine).
    *   **Android**: `-c:v h264_mediacodec` (Uses Snapdragon/Exynos DSP).
*   *Estimate*: 1080p video encodes at ~4x-5x realtime speed on modern devices (e.g., 1 min video takes ~15s).

### Pros/Cons
*   **✅ Robustness**: Survives everything (Twitter compression, re-encoding, trimming).
*   **❌ Integrity**: Technically alters "Raw" bytes. We must hash the *output* as the source of truth.
*   **❌ Battery**: Uses dedicated media silicon, draining more power than a simple copy.

---

## Recommendation 💡

**"The Holographic Bumper" (Option 1)** is the most "Indelible" philosophy-aligned choice.
*   It preserves the *sacredness* of the user's raw capture.
*   It adds branding that feels premium (like a movie studio outro).
*   It protects the provenance cryptographically without re-encoding.

**Fallback**: If users demand "Instagram Ready" watermarks on the clip itself, we effectively must do **Option 3 (Hardware Burn)**.
