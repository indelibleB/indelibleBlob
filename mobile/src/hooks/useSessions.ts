/*  ============
* useSessions Hook
* ============================================================================
* 
* Manages capture session state and operations.
* 
* RESPONSIBILITIES:
* - Load sessions from storage on mount
* - Create new capture sessions
* - End active sessions
* - Add captures to sessions
* - Persist sessions to storage
* 
* USAGE:
* const { sessions, activeSession, startSession, endSession, addCapture } = useSessions();
*/

import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { StorageService } from '../services/storage';
import { TrustManager } from '../services/trust';
import { IdentityService } from '../services/identity';
import { SkrService } from '../services/skr';
import type { CaptureSessionData, CapturedPhoto, CapturedVideo, GPSData } from '@shared/types';

export function useSessions() {
  // ============================================================================
  // STATE
  // ============================================================================

  const [sessions, setSessions] = useState<CaptureSessionData[]>([]);
  const [activeSession, setActiveSession] = useState<CaptureSessionData | null>(null);
  const [loading, setLoading] = useState(true);

  // ============================================================================
  // LOAD SESSIONS ON MOUNT
  // ============================================================================

  useEffect(() => {
    const loadSessions = async () => {
      console.log('📚 Loading sessions from storage...');
      const loadedSessions = await StorageService.loadSessions();
      setSessions(loadedSessions);
      setLoading(false);
      console.log(`✅ Loaded ${loadedSessions.length} sessions`);
    };

    loadSessions();
  }, []);

  // ============================================================================
  // PERSIST SESSIONS WHENEVER THEY CHANGE
  // ============================================================================

  useEffect(() => {
    if (!loading && sessions.length > 0) {
      StorageService.saveSessions(sessions);
      console.log(`💾 Saved ${sessions.length} sessions to storage`);
    }
  }, [sessions, loading]);

  // ============================================================================
  // START NEW SESSION
  // ============================================================================

  // ============================================================================
  // START NEW SESSION
  // ============================================================================

  const startSession = useCallback(async (location: GPSData, sessionName?: string) => {
    console.log('🎬 Starting new capture session...');

    // 1. TEEPIN / SKR Commerce Gating
    const profile = await TrustManager.getDeviceProfile();
    const currentUser = IdentityService.getCurrentUser();

    let availableCaptures: number | 'Infinity' = 0;

    if (profile.grade === 'GOLD') {
      // Seeker Device = Unlimited Free Captures
      console.log('🛡️  GOLD Grade Detected: Unlimited free captures granted.');
      availableCaptures = 'Infinity';
    } else {
      // Non-Seeker = Requires SKR Balance
      if (!currentUser?.solanaAddress) {
        Alert.alert('Wallet Required', 'Please connect a Solana wallet to pay for captures.');
        return null;
      }

      console.log('🪙 Reading SKR balance for Non-Seeker device...');
      const skrAfforded = await SkrService.getAvailableCaptures(currentUser.solanaAddress);

      if (skrAfforded <= 0) {
        Alert.alert('Insufficient SKR', 'You need SKR tokens to capture on a non-Seeker device. Please top up your wallet.');
        return null;
      }

      availableCaptures = skrAfforded;
      console.log(`🪙 Authorized for ${availableCaptures} paid captures.`);
    }

    const newSession: CaptureSessionData = {
      id: `session_${Date.now()}`,
      name: sessionName || `Session ${sessions.length + 1}`,
      startTime: Date.now(),
      endTime: null,
      location,
      photos: [],
      videos: [],
      totalAssets: 0,
      status: 'active',
      availableCaptures,
      capturesConsumed: 0,
      paymentPending: false,
    };

    setActiveSession(newSession);
    setSessions(prev => [newSession, ...prev]);

    console.log(`✅ Session started: ${newSession.name}`);
    Alert.alert('Session Started', `${newSession.name} is now active.`);

    return newSession;
  }, [sessions.length]);

  // ============================================================================
  // END ACTIVE SESSION
  // ============================================================================

  const endSession = useCallback(async () => {
    if (!activeSession) {
      Alert.alert('No Active Session', 'There is no active session to end');
      return;
    }

    console.log(`🏁 Ending session: ${activeSession.name}`);

    // Get the latest session data from sessions array
    const currentSession = sessions.find(s => s.id === activeSession.id);
    if (!currentSession) {
      console.error('❌ Active session not found in sessions array');
      return;
    }

    const totalCaptures = currentSession.photos.length + currentSession.videos.length;
    const capturesConsumed = currentSession.capturesConsumed || 0;
    let paymentPending = false;

    // 2. SKR Post-Settlement
    if (currentSession.availableCaptures !== 'Infinity' && capturesConsumed > 0) {
      console.log(`💸 Processing post-session SKR payment for ${capturesConsumed} captures...`);
      const success = await SkrService.settleSessionCaptures(capturesConsumed);

      if (!success) {
        paymentPending = true;
        Alert.alert(
          'Payment Failed',
          'The SKR payment transaction failed or was rejected. The session will be marked as Payment Pending, but your captures are safe.'
        );
      } else {
        Alert.alert(
          'Payment Successful',
          `Successfully paid for ${capturesConsumed} captures.`
        );
      }
    }

    const updatedSession: CaptureSessionData = {
      ...currentSession,
      endTime: Date.now(),
      status: 'completed',
      totalAssets: totalCaptures,
      paymentPending,
    };

    setSessions(prev =>
      prev.map(s => s.id === activeSession.id ? updatedSession : s)
    );

    setActiveSession(null);

    console.log(`✅ Session ended: ${updatedSession.name}`);
    if (!paymentPending && currentSession.availableCaptures === 'Infinity') {
      Alert.alert('Session Ended', `${updatedSession.name} completed with ${totalCaptures} captures`);
    }
  }, [activeSession, sessions]);

  // ============================================================================
  // ADD CAPTURE TO ACTIVE SESSION
  // ============================================================================

  const addCapture = useCallback((capture: CapturedPhoto | CapturedVideo) => {
    if (!activeSession) {
      console.error('❌ No active session to add capture to');
      return;
    }

    const isVideo = 'duration' in capture;
    console.log(`➕ Adding ${isVideo ? 'video' : 'photo'} to session: ${activeSession.name}`);

    // Use functional updates to avoid stale closure issues
    setSessions(prev => {
      const currentSession = prev.find(s => s.id === activeSession.id);
      if (!currentSession) return prev;

      // Check if we have capacity left
      let newAvailable = currentSession.availableCaptures;
      let newConsumed = currentSession.capturesConsumed || 0;

      if (newAvailable !== 'Infinity') {
        const remaining = (newAvailable || 0) - 1;
        newAvailable = remaining;
        newConsumed += 1;

        if (remaining <= 0) {
          console.log('⚠️ SKR capacity reached. Enforcing graceful session end soon.');
          // NOTE: Cannot auto-end safely within a setState callback because endSession relies on state.
          // A separate effect or component-level check should trigger endSession when availableCaptures === 0.
        }
      }

      const updatedSession: CaptureSessionData = {
        ...currentSession,
        photos: isVideo ? currentSession.photos : [...currentSession.photos, capture as CapturedPhoto],
        videos: isVideo ? [...currentSession.videos, capture as CapturedVideo] : currentSession.videos,
        totalAssets: currentSession.totalAssets + 1,
        availableCaptures: newAvailable,
        capturesConsumed: newConsumed,
      };

      console.log(`🔍 After adding: ${updatedSession.photos.length} photos, ${updatedSession.videos.length} videos`);

      // Also update activeSession
      setActiveSession(updatedSession);

      return prev.map(s => s.id === activeSession.id ? updatedSession : s);
    });

    console.log(`✅ Capture added (${isVideo ? 'video' : 'photo'})`);
  }, [activeSession]);

  // ============================================================================
  // UPDATE EXISTING CAPTURE IN ACTIVE SESSION
  // ============================================================================

  const updateCapture = useCallback((updatedCapture: CapturedPhoto | CapturedVideo) => {
    if (!activeSession) {
      console.error('❌ No active session to update capture in');
      return;
    }

    const isVideo = 'duration' in updatedCapture;

    // Use functional updates to avoid stale closure issues
    setSessions(prev => {
      const currentSession = prev.find(s => s.id === activeSession.id);
      if (!currentSession) return prev;

      const updatedSession: CaptureSessionData = {
        ...currentSession,
        photos: isVideo
          ? currentSession.photos
          : currentSession.photos.map(p =>
            p.uri === updatedCapture.uri ? updatedCapture as CapturedPhoto : p
          ),
        videos: isVideo
          ? currentSession.videos.map(v =>
            v.uri === updatedCapture.uri ? updatedCapture as CapturedVideo : v
          )
          : currentSession.videos,
      };

      // Also update activeSession
      setActiveSession(updatedSession);

      return prev.map(s => s.id === activeSession.id ? updatedSession : s);
    });

    console.log(`✅ Capture updated (${isVideo ? 'video' : 'photo'})`);
  }, [activeSession]);

  // ============================================================================
  // DELETE SESSION
  // ============================================================================

  const deleteSession = useCallback((sessionId: string) => {
    const sessionToDelete = sessions.find(s => s.id === sessionId);

    if (!sessionToDelete) {
      console.error('❌ Session not found:', sessionId);
      return;
    }

    console.log(`🗑️ Deleting session: ${sessionToDelete.name}`);

    // If deleting the active session, clear it
    if (activeSession?.id === sessionId) {
      setActiveSession(null);
    }

    // Remove from sessions list
    setSessions(prev => prev.filter(s => s.id !== sessionId));

    console.log(`✅ Session deleted: ${sessionToDelete.name}`);
    Alert.alert(
      'Session Deleted',
      `${sessionToDelete.name} has been removed`
    );
  }, [sessions, activeSession]);

  // ============================================================================
  // RETURN HOOK API
  // ============================================================================

  return {
    sessions,
    activeSession,
    loading,
    startSession,
    endSession,
    addCapture,
    updateCapture,
    deleteSession,
  };
}