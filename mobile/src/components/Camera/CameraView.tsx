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
import { View, StyleSheet, Alert, Text, TouchableOpacity, Animated, ScrollView, Linking } from 'react-native';
import { CameraView as ExpoCameraView } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { useCamera } from '../../hooks/useCamera';
import { CaptureButton } from './CaptureButton';
import { COLORS } from '../../constants/config';
import type { CapturedPhoto, CapturedVideo, CaptureSessionData, GPSData } from '@shared/types';
import { IdentityService } from '../../services/identity';
import { blobLog } from '../../utils/logger';

interface CameraViewProps {
  activeSession: CaptureSessionData | null;
  currentLocation: GPSData | null;
  onCapture: (capture: CapturedPhoto | CapturedVideo, isSovereign: boolean) => void;
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
  const [isSovereign, setIsSovereign] = useState(false);

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
    blobLog.info('🔘 Capture button pressed');
    blobLog.info('   Mode:', captureMode);
    blobLog.info('   Active session:', activeSession?.id || 'NONE');
    blobLog.info('   Current location:', currentLocation ? 'YES' : 'NO');
    blobLog.info('   Camera ready:', cameraReady);
    blobLog.info('   Is recording:', isRecording);

    if (!activeSession) {
      blobLog.info('❌ No active session');
      Alert.alert('No Active Session', 'Please start a session first');
      return;
    }

    if (!currentLocation) {
      blobLog.info('❌ No GPS location');
      Alert.alert('GPS Required', 'Waiting for GPS location...');
      return;
    }

    if (!cameraReady) {
      blobLog.info('❌ Camera not ready');
      Alert.alert('Camera Not Ready', 'Please wait...');
      return;
    }

    try {
      if (captureMode === 'photo') {
        blobLog.info('📸 Taking photo...');
        const photo = await takePhoto(currentLocation, activeSession.id);

        if (photo) {
          blobLog.info('✅ Photo captured successfully');
          onCapture(photo, isSovereign);
          Alert.alert('✓ Photo Captured', isSovereign ? 'Encrypted via Sovereign Mode' : 'Saved successfully');
        } else {
          blobLog.info('❌ Photo capture returned null');
        }

      } else {
        if (!isRecording) {
          blobLog.info('🎥 Starting video recording...');

          // Pass callback to handle video when recording completes
          const started = await startRecording(async (video) => {
            blobLog.info('🎬 Video recording finished, processing...');
            await handleRecordingFinished(video);
          });

          if (!started) {
            blobLog.info('❌ Recording failed to start');
            Alert.alert('Recording Failed', 'Could not start recording');
          } else {
            blobLog.info('✅ Recording started');
          }

        } else {
          blobLog.info('🛑 Stopping video recording...');
          await stopRecording(currentLocation, activeSession.id);
        }
      }

    } catch (error) {
      blobLog.error('❌ Capture error:', error);
      Alert.alert('Capture Failed', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  // ==========================================================================
  // HANDLE VIDEO RECORDING FINISHED
  // ==========================================================================

  const handleRecordingFinished = async (video: any) => {
    if (!currentLocation || !activeSession) {
      blobLog.info('❌ Missing location or session for video processing');
      return;
    }

    blobLog.info('🎬 Video recording finished:', video.uri);

    const processedVideo = await processVideo(
      video.uri,
      currentLocation,
      activeSession.id
    );

    if (processedVideo) {
      blobLog.info('✅ Video processed successfully');
      onCapture(processedVideo, isSovereign);
      Alert.alert('✓ Video Recorded', isSovereign ? 'Encrypted via Sovereign Mode' : `Duration: ${processedVideo.duration}s`);
    } else {
      blobLog.info('❌ Video processing failed');
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
          blobLog.info('📷 Camera ready');
          setCameraReady(true);
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
              blobLog.info('🔄 Mode toggle pressed');
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
              blobLog.info('🔄 Flip camera pressed');
              flipCamera();
            }}
            disabled={isRecording}
          >
            <Text style={styles.sidebarButtonIcon}>🔄</Text>
            <Text style={styles.sidebarButtonText}>
              {cameraType === 'back' ? 'Front Camera' : 'Back Camera'}
            </Text>
          </TouchableOpacity>

          {/* Connectivity Diagnostics */}
          <TouchableOpacity
            style={[styles.sidebarButton, { borderColor: COLORS.primary }]}
            onPress={() => {
              blobLog.info('🔍 Diagnostics button pressed');
              onNavigate('diagnostics');
            }}
          >
            <Text style={styles.sidebarButtonIcon}>📡</Text>
            <Text style={styles.sidebarButtonText}>Diagnostics</Text>
          </TouchableOpacity>

          {/* Sovereign Mode Toggle */}
          <TouchableOpacity
            style={[
              styles.sidebarButton,
              isSovereign && styles.sidebarButtonActive
            ]}
            onPress={() => {
              blobLog.info('🛡️ Sovereign toggle pressed:', !isSovereign);
              setIsSovereign(!isSovereign);
            }}
          >
            <Text style={styles.sidebarButtonIcon}>
              {isSovereign ? '🛡️' : '🔓'}
            </Text>
            <Text style={[
              styles.sidebarButtonText,
              isSovereign && styles.sidebarButtonTextActive
            ]}>
              {isSovereign ? 'Sovereign: ON' : 'Sovereign: OFF'}
            </Text>
          </TouchableOpacity>

          <View style={styles.sidebarDivider} />

          {/* Account Info */}
          <View style={styles.accountSection}>
            <Text style={styles.sidebarLabel}>IDENTITY STATUS</Text>

            {IdentityService.getCurrentUser() ? (
              <>
                <View style={styles.accountCard}>
                  <View style={styles.accountHeader}>
                    <Text style={styles.accountMethod}>
                      {IdentityService.getCurrentUser()?.method === 'mwa' ? '🟢 Solana Seeker' : '🔵 Sui zkLogin'}
                    </Text>
                    <Text style={styles.accountStatus}>CONNECTED</Text>
                  </View>
                  <Text style={styles.accountAddress} numberOfLines={1} ellipsizeMode="middle">
                    {IdentityService.getCurrentUser()?.solanaAddress}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.disconnectButton}
                  onPress={() => {
                    blobLog.info('CameraView', 'Disconnecting wallet...');
                    IdentityService.logout();
                    onNavigate('camera'); // Refresh view
                    setSidebarVisible(false);
                    Alert.alert('Disconnected', 'Identity session ended.');
                  }}
                >
                  <Text style={styles.disconnectText}>Disconnect Identity</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.accountCard}>
                <Text style={[styles.accountMethod, { color: COLORS.textSecondary }]}>Guest Mode</Text>
                <Text style={[styles.accountAddress, { color: COLORS.textSecondary, fontStyle: 'italic' }]}>
                  No Identity Connected
                </Text>
              </View>
            )}
          </View>

          {/* Sovereign Info Help */}
          <TouchableOpacity
            style={styles.infoButton}
            onPress={() => {
              Alert.alert(
                '🛡️ Sovereign Mode',
                'Your data, your rules. In Sovereign Mode, captures are encrypted on-device using your Identity. Only YOU verify who gets access.',
                [
                  { text: 'Got it', style: 'cancel' },
                  {
                    text: 'Learn More',
                    onPress: () => Linking.openURL('https://indelible-blob.com/#/sovereign-guide')
                  }
                ]
              );
            }}
          >
            <Text style={styles.infoText}>What is Sovereign Mode? ⓘ</Text>
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
  sidebarButtonActive: {
    backgroundColor: COLORS.primary + '40', // 25% opacity
    borderColor: COLORS.primary,
  },
  sidebarButtonTextActive: {
    color: COLORS.primary,
  },
  sidebarDivider: {
    height: 1,
    backgroundColor: COLORS.glassBorder,
    marginVertical: 16,
  },
  sidebarLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 8,
    letterSpacing: 1,
  },
  accountSection: {
    gap: 8,
  },
  accountCard: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  accountAddress: {
    color: COLORS.text,
    fontSize: 12,
    fontFamily: 'monospace',
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  accountMethod: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: 'bold',
  },
  accountStatus: {
    color: COLORS.success,
    fontSize: 9,
    fontWeight: 'bold',
  },
  disconnectButton: {
    marginTop: 8,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 69, 58, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 58, 0.3)',
    alignItems: 'center',
  },
  disconnectText: {
    color: '#FF453A',
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoButton: {
    marginTop: 20,
    paddingBottom: 20,
  },
  infoText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontStyle: 'italic',
    textAlign: 'center',
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