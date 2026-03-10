import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { Camera } from 'react-native-vision-camera';
import { LocationService } from '../services/location';
import { blobLog } from '../utils/logger';

export interface AppPermissions {
    camera: boolean;
    microphone: boolean;
    location: boolean;
    loading: boolean;
}

export type PermissionStep = 'camera' | 'microphone' | 'location' | 'complete';

export function usePermissions() {
    const [permissions, setPermissions] = useState<AppPermissions>({
        camera: false,
        microphone: false,
        location: false,
        loading: true,
    });
    const [currentStep, setCurrentStep] = useState<PermissionStep>('camera');
    const appStateRef = useRef(AppState.currentState);

    // Determine which step we should be on based on current permissions
    const resolveStep = (cam: boolean, mic: boolean, loc: boolean): PermissionStep => {
        if (!cam) return 'camera';
        if (!mic) return 'microphone';
        if (!loc) return 'location';
        return 'complete';
    };

    // Check current permission statuses WITHOUT requesting (safe to call any time)
    const checkPermissions = useCallback(async () => {
        try {
            const cameraStatus = await Camera.getCameraPermissionStatus();
            const micStatus = await Camera.getMicrophonePermissionStatus();
            const locationGranted = await LocationService.checkPermissions();

            const cam = cameraStatus === 'granted';
            const mic = micStatus === 'granted';
            const loc = locationGranted;

            blobLog.info(`Permissions check: camera=${cam}, mic=${mic}, location=${loc}`);

            setPermissions({ camera: cam, microphone: mic, location: loc, loading: false });
            setCurrentStep(resolveStep(cam, mic, loc));

            return { camera: cam, microphone: mic, location: loc };
        } catch (error) {
            blobLog.error('Permission check failed:', error);
            setPermissions(prev => ({ ...prev, loading: false }));
            return null;
        }
    }, []);

    // Request ONLY the current step's permission (one at a time)
    const requestCurrentPermission = useCallback(async () => {
        blobLog.info(`Requesting permission for step: ${currentStep}`);

        try {
            if (currentStep === 'camera') {
                const status = await Camera.requestCameraPermission();
                const granted = status === 'granted';
                blobLog.info('Camera permission: ' + status);
                setPermissions(prev => ({ ...prev, camera: granted }));
                if (granted) setCurrentStep('microphone');
            } else if (currentStep === 'microphone') {
                const status = await Camera.requestMicrophonePermission();
                const granted = status === 'granted';
                blobLog.info('Microphone permission: ' + status);
                setPermissions(prev => ({ ...prev, microphone: granted }));
                if (granted) setCurrentStep('location');
            } else if (currentStep === 'location') {
                const granted = await LocationService.requestPermissions();
                blobLog.info('Location permission: ' + granted);
                setPermissions(prev => ({ ...prev, location: granted }));
                if (granted) setCurrentStep('complete');
            }
        } catch (error) {
            blobLog.error('Permission request failed:', error);
        }
    }, [currentStep]);

    // Re-check permissions when app returns to foreground (user came back from Settings)
    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
            if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
                blobLog.info('App returned to foreground, re-checking permissions...');
                checkPermissions();
            }
            appStateRef.current = nextAppState;
        });

        return () => subscription.remove();
    }, [checkPermissions]);

    // Initial check on mount — check only, don't request
    useEffect(() => {
        checkPermissions();
    }, [checkPermissions]);

    return {
        permissions,
        currentStep,
        requestCurrentPermission,
        checkPermissions,
        allGranted: permissions.camera && permissions.microphone && permissions.location,
    };
}
