/**
 * ============================================================================
 * useCamera Hook
 * ============================================================================
 * 
 * Manages camera state, permissions, and capture operations.
 * 
 * RESPONSIBILITIES:
 * - Request camera and audio permissions
 * - Manage camera mode (photo/video)
 * - Handle photo capture
 * - Handle video recording (start/stop)
 * - Generate video thumbnails
 * - Track recording duration
 * 
 * USAGE:
 * const { cameraReady, captureMode, takePhoto, startRecording, stopRecording } = useCamera();
 */

import { useState, useRef, useCallback } from 'react';
import { Alert } from 'react-native';
import { Camera } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import { generateVideoThumbnail, getVideoDuration } from '../utils/helpers';
import type { CapturedPhoto, CapturedVideo, GPSData } from '@shared/types';
import { blobLog } from '../utils/logger';

export function useCamera() {
  // ============================================================================
  // STATE
  // ============================================================================

  const [hasPermission, setHasPermission] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [captureMode, setCaptureMode] = useState<'photo' | 'video'>('photo');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [cameraType, setCameraType] = useState<'front' | 'back'>('back');

  // ============================================================================
  // REFS
  // ============================================================================

  const cameraRef = useRef<any>(null);
  const recordingTimer = useRef<NodeJS.Timeout | null>(null);
  const isRecordingRef = useRef(false);

  // ============================================================================
  // REQUEST PERMISSIONS
  // ============================================================================

  const requestPermissions = useCallback(async () => {
    blobLog.info('Requesting camera permissions...');

    const cameraStatus = await Camera.requestCameraPermissionsAsync();
    const audioStatus = await Camera.requestMicrophonePermissionsAsync();

    const granted = cameraStatus.granted && audioStatus.granted;
    setHasPermission(granted);

    if (!granted) {
      Alert.alert(
        'Permissions Required',
        'Camera and microphone permissions are required to capture photos and videos.'
      );
    }

    blobLog.info(`Camera permissions: ${granted ? 'granted' : 'denied'}`);
    return granted;
  }, []);

  // ============================================================================
  // TOGGLE CAMERA MODE
  // ============================================================================

  const toggleMode = useCallback(() => {
    if (isRecording) {
      Alert.alert('Recording', 'Stop recording before switching modes');
      return;
    }
    setCaptureMode(prev => prev === 'photo' ? 'video' : 'photo');
    blobLog.info(`Switched to ${captureMode === 'photo' ? 'video' : 'photo'} mode`);
  }, [isRecording, captureMode]);

  // ============================================================================
  // FLIP CAMERA
  // ============================================================================

  const flipCamera = useCallback(() => {
    if (isRecording) {
      Alert.alert('Recording', 'Stop recording before flipping camera');
      return;
    }
    setCameraType(prev => prev === 'back' ? 'front' : 'back');
    blobLog.info(`Flipped to ${cameraType === 'back' ? 'front' : 'back'} camera`);
  }, [isRecording, cameraType]);

  // ============================================================================
  // TAKE PHOTO
  // ============================================================================

  const takePhoto = useCallback(async (location: GPSData, sessionId: string): Promise<CapturedPhoto | null> => {
    if (!cameraRef.current || !cameraReady) {
      Alert.alert('Camera Not Ready', 'Please wait for camera to initialize');
      return null;
    }

    try {
      blobLog.info('Taking photo...');

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.9,
        exif: true,
      });

      const capturedPhoto: CapturedPhoto = {
        uri: photo.uri,
        timestamp: Date.now(),
        sessionId,
        index: 0, // Will be set by session
        gpsData: location,
        uploadStatus: 'local',
      };

      blobLog.success('Photo captured: ' + photo.uri);
      return capturedPhoto;

    } catch (error) {
      blobLog.error('Photo capture failed:', error);
      Alert.alert('Capture Failed', 'Failed to take photo');
      return null;
    }
  }, [cameraReady]);

  // ============================================================================
  // START VIDEO RECORDING
  // ============================================================================

  const startRecording = useCallback(async (onVideoComplete?: (video: any) => void): Promise<boolean> => {
    if (!cameraRef.current || !cameraReady || isRecordingRef.current) {
      return false;
    }

    blobLog.info('Starting video recording...');

    isRecordingRef.current = true;
    setIsRecording(true);
    setRecordingDuration(0);

    // Start duration timer
    recordingTimer.current = setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);

    try {
      cameraRef.current.recordAsync({
        maxDuration: 60,
        mute: false,
      }).then((video) => {
        blobLog.success('Recording completed:', video);

        // Clear timer
        if (recordingTimer.current) {
          clearInterval(recordingTimer.current);
        }

        // Reset recording state
        isRecordingRef.current = false;
        setIsRecording(false);

        // Call completion callback if provided
        if (onVideoComplete) {
          onVideoComplete(video);
        }
      }).catch((error) => {
        blobLog.error('Recording error:', error);

        // Cleanup on error
        if (recordingTimer.current) {
          clearInterval(recordingTimer.current);
        }
        isRecordingRef.current = false;
        setIsRecording(false);
      });

      return true; // Return immediately
    } catch (error) {
      blobLog.error('Recording failed:', error);
      isRecordingRef.current = false;
      setIsRecording(false);
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
      return false;
    }
  }, [cameraReady]);

  // ============================================================================
  // STOP VIDEO RECORDING
  // ============================================================================

  const stopRecording = useCallback(async (location: GPSData, sessionId: string): Promise<CapturedVideo | null> => {
    if (!isRecordingRef.current) {
      return null;
    }

    blobLog.info('Stopping video recording...');

    try {
      cameraRef.current?.stopRecording();

      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }

      isRecordingRef.current = false;
      setIsRecording(false);

      // Video will be returned via recordAsync promise
      // This is handled in the component
      return null;

    } catch (error) {
      blobLog.error('Stop recording failed:', error);
      return null;
    }
  }, []);

  // ============================================================================
  // PROCESS RECORDED VIDEO
  // ============================================================================

  const processVideo = useCallback(async (videoUri: string, location: GPSData, sessionId: string): Promise<CapturedVideo | null> => {
    try {
      blobLog.info('Processing recorded video...');

      // Get video duration
      const duration = await getVideoDuration(videoUri);

      // Generate thumbnail
      const thumbnailUri = await generateVideoThumbnail(videoUri);

      const capturedVideo: CapturedVideo = {
        uri: videoUri,
        thumbnailUri: thumbnailUri || undefined,
        timestamp: Date.now(),
        sessionId,
        index: 0, // Will be set by session
        duration,
        gpsData: location,
        uploadStatus: 'local',
      };

      blobLog.success('Video processed: ' + videoUri);
      return capturedVideo;

    } catch (error) {
      blobLog.error('Video processing failed:', error);
      return null;
    }
  }, []);

  // ============================================================================
  // RETURN HOOK API
  // ============================================================================

  return {
    // State
    hasPermission,
    cameraReady,
    captureMode,
    isRecording,
    recordingDuration,
    cameraType,
    cameraRef,

    // Actions
    requestPermissions,
    setCameraReady,
    toggleMode,
    flipCamera,
    takePhoto,
    startRecording,
    stopRecording,
    processVideo,
  };
}