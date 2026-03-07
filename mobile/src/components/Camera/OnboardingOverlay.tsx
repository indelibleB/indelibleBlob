/**
 * ============================================================================
 * OnboardingOverlay — First-Launch Guided Experience
 * ============================================================================
 *
 * 3-step interactive onboarding — user drives every transition:
 *
 *   Step 1: SIDEBAR INVITE
 *     Gentle glow + bounce on the sidebar arrow. Tooltip says "Tap to explore."
 *     Waits for the user to physically tap the sidebar arrow (detected via
 *     sidebarVisible prop flipping to true). No auto-open.
 *
 *   Step 2: SIDEBAR EXPLORE
 *     Sidebar is now open (user opened it). Floating card explains controls.
 *     User taps "Got it" to advance.
 *
 *   Step 3: START HIGHLIGHT
 *     Sidebar closes. Pulsing glow highlights the Start button.
 *     User taps "Let's go!" to complete onboarding.
 *
 * Gated by AsyncStorage — only shown once per install.
 */

import React, { useEffect, useState, useRef } from 'react';
import {
    View, Text, TouchableOpacity, Animated, StyleSheet, Image, Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, FONTS, STORAGE_KEYS } from '../../constants/config';

const ONBOARDING_KEY = STORAGE_KEYS.ONBOARDING_COMPLETE;
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type Step = 'loading' | 'sidebar_invite' | 'sidebar_explore' | 'start_highlight' | null;

interface OnboardingOverlayProps {
    onCloseSidebar: () => void;
    sidebarVisible: boolean;
    hasActiveSession: boolean;
}

export function OnboardingOverlay({
    onCloseSidebar,
    sidebarVisible,
    hasActiveSession,
}: OnboardingOverlayProps) {
    const [step, setStep] = useState<Step>('loading');

    // Animation values
    const bounceAnim = useRef(new Animated.Value(0)).current;
    const pulseOpacity = useRef(new Animated.Value(0)).current;
    const tooltipOpacity = useRef(new Animated.Value(0)).current;
    const glowScale = useRef(new Animated.Value(1)).current;
    const startGlowScale = useRef(new Animated.Value(1)).current;
    const overlayOpacity = useRef(new Animated.Value(0)).current;

    // Track animation loops for cleanup
    const glowLoopRef = useRef<Animated.CompositeAnimation | null>(null);
    const startPulseRef = useRef<Animated.CompositeAnimation | null>(null);

    // ========================================================================
    // INIT — Check if onboarding already completed
    // ========================================================================
    useEffect(() => {
        AsyncStorage.getItem(ONBOARDING_KEY).then(value => {
            if (value === 'true') {
                setStep(null);
            } else {
                // Let camera UI settle before showing anything
                setTimeout(() => setStep('sidebar_invite'), 1500);
            }
        });
    }, []);

    // ========================================================================
    // Step 1: SIDEBAR INVITE
    // Gentle glow + 3 bounces on the sidebar arrow. Tooltip fades in.
    // Does NOT auto-open — waits for the user to tap the real arrow.
    // ========================================================================
    useEffect(() => {
        if (step !== 'sidebar_invite') return;

        // Fade in glow ring
        Animated.timing(pulseOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();

        // 3 bounces with decreasing distance
        Animated.sequence([
            Animated.delay(300),
            // Bounce 1
            Animated.spring(bounceAnim, { toValue: 24, tension: 80, friction: 5, useNativeDriver: true }),
            Animated.spring(bounceAnim, { toValue: 0, tension: 60, friction: 7, useNativeDriver: true }),
            // Bounce 2
            Animated.spring(bounceAnim, { toValue: 14, tension: 80, friction: 5, useNativeDriver: true }),
            Animated.spring(bounceAnim, { toValue: 0, tension: 60, friction: 7, useNativeDriver: true }),
            // Bounce 3
            Animated.spring(bounceAnim, { toValue: 6, tension: 80, friction: 5, useNativeDriver: true }),
            Animated.spring(bounceAnim, { toValue: 0, tension: 60, friction: 7, useNativeDriver: true }),
        ]).start();

        // Slow, smooth glow pulse (not jarring)
        const glowLoop = Animated.loop(
            Animated.sequence([
                Animated.timing(glowScale, { toValue: 1.25, duration: 1000, useNativeDriver: true }),
                Animated.timing(glowScale, { toValue: 1, duration: 1000, useNativeDriver: true }),
            ])
        );
        glowLoopRef.current = glowLoop;
        glowLoop.start();

        // Tooltip fades in after bounce settles
        Animated.timing(tooltipOpacity, {
            toValue: 1,
            duration: 500,
            delay: 1200,
            useNativeDriver: true,
        }).start();

        return () => {
            glowLoop.stop();
            glowLoopRef.current = null;
        };
    }, [step]);

    // ========================================================================
    // TRANSITION: Detect user opening sidebar → advance to Step 2
    // ========================================================================
    useEffect(() => {
        if (step === 'sidebar_invite' && sidebarVisible) {
            // User tapped the arrow! Clean up step 1 animations
            glowLoopRef.current?.stop();
            pulseOpacity.setValue(0);
            tooltipOpacity.setValue(0);
            bounceAnim.setValue(0);

            // Brief pause so sidebar finishes sliding, then show explore card
            setTimeout(() => setStep('sidebar_explore'), 600);
        }
    }, [sidebarVisible, step]);

    // ========================================================================
    // Step 2: SIDEBAR EXPLORE
    // Sidebar is open (user opened it). Show floating explanation card.
    // ========================================================================
    useEffect(() => {
        if (step !== 'sidebar_explore') return;

        tooltipOpacity.setValue(0);
        overlayOpacity.setValue(0);

        Animated.parallel([
            Animated.timing(overlayOpacity, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
            Animated.timing(tooltipOpacity, {
                toValue: 1,
                duration: 500,
                delay: 300,
                useNativeDriver: true,
            }),
        ]).start();
    }, [step]);

    // ========================================================================
    // Step 3: START HIGHLIGHT
    // Sidebar closes. Pulsing glow on Start button area.
    // ========================================================================
    useEffect(() => {
        if (step !== 'start_highlight') return;

        onCloseSidebar();

        tooltipOpacity.setValue(0);
        overlayOpacity.setValue(0);

        // Slight delay for sidebar to close before showing overlay
        Animated.sequence([
            Animated.delay(400),
            Animated.parallel([
                Animated.timing(overlayOpacity, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.timing(tooltipOpacity, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();

        // Gentle start button pulse
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(startGlowScale, { toValue: 1.15, duration: 800, useNativeDriver: true }),
                Animated.timing(startGlowScale, { toValue: 1, duration: 800, useNativeDriver: true }),
            ])
        );
        startPulseRef.current = pulse;
        pulse.start();

        return () => {
            pulse.stop();
            startPulseRef.current = null;
        };
    }, [step]);

    // ========================================================================
    // ACTIONS
    // ========================================================================
    const advanceToStart = () => {
        setStep('start_highlight');
    };

    const completeOnboarding = async () => {
        startPulseRef.current?.stop();
        await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
        setStep(null);
    };

    // Don't render if completed, loading, or in active session
    if (step === null || step === 'loading' || hasActiveSession) return null;

    // ========================================================================
    // RENDER
    // ========================================================================
    return (
        <>
            {/* ============================================================ */}
            {/* Step 1: Sidebar Invite — glow + bounce, no overlay            */}
            {/* The user taps the REAL sidebar arrow to advance.              */}
            {/* ============================================================ */}
            {step === 'sidebar_invite' && !sidebarVisible && (
                <>
                    {/* Pulsing glow ring aligned to sidebar toggle */}
                    <Animated.View
                        pointerEvents="none"
                        style={[
                            styles.sidebarGlow,
                            {
                                opacity: pulseOpacity,
                                transform: [
                                    { translateX: bounceAnim },
                                    { scale: glowScale },
                                ],
                            },
                        ]}
                    >
                        <View style={styles.glowRingOuter} />
                        <View style={styles.glowRingInner} />
                    </Animated.View>

                    {/* Tooltip — does not block sidebar arrow tap */}
                    <Animated.View
                        pointerEvents="none"
                        style={[styles.pulseTooltip, { opacity: tooltipOpacity }]}
                    >
                        <Image
                            source={require('../../../assets/icon.png')}
                            style={styles.tooltipIcon}
                        />
                        <View>
                            <Text style={styles.tooltipBrand}>indelible.Blob</Text>
                            <Text style={styles.tooltipHint}>← Tap to explore controls</Text>
                        </View>
                    </Animated.View>
                </>
            )}

            {/* ============================================================ */}
            {/* Step 2: Sidebar Explore — floating card over dimmed bg         */}
            {/* ============================================================ */}
            {step === 'sidebar_explore' && (
                <Animated.View style={[styles.fullOverlay, { opacity: overlayOpacity }]}>
                    <TouchableOpacity
                        style={styles.overlayTouchArea}
                        activeOpacity={1}
                        onPress={advanceToStart}
                    >
                        <Animated.View style={[styles.exploreCard, { opacity: tooltipOpacity }]}>
                            <Image
                                source={require('../../../assets/icon.png')}
                                style={styles.cardIcon}
                            />
                            <Text style={styles.cardTitle}>Your Command Center</Text>
                            <Text style={styles.cardBody}>
                                Switch capture modes, toggle{'\n'}
                                Sovereign encryption, and manage{'\n'}
                                your identity session binding.
                            </Text>
                            <View style={styles.cardDivider} />
                            <View style={styles.cardButton}>
                                <Text style={styles.cardButtonText}>Got it →</Text>
                            </View>
                        </Animated.View>
                    </TouchableOpacity>
                </Animated.View>
            )}

            {/* ============================================================ */}
            {/* Step 3: Start Button Highlight                                */}
            {/* ============================================================ */}
            {step === 'start_highlight' && (
                <Animated.View style={[styles.fullOverlay, { opacity: overlayOpacity }]}>
                    <TouchableOpacity
                        style={styles.overlayTouchArea}
                        activeOpacity={1}
                        onPress={completeOnboarding}
                    >
                        {/* Pulsing glow near start button (bottom-right) */}
                        <Animated.View
                            pointerEvents="none"
                            style={[
                                styles.startGlow,
                                { transform: [{ scale: startGlowScale }] },
                            ]}
                        />

                        {/* Tooltip above start area */}
                        <Animated.View
                            pointerEvents="none"
                            style={[styles.startTooltip, { opacity: tooltipOpacity }]}
                        >
                            <Image
                                source={require('../../../assets/icon.png')}
                                style={styles.startTooltipIcon}
                            />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.cardTitle}>Ready to Capture Truth</Text>
                                <Text style={styles.cardBody}>
                                    When GPS locks, tap Start to begin{'\n'}
                                    your Session Bind sequence which{'\n'}
                                    secures your first capture session.
                                </Text>
                            </View>
                        </Animated.View>

                        <View style={styles.startDismiss}>
                            <Text style={styles.cardButtonText}>Let's go!</Text>
                            <Image
                                source={require('../../../assets/emoji_size_blob_icon.png')}
                                style={styles.inlineBlob}
                            />
                        </View>
                    </TouchableOpacity>
                </Animated.View>
            )}
        </>
    );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
    // Glow ring — matches sidebar toggle exactly (left:0, top:'45%', ~26w x 50h, right-radius 8)
    sidebarGlow: {
        position: 'absolute',
        left: -2,
        top: '45%',
        width: 28,
        height: 52,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
    glowRingOuter: {
        position: 'absolute',
        width: 32,
        height: 56,
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
        borderWidth: 2,
        borderColor: COLORS.primary,
        backgroundColor: 'rgba(0, 212, 255, 0.08)',
    },
    glowRingInner: {
        position: 'absolute',
        width: 26,
        height: 50,
        borderTopRightRadius: 8,
        borderBottomRightRadius: 8,
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
        borderWidth: 1,
        borderColor: COLORS.secondary,
        backgroundColor: 'rgba(153, 69, 255, 0.06)',
    },

    // Pulse tooltip (step 1) — positioned beside the sidebar arrow
    pulseTooltip: {
        position: 'absolute',
        left: 40,
        top: '45%',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(16, 8, 32, 0.92)',
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.primary,
        gap: 10,
        zIndex: 100,
    },
    tooltipIcon: {
        width: 42,
        height: 42,
        borderRadius: 21,
    },
    tooltipBrand: {
        color: COLORS.primary,
        fontSize: 13,
        fontFamily: FONTS.bold,
        letterSpacing: 0.5,
    },
    tooltipHint: {
        color: COLORS.textSecondary,
        fontSize: 11,
        fontFamily: FONTS.regular,
        marginTop: 1,
    },

    // Full overlay (steps 2 & 3)
    fullOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        zIndex: 99,
    },
    overlayTouchArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Explore card (step 2) — centered floating card
    exploreCard: {
        backgroundColor: 'rgba(16, 8, 32, 0.95)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.primary,
        padding: 24,
        alignItems: 'center',
        maxWidth: 280,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    cardIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        marginBottom: 14,
    },
    cardTitle: {
        color: COLORS.text,
        fontSize: 16,
        fontFamily: FONTS.bold,
        textAlign: 'center',
        marginBottom: 8,
    },
    cardBody: {
        color: COLORS.textSecondary,
        fontSize: 13,
        fontFamily: FONTS.regular,
        textAlign: 'center',
        lineHeight: 20,
    },
    cardDivider: {
        width: '80%',
        height: 1,
        backgroundColor: COLORS.glassBorder,
        marginVertical: 16,
    },
    cardButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 8,
        paddingHorizontal: 24,
        borderRadius: 20,
    },
    cardButtonText: {
        color: '#fff',
        fontSize: 14,
        fontFamily: FONTS.bold,
    },

    // Start glow (step 3) — matches navPill exactly at scale(1)
    // navPill: minWidth:80, paddingVertical:10, paddingHorizontal:14, borderRadius:20, borderWidth:1
    // captureRow: paddingHorizontal:16, bottomBar: paddingBottom:24
    // BlobCaptureButton touchArea: 82px tall → row height 82 → navPill centered: (82-40)/2 = 21px offset
    startGlow: {
        position: 'absolute',
        bottom: 57,
        right: 16,
        width: 82,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 212, 255, 0.12)',
        borderWidth: 2,
        borderColor: COLORS.primary,
    },

    // Start tooltip icon (step 3) — larger than step 1 tooltip icon, fills vertical space
    startTooltipIcon: {
        width: 66,
        height: 66,
        borderRadius: 14,
        marginLeft: 8,
    },

    // Start tooltip (step 3) — floating well above start area
    startTooltip: {
        position: 'absolute',
        bottom: 160,
        right: 16,
        left: 16,
        flexDirection: 'row',
        backgroundColor: 'rgba(16, 8, 32, 0.95)',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: COLORS.primary,
        padding: 16,
        gap: 14,
        alignItems: 'center',
    },

    // Dismiss button (step 3) — just above the start glow, below the tooltip
    startDismiss: {
        position: 'absolute',
        bottom: 100,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 24,
        gap: 8,
    },
    inlineBlob: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginLeft: 4,
    },
});
