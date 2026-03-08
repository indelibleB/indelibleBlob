/**
 * ============================================================================
 * Location Service
 * ============================================================================
 * 
 * Handles GPS location tracking with high accuracy.
 * 
 * FEATURES:
 * - Request location permissions
 * - Start/stop location tracking
 * - High-accuracy GPS mode
 * - RTK support detection
 * - Real-time location updates
 */

import * as Location from 'expo-location';
import type { GPSData } from '@shared/types';
import { blobLog } from '../utils/logger';

class LocationServiceClass {
  private subscription: Location.LocationSubscription | null = null;
  private callback: ((location: GPSData) => void) | null = null;

  /**
   * Request location permissions from the user
   */
  async requestPermissions(): Promise<boolean> {
    blobLog.info('📍 Checking location permission...');

    // First check if already granted (handles Android activity restarts)
    const existing = await Location.getForegroundPermissionsAsync();
    if (existing.status === 'granted') {
      blobLog.success('Location permission already granted');
      return true;
    }

    // Not yet granted — request it
    blobLog.info('📍 Requesting location permission from user...');
    const { status } = await Location.requestForegroundPermissionsAsync();
    const granted = status === 'granted';

    if (granted) {
      blobLog.success('Location permission granted');
    } else {
      blobLog.error('Location permission denied');
    }

    return granted;
  }

  /**
   * Start tracking location updates
   * 
   * @param callback - Function called with each location update
   */
  async startTracking(callback: (location: GPSData) => void): Promise<void> {
    blobLog.info('Starting location tracking...');

    this.callback = callback;

    try {
      // Configure high-accuracy tracking
      this.subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation, // Highest accuracy
          timeInterval: 1000, // Update every 1 second
          distanceInterval: 0.1, // Update every 0.1 meters
        },
        (location) => {
          const gpsData: GPSData = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            altitude: location.coords.altitude || 0,
            accuracy: location.coords.accuracy || 999,
            heading: location.coords.heading || 0,
            speed: location.coords.speed || 0,
            timestamp: location.timestamp,
            isRTK: (location.coords.accuracy || 999) < 0.1, // RTK if accuracy < 10cm
          };

          // Call the callback with processed data
          if (this.callback) {
            this.callback(gpsData);
          }
        }
      );

      blobLog.success('Location tracking started (1s interval, 0.1m distance)');

    } catch (error) {
      blobLog.error('Failed to start location tracking', error);
      throw error;
    }
  }

  /**
   * Stop tracking location updates
   */
  stopTracking(): void {
    if (!this.subscription && !this.callback) return;

    blobLog.info('🛑 Stopping location tracking...');
    try {
      if (this.subscription) {
        this.subscription.remove();
        this.subscription = null;
      }
    } catch (e) {
      blobLog.warn('Error removing location subscription', e);
    }

    this.callback = null;
  }

  /**
   * Get current location once (no tracking)
   */
  async getCurrentLocation(): Promise<GPSData | null> {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });

      const gpsData: GPSData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        altitude: location.coords.altitude || 0,
        accuracy: location.coords.accuracy || 999,
        heading: location.coords.heading || 0,
        speed: location.coords.speed || 0,
        timestamp: location.timestamp,
        isRTK: (location.coords.accuracy || 999) < 0.1,
      };

      blobLog.success(`GPS: ${gpsData.latitude.toFixed(6)}, ${gpsData.longitude.toFixed(6)} (acc: ${gpsData.accuracy.toFixed(1)}m)`);
      return gpsData;

    } catch (error) {
      blobLog.error('Failed to get current location:', error);
      return null;
    }
  }
}

export const LocationService = new LocationServiceClass();