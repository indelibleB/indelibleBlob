/**
 * ============================================================================
 * indelible.blob - Main Application
 * ============================================================================
 * 
 * Decentralized photo/video verification platform using Walrus and Sui.
 */

import 'react-native-get-random-values'; // Required crypto polyfill for WalletConnect v2
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, ToastAndroid, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

// Sui Wallet Context (replaces @mysten/dapp-kit)
import { SuiWalletProvider, useSuiWallet } from './src/contexts/SuiWalletContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

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
import { SettingsScreen } from './src/components/Settings/SettingsScreen'; // [NEW]
import { GovernanceScreen } from './src/components/Governance/GovernanceScreen'; // [NEW]
import { ProposalDetailScreen, GovernanceProposal } from './src/components/Governance/ProposalDetailScreen'; // [NEW]

// Services
import { LocationService } from './src/services/location';
import { IdentityService } from './src/services/identity';
import { SensorService } from './src/services/sensors';
import { blobLog } from './src/utils/logger';

// Types & Constants
import { COLORS, FONTS } from './src/constants/config';
import type { CapturedPhoto, CapturedVideo, GPSData, CaptureSessionData } from '@shared/types';



// Keep native splash screen visible until fonts are loaded
SplashScreen.preventAutoHideAsync();

// =========================================================================
// ROOT APP COMPONENT (PROVIDERS)
// =========================================================================
export default function App() {
  return (
    <SafeAreaProvider>
      <SuiWalletProvider network="testnet">
        <IndelibleBlobApp />
      </SuiWalletProvider>
    </SafeAreaProvider>
  );
}

// =========================================================================
// MAIN LOGIC COMPONENT
// =========================================================================
function IndelibleBlobApp() {

  // Load Inter fonts
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // Navigation
  const [currentView, setCurrentView] = useState<'camera' | 'library' | 'session-detail' | 'capture-detail' | 'diagnostics' | 'settings' | 'governance' | 'proposal-detail'>('camera');

  // Selected items
  const [selectedSession, setSelectedSession] = useState<CaptureSessionData | null>(null);
  const [selectedCapture, setSelectedCapture] = useState<CapturedPhoto | CapturedVideo | null>(null);
  const [selectedProposal, setSelectedProposal] = useState<GovernanceProposal | null>(null);

  // Location
  const [currentLocation, setCurrentLocation] = useState<GPSData | null>(null);
  const currentLocationRef = useRef<GPSData | null>(null);

  // Identity State
  const { address: currentAddress } = useSuiWallet();
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
          LocationService.startTracking((loc) => {
            currentLocationRef.current = loc;
            setCurrentLocation(loc); // [FIX] Trigger re-render
          }).catch(e => console.error('LocTrack error', e));
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

  const handleStartSession = useCallback(async (overrideAddress?: string) => {
    const currentLocation = currentLocationRef.current;
    blobLog.info('🎬 Start Session button pressed');

    // Validate overrideAddress is actually a string (button onPress passes touch event as first arg)
    const validOverride = typeof overrideAddress === 'string' ? overrideAddress : undefined;
    const addrToUse = validOverride || currentAddress;

    // Step 1: Layer A - Sui Wallet Binding (Metadata Identity)
    // First bind the person's Sui identity for on-chain provenance recording
    if (!addrToUse) {
      blobLog.info('   👤 Layer A: Hardware binding queued — Now connecting Sui wallet for metadata layer...');
      setLoginModalVisible(true);
      return;
    }

    // Step 2: Layer B - Hardware Binding (Device Attestation)
    // Prove the device via MWA Seed Vault / TEEPIN signature now that we have the Sui address
    try {
      setIdentityLoading(true);
      blobLog.info('   🔐 Layer B: Initiating Hardware Bind (Seed Vault)...');

      await IdentityService.initializeIdentity({ address: addrToUse });

      const currentUser = IdentityService.getCurrentUser();
      const gradeMsg = currentUser?.provenanceGrade === 'GOLD'
        ? '🟢 Gold — Hardware Secured'
        : '🔵 Silver — Device Attested';

      blobLog.success(`   Identity Verified: ${gradeMsg}`);
      if (Platform.OS === 'android') ToastAndroid.show(gradeMsg, ToastAndroid.SHORT);

    } catch (e: any) {
      setIdentityLoading(false);
      Alert.alert('Hardware Verification Failed', e.message);
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
  }, [activeSession, sessions.length, startSession, currentAddress]);

  // ==========================================================================
  // HANDLE END SESSION
  // ==========================================================================

  const handleEndSession = useCallback(async () => {
    if (!activeSession) return;

    // Block ending session while captures are still processing
    if (processingQueue.length > 0) {
      Alert.alert(
        'Processing In Progress',
        `${processingQueue.length} capture(s) still processing. Please wait for them to finish before ending the session.`
      );
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
          onPress: async () => {
            blobLog.info('⏹️ Ending Session...');
            await endSession();
            await IdentityService.logout();
            blobLog.success('   ✅ Session Unbound.');
          },
        },
      ]
    );
  }, [activeSession, endSession, processingQueue.length]);

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
  // SPLASH SCREEN — Hide when all assets are ready
  // ==========================================================================

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // ==========================================================================
  // RENDERING
  // ==========================================================================

  if (!fontsLoaded) {
    return null;
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
              processingCount={processingQueue.length}
              onCapture={handleCapture}
              onNavigate={(view: any) => setCurrentView(view)}
              onStartSession={handleStartSession}
              onEndSession={handleEndSession}
              isActive={!loginModalVisible && !identityLoading} // [NEW] Pause camera during auth
            />
          </View>
        )}

        {currentView === 'diagnostics' && (
          <DiagnosticsHub onBack={() => setCurrentView('camera')} />
        )}

        {currentView === 'settings' && (
          <SettingsScreen onBack={() => setCurrentView('camera')} />
        )}

        {currentView === 'governance' && (
          <GovernanceScreen
            onBack={() => setCurrentView('camera')}
            onViewProposal={(proposal) => {
              setSelectedProposal(proposal);
              setCurrentView('proposal-detail');
            }}
          />
        )}

        {currentView === 'proposal-detail' && selectedProposal && (
          <ProposalDetailScreen
            proposal={selectedProposal}
            onBack={() => setCurrentView('governance')}
          />
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
            <SessionList sessions={sessions} onSelectSession={(session) => { setSelectedSession(session); setCurrentView('session-detail'); }} onDeleteSession={deleteSession} />
          </LinearGradient>
        )}

        {currentView === 'session-detail' && selectedSession && (
          <SessionDetail
            session={selectedSession}
            onSelectCapture={(capture) => { setSelectedCapture(capture); setCurrentView('capture-detail'); }}
            onBack={() => setCurrentView('library')}
            onDeleteSession={deleteSession}
          />
        )}

        {currentView === 'capture-detail' && selectedCapture && (
          <CaptureDetail capture={selectedCapture} onBack={() => setCurrentView('session-detail')} />
        )}
      </MotiView>


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
        onLoginSuccess={(newAddress) => {
          setLoginModalVisible(false);
          handleStartSession(newAddress); // Use explicit arg to prevent closure bugs
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
  identityOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
