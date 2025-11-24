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
import type { GPSData } from '../types';

class LocationServiceClass {
  private subscription: Location.LocationSubscription | null = null;
  private callback: ((location: GPSData) => void) | null = null;

  /**
   * Request location permissions from the user
   */
  async requestPermissions(): Promise<boolean> {
    console.log('📍 Requesting location permission...');
    
    const { status } = await Location.requestForegroundPermissionsAsync();
    const granted = status === 'granted';
    
    if (granted) {
      console.log('✅ Location permission granted');
    } else {
      console.log('❌ Location permission denied');
    }
    
    return granted;
  }

  /**
   * Start tracking location updates
   * 
   * @param callback - Function called with each location update
   */
  async startTracking(callback: (location: GPSData) => void): Promise<void> {
    console.log('🛰️  Starting location tracking...');
    
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

      console.log('✅ Location tracking started (1s interval, 0.1m distance)');
      
    } catch (error) {
      console.error('❌ Failed to start location tracking:', error);
      throw error;
    }
  }

  /**
   * Stop tracking location updates
   */
  stopTracking(): void {
    console.log('🛑 Stopping location tracking...');
    
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }
    
    this.callback = null;
    console.log('✅ Location tracking stopped');
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

      console.log('✅ GPS: %.6f, %.6f (acc: %.1fm)', gpsData.latitude, gpsData.longitude, gpsData.accuracy);
      return gpsData;
      
    } catch (error) {
      console.error('❌ Failed to get current location:', error);
      return null;
    }
  }
}

export const LocationService = new LocationServiceClass();