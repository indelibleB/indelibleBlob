import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, PanResponder, Animated, Alert, Switch, ScrollView, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { StorageService } from '../../services/storage';
import { COLORS, FONTS } from '../../constants/config';
import { CreatorAllocationPreferences } from '@shared/types';
import { ArrowLeft } from 'lucide-react-native';

// ============================================================================
// SCRUBBER — Top-level React.memo so PanResponder survives parent re-renders.
// ============================================================================
interface ScrubberProps {
    label: string;
    description: string;
    value: number;
    color: string;
    isLockedMin?: boolean;
    onValueChange: (v: number) => void;
    onRelease?: () => void;
}

const Scrubber = React.memo<ScrubberProps>(({ label, description, value, color, isLockedMin = false, onValueChange, onRelease }) => {
    const pan = useRef(new Animated.Value(value)).current;

    useEffect(() => {
        Animated.spring(pan, { toValue: value, useNativeDriver: false, friction: 8 }).start();
    }, [value]);

    const initialValueRef = useRef(value);
    const latestValueRef = useRef(value);
    const onValueChangeRef = useRef(onValueChange);
    const onReleaseRef = useRef(onRelease);

    useEffect(() => { latestValueRef.current = value; }, [value]);
    useEffect(() => { onValueChangeRef.current = onValueChange; }, [onValueChange]);
    useEffect(() => { onReleaseRef.current = onRelease; }, [onRelease]);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                Haptics.selectionAsync();
                initialValueRef.current = latestValueRef.current;
            },
            onPanResponderMove: (_evt, gestureState) => {
                const percentDelta = (gestureState.dx / 250) * 100;
                let nextVal = initialValueRef.current + percentDelta;

                if (isLockedMin && nextVal < 33.33) nextVal = 33.33;
                if (nextVal < 0) nextVal = 0;
                if (nextVal > 100) nextVal = 100;

                onValueChangeRef.current(Number(nextVal.toFixed(2)));
            },
            onPanResponderRelease: () => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onReleaseRef.current?.();
            }
        })
    ).current;

    return (
        <View style={styles.scrubberWrapper}>
            <View style={styles.scrubberHeader}>
                <Text style={styles.scrubberLabel}>{label}</Text>
                <Text style={[styles.scrubberValue, { color }]}>{value.toFixed(2)}%</Text>
            </View>
            <Text style={styles.scrubberDesc}>{description}</Text>

            <View style={styles.trackContainer} {...panResponder.panHandlers}>
                <View style={styles.trackBackground} />
                {isLockedMin && (
                    <View style={[styles.lockedFloorMarker, { left: '33.33%' }]} />
                )}
                <Animated.View
                    style={[
                        styles.trackFill,
                        {
                            backgroundColor: color,
                            width: pan.interpolate({
                                inputRange: [0, 100],
                                outputRange: ['0%', '100%']
                            })
                        }
                    ]}
                />
                <Animated.View
                    style={[
                        styles.thumb,
                        {
                            left: pan.interpolate({
                                inputRange: [0, 100],
                                outputRange: ['0%', '100%']
                            })
                        }
                    ]}
                >
                    <View style={styles.thumbGrip} />
                </Animated.View>
            </View>
            {isLockedMin && (
                <>
                    <Text style={styles.lockedText}>Protocol minimum: 33.33%</Text>
                    <Text style={styles.lockedText}>This floor will be adjusted through a community governance vote once platform "sustainability" is met. The metrics by which we define "sustainability" will be a community vote of its own.</Text>
                </>
            )}
        </View>
    );
});

// ============================================================================
// SETTINGS SCREEN
// ============================================================================

interface SettingsScreenProps {
    onBack: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
    const [allocations, setAllocations] = useState<CreatorAllocationPreferences>({
        treasury: 33.34,
        creator: 33.33,
        community: 33.33,
        shareForResearch: false
    });

    const [loading, setLoading] = useState(true);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Track which slider was last moved so snap-to-100 adjusts the right one
    const lastMovedRef = useRef<'treasury' | 'creator' | 'community'>('creator');

    useEffect(() => {
        const loadPrefs = async () => {
            const prefs = await StorageService.loadAllocationPreferences();
            setAllocations(prefs);
            setLoading(false);
        };
        loadPrefs();
    }, []);

    const handleBack = () => {
        if (hasUnsavedChanges) {
            Alert.alert(
                'Unsaved Changes',
                'You have unsaved changes. Discard them?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Discard', style: 'destructive', onPress: onBack }
                ]
            );
        } else {
            onBack();
        }
    };

    const handleSave = async () => {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await StorageService.saveAllocationPreferences(allocations);
        setHasUnsavedChanges(false);
        onBack();
    };

    // Snap-to-100: on slider release, if total is close to 100, adjust the
    // last-moved slider so total hits exactly 100. Smooth drag is untouched.
    const snapToHundred = useCallback(() => {
        setAllocations(prev => {
            const sum = prev.treasury + prev.creator + prev.community;
            const diff = 100 - sum;

            // Only snap if within 5% of 100
            if (Math.abs(diff) > 5) return prev;
            if (Math.abs(diff) < 0.01) return prev; // Already valid

            const key = lastMovedRef.current;
            let adjusted = Number((prev[key] + diff).toFixed(2));

            // Respect treasury floor
            if (key === 'treasury' && adjusted < 33.33) return prev;
            if (adjusted < 0) return prev;
            if (adjusted > 100) return prev;

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            return { ...prev, [key]: adjusted };
        });
    }, []);

    const handleTreasuryChange = useCallback((newValue: number) => {
        if (newValue < 33.33) {
            newValue = 33.33;
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
        if (newValue > 100) newValue = 100;
        lastMovedRef.current = 'treasury';
        setAllocations(prev => ({ ...prev, treasury: Number(newValue.toFixed(2)) }));
        setHasUnsavedChanges(true);
    }, []);

    const handleCreatorChange = useCallback((newValue: number) => {
        if (newValue < 0) newValue = 0;
        if (newValue > 100) newValue = 100;
        lastMovedRef.current = 'creator';
        setAllocations(prev => ({ ...prev, creator: Number(newValue.toFixed(2)) }));
        setHasUnsavedChanges(true);
    }, []);

    const handleCommunityChange = useCallback((newValue: number) => {
        if (newValue < 0) newValue = 0;
        if (newValue > 100) newValue = 100;
        lastMovedRef.current = 'community';
        setAllocations(prev => ({ ...prev, community: Number(newValue.toFixed(2)) }));
        setHasUnsavedChanges(true);
    }, []);

    const handleResearchToggle = useCallback((val: boolean) => {
        setAllocations(prev => ({ ...prev, shareForResearch: val }));
        setHasUnsavedChanges(true);
        Haptics.selectionAsync();
    }, []);

    const currentSum = Math.round((allocations.treasury + allocations.creator + allocations.community) * 100) / 100;
    const isSumValid = Math.abs(currentSum - 100) < 0.05;
    const canSave = hasUnsavedChanges && isSumValid;

    if (loading) return null;

    return (
        <View style={styles.container}>
            <LinearGradient colors={[COLORS.backgroundDark, COLORS.background]} style={styles.gradient}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleBack} style={styles.iconButton}>
                        <ArrowLeft size={24} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Settings</Text>
                    <View style={styles.iconButton} />
                </View>

                <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollContainer}>
                    <Text style={styles.sectionTitle}>Creator Allocations</Text>
                    <Text style={[styles.subtitle, { textAlign: 'center' }]}>
                        Adjust your SKR reward splits. The indelible.Blob appreciates your support of the treasury allocation floor temporarily while the Blob finds its indelibility! :)
                    </Text>

                    <Scrubber
                        label="Treasury (Protocol)"
                        description="Sustains network operations and data availability fees."
                        value={allocations.treasury}
                        color={COLORS.primary}
                        isLockedMin={true}
                        onValueChange={handleTreasuryChange}
                        onRelease={snapToHundred}
                    />

                    <Scrubber
                        label="Creator Rewards"
                        description="Direct revenue sent to the creator of the capture."
                        value={allocations.creator}
                        color={COLORS.secondary}
                        onValueChange={handleCreatorChange}
                        onRelease={snapToHundred}
                    />

                    <Scrubber
                        label="Community / Public Goods"
                        description="Funds directed to ecosystem grants and public goods."
                        value={allocations.community}
                        color="#A855F7"
                        onValueChange={handleCommunityChange}
                        onRelease={snapToHundred}
                    />

                    <View style={styles.summaryBox}>
                        <View>
                            <Text style={styles.summaryLabel}>Total Allocation</Text>
                            {!isSumValid && (
                                <Text style={styles.sumErrorText}>Must equal exactly 100%</Text>
                            )}
                        </View>
                        <Text style={[styles.summaryTotal, { color: isSumValid ? COLORS.success : COLORS.error }]}>
                            {currentSum}%
                        </Text>
                    </View>

                    {/* Research Consent — Copy from Research Lead (Agent 5) */}
                    <View style={styles.consentSection}>
                        <Text style={styles.consentHeadline}>Help us Build a Longevity-Minded, Creative Economy Tethered to Reality</Text>
                        <Text style={styles.consentBody}>
                            We invite you to participate in our research by allowing us to include your anonymized and aggregated allocation data in our studies. Your participation helps us understand how to build more equitable economic models.
                        </Text>
                        <Text style={styles.consentBody}>
                            Your privacy is protected — we only use anonymized, aggregated data, and you can opt out at any time without penalty.
                        </Text>

                        <View style={styles.consentToggleRow}>
                            <Text style={styles.consentCheckLabel}>
                                I consent to my anonymized allocation data being used for research purposes to help build a stronger economy.
                            </Text>
                            <Switch
                                value={allocations.shareForResearch}
                                onValueChange={handleResearchToggle}
                                trackColor={{ false: 'rgba(255,255,255,0.1)', true: COLORS.primary }}
                                thumbColor={allocations.shareForResearch ? COLORS.text : '#888'}
                            />
                        </View>

                        <TouchableOpacity onPress={() => Linking.openURL('https://indelibleblob.com/#/research/consent')}>
                            <Text style={styles.consentLink}>Learn more about our research and data policies.</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
                        disabled={!canSave}
                        onPress={handleSave}
                    >
                        <Text style={styles.saveButtonText}>
                            {!isSumValid
                                ? "Invalid Allocation"
                                : hasUnsavedChanges
                                    ? "Save Preferences"
                                    : "Saved"}
                        </Text>
                    </TouchableOpacity>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    gradient: {
        flex: 1,
        paddingTop: 50,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    iconButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        color: COLORS.text,
        fontFamily: FONTS.bold,
        fontSize: 18,
    },
    scrollContent: {
        flex: 1,
        paddingHorizontal: 20,
    },
    scrollContainer: {
        paddingBottom: 40,
    },
    sectionTitle: {
        color: COLORS.text,
        fontFamily: FONTS.bold,
        fontSize: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        color: COLORS.textSecondary,
        fontFamily: FONTS.regular,
        fontSize: 14,
        marginBottom: 30,
        lineHeight: 20,
    },
    scrubberWrapper: {
        marginBottom: 30,
    },
    scrubberHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    scrubberLabel: {
        color: COLORS.text,
        fontFamily: FONTS.bold,
        fontSize: 16,
    },
    scrubberValue: {
        fontFamily: FONTS.bold,
        fontSize: 16,
    },
    scrubberDesc: {
        color: COLORS.textSecondary,
        fontFamily: FONTS.regular,
        fontSize: 12,
        marginBottom: 12,
    },
    trackContainer: {
        height: 44,
        justifyContent: 'center',
        position: 'relative',
        paddingVertical: 10,
    },
    trackBackground: {
        height: 6,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 3,
        width: '100%',
    },
    trackFill: {
        height: 6,
        borderRadius: 3,
        position: 'absolute',
        top: 19,
        left: 0,
    },
    lockedFloorMarker: {
        position: 'absolute',
        top: 12,
        bottom: 12,
        width: 2,
        backgroundColor: 'white',
        zIndex: 1,
    },
    thumb: {
        position: 'absolute',
        top: 8,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'white',
        marginLeft: -14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 3.84,
        elevation: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    thumbGrip: {
        width: 4,
        height: 12,
        backgroundColor: COLORS.backgroundDark,
        borderRadius: 2,
    },
    lockedText: {
        color: COLORS.textSecondary,
        fontFamily: FONTS.medium,
        fontSize: 11,
        marginTop: 8,
        opacity: 0.7,
    },
    summaryBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 16,
        borderRadius: 12,
        marginTop: 10,
        marginBottom: 24,
    },
    summaryLabel: {
        color: COLORS.text,
        fontFamily: FONTS.medium,
        fontSize: 16,
    },
    summaryTotal: {
        fontFamily: FONTS.bold,
        fontSize: 20,
    },
    sumErrorText: {
        color: COLORS.error,
        fontFamily: FONTS.medium,
        fontSize: 12,
        marginTop: 4,
    },
    consentSection: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    consentHeadline: {
        color: COLORS.text,
        fontFamily: FONTS.bold,
        fontSize: 15,
        marginBottom: 10,
        textAlign: 'center',
    },
    consentBody: {
        color: COLORS.textSecondary,
        fontFamily: FONTS.regular,
        fontSize: 12,
        lineHeight: 18,
        marginBottom: 10,
    },
    consentToggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 6,
        marginBottom: 12,
    },
    consentCheckLabel: {
        color: COLORS.text,
        fontFamily: FONTS.medium,
        fontSize: 12,
        lineHeight: 17,
        flex: 1,
        marginRight: 14,
    },
    consentLink: {
        color: COLORS.primary,
        fontFamily: FONTS.medium,
        fontSize: 12,
        textDecorationLine: 'underline',
    },
    saveButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    saveButtonDisabled: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        opacity: 0.5,
    },
    saveButtonText: {
        color: COLORS.text,
        fontFamily: FONTS.bold,
        fontSize: 16,
    }
});
