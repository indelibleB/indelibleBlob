/**
 * Video Bumper Utility (Stubbed)
 *
 * FFmpeg-based video stitching is currently disabled because
 * ffmpeg-kit-react-native is deprecated and its Maven artifacts
 * have been removed. This stub returns the original video URI
 * unchanged until a replacement library is integrated.
 */

import { blobLog } from './logger';

export async function appendBumper(videoUri: string): Promise<string> {
    blobLog.info('Video bumper is currently disabled (ffmpeg-kit deprecated). Returning original.');
    return videoUri;
}
