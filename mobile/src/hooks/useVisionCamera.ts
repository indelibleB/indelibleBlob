import { useState, useCallback, useRef, useEffect } from 'react';
import {
    useCameraDevice,
    useCameraFormat,
    useFrameProcessor,
    Camera,
    PhotoFile,
    VideoFile,
    useCameraPermission,
    useMicrophonePermission
} from 'react-native-vision-camera';
import { Alert, Linking } from 'react-native';
import { GPSData } from '@shared/types';
import * as Location from 'expo-location'; // We keep Expo Location
import { blobLog } from '../utils/logger';

export function useVisionCamera() {
    const [cameraPosition, setCameraPosition] = useState<'back' | 'front'>('back');
    const [flash, setFlash] = useState<'off' | 'on'>('off');
    const [isRecording, setIsRecording] = useState(false);

    // Permissions
    const { hasPermission: hasCamPermission, requestPermission: requestCamPermission } = useCameraPermission();
    const { hasPermission: hasMicPermission, requestPermission: requestMicPermission } = useMicrophonePermission();

    // Device Selection
    // [FIX] Ensure we react to position changes
    const device = useCameraDevice(cameraPosition);

    // Ref
    const camera = useRef<Camera>(null);

    // Initial Permission Request
    useEffect(() => {
        (async () => {
            if (!hasCamPermission) await requestCamPermission();
            if (!hasMicPermission) await requestMicPermission();
        })();
    }, []);

    const toggleCamera = useCallback(() => {
        setCameraPosition(p => (p === 'back' ? 'front' : 'back'));
    }, []);

    const toggleFlash = useCallback(() => {
        setFlash(f => (f === 'off' ? 'on' : 'off'));
    }, []);

    /**
     * Take Photo
     */
    const takePhoto = useCallback(async (location: GPSData): Promise<PhotoFile | null> => {
        if (!camera.current) return null;

        try {
            const photo = await camera.current.takePhoto({
                flash: flash,
                enableShutterSound: true,
            });

            return photo; // Returns { path, width, height, ... }
        } catch (e) {
            console.error('VisionCamera Capture Failed:', e);
            return null;
        }
    }, [flash]);

    /**
     * Start Recording
     * @param onFinished — callback invoked with the VideoFile when recording completes
     */
    const startRecording = useCallback(async (onFinished?: (video: VideoFile) => void) => {
        if (!camera.current) return;

        try {
            setIsRecording(true);
            camera.current.startRecording({
                flash: flash === 'on' ? 'on' : 'off',
                onRecordingFinished: (video) => {
                    console.log('VisionCamera Recording Finished:', video);
                    setIsRecording(false);
                    onFinished?.(video);
                },
                onRecordingError: (error) => {
                    console.error('Recording Error:', error);
                    setIsRecording(false);
                }
            });
            return true;
        } catch (e) {
            console.error('Failed to start recording:', e);
            setIsRecording(false);
            return false;
        }
    }, [flash]);

    /**
     * Stop Recording
     */
    const stopRecording = useCallback(async () => {
        if (!camera.current) return;
        await camera.current.stopRecording();
        setIsRecording(false);
    }, []);

    return {
        device,
        hasPermission: hasCamPermission && hasMicPermission,
        cameraPosition,
        flash,
        isRecording,
        camera,
        toggleCamera,
        toggleFlash,
        takePhoto,
        startRecording,
        stopRecording
    };
}
