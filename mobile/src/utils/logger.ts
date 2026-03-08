/**
 * ============================================================================
 * Standardized Logging Utility
 * ============================================================================
 *
 * Ensures all app logs are easily filterable in the WSL terminal via adb logcat.
 * All logging is gated behind __DEV__ — zero console output in production APK.
 * Usage:
 * blobLog.info('Starting capture...');
 * blobLog.error('Upload failed', error);
 */

const TAG = '[BLOB_TRACE]';

export const blobLog = {
    info: (message: string, ...args: any[]) => {
        if (__DEV__) console.log(`${TAG} ℹ️ ${message}`, ...args);
    },
    warn: (message: string, ...args: any[]) => {
        if (__DEV__) console.warn(`${TAG} ⚠️ ${message}`, ...args);
    },
    error: (message: string, ...args: any[]) => {
        if (__DEV__) console.error(`${TAG} ❌ ${message}`, ...args);
    },
    success: (message: string, ...args: any[]) => {
        if (__DEV__) console.log(`${TAG} ✅ ${message}`, ...args);
    },
    step: (step: number, total: number, message: string) => {
        if (__DEV__) console.log(`${TAG} 🔄 Step ${step}/${total}: ${message}`);
    }
};
