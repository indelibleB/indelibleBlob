# Design Brief: Universal Verification UI & "Green Check" Portal

**Status**: [QUEUED] for V1.5 Design Phase
**Goal**: Design a universally recognizable, tamper-proof system for identifying Indelible Blob imagery across the web/mobile.

## The Problem
*   Block explorers (Suiscan/Walrus) are confusing for normal users.
*   Users need a simple "Is this real?" indicator.
*   The indicator must lead to a "Nutrition Label" that explains *why* it's trusted (Captured vs Generated vs Edited).

## User Requirements
1.  **Unique Identification**: A signature/watermark that is immediately recognized as "Indelible Verified."
2.  **Platform Agnostic**: Must work on email, news blogs, social media, text.
3.  **Hard to Fake**: Cannot be easily reproduced (e.g., dynamic/3D vs static PNG).
4.  **User-Friendly Portal**: Clicking the seal connects to a "Detail Analyzer" (not a block explorer).

## Brainstorming & Design Concepts (Stashed)
*   **Visual Indicator**:
    *   *Idea 1*: **"Partial Frame"**: A distinct border style or corner glint that signifies authentic hardware capture.
    *   *Idea 2*: **"Holographic Seal"**: A subtle 3D/animated element that shimmers on hover (harder to screenshot/fake).
    *   *Idea 3*: **"Invisible Watermark"**: Steganography that browser extensions can detect and "light up" (Power User feature).
*   **The "Nutrition Label" (Analyzer Portal)**:
    *   **Headline**: "Verified Captured by [Device Model]" at [Time/Date].
    *   **Trust Score**: 100/100 (Unedited).
    *   **Origin Map**: Rough region verification (Privacy preserved region).
    *   **Hardware Sig**: "Signed by TEEPIN Enclave #8392..."

## Next Steps
1.  Collaborative design session to mockup the "Glint" or "Frame".
2.  Prototype the "Detail Analyzer" page (frontend view of the Sui object).
