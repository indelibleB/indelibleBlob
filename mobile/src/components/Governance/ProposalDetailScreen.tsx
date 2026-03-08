import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { StorageService } from '../../services/storage';
import { COLORS, FONTS } from '../../constants/config';
import { ArrowLeft, CheckCircle2, ShieldAlert } from 'lucide-react-native';
import { blobLog } from '../../utils/logger';

// Exported Interface for global Governance typing
export interface GovernanceProposal {
    id: string;
    title: string;
    description: string;
}

interface ProposalDetailScreenProps {
    proposal: GovernanceProposal;
    onBack: () => void;
}

export const ProposalDetailScreen: React.FC<ProposalDetailScreenProps> = ({ proposal, onBack }) => {
    const [hasVoted, setHasVoted] = useState(false);
    const [witnessCredits, setWitnessCredits] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    // Mock decay for visual purposes only based on last session time. MVP feature.
    const [isDecaying, setIsDecaying] = useState(false);

    useEffect(() => {
        const loadUserData = async () => {
            try {
                // 1. Check if they already voted on this specific proposal
                const votes = await StorageService.loadGovernanceVotes();
                if (votes[proposal.id]) {
                    setHasVoted(true);
                }

                // 2. Calculate pure Proof-of-Witness Voting Power (1 Session = 1 Credit)
                // Count sessions that finished successfully (completed or uploaded).
                // Exclude 'active' sessions (in-progress or crashed before ending).
                const allSessions = await StorageService.loadSessions();

                const validSessions = allSessions.filter(s => s.status === 'completed' || s.status === 'uploaded');
                setWitnessCredits(validSessions.length);

                // 3. Visual Decay logic (if last valid session > 7 days ago)
                if (validSessions.length > 0) {
                    const lastSession = validSessions[0]; // Assuming newest first
                    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
                    if (lastSession.startTime < sevenDaysAgo) {
                        setIsDecaying(true);
                    }
                }

            } catch (err) {
                blobLog.error("Error loading Governance Power:", err);
            } finally {
                setLoading(false);
            }
        };
        loadUserData();
    }, [proposal.id]);

    const handleCastVote = async () => {
        if (hasVoted) return;

        if (witnessCredits === 0) {
            Alert.alert(
                "No Witness Credits",
                "You must complete at least one verified capture session to earn voting power in the indelible.Blob protocol.",
                [{ text: "Understood" }]
            );
            return;
        }

        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

        // Save using established Storage method
        await StorageService.saveGovernanceVote(proposal.id);

        setHasVoted(true);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    };

    if (loading) return null;

    return (
        <View style={styles.container}>
            <LinearGradient colors={[COLORS.backgroundDark, COLORS.background]} style={styles.gradient}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onBack} style={styles.iconButton}>
                        <ArrowLeft size={24} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Proposal Details</Text>
                    <View style={styles.iconButton} />
                </View>

                <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>

                    {/* Proposal Headers */}
                    <View style={styles.proposalSection}>
                        <Text style={styles.title}>{proposal.title}</Text>
                        <Text style={styles.description}>{proposal.description}</Text>
                    </View>

                    {/* Proof of Witness Breakdown */}
                    <View style={styles.powerModule}>
                        <View style={styles.powerHeader}>
                            <ShieldAlert size={18} color={COLORS.primary} />
                            <Text style={styles.powerTitle}>Proof-of-Witness Power</Text>
                        </View>

                        <Text style={styles.powerContext}>
                            indelible.Blob governance is strictly determined by cryptographic evidence of reality. Wealth cannot buy influence. 1 Verified Capture Session = 1 Witness Credit.
                        </Text>

                        <View style={styles.breakdownRow}>
                            <Text style={styles.breakdownLabel}>Verified Sessions</Text>
                            <Text style={styles.breakdownValue}>{witnessCredits}</Text>
                        </View>

                        <View style={styles.breakdownRow}>
                            <Text style={styles.breakdownLabel}>Standing</Text>
                            <Text style={[styles.breakdownValue, { color: isDecaying ? COLORS.error : COLORS.success }]}>
                                {isDecaying ? 'Decaying (Inactive > 7d)' : 'Active'}
                            </Text>
                        </View>

                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Total Voting Power</Text>
                            <Text style={styles.totalValue}>{witnessCredits}</Text>
                        </View>
                    </View>

                    {/* Action Area */}
                    <TouchableOpacity
                        style={[styles.voteButton, hasVoted && styles.voteButtonDisabled, witnessCredits === 0 && styles.voteButtonDisabled]}
                        disabled={hasVoted || witnessCredits === 0}
                        onPress={handleCastVote}
                    >
                        {hasVoted ? (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <CheckCircle2 color={COLORS.success} size={20} />
                                <Text style={[styles.voteButtonText, { color: COLORS.success }]}>
                                    Vote Cast ({witnessCredits} Power)
                                </Text>
                            </View>
                        ) : (
                            <Text style={styles.voteButtonText}>
                                {witnessCredits === 0 ? 'No Witness Credits' : `Cast Vote (${witnessCredits} Power)`}
                            </Text>
                        )}
                    </TouchableOpacity>

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
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    proposalSection: {
        marginBottom: 30,
    },
    title: {
        color: COLORS.text,
        fontFamily: FONTS.bold,
        fontSize: 22,
        lineHeight: 30,
        marginBottom: 16,
    },
    description: {
        color: COLORS.textSecondary,
        fontFamily: FONTS.regular,
        fontSize: 16,
        lineHeight: 24,
    },
    powerModule: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    powerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    powerTitle: {
        color: COLORS.text,
        fontFamily: FONTS.bold,
        fontSize: 16,
    },
    powerContext: {
        color: COLORS.textSecondary,
        fontFamily: FONTS.medium,
        fontSize: 13,
        lineHeight: 18,
        marginBottom: 20,
        fontStyle: 'italic',
        opacity: 0.8,
    },
    breakdownRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    breakdownLabel: {
        color: COLORS.textSecondary,
        fontFamily: FONTS.medium,
        fontSize: 14,
    },
    breakdownValue: {
        color: COLORS.text,
        fontFamily: FONTS.semiBold,
        fontSize: 14,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    totalLabel: {
        color: COLORS.primary,
        fontFamily: FONTS.bold,
        fontSize: 16,
    },
    totalValue: {
        color: COLORS.primary,
        fontFamily: FONTS.bold,
        fontSize: 20,
    },
    voteButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 18,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    voteButtonDisabled: {
        backgroundColor: 'rgba(20, 241, 149, 0.1)',
        shadowOpacity: 0,
        elevation: 0,
    },
    voteButtonText: {
        color: COLORS.backgroundDark,
        fontFamily: FONTS.bold,
        fontSize: 16,
    }
});
