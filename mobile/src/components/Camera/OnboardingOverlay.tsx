/**
 * ============================================================================
 * OnboardingOverlay — First-Launch Guided Experience
 * ============================================================================
 *
 * 5-step interactive onboarding + free explore:
 *
 *   Step 1: INTRO DEFINITION
 *     Fullscreen card: "What is indelible.Blob?" — defines the protocol.
 *
 *   Step 2: INTRO NECESSITY
 *     Fullscreen card: "Why does this matter right now?"
 *     Includes hyperlink to Yale ISPS "liar's dividend" research.
 *
 *   Step 3: SIDEBAR INVITE
 *     Glow scale cycles on the sidebar arrow. User taps to open.
 *
 *   Step 4: SIDEBAR EXPLORE
 *     Sidebar is open. Sequential highlight pulses on Settings, Vote,
 *     and info buttons. Card explains controls. User taps "Got it" to
 *     dismiss overlay — sidebar stays open for free exploration.
 *
 *   Step 4b: SIDEBAR FREE EXPLORE
 *     No overlay. User explores sidebar freely. When they close the
 *     sidebar, onboarding continues.
 *
 *   Step 5: START HIGHLIGHT
 *     Pulsing glow highlights the Start button.
 *
 * Gated by AsyncStorage — only shown once per install.
 */

import React, { useEffect, useState, useRef } from 'react';
import {
    View, Text, TouchableOpacity, Animated, StyleSheet, Image, Dimensions,
    ScrollView, Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, FONTS, STORAGE_KEYS } from '../../constants/config';

const ONBOARDING_KEY = STORAGE_KEYS.ONBOARDING_COMPLETE;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Sidebar glow button width (~28px) → scale to screen edge width for intro effect
const GLOW_BUTTON_WIDTH = 28;
const INTRO_SCALE = SCREEN_WIDTH / GLOW_BUTTON_WIDTH;

const LIARS_DIVIDEND_URL = 'https://isps.yale.edu/research/publications/isps24-07';

// Sidebar layout constants (sidebar: left:0, top:100, width:220, padding:20)
// These approximate the button positions within the sidebar content area.
// Settings/Vote row sits inside the identity card near the bottom.
// Info buttons are below the identity card.
const SIDEBAR_LEFT = 20;       // sidebar internal padding
const SIDEBAR_WIDTH = 180;     // 220 - 40px padding
const SIDEBAR_TOP = 100;       // sidebar top offset from screen

type Step =
    | 'loading'
    | 'intro_definition'
    | 'intro_necessity'
    | 'sidebar_invite'
    | 'sidebar_explore'     // Card with "Got it"
    | 'sidebar_tour'        // Sequential highlight animation
    | 'sidebar_free_explore' // User explores freely, no overlay
    | 'start_highlight'
    | null;

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
    const pulseOpacity = useRef(new Animated.Value(0)).current;
    const tooltipOpacity = useRef(new Animated.Value(0)).current;
    const glowScale = useRef(new Animated.Value(1)).current;
    const startGlowScale = useRef(new Animated.Value(1)).current;
    const overlayOpacity = useRef(new Animated.Value(0)).current;
    const cardFade = useRef(new Animated.Value(0)).current;

    // Sidebar button highlights — sequential animation
    const settingsGlow = useRef(new Animated.Value(0)).current;
    const voteGlow = useRef(new Animated.Value(0)).current;
    const infoGlow = useRef(new Animated.Value(0)).current;
    // Info glow position animation (moves from Session Bind to Sovereign Mode)
    const infoGlowTop = useRef(new Animated.Value(0)).current;

    // Track animation loops for cleanup
    const glowLoopRef = useRef<Animated.CompositeAnimation | null>(null);
    const startPulseRef = useRef<Animated.CompositeAnimation | null>(null);
    const highlightSeqRef = useRef<Animated.CompositeAnimation | null>(null);

    // ========================================================================
    // INIT — Check if onboarding already completed
    // ========================================================================
    useEffect(() => {
        AsyncStorage.getItem(ONBOARDING_KEY).then(value => {
            if (value === 'true') {
                setStep(null);
            } else {
                setTimeout(() => setStep('intro_definition'), 800);
            }
        });
    }, []);

    // ========================================================================
    // Steps 1 & 2: INTRO SCREENS — fade in overlay + card
    // ========================================================================
    useEffect(() => {
        if (step !== 'intro_definition' && step !== 'intro_necessity') return;

        overlayOpacity.setValue(0);
        cardFade.setValue(0);

        Animated.parallel([
            Animated.timing(overlayOpacity, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.timing(cardFade, {
                toValue: 1,
                duration: 600,
                delay: 200,
                useNativeDriver: true,
            }),
        ]).start();
    }, [step]);

    // ========================================================================
    // Step 3: SIDEBAR INVITE
    // 2 large glow scale cycles (button → screen edge → button) then idle pulse.
    // ========================================================================
    useEffect(() => {
        if (step !== 'sidebar_invite') return;

        overlayOpacity.setValue(0);
        cardFade.setValue(0);

        Animated.timing(pulseOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();

        Animated.sequence([
            Animated.delay(300),
            Animated.timing(glowScale, { toValue: INTRO_SCALE, duration: 800, useNativeDriver: true }),
            Animated.timing(glowScale, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.timing(glowScale, { toValue: INTRO_SCALE, duration: 800, useNativeDriver: true }),
            Animated.timing(glowScale, { toValue: 1, duration: 800, useNativeDriver: true }),
        ]).start(() => {
            const glowLoop = Animated.loop(
                Animated.sequence([
                    Animated.timing(glowScale, { toValue: 1.25, duration: 1000, useNativeDriver: true }),
                    Animated.timing(glowScale, { toValue: 1, duration: 1000, useNativeDriver: true }),
                ])
            );
            glowLoopRef.current = glowLoop;
            glowLoop.start();
        });

        Animated.timing(tooltipOpacity, {
            toValue: 1,
            duration: 500,
            delay: 1200,
            useNativeDriver: true,
        }).start();

        return () => {
            glowScale.stopAnimation();
            glowLoopRef.current?.stop();
            glowLoopRef.current = null;
        };
    }, [step]);

    // ========================================================================
    // TRANSITION: Detect user opening sidebar → advance to Step 4
    // ========================================================================
    useEffect(() => {
        if (step === 'sidebar_invite' && sidebarVisible) {
            glowLoopRef.current?.stop();
            pulseOpacity.setValue(0);
            tooltipOpacity.setValue(0);
            setTimeout(() => setStep('sidebar_explore'), 600);
        }
    }, [sidebarVisible, step]);

    // ========================================================================
    // Step 4: SIDEBAR EXPLORE — Show card only, no highlights yet
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
    // Step 4b: SIDEBAR TOUR — Sequential highlight animation
    // "Got it" triggers this. Highlights play, then → free explore.
    // ========================================================================
    useEffect(() => {
        if (step !== 'sidebar_tour') return;

        settingsGlow.setValue(0);
        voteGlow.setValue(0);
        infoGlow.setValue(0);
        infoGlowTop.setValue(0);

        const seq = Animated.sequence([
            Animated.delay(300),

            // Settings button — 2 pulses (1s each)
            Animated.timing(settingsGlow, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.timing(settingsGlow, { toValue: 0.2, duration: 600, useNativeDriver: true }),
            Animated.timing(settingsGlow, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.timing(settingsGlow, { toValue: 0, duration: 600, useNativeDriver: true }),

            // Vote button — 2 pulses (1s each)
            Animated.timing(voteGlow, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.timing(voteGlow, { toValue: 0.2, duration: 600, useNativeDriver: true }),
            Animated.timing(voteGlow, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.timing(voteGlow, { toValue: 0, duration: 600, useNativeDriver: true }),

            // Info glow on "Session Bind" — 2 pulses
            Animated.timing(infoGlow, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.timing(infoGlow, { toValue: 0.2, duration: 600, useNativeDriver: true }),
            Animated.timing(infoGlow, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.timing(infoGlow, { toValue: 0.3, duration: 600, useNativeDriver: true }),

            // Smoothly move info glow down to "Sovereign Mode" position (2s)
            Animated.parallel([
                Animated.timing(infoGlowTop, { toValue: 1, duration: 2000, useNativeDriver: true }),
                Animated.timing(infoGlow, { toValue: 1, duration: 500, useNativeDriver: true }),
            ]),

            // Sovereign Mode info — 2 pulses
            Animated.timing(infoGlow, { toValue: 0.2, duration: 600, useNativeDriver: true }),
            Animated.timing(infoGlow, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.timing(infoGlow, { toValue: 0.2, duration: 600, useNativeDriver: true }),
            Animated.timing(infoGlow, { toValue: 1, duration: 400, useNativeDriver: true }),

            // Fade out all
            Animated.timing(infoGlow, { toValue: 0, duration: 500, useNativeDriver: true }),
        ]);

        highlightSeqRef.current = seq;
        seq.start(() => {
            // Tour complete — sidebar stays open, user explores freely
            setStep('sidebar_free_explore');
        });

        return () => {
            seq.stop();
            highlightSeqRef.current = null;
        };
    }, [step]);

    // ========================================================================
    // Step 4b: SIDEBAR FREE EXPLORE
    // No overlay — user explores sidebar. Detect close to continue.
    // ========================================================================
    useEffect(() => {
        if (step === 'sidebar_free_explore' && !sidebarVisible) {
            // User closed the sidebar — continue onboarding
            setStep('start_highlight');
        }
    }, [sidebarVisible, step]);

    // ========================================================================
    // Step 5: START HIGHLIGHT
    // Sidebar closes. Pulsing glow on Start button area.
    // ========================================================================
    useEffect(() => {
        if (step !== 'start_highlight') return;

        // Ensure sidebar is closed (in case it wasn't already)
        onCloseSidebar();

        tooltipOpacity.setValue(0);
        overlayOpacity.setValue(0);

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
    const advanceToNecessity = () => setStep('intro_necessity');
    const advanceToSidebar = () => setStep('sidebar_invite');

    const dismissExploreCard = () => {
        // Dismiss card overlay, start the highlight tour sequence
        tooltipOpacity.setValue(0);
        overlayOpacity.setValue(0);
        setStep('sidebar_tour');
    };

    const openLiarsDividend = () => {
        Linking.openURL(LIARS_DIVIDEND_URL);
    };

    const completeOnboarding = async () => {
        startPulseRef.current?.stop();
        await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
        setStep(null);
    };

    // Don't render if completed, loading, free explore, or in active session
    if (step === null || step === 'loading' || step === 'sidebar_free_explore' || hasActiveSession) return null;

    // ========================================================================
    // RENDER
    // ========================================================================
    return (
        <>
            {/* ============================================================ */}
            {/* Step 1: INTRO — What is indelible.Blob?                      */}
            {/* ============================================================ */}
            {step === 'intro_definition' && (
                <Animated.View style={[styles.fullOverlay, { opacity: overlayOpacity }]}>
                    <Animated.View style={[styles.introContainer, { opacity: cardFade }]}>
                        <ScrollView
                            contentContainerStyle={styles.introScroll}
                            showsVerticalScrollIndicator={false}
                        >
                            <Image
                                source={require('../../../assets/icon.png')}
                                style={styles.introIcon}
                            />
                            <Text style={styles.introHeadline}>
                                What is indelible.Blob?
                            </Text>
                            <View style={styles.introDivider} />
                            <Text style={styles.introDefinition}>
                                <Text style={styles.introItalic}>In·del·i·ble</Text>
                                <Text style={styles.introDefLabel}> (adj.): </Text>
                                Marks that cannot be removed, washed away, or erased.
                            </Text>
                            <Text style={styles.introSubDefinition}>
                                In the physical world, it's the ink that survives the flood.{'\n'}
                                In the digital world, it's the truth that survives the algorithm.
                            </Text>
                            <View style={styles.introDividerSmall} />
                            <Text style={styles.introBody}>
                                indelible.Blob is the world's first decentralized truth
                                infrastructure built for the age of synthetic media. It isn't
                                just a camera app; it is a cryptographic seal of reality to
                                replace your camera app.
                            </Text>
                            <Text style={styles.introBody}>
                                By fusing hardware-level device attestation with the immutable
                                ledgers of Sui and Solana, we prove that your photos and videos
                                are real, at the exact moment of capture, not after. Not
                                generated, nor edited by human or machine alike.
                            </Text>
                            <Text style={styles.introBody}>
                                We turn fleeting digital signals into permanent "Blobs" of
                                verifiable evidence, stored across the censorship-resistant
                                Walrus network.
                            </Text>
                            <Text style={styles.introMetaphor}>
                                The "Blob" is the fluid, organic truth; the "Cube" is the
                                rigid, cryptographic container that protects it. Together, they
                                ensure that what you see is exactly what happened.
                            </Text>
                        </ScrollView>
                        <TouchableOpacity
                            style={styles.introButton}
                            onPress={advanceToNecessity}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.introButtonText}>Next →</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </Animated.View>
            )}

            {/* ============================================================ */}
            {/* Step 2: INTRO — Why does this matter right now?               */}
            {/* ============================================================ */}
            {step === 'intro_necessity' && (
                <Animated.View style={[styles.fullOverlay, { opacity: overlayOpacity }]}>
                    <Animated.View style={[styles.introContainer, { opacity: cardFade }]}>
                        <ScrollView
                            contentContainerStyle={styles.introScroll}
                            showsVerticalScrollIndicator={false}
                        >
                            <Text style={styles.introHeadline}>
                                Why does this matter{'\n'}right now?
                            </Text>
                            <View style={styles.introDivider} />
                            <Text style={styles.introBody}>
                                We are entering an era where seeing is no longer believing.
                                96% of AI-generated deepfakes now bypass traditional detection,
                                and the{' '}
                                <Text
                                    style={styles.introLink}
                                    onPress={openLiarsDividend}
                                >
                                    "liar's dividend"
                                </Text>
                                {' '}allows the powerful to dismiss real evidence as fake.
                            </Text>
                            <Text style={styles.introBody}>
                                This isn't just a technical glitch; it is a crisis of trust
                                that threatens our interpersonal respect, our legal systems,
                                and our shared global reality.
                            </Text>
                            <View style={styles.introDividerSmall} />
                            <Text style={styles.introSolutionLabel}>The Solution:</Text>
                            <Text style={styles.introBody}>
                                indelible.Blob solves this by shifting the burden of proof
                                from detection to verification.
                            </Text>
                            <View style={styles.introBulletRow}>
                                <Text style={styles.introBulletIcon}>{'🛡️'}</Text>
                                <Text style={styles.introBulletText}>
                                    <Text style={styles.introBold}>For You: </Text>
                                    It's the power to defend your own eyes and your own work.
                                </Text>
                            </View>
                            <View style={styles.introBulletRow}>
                                <Text style={styles.introBulletIcon}>{'🤝'}</Text>
                                <Text style={styles.introBulletText}>
                                    <Text style={styles.introBold}>For the Community: </Text>
                                    It's a return to a shared ground of facts.
                                </Text>
                            </View>
                            <View style={styles.introBulletRow}>
                                <Text style={styles.introBulletIcon}>{'🌍'}</Text>
                                <Text style={styles.introBulletText}>
                                    <Text style={styles.introBold}>For the World: </Text>
                                    It's a path toward a global culture where value is placed
                                    on authenticity, and where every person who breathes in
                                    this realm can once again trust the media that connects us.
                                </Text>
                            </View>
                            <View style={styles.introDivider} />
                            <Text style={styles.introCTA}>
                                Capture the truth. Make it indelible.
                            </Text>
                        </ScrollView>
                        <TouchableOpacity
                            style={styles.introButton}
                            onPress={advanceToSidebar}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.introButtonText}>Let's begin →</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </Animated.View>
            )}

            {/* ============================================================ */}
            {/* Step 3: Sidebar Invite — glow + scale, no overlay             */}
            {/* ============================================================ */}
            {step === 'sidebar_invite' && !sidebarVisible && (
                <>
                    <Animated.View
                        pointerEvents="none"
                        style={[
                            styles.sidebarGlow,
                            {
                                opacity: pulseOpacity,
                                transform: [{ scale: glowScale }],
                            },
                        ]}
                    >
                        <View style={styles.glowRingOuter} />
                        <View style={styles.glowRingInner} />
                    </Animated.View>

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
            {/* Step 4: Sidebar Explore — card overlay only                    */}
            {/* ============================================================ */}
            {step === 'sidebar_explore' && (
                <Animated.View style={[styles.fullOverlay, { opacity: overlayOpacity }]}>
                    <TouchableOpacity
                        style={styles.overlayTouchArea}
                        activeOpacity={1}
                        onPress={dismissExploreCard}
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
                            <Text style={[styles.cardBody, { marginTop: 8, fontStyle: 'italic' }]}>
                                Explore Settings and Vote in the{'\n'}
                                sidebar when you're ready.
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
            {/* Step 4b: Sidebar Tour — highlight rings, no overlay dimming    */}
            {/* ============================================================ */}
            {step === 'sidebar_tour' && (
                <>
                    {/* Settings button highlight */}
                    <Animated.View
                        pointerEvents="none"
                        style={[styles.highlightSettings, { opacity: settingsGlow }]}
                    />
                    {/* Vote button highlight */}
                    <Animated.View
                        pointerEvents="none"
                        style={[styles.highlightVote, { opacity: voteGlow }]}
                    />
                    {/* Info button highlight — slides from Session Bind to Sovereign Mode */}
                    <Animated.View
                        pointerEvents="none"
                        style={[
                            styles.highlightInfo,
                            {
                                opacity: infoGlow,
                                transform: [{
                                    translateY: infoGlowTop.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0, 41],
                                    }),
                                }],
                            },
                        ]}
                    />
                </>
            )}

            {/* ============================================================ */}
            {/* Step 5: Start Button Highlight                                */}
            {/* ============================================================ */}
            {step === 'start_highlight' && (
                <Animated.View style={[styles.fullOverlay, { opacity: overlayOpacity }]}>
                    <TouchableOpacity
                        style={styles.overlayTouchArea}
                        activeOpacity={1}
                        onPress={completeOnboarding}
                    >
                        <Animated.View
                            pointerEvents="none"
                            style={[
                                styles.startGlow,
                                { transform: [{ scale: startGlowScale }] },
                            ]}
                        />

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
    // Intro screens (steps 1 & 2)
    introContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 30,
    },
    introScroll: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingBottom: 20,
    },
    introIcon: {
        width: 80,
        height: 80,
        borderRadius: 20,
        alignSelf: 'center',
        marginBottom: 20,
    },
    introHeadline: {
        color: COLORS.text,
        fontSize: 24,
        fontFamily: FONTS.bold,
        textAlign: 'center',
        marginBottom: 16,
        lineHeight: 32,
    },
    introDivider: {
        width: 60,
        height: 2,
        backgroundColor: COLORS.primary,
        alignSelf: 'center',
        marginVertical: 16,
    },
    introDividerSmall: {
        width: 40,
        height: 1,
        backgroundColor: COLORS.glassBorder,
        alignSelf: 'center',
        marginVertical: 14,
    },
    introDefinition: {
        color: COLORS.textSecondary,
        fontSize: 15,
        fontFamily: FONTS.regular,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 8,
    },
    introItalic: {
        fontFamily: FONTS.bold,
        fontStyle: 'italic',
        color: COLORS.primary,
    },
    introDefLabel: {
        color: COLORS.textSecondary,
        fontStyle: 'italic',
    },
    introSubDefinition: {
        color: COLORS.textSecondary,
        fontSize: 13,
        fontFamily: FONTS.regular,
        fontStyle: 'italic',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 4,
        opacity: 0.8,
    },
    introBody: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontFamily: FONTS.regular,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 12,
    },
    introMetaphor: {
        color: COLORS.text,
        fontSize: 14,
        fontFamily: FONTS.medium,
        textAlign: 'center',
        lineHeight: 22,
        marginTop: 8,
        paddingHorizontal: 8,
    },
    introSolutionLabel: {
        color: COLORS.primary,
        fontSize: 16,
        fontFamily: FONTS.bold,
        textAlign: 'center',
        marginBottom: 8,
    },
    introLink: {
        color: COLORS.primary,
        textDecorationLine: 'underline',
        fontFamily: FONTS.bold,
    },
    introBulletRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: 12,
        marginBottom: 10,
    },
    introBulletIcon: {
        fontSize: 16,
        marginRight: 10,
        marginTop: 2,
    },
    introBulletText: {
        flex: 1,
        color: COLORS.textSecondary,
        fontSize: 14,
        fontFamily: FONTS.regular,
        lineHeight: 22,
    },
    introBold: {
        fontFamily: FONTS.bold,
        color: COLORS.text,
    },
    introCTA: {
        color: COLORS.text,
        fontSize: 18,
        fontFamily: FONTS.bold,
        textAlign: 'center',
        marginTop: 4,
    },
    introButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 14,
        paddingHorizontal: 40,
        borderRadius: 28,
        alignSelf: 'center',
        marginTop: 16,
    },
    introButtonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: FONTS.bold,
    },

    // Glow ring — sidebar toggle
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

    // Pulse tooltip (step 3)
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

    // Full overlay
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

    // Sidebar button highlights (step 4b: sidebar_tour)
    // Sidebar: left:0, top:100, width:220, paddingHorizontal:16, paddingVertical:20
    // Guest mode layout (most likely during first-launch onboarding):
    //   Controls title + 4 buttons (~160px) + identity card (~80px) = ~240px from sidebar top
    //   Settings/Vote row near bottom of identity card: sidebar top(100) + padding(20) + ~335px ≈ 455px
    //   Info buttons below card: ~500px and ~541px from screen top
    highlightSettings: {
        position: 'absolute',
        left: 27,
        top: 481,
        width: 82,
        height: 28,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: COLORS.primary,
        backgroundColor: 'rgba(0, 212, 255, 0.25)',
        zIndex: 100,
    },
    highlightVote: {
        position: 'absolute',
        left: 117,
        top: 481,
        width: 82,
        height: 28,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: 'rgba(20, 241, 149, 0.8)',
        backgroundColor: 'rgba(20, 241, 149, 0.20)',
        zIndex: 100,
    },
    // Info highlight — starts at "What is Session Bind?" position
    // translateY animates it down 41px to "What is Sovereign Mode?"
    highlightInfo: {
        position: 'absolute',
        left: 16,
        top: 530,
        width: 190,
        height: 22,
        borderRadius: 11,
        borderWidth: 1.5,
        borderColor: COLORS.primary,
        backgroundColor: 'rgba(0, 212, 255, 0.15)',
        zIndex: 100,
    },

    // Explore card (step 4)
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

    // Start glow (step 5)
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
    startTooltipIcon: {
        width: 66,
        height: 66,
        borderRadius: 14,
        marginLeft: 8,
    },
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
