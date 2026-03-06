/**
 * ============================================================================
 * VisionCameraView — Full-Featured Camera UI
 * ============================================================================
 *
 * Built on react-native-vision-camera for depth/LiDAR support.
 * Ports all features from the original CameraView with updated branding.
 *
 * FEATURES:
 * - Photo/Video capture with blob button
 * - GPS precision overlay with RTK/accuracy info
 * - Collapsible sidebar with controls
 * - Mode switching (photo/video) + camera flip
 * - Sovereign mode toggle
 * - Identity status display
 * - Diagnostics navigation
 */

import React, { useEffect, useState } from 'react';
import {
    View, StyleSheet, Text, TouchableOpacity, Animated,
    Alert, Linking, ScrollView
} from 'react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import { useVisionCamera } from '../../hooks/useVisionCamera';
import { COLORS, FONTS } from '../../constants/config';
import { BlobCaptureButton } from './BlobCaptureButton';
import { LinearGradient } from 'expo-linear-gradient';
import {
    ChevronLeft, ChevronRight, Camera as CameraIcon, Video,
    RotateCcw, Wifi, Shield, ShieldCheck, Info, LogOut, User
} from 'lucide-react-native';
import { IdentityService } from '../../services/identity';
import { blobLog } from '../../utils/logger';
import type {
    CaptureSessionData, GPSData, CapturedPhoto, CapturedVideo
} from '@shared/types';

import { BookOpen, Play, Square } from 'lucide-react-native';

interface VisionCameraViewProps {
    activeSession: CaptureSessionData | null;
    currentLocation: GPSData | null;
    locationPermission: boolean;
    hasCameraPermission: boolean; // [NEW] Prop driven by App.tsx
    sessionCount: number;
    processingCount: number; // Number of captures currently processing
    onCapture: (capture: CapturedPhoto | CapturedVideo, isSovereign: boolean) => void;
    onNavigate: (view: string) => void;
    onStartSession: () => void;
    onEndSession: () => void;
    isActive?: boolean; // Controls whether camera native surface is active (yield during modals)
}

export function VisionCameraView({
    activeSession,
    currentLocation,
    locationPermission,
    hasCameraPermission, // [NEW]
    sessionCount,
    processingCount,
    onCapture,
    onNavigate,
    onStartSession,
    onEndSession,
    isActive = true, // Default to active, App.tsx sets false during auth modals
}: VisionCameraViewProps) {

    // ========================================================================
    // HOOKS
    // ========================================================================

    const {
        device,
        hasPermission: internalHasPermission, // Rename to avoid conflict, but we prefer prop
        camera,
        takePhoto,
        startRecording,
        stopRecording,
        isRecording,
        toggleCamera, // [FIX] Added to destructuring
    } = useVisionCamera();

    // Use the prop if provided, otherwise fallback to internal check
    // This allows App.tsx to force "true" if it thinks we have it, or "false"
    // Ideally they match.
    const isPermissionGranted = hasCameraPermission || internalHasPermission;

    // ========================================================================
    // STATE
    // ========================================================================

    const [captureMode, setCaptureMode] = useState<'photo' | 'video'>('photo');
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [sidebarAnim] = useState(new Animated.Value(-220));
    const [isSovereign, setIsSovereign] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);

    // ========================================================================
    // SKR / RECORDING TIMER / AUTO-END
    // ========================================================================

    useEffect(() => {
        let timer: ReturnType<typeof setInterval>;
        if (isRecording) {
            setRecordingDuration(0);
            timer = setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);
        } else {
            setRecordingDuration(0);
        }
        return () => { if (timer) clearInterval(timer); };
    }, [isRecording]);

    // [NEW] SKR Auto-End: Watch active session capacity
    useEffect(() => {
        if (activeSession && activeSession.availableCaptures !== 'Infinity') {
            const available = activeSession.availableCaptures || 0;
            if (available <= 0) {
                blobLog.warn('⚠️ SKR capacity reached 0. Auto-ending session.');
                onEndSession();
            }
        }
    }, [activeSession, onEndSession]);

    // ========================================================================
    // SIDEBAR TOGGLE
    // ========================================================================

    const toggleSidebar = () => {
        const toValue = sidebarVisible ? -220 : 0;
        Animated.spring(sidebarAnim, {
            toValue,
            useNativeDriver: true,
            tension: 50,
            friction: 8,
        }).start();
        setSidebarVisible(!sidebarVisible);
    };

    // ========================================================================
    // CAPTURE HANDLER
    // ========================================================================

    const handleCapture = async () => {
        if (!currentLocation || !activeSession) return;

        if (captureMode === 'photo') {
            const photo = await takePhoto(currentLocation);
            if (photo) {
                const capturedPhoto: CapturedPhoto = {
                    uri: `file://${photo.path}`,
                    timestamp: Date.now(),
                    gpsData: currentLocation,
                    sessionId: activeSession.id,
                    index: activeSession.totalAssets || 0,
                    surveyMetadata: {
                        relativeToBase: {
                            deltaLat: currentLocation.latitude - (activeSession as any).baseLocation?.latitude || 0,
                            deltaLon: currentLocation.longitude - (activeSession as any).baseLocation?.longitude || 0,
                            deltaAlt: (currentLocation.altitude || 0) - ((activeSession as any).baseLocation?.altitude || 0),
                        },
                        captureQuality: {
                            gpsAccuracy: currentLocation.accuracy || 999,
                            isRTKEnabled: (currentLocation as any).isRTK || false,
                            coordinateSystem: 'WGS84',
                        },
                    },
                    uploadStatus: 'local',
                };
                onCapture(capturedPhoto, isSovereign);
            }
        } else {
            if (isRecording) {
                await stopRecording();
            } else {
                await startRecording((video) => {
                    if (!currentLocation || !activeSession) return;
                    const capturedVideo: CapturedVideo = {
                        uri: `file://${video.path}`,
                        timestamp: Date.now(),
                        gpsData: currentLocation,
                        sessionId: activeSession.id,
                        index: activeSession.totalAssets || 0,
                        duration: video.duration,
                        uploadStatus: 'local',
                    };
                    onCapture(capturedVideo, isSovereign);
                });
            }
        }
    };

    // ========================================================================
    // RENDER: PERMISSION / NO DEVICE
    // ========================================================================

    if (!isPermissionGranted) {
        return (
            <View style={styles.center}>
                <Shield color={COLORS.error} size={64} />
                <Text style={[styles.permText, { marginTop: 16 }]}>Camera Permission Required</Text>
                <Text style={{ color: COLORS.textSecondary, textAlign: 'center', maxWidth: 300, marginBottom: 24 }}>
                    Indelible needs camera access to verify your captures.
                </Text>
                <TouchableOpacity
                    style={[styles.sidebarButton, { backgroundColor: COLORS.glass, paddingHorizontal: 24 }]}
                    onPress={() => Linking.openSettings()}
                >
                    <Text style={styles.sidebarButtonText}>Open Settings</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (device == null) {
        return (
            <View style={styles.center}>
                <CameraIcon color={COLORS.textSecondary} size={48} />
                <Text style={styles.permText}>No Camera Device Found</Text>
            </View>
        );
    }

    // ========================================================================
    // IDENTITY INFO
    // ========================================================================

    const currentUser = IdentityService.getCurrentUser();

    // ========================================================================
    // RENDER
    // ========================================================================

    return (
        <View style={styles.container}>
            {/* Camera Preview */}
            <Camera
                ref={camera}
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={isActive}
                photo={true}
                video={true}
                audio={true}
                enableZoomGesture={true}
            />

            {/* ============================================================== */}
            {/* TOP STATUS BAR                                                 */}
            {/* ============================================================== */}
            <LinearGradient
                colors={['rgba(0,0,0,0.7)', 'transparent']}
                style={styles.topBar}
            >
                {/* Session badge */}
                {activeSession && (
                    <View style={styles.sessionBadge}>
                        <View style={styles.sessionDot} />
                        <Text style={styles.sessionText}>
                            {activeSession.name} • {activeSession.totalAssets} captures
                            {activeSession.availableCaptures !== 'Infinity'
                                ? ` (${activeSession.availableCaptures} paid left)`
                                : ` (Free via Seeker)`}
                        </Text>
                    </View>
                )}

                {/* GPS precision indicator */}
                <View style={[
                    styles.gpsBadge,
                    currentLocation ? styles.gpsBadgeActive : styles.gpsBadgeWaiting
                ]}>
                    <Text style={styles.gpsText}>
                        {currentLocation
                            ? `${(currentLocation as any).isRTK ? 'RTK' : 'GPS'} • ${(currentLocation.accuracy as any)?.toFixed(1) || '?'}m`
                            : 'Acquiring...'}
                    </Text>
                </View>
            </LinearGradient>

            {/* ============================================================== */}
            {/* COLLAPSIBLE SIDEBAR                                            */}
            {/* ============================================================== */}
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
                        onPress={() => setCaptureMode(captureMode === 'photo' ? 'video' : 'photo')}
                        disabled={isRecording}
                    >
                        {captureMode === 'photo'
                            ? <Video color={COLORS.text} size={20} />
                            : <CameraIcon color={COLORS.text} size={20} />
                        }
                        <Text style={styles.sidebarButtonText}>
                            {captureMode === 'photo' ? 'Video Mode' : 'Photo Mode'}
                        </Text>
                    </TouchableOpacity>

                    {/* Flip Camera */}
                    <TouchableOpacity
                        style={styles.sidebarButton}
                        onPress={toggleCamera} // [FIX] Wired up
                        disabled={isRecording}
                    >
                        <RotateCcw color={COLORS.text} size={20} />
                        <Text style={styles.sidebarButtonText}>Flip Camera</Text>
                    </TouchableOpacity>

                    {/* Diagnostics */}
                    <TouchableOpacity
                        style={[styles.sidebarButton, { borderColor: COLORS.primary }]}
                        onPress={() => {
                            toggleSidebar();
                            onNavigate('diagnostics');
                        }}
                    >
                        <Wifi color={COLORS.primary} size={20} />
                        <Text style={[styles.sidebarButtonText, { color: COLORS.primary }]}>
                            Diagnostics
                        </Text>
                    </TouchableOpacity>

                    {/* Sovereign Mode Toggle */}
                    <TouchableOpacity
                        style={[
                            styles.sidebarButton,
                            isSovereign && styles.sidebarButtonActive
                        ]}
                        onPress={() => setIsSovereign(!isSovereign)}
                    >
                        {isSovereign
                            ? <ShieldCheck color={COLORS.tertiary} size={20} />
                            : <Shield color={COLORS.textSecondary} size={20} />
                        }
                        <Text style={[
                            styles.sidebarButtonText,
                            isSovereign && { color: COLORS.tertiary }
                        ]}>
                            {isSovereign ? 'Sovereign: ON' : 'Sovereign: OFF'}
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    {/* Identity Status */}
                    <Text style={styles.sectionLabel}>SESSION BIND</Text>

                    {currentUser ? (
                        <View style={styles.identityCard}>
                            <View style={styles.identityHeader}>
                                <Text style={styles.identityMethod}>🔗 Cross-Chain Bind</Text>
                                <Text style={styles.identityStatus}>ACTIVE</Text>
                            </View>

                            {/* Sui zkLogin Address */}
                            {currentUser.suiAddress && (
                                <View style={styles.bindRow}>
                                    <Text style={styles.bindRoleLabel}>🔵 Sui Metadata</Text>
                                    <Text style={styles.identityAddress} numberOfLines={1} ellipsizeMode="middle">
                                        {currentUser.suiAddress}
                                    </Text>
                                </View>
                            )}

                            {/* Solana Seed Vault Address */}
                            {currentUser.solanaAddress && (
                                <View style={styles.bindRow}>
                                    <Text style={styles.bindRoleLabel}>🟢 Solana Commerce</Text>
                                    <Text style={styles.identityAddress} numberOfLines={1} ellipsizeMode="middle">
                                        {currentUser.solanaAddress}
                                    </Text>
                                </View>
                            )}

                            {currentUser.provenanceGrade && (
                                <View style={[styles.bindRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
                                    <Text style={styles.bindRoleLabel}>
                                        {currentUser.provenanceGrade === 'GOLD' ? '🛡️ Seeker Seed Vault' : '🥈 OS Hardware Secured'}
                                    </Text>
                                </View>
                            )}

                            <TouchableOpacity
                                style={styles.disconnectButton}
                                onPress={() => {
                                    if (activeSession) {
                                        Alert.alert('Action Blocked', 'Cannot disconnect while a capture session is active. Please end the session first.');
                                        return;
                                    }
                                    IdentityService.logout();
                                    toggleSidebar();
                                    Alert.alert('Disconnected', 'Identity session ended.');
                                }}
                            >
                                <LogOut color={COLORS.error} size={14} />
                                <Text style={styles.disconnectText}>Disconnect</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.identityCard}>
                            <User color={COLORS.textSecondary} size={20} />
                            <Text style={styles.guestText}>Guest Mode</Text>
                        </View>
                    )}

                    {/* Session Bind Info */}
                    <TouchableOpacity
                        style={styles.infoButton}
                        onPress={() => {
                            Alert.alert(
                                'Session Bind',
                                'Your session is bound to both chains:\n\n🟢 Solana (Seed Vault) — Hardware-secured attestation proving your media captures are authentic. Also handles SKR token payments.\n\n🔵 Sui (zkLogin) — Stores this verified metadata on-chain. Search your address on SuiScan to view your captures.',
                                [
                                    { text: 'Got it', style: 'cancel' },
                                    {
                                        text: 'Learn More',
                                        onPress: () => Linking.openURL('https://indelible-blob.com/session-bind-guide'),
                                    },
                                ]
                            );
                        }}
                    >
                        <Info color={COLORS.textSecondary} size={14} />
                        <Text style={styles.infoText}>What is Session Bind?</Text>
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    {/* Sovereign Info */}
                    <TouchableOpacity
                        style={styles.infoButton}
                        onPress={() => {
                            Alert.alert(
                                'Sovereign Mode',
                                'Your data, your rules. In Sovereign Mode, captures are encrypted on-device using your Identity. Only YOU verify who gets access.',
                                [
                                    { text: 'Got it', style: 'cancel' },
                                    {
                                        text: 'Learn More',
                                        onPress: () => Linking.openURL('https://indelible-blob.com/sovereign-guide'),
                                    },
                                ]
                            );
                        }}
                    >
                        <Info color={COLORS.textSecondary} size={14} />
                        <Text style={styles.infoText}>What is Sovereign Mode?</Text>
                    </TouchableOpacity>
                </LinearGradient>
            </Animated.View>

            {/* Sidebar Toggle Handle */}
            <TouchableOpacity
                style={[styles.sidebarToggle, sidebarVisible && styles.sidebarToggleOpen]}
                onPress={toggleSidebar}
            >
                {sidebarVisible
                    ? <ChevronLeft color={COLORS.text} size={18} />
                    : <ChevronRight color={COLORS.text} size={18} />
                }
            </TouchableOpacity>

            {/* ============================================================== */}
            {/* BOTTOM CAPTURE AREA                                            */}
            {/* ============================================================== */}
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.85)']}
                style={styles.bottomBar}
            >
                <View style={styles.captureRow}>
                    {/* Left: Library */}
                    <TouchableOpacity
                        style={styles.navPill}
                        onPress={() => onNavigate('library')}
                    >
                        <BookOpen color={COLORS.text} size={16} />
                        <Text style={styles.navPillText}>Library ({sessionCount})</Text>
                    </TouchableOpacity>

                    {/* Center: Blob Capture Button */}
                    <BlobCaptureButton
                        mode={captureMode}
                        isRecording={isRecording}
                        disabled={!device || !activeSession || !currentLocation}
                        recordingDuration={recordingDuration}
                        onPress={handleCapture}
                    />

                    {/* Right: Start/End Session + Processing Pill */}
                    {activeSession ? (
                        <View style={{ alignItems: 'flex-end', gap: 6 }}>
                            {processingCount > 0 && (
                                <View style={styles.processingPill}>
                                    <Text style={styles.processingPillText}>⚙️ {processingCount}</Text>
                                </View>
                            )}
                            <TouchableOpacity
                                style={[styles.navPill, styles.navPillDanger]}
                                onPress={onEndSession}
                            >
                                <Square color={COLORS.text} size={14} />
                                <Text style={styles.navPillText}>End</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={[styles.navPill, styles.navPillPrimary]}
                            onPress={onStartSession}
                            disabled={!locationPermission || !currentLocation}
                        >
                            {!locationPermission || !currentLocation
                                ? <Text style={styles.navPillText}>GPS...</Text>
                                : <><Play color={COLORS.text} size={14} /><Text style={styles.navPillText}>Start</Text></>
                            }
                        </TouchableOpacity>
                    )}
                </View>
            </LinearGradient>
        </View>
    );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.backgroundDark,
        gap: 16,
    },
    permText: {
        color: COLORS.textSecondary,
        fontSize: 16,
        fontFamily: FONTS.medium,
    },

    // Top bar
    topBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 20,
    },
    sessionBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.glass,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
    },
    sessionDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.tertiary,
        marginRight: 8,
    },
    sessionText: {
        color: COLORS.text,
        fontSize: 12,
        fontFamily: FONTS.semiBold,
    },
    gpsBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 16,
        borderWidth: 1,
    },
    gpsBadgeActive: {
        backgroundColor: 'rgba(0, 212, 255, 0.1)',
        borderColor: COLORS.primary,
    },
    gpsBadgeWaiting: {
        backgroundColor: 'rgba(255, 149, 0, 0.1)',
        borderColor: COLORS.warning,
    },
    gpsText: {
        color: COLORS.text,
        fontSize: 11,
        fontFamily: FONTS.semiBold,
        letterSpacing: 0.5,
    },

    // Sidebar
    sidebar: {
        position: 'absolute',
        left: 0,
        top: 100,
        bottom: 150,
        width: 220,
        zIndex: 10,
    },
    sidebarGradient: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 20,
        borderTopRightRadius: 16,
        borderBottomRightRadius: 16,
        borderWidth: 1,
        borderLeftWidth: 0,
        borderColor: COLORS.glassBorder,
    },
    sidebarTitle: {
        color: COLORS.text,
        fontSize: 14,
        fontFamily: FONTS.bold,
        letterSpacing: 1,
        marginBottom: 16,
        textTransform: 'uppercase',
    },
    sidebarButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
        marginBottom: 8,
    },
    sidebarButtonActive: {
        backgroundColor: 'rgba(20, 241, 149, 0.1)',
        borderColor: COLORS.tertiary,
    },
    sidebarButtonText: {
        color: COLORS.text,
        fontSize: 13,
        fontFamily: FONTS.medium,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.glassBorder,
        marginVertical: 12,
    },
    sectionLabel: {
        color: COLORS.textSecondary,
        fontSize: 10,
        fontFamily: FONTS.bold,
        letterSpacing: 2,
        marginBottom: 8,
    },

    // Identity card
    identityCard: {
        backgroundColor: COLORS.glass,
        borderRadius: 10,
        padding: 12,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
        gap: 4,
    },
    bindRow: {
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.06)',
        paddingBottom: 4,
        marginBottom: 2,
    },
    bindRoleLabel: {
        color: COLORS.text,
        fontSize: 10,
        fontFamily: FONTS.semiBold,
        marginBottom: 1,
    },
    processingPill: {
        backgroundColor: 'rgba(0,0,0,0.55)',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 14,
        alignItems: 'center',
    },
    processingPillText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontFamily: FONTS.semiBold,
    },
    identityHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    identityMethod: {
        color: COLORS.text,
        fontSize: 12,
        fontFamily: FONTS.semiBold,
    },
    identityStatus: {
        color: COLORS.tertiary,
        fontSize: 9,
        fontFamily: FONTS.bold,
        letterSpacing: 1,
    },
    identityAddress: {
        color: COLORS.textSecondary,
        fontSize: 10,
        fontFamily: FONTS.regular,
    },
    disconnectButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    disconnectText: {
        color: COLORS.error,
        fontSize: 11,
        fontFamily: FONTS.medium,
    },
    guestText: {
        color: COLORS.textSecondary,
        fontSize: 12,
        fontFamily: FONTS.medium,
        fontStyle: 'italic',
    },

    // Info
    infoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 12,
    },
    infoText: {
        color: COLORS.textSecondary,
        fontSize: 11,
        fontFamily: FONTS.regular,
    },

    // Toggle
    sidebarToggle: {
        position: 'absolute',
        left: 0,
        top: '45%',
        backgroundColor: COLORS.glassDark,
        paddingVertical: 16,
        paddingHorizontal: 4,
        borderTopRightRadius: 8,
        borderBottomRightRadius: 8,
        borderWidth: 1,
        borderLeftWidth: 0,
        borderColor: COLORS.glassBorder,
        zIndex: 11,
    },
    sidebarToggleOpen: {
        left: 220,
    },

    // Bottom bar
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: 24,
        paddingTop: 40,
    },
    captureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    navPill: {
        backgroundColor: COLORS.glass,
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
        minWidth: 80,
        justifyContent: 'center',
    },
    navPillPrimary: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    navPillDanger: {
        backgroundColor: COLORS.recording,
        borderColor: COLORS.recording,
    },
    navPillText: {
        color: COLORS.text,
        fontSize: 12,
        fontFamily: FONTS.semiBold,
    },
});
