/**
 * ============================================================================
 * indelible.blob - Main Application
 * ============================================================================
 * 
 * Decentralized photo/video verification platform using Walrus and Sui.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, ToastAndroid, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

// [NEW] DApp Kit & Query Imports
import { createNetworkConfig, SuiClientProvider, WalletProvider, useCurrentAccount } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Hooks
import { useSessions } from './src/hooks/useSessions';
import { useCapture } from './src/hooks/useCapture';
import { usePermissions } from './src/hooks/usePermissions';

// Components
import { VisionCameraView } from './src/components/Camera/VisionCameraView';
import { SessionList, SessionDetail, CaptureDetail } from './src/components/Library';
import { LoadingSpinner } from './src/components/UI';
import { DiagnosticsHub } from './src/components/Diagnostics/DiagnosticsHub';
import { LoginModal } from './src/components/Identity/LoginModal'; // [NEW]

// Services
import { LocationService } from './src/services/location';
import { IdentityService } from './src/services/identity';
import { SensorService } from './src/services/sensors';
import { blobLog } from './src/utils/logger';

// Types & Constants
import { COLORS, FONTS } from './src/constants/config';
import type { CapturedPhoto, CapturedVideo, GPSData, CaptureSessionData } from '@shared/types';

// =========================================================================
// SUI CONFIGURATION
// =========================================================================
const { networkConfig } = createNetworkConfig({
  testnet: { url: getFullnodeUrl('testnet') },
  mainnet: { url: getFullnodeUrl('mainnet') },
});
const queryClient = new QueryClient();

// =========================================================================
// ROOT APP COMPONENT (PROVIDERS)
// =========================================================================
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
        <WalletProvider>
          <IndelibleBlobApp />
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}

// =========================================================================
// MAIN LOGIC COMPONENT
// =========================================================================
function IndelibleBlobApp() {
  console.log('TRACE: [App.tsx] App rendering...');

  // Load Inter fonts
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // Navigation
  const [currentView, setCurrentView] = useState<'camera' | 'library' | 'session-detail' | 'capture-detail' | 'diagnostics'>('camera');

  // Selected items
  const [selectedSession, setSelectedSession] = useState<CaptureSessionData | null>(null);
  const [selectedCapture, setSelectedCapture] = useState<CapturedPhoto | CapturedVideo | null>(null);

  // Location
  const [currentLocation, setCurrentLocation] = useState<GPSData | null>(null);

  // Identity State
  const currentAccount = useCurrentAccount(); // [NEW] Real Wallet Account
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [identityLoading, setIdentityLoading] = useState(false);

  // Permissions
  const { permissions } = usePermissions();

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
  // INITIALIZE SERVICE LAYERS
  // ==========================================================================

  useEffect(() => {
    const initializeServices = async () => {
      if (!permissions.loading) {
        if (permissions.location) {
          LocationService.startTracking(setCurrentLocation).catch(e => console.error('LocTrack error', e));
        }
        try {
          await SensorService.startTracking();
        } catch (e) {
          console.warn('Sensor error', e);
        }
      }
    };

    initializeServices();

    return () => {
      LocationService.stopTracking();
      SensorService.stopTracking();
    };
  }, [permissions.loading, permissions.location]);

  // ==========================================================================
  // HANDLE START SESSION (REAL IDENTITY FLOW)
  // ==========================================================================

  const handleStartSession = useCallback(async () => {
    blobLog.info('🎬 Start Session button pressed');

    // Step 1: Layer A - Sui Authentication
    // Check if real wallet is connected via DApp Kit
    if (!currentAccount) {
      blobLog.info('   👤 Layer A: No Wallet Connected. Prompting login...');
      setLoginModalVisible(true);
      return;
    }

    // Step 2: Layer B - Hardware Binding (Cross-Chain)
    // Synchronize the DApp Kit account with our IdentityService and enforce Hardware Check
    try {
      setIdentityLoading(true);

      // ORCHESTRATION: This throws if "Session Bind" or "Hardware Check" fails.
      await IdentityService.initializeIdentity(currentAccount);

      const currentUser = IdentityService.getCurrentUser();
      const gradeMsg = currentUser?.provenanceGrade === 'GOLD'
        ? '🟢 Gold — Hardware Secured'
        : '🔵 Silver — Device Attested';

      blobLog.success(`   Identity Verified: ${gradeMsg}`);
      if (Platform.OS === 'android') ToastAndroid.show(gradeMsg, ToastAndroid.SHORT);

    } catch (e: any) {
      setIdentityLoading(false);
      Alert.alert('Identity Verification Failed', e.message);
      return;
    } finally {
      setIdentityLoading(false);
    }

    // Step 3: GPS check
    if (!currentLocation) {
      Alert.alert('GPS Required', 'Waiting for GPS location...');
      return;
    }

    // Step 4: Session guard
    if (activeSession) {
      Alert.alert('Session Active', 'End the current session first');
      return;
    }

    // Step 5: Start capture session
    const sessionName = `Session ${sessions.length + 1}`;
    blobLog.info(`   Creating session: ${sessionName}`);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await startSession(currentLocation, sessionName);
  }, [currentLocation, activeSession, sessions.length, startSession, currentAccount]);

  // ==========================================================================
  // HANDLE END SESSION
  // ==========================================================================

  const handleEndSession = useCallback(async () => {
    if (!activeSession) return;

    Alert.alert(
      'End Session',
      `End "${activeSession.name}" with ${activeSession.totalAssets} captures?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Session',
          style: 'destructive',
          onPress: async () => {
            blobLog.info('⏹️ Ending Session...');
            await endSession();
            await IdentityService.logout(); // Clear session binding
            blobLog.success('   ✅ Session Unbound.');
          },
        },
      ]
    );
  }, [activeSession, endSession]);

  // ==========================================================================
  // HANDLE CAPTURE
  // ==========================================================================

  const handleCapture = useCallback(async (capture: CapturedPhoto | CapturedVideo, isSovereign: boolean) => {
    blobLog.info(`📸 New capture received: ${capture.uri}`);
    addCapture(capture);

    try {
      await processCapture(capture, isSovereign, (status, updatedCapture) => {
        updateCapture(updatedCapture);
      });
    } catch (error: any) {
      console.error('❌ Capture processing failed:', error);
      if (error.message.includes('Strict Provenance')) {
        Alert.alert('⚠️ Integrity Check Failed', 'Hardware signature verification failed.');
      } else {
        Alert.alert('Processing Failed', error.message);
      }
    }
  }, [addCapture, processCapture, updateCapture]);

  // ==========================================================================
  // RENDERING
  // ==========================================================================

  if (sessionsLoading || !fontsLoaded || permissions.loading) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={[COLORS.backgroundDark, COLORS.background]} style={styles.gradient}>
          <LoadingSpinner size="large" message="Initializing..." />
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Main Content Area */}
      <MotiView
        key={currentView}
        from={{ opacity: 0, scale: 0.95, translateY: 10 }}
        animate={{ opacity: 1, scale: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 400 }}
        style={styles.content}
      >
        {currentView === 'camera' && (
          <View style={styles.cameraContainer}>
            <VisionCameraView
              activeSession={activeSession}
              currentLocation={currentLocation}
              locationPermission={permissions.location}
              hasCameraPermission={permissions.camera}
              sessionCount={sessions.length}
              onCapture={handleCapture}
              onNavigate={(view: any) => setCurrentView(view)}
              onStartSession={handleStartSession}
              onEndSession={handleEndSession}
            />
          </View>
        )}

        {currentView === 'diagnostics' && (
          <DiagnosticsHub onBack={() => setCurrentView('camera')} />
        )}

        {currentView === 'library' && (
          <LinearGradient colors={[COLORS.backgroundDark, COLORS.background]} style={styles.gradient}>
            <View style={styles.libraryHeader}>
              <TouchableOpacity style={styles.backButton} onPress={() => setCurrentView('camera')}>
                <Text style={styles.backButtonText}>← Camera</Text>
              </TouchableOpacity>
              <Text style={styles.libraryTitle}>Library</Text>
              <View style={styles.placeholder} />
            </View>
            <SessionList sessions={sessions} onSelectSession={setSelectedSession} onDeleteSession={deleteSession} />
          </LinearGradient>
        )}

        {currentView === 'session-detail' && selectedSession && (
          <SessionDetail
            session={selectedSession}
            onSelectCapture={setSelectedCapture}
            onBack={() => setCurrentView('library')}
            onDeleteSession={deleteSession}
          />
        )}

        {currentView === 'capture-detail' && selectedCapture && (
          <CaptureDetail capture={selectedCapture} onBack={() => setCurrentView('session-detail')} />
        )}
      </MotiView>

      {/* Processing Indicator */}
      {processingQueue.length > 0 && (
        <View style={styles.processingIndicator}>
          <Text style={styles.processingText}>
            ⚙️ Processing {processingQueue.length} capture{processingQueue.length > 1 ? 's' : ''}...
          </Text>
        </View>
      )}

      {/* Identity Loading Overlay */}
      {identityLoading && (
        <View style={styles.identityOverlay}>
          <LoadingSpinner size="large" message="Verifying Hardware Provenance..." />
        </View>
      )}

      {/* Login Modal */}
      <LoginModal
        visible={loginModalVisible}
        onClose={() => setLoginModalVisible(false)}
        onLoginSuccess={() => {
          setLoginModalVisible(false);
          handleStartSession(); // Retry start session after login
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
  },
  content: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  cameraContainer: {
    flex: 1,
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
  identityOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});