/**
 * ============================================================================
 * indelible.blob - Main Application
 * ============================================================================
 * 
 * Decentralized photo/video verification platform using Walrus and Sui.
 * 
 * ARCHITECTURE:
 * - Modular component-based design
 * - Custom hooks for business logic
 * - Service layer for external integrations
 * - Type-safe throughout
 * 
 * NAVIGATION:
 * - Camera: Capture photos and videos
 * - Library: Browse sessions and captures
 * - Session Detail: View captures in a session
 * - Capture Detail: Full metadata view
 * 
 * FEATURES:
 * - GPS-tagged captures
 * - Walrus decentralized storage
 * - Sui blockchain verification
 * - Session-based organization
 * - Persistent local storage
 */

import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

// Hooks
import { useSessions } from './src/hooks/useSessions';
import { useCapture } from './src/hooks/useCapture';

// Components
import { CameraView } from './src/components/Camera';
import { SessionList, SessionDetail, CaptureDetail } from './src/components/Library';
import { LoadingSpinner } from './src/components/UI';

// Services
import { LocationService } from './src/services/location';

// Types & Constants
import { COLORS } from './src/constants/config';
import type { CapturedPhoto, CapturedVideo, GPSData, CaptureSessionData } from './src/types';

export default function App() {
  
  // Navigation
  const [currentView, setCurrentView] = useState<'camera' | 'library' | 'session-detail' | 'capture-detail'>('camera');
  
  // Selected items
  const [selectedSession, setSelectedSession] = useState<CaptureSessionData | null>(null);
  const [selectedCapture, setSelectedCapture] = useState<CapturedPhoto | CapturedVideo | null>(null);
  
  // Location
  const [currentLocation, setCurrentLocation] = useState<GPSData | null>(null);
  const [locationPermission, setLocationPermission] = useState(false);

  // Hooks
  const { 
    sessions, 
    activeSession, 
    loading: sessionsLoading,
    startSession, 
    endSession, 
    addCapture,
    updateCapture,
    deleteSession 
  } = useSessions();

  const { 
    processCapture,
    processingQueue 
  } = useCapture();

  // ==========================================================================
  // INITIALIZE APP
  // ==========================================================================
  
  useEffect(() => {
    const initialize = async () => {
      console.log('🚀 indelible.blob initializing...');
      
      const granted = await LocationService.requestPermissions();
      setLocationPermission(granted);
      
      if (granted) {
        // Start location tracking
        LocationService.startTracking((location) => {
          setCurrentLocation(location);
        });
      }
      
      console.log('✅ indelible.blob ready!');
    };
    
    initialize();
    
    return () => {
      LocationService.stopTracking();
    };
  }, []);

  // ==========================================================================
  // HANDLE START SESSION (ANDROID-COMPATIBLE)
  // ==========================================================================
  
  const handleStartSession = useCallback(async () => {
    console.log('🎬 Start Session button pressed');
    console.log('   Current location:', currentLocation);
    console.log('   Active session:', activeSession);
    
    if (!currentLocation) {
      Alert.alert('GPS Required', 'Waiting for GPS location. Please wait or go outdoors for better signal.');
      return;
    }

    if (activeSession) {
      Alert.alert('Session Active', 'End the current session first');
      return;
    }

    // Auto-generate session name (Android doesn't support Alert.prompt)
    const sessionName = `Session ${sessions.length + 1}`;
    console.log('   Creating session:', sessionName);
    
    await startSession(currentLocation, sessionName);
  }, [currentLocation, activeSession, sessions.length, startSession]);

  // ==========================================================================
  // HANDLE END SESSION
  // ==========================================================================
  
  const handleEndSession = useCallback(() => {
    if (!activeSession) {
      Alert.alert('No Active Session', 'There is no active session to end');
      return;
    }

    Alert.alert(
      'End Session',
      `End "${activeSession.name}" with ${activeSession.totalAssets} captures?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Session',
          style: 'destructive',
          onPress: () => endSession(),
        },
      ]
    );
  }, [activeSession, endSession]);

  // ==========================================================================
  // HANDLE CAPTURE
  // ==========================================================================
  
  const handleCapture = useCallback(async (capture: CapturedPhoto | CapturedVideo) => {
    console.log('📸 New capture received:', capture.uri);
    
    addCapture(capture);
    
    await processCapture(capture, (status, updatedCapture) => {
      console.log(`Status update: ${status}`);
      updateCapture(updatedCapture);
    });
  }, [addCapture, processCapture, updateCapture]);

  // ==========================================================================
  // NAVIGATION HANDLERS
  // ==========================================================================
  
  const handleSelectSession = useCallback((session: CaptureSessionData) => {
    setSelectedSession(session);
    setCurrentView('session-detail');
  }, []);

  const handleSelectCapture = useCallback((capture: CapturedPhoto | CapturedVideo) => {
    setSelectedCapture(capture);
    setCurrentView('capture-detail');
  }, []);

  const handleBackToLibrary = useCallback(() => {
    setSelectedSession(null);
    setCurrentView('library');
  }, []);

  const handleBackToSession = useCallback(() => {
    setSelectedCapture(null);
    setCurrentView('session-detail');
  }, []);

  // ==========================================================================
  // RENDER: LOADING
  // ==========================================================================
  
  if (sessionsLoading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[COLORS.backgroundDark, COLORS.background]}
          style={styles.gradient}
        >
          <LoadingSpinner size="large" message="Loading indelible.blob..." />
        </LinearGradient>
      </View>
    );
  }

  // ==========================================================================
  // RENDER: MAIN APP
  // ==========================================================================
  
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {currentView === 'camera' && (
        <View style={styles.cameraContainer}>
          <CameraView
            activeSession={activeSession}
            currentLocation={currentLocation}
            onCapture={handleCapture}
            onNavigate={setCurrentView}
          />
          
          {/* Bottom Navigation */}
          <View style={styles.bottomNav}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => setCurrentView('library')}
            >
              <Text style={styles.navButtonText}>📚 Library ({sessions.length})</Text>
            </TouchableOpacity>
            
            {activeSession ? (
              <TouchableOpacity
                style={[styles.navButton, styles.navButtonDanger]}
                onPress={handleEndSession}
              >
                <Text style={styles.navButtonText}>⏹️  End Session</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.navButton, styles.navButtonPrimary]}
                onPress={handleStartSession}
                disabled={!locationPermission || !currentLocation}
              >
                <Text style={styles.navButtonText}>
                  {!locationPermission ? '📍 GPS Required' : !currentLocation ? '📍 Waiting...' : '▶️  Start Session'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {currentView === 'library' && (
        <LinearGradient
          colors={[COLORS.backgroundDark, COLORS.background]}
          style={styles.gradient}
        >
          <View style={styles.libraryHeader}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setCurrentView('camera')}
            >
              <Text style={styles.backButtonText}>← Camera</Text>
            </TouchableOpacity>
            <Text style={styles.libraryTitle}>Library</Text>
            <View style={styles.placeholder} />
          </View>

          <SessionList
            sessions={sessions}
            onSelectSession={handleSelectSession}
            onDeleteSession={deleteSession}
          />
        </LinearGradient>
      )}

      {currentView === 'session-detail' && selectedSession && (
        <SessionDetail
          session={selectedSession}
          onSelectCapture={handleSelectCapture}
          onBack={handleBackToLibrary}
          onDeleteSession={deleteSession}
        />
      )}

      {currentView === 'capture-detail' && selectedCapture && (
        <CaptureDetail
          capture={selectedCapture}
          onBack={handleBackToSession}
        />
      )}

      {processingQueue.length > 0 && (
        <View style={styles.processingIndicator}>
          <Text style={styles.processingText}>
            ⚙️ Processing {processingQueue.length} capture{processingQueue.length > 1 ? 's' : ''}...
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  gradient: {
    flex: 1,
  },
  cameraContainer: {
    flex: 1,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 20,
    backgroundColor: 'transparent',
  },
  navButton: {
    width: '30%',
    maxWidth: 120,
    backgroundColor: COLORS.glass,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  navButtonPrimary: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  navButtonDanger: {
    backgroundColor: COLORS.error,
    borderColor: COLORS.error,
  },
  navButtonText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  libraryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  libraryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  placeholder: {
    width: 60,
  },
  processingIndicator: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: COLORS.info,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  processingText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
});