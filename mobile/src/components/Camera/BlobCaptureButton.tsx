/**
 * ============================================================================
 * BlobCaptureButton Component
 * ============================================================================
 *
 * The indelible.Blob capture button — an organic, animated blob shape that
 * serves as both the camera shutter and a processing indicator.
 *
 * STATES:
 * - Idle:       Soft breathing animation, Sui cyan glow
 * - Recording:  Pulsing red with timer overlay
 * - Processing: Color-cycling iridescent morph
 * - Disabled:   Dimmed, no animation
 */

import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated, Easing } from 'react-native';
import { COLORS, FONTS } from '../../constants/config';

interface BlobCaptureButtonProps {
    mode: 'photo' | 'video';
    isRecording: boolean;
    disabled: boolean;
    processing?: boolean;
    recordingDuration: number;
    onPress: () => void;
}

export function BlobCaptureButton({
    mode,
    isRecording,
    disabled,
    processing = false,
    recordingDuration,
    onPress,
}: BlobCaptureButtonProps) {

    // Breathing animation
    const breatheAnim = useRef(new Animated.Value(1)).current;
    // Pulse animation for recording/processing
    const pulseAnim = useRef(new Animated.Value(1)).current;
    // Glow opacity
    const glowAnim = useRef(new Animated.Value(0.4)).current;
    // Processing color cycle
    const colorAnim = useRef(new Animated.Value(0)).current;

    // Breathing effect (idle state)
    useEffect(() => {
        if (!isRecording && !processing && !disabled) {
            const breathe = Animated.loop(
                Animated.sequence([
                    Animated.timing(breatheAnim, {
                        toValue: 1.06,
                        duration: 2000,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: true,
                    }),
                    Animated.timing(breatheAnim, {
                        toValue: 1,
                        duration: 2000,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: true,
                    }),
                ])
            );
            breathe.start();
            return () => breathe.stop();
        } else {
            breatheAnim.setValue(1);
        }
    }, [isRecording, processing, disabled]);

    // Glow pulsing effect
    useEffect(() => {
        if (!disabled) {
            const glow = Animated.loop(
                Animated.sequence([
                    Animated.timing(glowAnim, {
                        toValue: 0.8,
                        duration: 1500,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: true,
                    }),
                    Animated.timing(glowAnim, {
                        toValue: 0.3,
                        duration: 1500,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: true,
                    }),
                ])
            );
            glow.start();
            return () => glow.stop();
        }
    }, [disabled]);

    // Recording/Processing pulse
    useEffect(() => {
        if (isRecording || processing) {
            const pulse = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.15,
                        duration: 600,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 600,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ])
            );
            pulse.start();
            return () => pulse.stop();
        } else {
            pulseAnim.setValue(1);
        }
    }, [isRecording, processing]);

    // Color cycling for processing
    useEffect(() => {
        if (processing) {
            const cycle = Animated.loop(
                Animated.timing(colorAnim, {
                    toValue: 1,
                    duration: 3000,
                    easing: Easing.linear,
                    useNativeDriver: false,
                })
            );
            cycle.start();
            return () => cycle.stop();
        } else {
            colorAnim.setValue(0);
        }
    }, [processing]);

    // Format recording duration as MM:SS
    const formatDuration = (seconds: number): string => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    // Determine button color based on state
    const getBlobColor = () => {
        if (disabled) return 'rgba(100, 100, 120, 0.3)';
        if (isRecording) return COLORS.recording;
        if (processing) {
            // Interpolate through brand colors during processing
            return colorAnim.interpolate({
                inputRange: [0, 0.33, 0.66, 1],
                outputRange: [COLORS.primary, COLORS.secondary, COLORS.tertiary, COLORS.primary],
            });
        }
        return COLORS.primary;
    };

    const getGlowColor = () => {
        if (disabled) return 'transparent';
        if (isRecording) return COLORS.recording;
        if (processing) return COLORS.secondary;
        return COLORS.primary;
    };

    const blobColor = getBlobColor();
    const scale = isRecording || processing
        ? Animated.multiply(breatheAnim, pulseAnim)
        : breatheAnim;

    return (
        <View style={styles.container}>
            {/* Outer glow ring */}
            <Animated.View
                style={[
                    styles.glowRing,
                    {
                        opacity: glowAnim,
                        borderColor: getGlowColor(),
                        transform: [{ scale }],
                    },
                ]}
            />

            {/* Main blob button */}
            <TouchableOpacity
                onPress={onPress}
                disabled={disabled}
                activeOpacity={0.7}
                style={styles.touchArea}
            >
                <Animated.View
                    style={[
                        styles.blob,
                        {
                            backgroundColor: blobColor,
                            transform: [{ scale }],
                        },
                    ]}
                >
                    {/* Inner content based on state */}
                    {isRecording ? (
                        <View style={styles.recordingInner}>
                            <View style={styles.stopSquare} />
                            <Text style={styles.durationText}>
                                {formatDuration(recordingDuration)}
                            </Text>
                        </View>
                    ) : processing ? (
                        <Text style={styles.processingText}>⟳</Text>
                    ) : (
                        <View style={styles.idleInner}>
                            {mode === 'photo' ? (
                                // Inner circle for photo mode
                                <View style={styles.photoInner} />
                            ) : (
                                // Red dot for video mode
                                <View style={styles.videoInner} />
                            )}
                        </View>
                    )}
                </Animated.View>
            </TouchableOpacity>

            {/* Mode label */}
            <Text style={[styles.modeLabel, disabled && styles.modeLabelDisabled]}>
                {isRecording ? 'REC' : processing ? 'Processing...' : mode === 'photo' ? 'PHOTO' : 'VIDEO'}
            </Text>
        </View>
    );
}

const BLOB_SIZE = 72;

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    glowRing: {
        position: 'absolute',
        width: BLOB_SIZE + 20,
        height: BLOB_SIZE + 20,
        borderRadius: (BLOB_SIZE + 20) / 2,
        borderWidth: 2,
    },
    touchArea: {
        width: BLOB_SIZE + 10,
        height: BLOB_SIZE + 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    blob: {
        width: BLOB_SIZE,
        height: BLOB_SIZE,
        // Organic blob shape via asymmetric border radii
        borderTopLeftRadius: BLOB_SIZE * 0.47,
        borderTopRightRadius: BLOB_SIZE * 0.53,
        borderBottomLeftRadius: BLOB_SIZE * 0.52,
        borderBottomRightRadius: BLOB_SIZE * 0.44,
        alignItems: 'center',
        justifyContent: 'center',
        // Subtle shadow for depth
        shadowColor: '#00d4ff',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    idleInner: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    photoInner: {
        width: BLOB_SIZE * 0.4,
        height: BLOB_SIZE * 0.4,
        borderRadius: BLOB_SIZE * 0.2,
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    videoInner: {
        width: BLOB_SIZE * 0.3,
        height: BLOB_SIZE * 0.3,
        borderRadius: BLOB_SIZE * 0.15,
        backgroundColor: COLORS.recording,
    },
    recordingInner: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    stopSquare: {
        width: 20,
        height: 20,
        borderRadius: 3,
        backgroundColor: '#fff',
    },
    durationText: {
        color: '#fff',
        fontSize: 10,
        fontFamily: FONTS.bold,
        marginTop: 2,
    },
    processingText: {
        fontSize: 28,
        color: '#fff',
    },
    modeLabel: {
        marginTop: 8,
        fontSize: 10,
        fontFamily: FONTS.semiBold,
        color: COLORS.primary,
        letterSpacing: 2,
    },
    modeLabelDisabled: {
        color: COLORS.textSecondary,
    },
});
