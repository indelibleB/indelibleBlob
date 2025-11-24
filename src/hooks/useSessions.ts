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
import type { CaptureSessionData, CapturedPhoto, CapturedVideo, GPSData } from '../types';

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
  
  const startSession = useCallback(async (location: GPSData, sessionName?: string) => {
    console.log('🎬 Starting new capture session...');
    
    const newSession: CaptureSessionData = {
      id: `session_${Date.now()}`,
      name: sessionName || `Session ${sessions.length + 1}`,
      startTime: Date.now(),
      endTime: null,
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
        altitude: location.altitude,
      },
      photos: [],
      videos: [],
      totalAssets: 0,
      status: 'active',
    };
    
    setActiveSession(newSession);
    setSessions(prev => [newSession, ...prev]);
    
    console.log(`✅ Session started: ${newSession.name}`);
    Alert.alert('Session Started', `${newSession.name} is now active`);
    
    return newSession;
  }, [sessions.length]);

  // ============================================================================
  // END ACTIVE SESSION
  // ============================================================================
  
  const endSession = useCallback(() => {
    if (!activeSession) {
      Alert.alert('No Active Session', 'There is no active session to end');
      return;
    }
    
    console.log(`🏁 Ending session: ${activeSession.name}`);
    console.log(`🔍 DEBUG: activeSession has ${activeSession.photos.length} photos, ${activeSession.videos.length} videos`);
    console.log(`🔍 DEBUG: sessions array length: ${sessions.length}`);
    
    // Get the latest session data from sessions array (it has the most recent captures)
    const currentSession = sessions.find(s => s.id === activeSession.id);
    if (!currentSession) {
      console.error('❌ Active session not found in sessions array');
      return;
    }
    
    const totalCaptures = currentSession.photos.length + currentSession.videos.length;
    console.log(`🔍 DEBUG: currentSession from array has ${currentSession.photos.length} photos, ${currentSession.videos.length} videos`);
    console.log(`🔍 DEBUG: totalCaptures = ${totalCaptures}`);
    
    const updatedSession: CaptureSessionData = {
      ...currentSession,
      endTime: Date.now(),
      status: 'completed',
      totalAssets: totalCaptures,
    };
    
    setSessions(prev => 
      prev.map(s => s.id === activeSession.id ? updatedSession : s)
    );
    
    setActiveSession(null);
    
    console.log(`✅ Session ended: ${updatedSession.name}`);
    Alert.alert(
      'Session Ended',
      `${updatedSession.name} completed with ${totalCaptures} captures`
    );
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
      
      const updatedSession: CaptureSessionData = {
        ...currentSession,
        photos: isVideo ? currentSession.photos : [...currentSession.photos, capture as CapturedPhoto],
        videos: isVideo ? [...currentSession.videos, capture as CapturedVideo] : currentSession.videos,
        totalAssets: currentSession.totalAssets + 1,
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