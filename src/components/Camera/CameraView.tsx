/**
 * ============================================================================
 * CameraView Component
 * ============================================================================
 * 
 * Main camera screen with all camera functionality.
 * 
 * FEATURES:
 * - Photo capture
 * - Video recording
 * - Mode switching
 * - Camera flip
 * - GPS integration
 * - Session management
 * - Real-time processing
 * 
 * PROPS:
 * - activeSession: CaptureSessionData | null - Current active session
 * - currentLocation: GPSData | null - Current GPS location
 * - onCapture: (capture: CapturedPhoto | CapturedVideo) => void
 * - onNavigate: (view: string) => void
 * 
 * USAGE:
 * <CameraView 
 *   activeSession={session}
 *   currentLocation={location}
 *   onCapture={handleCapture}
 * />
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, Text, TouchableOpacity, Animated } from 'react-native';
import { CameraView as ExpoCameraView } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { useCamera } from '../../hooks/useCamera';
import { CaptureButton } from './CaptureButton';
import { COLORS } from '../../constants/config';
import type { CapturedPhoto, CapturedVideo, CaptureSessionData, GPSData } from '../../types';

interface CameraViewProps {
  activeSession: CaptureSessionData | null;
  currentLocation: GPSData | null;
  onCapture: (capture: CapturedPhoto | CapturedVideo) => void;
  onNavigate: (view: string) => void;
}

export function CameraView({ 
  activeSession, 
  currentLocation, 
  onCapture,
  onNavigate 
}: CameraViewProps) {
  
  // ==========================================================================
  // HOOKS
  // ==========================================================================
  
  const {
    hasPermission,
    cameraReady,
    captureMode,
    isRecording,
    recordingDuration,
    cameraType,
    cameraRef,
    requestPermissions,
    setCameraReady,
    toggleMode,
    flipCamera,
    takePhoto,
    startRecording,
    stopRecording,
    processVideo,
  } = useCamera();

  // ==========================================================================
  // SIDEBAR STATE
  // ==========================================================================
  
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [sidebarAnim] = useState(new Animated.Value(-200)); // Start off-screen

  // ==========================================================================
  // TOGGLE SIDEBAR
  // ==========================================================================
  
  const toggleSidebar = () => {
    const toValue = sidebarVisible ? -200 : 0;
    
    Animated.spring(sidebarAnim, {
      toValue,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
    
    setSidebarVisible(!sidebarVisible);
  };

  // ==========================================================================
  // REQUEST PERMISSIONS
  // ==========================================================================
  
  useEffect(() => {
    requestPermissions();
  }, [requestPermissions]);

  // ==========================================================================
  // HANDLE CAPTURE
  // ==========================================================================
  
  const handleCapture = async () => {
    console.log('🔘 Capture button pressed');
    console.log('   Mode:', captureMode);
    console.log('   Active session:', activeSession?.id || 'NONE');
    console.log('   Current location:', currentLocation ? 'YES' : 'NO');
    console.log('   Camera ready:', cameraReady);
    console.log('   Is recording:', isRecording);

    if (!activeSession) {
      console.log('❌ No active session');
      Alert.alert('No Active Session', 'Please start a session first');
      return;
    }

    if (!currentLocation) {
      console.log('❌ No GPS location');
      Alert.alert('GPS Required', 'Waiting for GPS location...');
      return;
    }

    if (!cameraReady) {
      console.log('❌ Camera not ready');
      Alert.alert('Camera Not Ready', 'Please wait...');
      return;
    }

    try {
      if (captureMode === 'photo') {
        console.log('📸 Taking photo...');
        const photo = await takePhoto(currentLocation, activeSession.id);
        
        if (photo) {
          console.log('✅ Photo captured successfully');
          onCapture(photo);
          Alert.alert('✓ Photo Captured', 'Photo saved successfully');
        } else {
          console.log('❌ Photo capture returned null');
        }
        
      } else {
        if (!isRecording) {
          console.log('🎥 Starting video recording...');
          
          // Pass callback to handle video when recording completes
          const started = await startRecording(async (video) => {
            console.log('🎬 Video recording finished, processing...');
            await handleRecordingFinished(video);
          });
          
          if (!started) {
            console.log('❌ Recording failed to start');
            Alert.alert('Recording Failed', 'Could not start recording');
          } else {
            console.log('✅ Recording started');
          }
          
        } else {
          console.log('🛑 Stopping video recording...');
          await stopRecording(currentLocation, activeSession.id);
        }
      }
      
    } catch (error) {
      console.error('❌ Capture error:', error);
      Alert.alert('Capture Failed', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  // ==========================================================================
  // HANDLE VIDEO RECORDING FINISHED
  // ==========================================================================
  
  const handleRecordingFinished = async (video: any) => {
    if (!currentLocation || !activeSession) {
      console.log('❌ Missing location or session for video processing');
      return;
    }
    
    console.log('🎬 Video recording finished:', video.uri);
    
    const processedVideo = await processVideo(
      video.uri,
      currentLocation,
      activeSession.id
    );
    
    if (processedVideo) {
      console.log('✅ Video processed successfully');
      onCapture(processedVideo);
      Alert.alert('✓ Video Recorded', `Duration: ${processedVideo.duration}s`);
    } else {
      console.log('❌ Video processing failed');
    }
  };

  // ==========================================================================
  // RENDER: NO PERMISSION
  // ==========================================================================
  
  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Camera permission required</Text>
      </View>
    );
  }

  // ==========================================================================
  // RENDER: CAMERA VIEW
  // ==========================================================================
  
  return (
    <View style={styles.container}>
      {/* Camera Preview */}
      <ExpoCameraView
        ref={cameraRef}
        style={styles.camera}
        facing={cameraType}
        mode={captureMode === 'video' ? 'video' : 'picture'}
        onCameraReady={() => {
          console.log('📷 Camera ready');
          setCameraReady(true);
        }}
        onRecordingStatusChange={(status) => {
          if (status.isRecording === false && status.uri) {
            handleRecordingFinished(status);
          }
        }}
      />

      {/* Top Status Bar */}
      <LinearGradient
        colors={['rgba(0,0,0,0.7)', 'transparent']}
        style={styles.topBar}
      >
        {/* Session Info */}
        {activeSession && (
          <View style={styles.sessionBadge}>
            <Text style={styles.sessionText}>
              {activeSession.name} • {activeSession.totalAssets} captures
            </Text>
          </View>
        )}

        {/* GPS Status */}
        <View style={styles.gpsBadge}>
          <Text style={styles.gpsText}>
            {currentLocation 
              ? `📍 ${currentLocation.isRTK ? 'RTK' : 'GPS'} • ${currentLocation.accuracy?.toFixed(1) || 'N/A'}m`
              : '📍 Waiting...'}
          </Text>
        </View>
      </LinearGradient>

      {/* Collapsible Sidebar */}
      <Animated.View 
        style={[
          styles.sidebar,
          { transform: [{ translateX: sidebarAnim }] }
        ]}
      >
        <LinearGradient
          colors={[COLORS.glassDark, COLORS.glass]}
          style={styles.sidebarGradient}
        >
          <Text style={styles.sidebarTitle}>Controls</Text>
          
          {/* Mode Toggle */}
          <TouchableOpacity
            style={styles.sidebarButton}
            onPress={() => {
              console.log('🔄 Mode toggle pressed');
              toggleMode();
            }}
            disabled={isRecording}
          >
            <Text style={styles.sidebarButtonIcon}>
              {captureMode === 'photo' ? '🎥' : '📸'}
            </Text>
            <Text style={styles.sidebarButtonText}>
              {captureMode === 'photo' ? 'Video Mode' : 'Photo Mode'}
            </Text>
          </TouchableOpacity>

          {/* Flip Camera */}
          <TouchableOpacity
            style={styles.sidebarButton}
            onPress={() => {
              console.log('🔄 Flip camera pressed');
              flipCamera();
            }}
            disabled={isRecording}
          >
            <Text style={styles.sidebarButtonIcon}>🔄</Text>
            <Text style={styles.sidebarButtonText}>
              {cameraType === 'back' ? 'Front Camera' : 'Back Camera'}
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>

      {/* Sidebar Toggle Button */}
      <TouchableOpacity
        style={styles.sidebarToggle}
        onPress={toggleSidebar}
      >
        <Text style={styles.sidebarToggleIcon}>
          {sidebarVisible ? '◀' : '▶'}
        </Text>
      </TouchableOpacity>

      {/* Bottom Capture Area */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.bottomBar}
      >
        <View style={styles.captureContainer}>
          <CaptureButton
            mode={captureMode}
            isRecording={isRecording}
            disabled={!cameraReady || !activeSession || !currentLocation}
            recordingDuration={recordingDuration}
            onPress={handleCapture}
          />
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  camera: {
    flex: 1,
  },
  message: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: COLORS.text,
    fontSize: 16,
  },
  
  // ==========================================================================
  // TOP BAR
  // ==========================================================================
  
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 10,
  },
  sessionBadge: {
    backgroundColor: COLORS.glass,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  sessionText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '600',
  },
  gpsBadge: {
    backgroundColor: COLORS.glass,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  gpsText: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: '600',
  },
  
  // ==========================================================================
  // SIDEBAR
  // ==========================================================================
  
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 200,
    width: 180,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderColor: COLORS.glassBorder,
  },
  sidebarGradient: {
    padding: 16,
  },
  sidebarTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  sidebarButton: {
    backgroundColor: COLORS.backgroundDark,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  sidebarButtonIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  sidebarButtonText: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: '600',
  },
  sidebarToggle: {
    position: 'absolute',
    left: 0,
    top: '50%',
    marginTop: -30,
    backgroundColor: COLORS.primary,
    width: 40,
    height: 60,
    borderTopRightRadius: 30,
    borderBottomRightRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  sidebarToggleIcon: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  // ==========================================================================
  // BOTTOM BAR
  // ==========================================================================
  
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 40,
    paddingTop: 20,
  },
  captureContainer: {
    alignItems: 'center',
  },
});