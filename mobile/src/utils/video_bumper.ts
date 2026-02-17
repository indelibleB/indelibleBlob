/**
 * Video Bumper Utility (Stubbed)
 *
 * FFmpeg-based video stitching is currently disabled because
 * ffmpeg-kit-react-native is deprecated and its Maven artifacts
 * have been removed. This stub returns the original video URI
 * unchanged until a replacement library is integrated.
 */

export async function appendBumper(videoUri: string): Promise<string> {
    console.log('🎞️ Video bumper is currently disabled (ffmpeg-kit deprecated). Returning original.');
    return videoUri;
}
