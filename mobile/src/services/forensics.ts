/**
 * ============================================================================
 * SENSOR FORENSICS SERVICE
 * ============================================================================
 * 
 * Correlates physical sensors (IMU) with digital sensors (GPS) to detect
 * sophisticated spoofing attempts.
 */

import { SensorData, GPSData } from '@shared/types';
import { blobLog } from '../utils/logger';

export interface ForensicsResult {
    isValid: boolean;
    confidence: number; // 0 to 100
    anomalies: string[];
}

class SensorForensicsClass {
    /**
     * Correlate Accelerometer data with GPS velocity/movement
     */
    async validateMovement(sensorData: SensorData, gpsData: GPSData, lastGpsData?: GPSData): Promise<ForensicsResult> {
        const anomalies: string[] = [];
        let confidence = 100;

        // 1. Static Device Check (GPS Moving but Accelerometer Static)
        // Most GPS spoofers (mock location apps) inject moving coordinates while the phone sits on a desk.
        const isMovingGps = lastGpsData ? this.calculateDistance(gpsData, lastGpsData) > 0.0001 : false; // ~10 meters

        // High-pass filter for accelerometer to detect human hand tremors or movement
        // Acceleration values < 1.0 (earth gravity) + slight threshold usually mean relative stillness
        const totalAccel = Math.sqrt(Math.pow(sensorData.accelerometer.x, 2) + Math.pow(sensorData.accelerometer.y, 2) + Math.pow(sensorData.accelerometer.z, 2));
        const isMovingIMU = totalAccel > 1.1 || totalAccel < 0.9; // 10% variance from rest

        if (isMovingGps && !isMovingIMU) {
            confidence -= 60;
            anomalies.push('GPS Movement detected without corresponding Physical Motion (Potential Spoofing)');
        }

        // 2. Compass vs GPS Bearing
        // If the device is moving North but the compass is fixed East (and not rotating), it's a minor signal mismatch
        // (This is less reliable but adds to the forensic weight)

        return {
            isValid: confidence > 50,
            confidence,
            anomalies,
        };
    }

    /**
     * [STAGE 3] Depth Map Validation
     * Checks if the capture includes authentic depth metadata (LiDAR/ToF).
     */
    async validateDepth(depthData?: { minDepth: number; maxDepth: number; variance: number; hasDepthMap: boolean }): Promise<ForensicsResult> {
        const anomalies: string[] = [];
        let confidence = 100;

        if (!depthData || !depthData.hasDepthMap) {
            // [POLICY] No Depth Data = SILVER Grade Max (Cannot prove 3D)
            return { isValid: true, confidence: 50, anomalies: ['No Depth Map (2D Screen check impossible)'] };
        }

        // 1. "Flatness" Check (Screen Detection)
        // If variance is near 0, it means all pixels are at the same distance (e.g., photo of a screen or wall).
        // A real 3D scene usually has variance > 0.5 meters.
        if (depthData.variance < 0.1) {
            confidence -= 80;
            anomalies.push('Depth Variance too low (Potential 2D Screen or Flat Surface)');
        }

        // 2. Validity Range
        if (depthData.maxDepth <= 0 || depthData.maxDepth === Infinity) {
            confidence -= 40;
            anomalies.push('Invalid Depth Range');
        }

        return {
            isValid: confidence > 60,
            confidence,
            anomalies
        };
    }

    private calculateDistance(p1: GPSData, p2: GPSData): number {
        // Simple Haversine or Euclidean approximation for micro-distances
        return Math.sqrt(Math.pow(p1.latitude - p2.latitude, 2) + Math.pow(p1.longitude - p2.longitude, 2));
    }
}

export const SensorForensics = new SensorForensicsClass();
