/**
 * ============================================================================
 * Standardized Logging Utility
 * ============================================================================
 * 
 * Ensures all app logs are easily filterable in the WSL terminal via adb logcat.
 * Usage: 
 * blobLog.info('Starting capture...');
 * blobLog.error('Upload failed', error);
 */

const TAG = '[BLOB_TRACE]';

export const blobLog = {
    info: (message: string, ...args: any[]) => {
        console.log(`${TAG} ℹ️ ${message}`, ...args);
    },
    warn: (message: string, ...args: any[]) => {
        console.warn(`${TAG} ⚠️ ${message}`, ...args);
    },
    error: (message: string, ...args: any[]) => {
        console.error(`${TAG} ❌ ${message}`, ...args);
    },
    success: (message: string, ...args: any[]) => {
        console.log(`${TAG} ✅ ${message}`, ...args);
    },
    step: (step: number, total: number, message: string) => {
        console.log(`${TAG} 🔄 Step ${step}/${total}: ${message}`);
    }
};
