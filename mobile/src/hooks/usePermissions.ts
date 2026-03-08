import { useState, useEffect, useCallback } from 'react';
import { Camera } from 'react-native-vision-camera';
import { LocationService } from '../services/location';
import { Platform } from 'react-native';
import { blobLog } from '../utils/logger';

export interface AppPermissions {
    camera: boolean;
    microphone: boolean;
    location: boolean;
    loading: boolean;
}

export function usePermissions() {
    const [permissions, setPermissions] = useState<AppPermissions>({
        camera: false,
        microphone: false,
        location: false,
        loading: true,
    });

    const requestAllPermissions = useCallback(async () => {
        blobLog.info('Requesting all app permissions...');

        try {
            // 1. Camera & Mic (Parallel)
            const cameraStatus = await Camera.requestCameraPermission();
            const micStatus = await Camera.requestMicrophonePermission();

            blobLog.info('Camera: ' + cameraStatus);
            blobLog.info('Mic: ' + micStatus);

            // 2. Location (Sequential, as it might trigger a modal)
            const locationGranted = await LocationService.requestPermissions();
            blobLog.info('Location: ' + locationGranted);

            setPermissions({
                camera: cameraStatus === 'granted',
                microphone: micStatus === 'granted',
                location: locationGranted,
                loading: false,
            });

            return {
                camera: cameraStatus === 'granted',
                microphone: micStatus === 'granted',
                location: locationGranted,
            };

        } catch (error) {
            blobLog.error('Permission request failed:', error);
            setPermissions(prev => ({ ...prev, loading: false }));
            return null;
        }
    }, []);

    // Initial check on mount
    useEffect(() => {
        requestAllPermissions();
    }, [requestAllPermissions]);

    return {
        permissions,
        requestAllPermissions,
    };
}
