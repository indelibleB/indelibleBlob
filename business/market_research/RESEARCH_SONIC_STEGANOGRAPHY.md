# 🦇 Research: Sonic Steganography ("The Sonic Signature")

**Status**: Proposal / Feasibility Analysis  
**Target**: Video Watermarking (Invisible Stamp)  
**Goal**: Embed a unique identifier into video captures *without* altering visual data or incurring heavy transcoding costs.

---

## 1. The Core Concept
Instead of modifying the visual pixels (which requires expensive re-encoding and degrades the "raw" image integrity), we inject an **inaudible acoustic signature** into the audio track of the video container.

### How it works (High Level)
1.  **Capture**: User records a video (`capture.mp4`).
2.  **Generate**: App generates a unique ID (e.g., `blob-1234`) and converts it into a sequence of high-frequency tones (Frequency Shift Keying).
    *   *Example*: 18.5kHz = '0', 19.5kHz = '1'.
3.  **Mix**: App uses FFmpeg to **mix** this tone sequence into the video's audio track.
4.  **Save**: The output file (`stamped.mp4`) has **identical video data** to the source, but the audio now contains the hidden ID.

---

## 2. Technical Implementation (React Native)

We would use `ffmpeg-kit-react-native` (specifically the `audio` or `min-gpl` package) to handle the mixing.

### The "Video Copy" Advantage ⚡
The single biggest advantage of this approach is **Performance**.
*   **Visual Watermark (Pixels)**: Requires decoding every video frame, overlaying an image, and re-encoding.
    *   *Cost*: ~1.5x - 2x video duration (Slow). Burns battery. Loses "Raw" integrity.
*   **Sonic Watermark (Audio)**: Copies the video stream bit-for-bit (`-c:v copy`). Only re-encodes the relatively small audio stream.
    *   *Cost*: ~0.1x video duration (Fast). Preserves "Raw" visual integrity perfectly.

### Proposed FFmpeg Command
```bash
ffmpeg -i input.mp4 \
       -f lavfi -i "sine=frequency=19000:duration=5" \
       -filter_complex "[0:a][1:a]amix=inputs=2:duration=first" \
       -c:v copy \
       -c:a aac \
       output.mp4
```
*   `-c:v copy`: This is the magic flag. It streams the video data directly from input to output without touching it.

---

## 3. Risks & Limitations

### ⚠️ The "Compression Cut-off" (The WhatsApp Problem)
Most social platforms (WhatsApp, Twitter/X, Instagram) compress audio aggressively using codecs like AAC or Opus at low bitrates (64kbps).
*   **Risk**: These codecs often apply a **Low-Pass Filter**, cutting off all frequencies above ~16kHz to save space.
*   **Impact**: If we hide our signal at 19kHz (inaudible), Instagram might wipe it clean during upload.
*   **Mitigation**: We might need to use frequencies in the **14kHz - 16kHz** range.
    *   *Trade-off*: This range is technically audible to children and young adults (the "Mosquito Tone" effect). It must be mixed at a very low volume (-40dB) to remain roughly "invisible".

### ⚠️ Dependency Size
*   **FFmpeg Kit**: Adds ~25MB - 50MB to the App Bundle size (.apk / .ipa).
*   **Mitigation**: Use the `audio` package variant of FFmpeg-Kit to minimize bloat, as we don't need complex video filters.

---

## 4. Verification (The Reader) 🕵️‍♀️
Encoding is easy. Decoding is hard.

To verify a "Sonic Signature":
1.  **Extract Audio**: `ffmpeg -i video.mp4 -vn audio.wav`
2.  **Spectrogram Analysis**: Perform an FFT (Fast Fourier Transform) on the audio.
3.  **Decode**: Look for energy spikes at our specific frequencies (18.5kHz / 19.5kHz) over time.

*Implementation Strategy*:
*   **In-App**: Hard. Requires a robust DSP (Digital Signal Processing) library.
*   **Server-Side**: Easy. We send the blob to the backend, and Python (`numpy`/`scipy`) handles the FFT extraction instantly.

---

## 5. Verdict

| Feature | Visual Overlay | Sonic Steganography | Metadata Tagging |
| :--- | :--- | :--- | :--- |
| **Visual Integrity** | ❌ Modified (Re-encoded) | ✅ **100% Original** | ✅ **100% Original** |
| **Processing Speed** | 🐢 Slow | 🐇 **Fast** | 🐆 Instant |
| **Robustness** | 🛡️ High (Survives screenshot) | ⚠️ Medium (May survive re-encode) | ❌ Low (Lost on re-mux) |
| **Complexity** | 😐 Medium | 🤯 **High (Decoding)** | 😊 Low |

### Recommendation
If we prioritize **Hash Integrity** of the visuals, **Sonic Steganography is the superior Choice**.
It allows us to "Stamp" the file physically (in the audio data) without changing a single pixel of the evidence.

**Next Step**:
1.  Install `ffmpeg-kit-react-native-audio`.
2.  Prototype a simple mixing function in `useCapture.ts` that injects a static "beep" at 15kHz.
3.  Test if it survives a Walrus upload/download cycle.
