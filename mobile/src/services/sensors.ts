import { Magnetometer, Accelerometer, MagnetometerMeasurement, AccelerometerMeasurement } from 'expo-sensors';
import { Subscription } from 'expo-modules-core';
import { SensorData } from '@shared/types';
import { blobLog } from '../utils/logger';

class SensorServiceClass {
    private magnetometerSubscription: Subscription | null = null;
    private accelerometerSubscription: Subscription | null = null;

    private lastMagnetometer: MagnetometerMeasurement | null = null;
    private lastAccelerometer: AccelerometerMeasurement | null = null;
    private currentHeading: number = 0;

    /**
     * Start listening to sensors
     */
    async startTracking() {
        blobLog.info('🧲 Starting hardware sensors (Magnetometer & Accelerometer)...');

        // Set update intervals
        Magnetometer.setUpdateInterval(100);
        Accelerometer.setUpdateInterval(100);

        // Subscribe to Magnetometer (for Heading)
        this.magnetometerSubscription = Magnetometer.addListener(data => {
            this.lastMagnetometer = data;
            // Simple heading calculation from magnetometer data
            const { x, y } = data;
            let angle = Math.atan2(y, x) * (180 / Math.PI);
            if (angle < 0) angle += 360;
            this.currentHeading = angle;
        });

        // Subscribe to Accelerometer (for Orientation)
        this.accelerometerSubscription = Accelerometer.addListener(data => {
            this.lastAccelerometer = data;
        });
    }

    /**
     * Stop listening to sensors
     */
    stopTracking() {
        blobLog.info('🧲 Stopping hardware sensors...');
        this.magnetometerSubscription?.remove();
        this.accelerometerSubscription?.remove();
        this.magnetometerSubscription = null;
        this.accelerometerSubscription = null;
    }

    /**
     * Get the current instantaneous sensor state
     */
    getSensorData(): SensorData | undefined {
        if (!this.lastMagnetometer || !this.lastAccelerometer) {
            return undefined;
        }

        return {
            accelerometer: {
                x: this.lastAccelerometer.x,
                y: this.lastAccelerometer.y,
                z: this.lastAccelerometer.z,
            },
            magnetometer: {
                x: this.lastMagnetometer.x,
                y: this.lastMagnetometer.y,
                z: this.lastMagnetometer.z,
            },
            compassHeading: this.currentHeading,
        };
    }
}

export const SensorService = new SensorServiceClass();
