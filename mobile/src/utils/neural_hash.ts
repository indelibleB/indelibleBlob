import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import jpeg from 'jpeg-js';
import { bmvbhash } from 'blockhash-core';

/**
 * Neural Hash Utility 🧠
 * 
 * Generates a "Visual Fingerprint" (pHash) for an image.
 * This hash remains stable even if the image is resized, re-encoded, or slightly modified.
 * 
 * STRATEGY: "Micro-Resize"
 * 1. Native Resize -> 32x32 (using GPU/OS)
 * 2. Decode -> RGB (pure JS)
 * 3. Hash -> Block Mean Value (pure JS)
 */

export async function createFingerprint(uri: string): Promise<string> {
    try {
        console.log('🧠 Neural Hash: Generatring fingerprint...');
        const startTime = Date.now();

        // 1. Micro-Resize (Native Speed)
        // We resize to 32x32. This is small enough for pure JS to handle instantly.
        const manipResult = await ImageManipulator.manipulateAsync(
            uri,
            [{ resize: { width: 32, height: 32 } }],
            { base64: true, format: ImageManipulator.SaveFormat.JPEG, compress: 0.7 }
        );

        if (!manipResult.base64) {
            throw new Error('Failed to extract base64 from micro-resize');
        }

        // 2. Decode JPEG (Pure JS)
        const rawBuffer = Buffer.from(manipResult.base64, 'base64');
        const decoded = jpeg.decode(rawBuffer, { useTArray: true }); // Uint8Array

        // 3. Compute pHash (Block Mean Value)
        // blockhash-core expects RGBA data. jpeg-js returns RGBA.
        const hash = bmvbhash(decoded, 8); // 8-byte hash (64-bit)

        const duration = Date.now() - startTime;
        console.log(`🧠 Fingerprint Generated: ${hash} (Took ${duration}ms)`);

        return hash;

    } catch (error) {
        console.error('❌ Neural Fingerprinting Failed:', error);
        return '0000000000000000'; // Fail-safe (Null Hash)
    }
}
