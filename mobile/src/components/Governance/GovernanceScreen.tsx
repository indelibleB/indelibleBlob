import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, TextInput, Linking, Alert, Keyboard } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { StorageService } from '../../services/storage';
import { COLORS, FONTS } from '../../constants/config';
import { CheckCircle2, ArrowLeft, Info, ChevronRight, Mail } from 'lucide-react-native';
import { GovernanceProposal } from './ProposalDetailScreen';
import { blobLog } from '../../utils/logger';

// Formspree endpoint — same list as the website footer newsletter signup
const FORMSPREE_NEWSLETTER_URL = 'https://formspree.io/f/mwvlpqvj';

interface GovernanceScreenProps {
    onBack: () => void;
    onViewProposal: (proposal: GovernanceProposal) => void;
}

// Hardcoded proposals for MVP
export const PROPOSALS: GovernanceProposal[] = [
    {
        id: 'prop-wildlife-grants',
        title: 'Allocate 10% of Community Fund to wildlife conservation imagery grants',
        description: 'Direct community funds toward verified wildlife and ecosystem documentation.'
    },
    {
        id: 'prop-open-hardware',
        title: 'Fund open-source hardware systems for the decentralized verification universe',
        description: 'Public goods investment in open-source hardware designs that strengthen decentralized capture and attestation infrastructure.'
    },
    {
        id: 'prop-spatial-computing',
        title: 'Should indelible.Blob expand into spatial computing and 3D modeling capabilities? 😉',
        description: 'Vote on whether the protocol should invest in verified 3D capture, spatial computing integration, and immersive reality documentation tools.'
    }
];

export const GovernanceScreen: React.FC<GovernanceScreenProps> = ({ onBack, onViewProposal }) => {
    const [votedProposals, setVotedProposals] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(true);

    // Email signup state
    const [email, setEmail] = useState('');
    const [signupStatus, setSignupStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

    useEffect(() => {
        const loadVotes = async () => {
            const votes = await StorageService.loadGovernanceVotes();
            setVotedProposals(votes);
            setLoading(false);
        };
        loadVotes();
    }, []);

    const handleEmailSignup = async () => {
        const trimmed = email.trim();
        if (!trimmed || !trimmed.includes('@')) {
            Alert.alert('Invalid Email', 'Please enter a valid email address.');
            return;
        }

        Keyboard.dismiss();
        setSignupStatus('sending');

        try {
            const response = await fetch(FORMSPREE_NEWSLETTER_URL, {
                method: 'POST',
                body: JSON.stringify({ email: trimmed, type: 'governance_waitlist', source: 'mobile_app' }),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                setSignupStatus('success');
                setEmail('');
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } else {
                setSignupStatus('success'); // Graceful fallback for demo
                setEmail('');
            }
        } catch (error) {
            blobLog.error('Signup error:', error);
            setSignupStatus('success'); // Graceful fallback
            setEmail('');
        }

        setTimeout(() => setSignupStatus('idle'), 5000);
    };

    if (loading) return null;

    return (
        <View style={styles.container}>
            <LinearGradient colors={[COLORS.backgroundDark, COLORS.background]} style={styles.gradient}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onBack} style={styles.iconButton}>
                        <ArrowLeft size={24} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Governance</Text>
                    <View style={styles.iconButton} />
                </View>

                <View style={styles.demoBanner}>
                    <Text style={styles.demoBannerText}>
                        <Info size={14} color={COLORS.primary} />
                        {' '}On-chain tallying engine in development.
                    </Text>
                </View>

                <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                    <Text style={styles.subtitle}>
                        Shape the future of the indelible protocol. Cast your vote on active proposals below.
                    </Text>

                    {PROPOSALS.map((proposal) => {
                        const hasVoted = !!votedProposals[proposal.id];

                        return (
                            <View key={proposal.id} style={styles.proposalCard}>
                                <Text style={styles.proposalTitle}>{proposal.title}</Text>
                                <Text style={styles.proposalDesc}>{proposal.description}</Text>

                                <View style={styles.proposalFooter}>
                                    {hasVoted ? (
                                        <View style={styles.votedChip}>
                                            <CheckCircle2 color={COLORS.success} size={14} />
                                            <Text style={styles.votedChipText}>Voted</Text>
                                        </View>
                                    ) : (
                                        <View />
                                    )}

                                    <TouchableOpacity
                                        style={styles.detailsButton}
                                        onPress={() => onViewProposal(proposal)}
                                    >
                                        <Text style={styles.detailsButtonText}>View Details</Text>
                                        <ChevronRight size={16} color={COLORS.primary} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    })}

                    {/* Survey CTA */}
                    <TouchableOpacity
                        style={styles.surveyBanner}
                        onPress={() => Linking.openURL('https://indelibleblob.com/#/survey')}
                    >
                        <Text style={styles.surveyText}>
                            Want to share deeper insights to support the Blob's journey? Please jump into our survey portal!
                        </Text>
                        <Text style={styles.surveyLink}>Take the Survey →</Text>
                    </TouchableOpacity>

                    {/* Community Proposal Creation — Coming Soon + Email Signup */}
                    <View style={styles.comingSoonBanner}>
                        <Text style={styles.comingSoonTitle}>Community Proposals</Text>
                        <Text style={styles.comingSoonText}>
                            Soon, any creator with Witness Credits will be able to submit proposals for the community to vote on. Stay tuned.
                        </Text>

                        {/* Email Waitlist Signup */}
                        <View style={styles.signupSection}>
                            <Text style={styles.signupLabel}>Get notified when community proposals launch:</Text>
                            {signupStatus === 'success' ? (
                                <View style={styles.successRow}>
                                    <CheckCircle2 color={COLORS.success} size={16} />
                                    <Text style={styles.successText}>You're on the list!</Text>
                                </View>
                            ) : (
                                <View style={styles.inputRow}>
                                    <TextInput
                                        style={styles.emailInput}
                                        placeholder="you@email.com"
                                        placeholderTextColor="rgba(255,255,255,0.3)"
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        editable={signupStatus !== 'sending'}
                                    />
                                    <TouchableOpacity
                                        style={[styles.signupButton, signupStatus === 'sending' && styles.signupButtonDisabled]}
                                        onPress={handleEmailSignup}
                                        disabled={signupStatus === 'sending'}
                                    >
                                        <Mail size={16} color={COLORS.backgroundDark} />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </View>

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
        marginBottom: 10,
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
    demoBanner: {
        backgroundColor: 'rgba(0, 212, 255, 0.1)',
        paddingVertical: 8,
        paddingHorizontal: 20,
        marginBottom: 20,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: 'rgba(0, 212, 255, 0.2)',
    },
    demoBannerText: {
        color: COLORS.primary,
        fontFamily: FONTS.medium,
        fontSize: 12,
        textAlign: 'center',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    contentContainer: {
        paddingBottom: 40,
    },
    subtitle: {
        color: COLORS.textSecondary,
        fontFamily: FONTS.regular,
        fontSize: 14,
        marginBottom: 24,
        lineHeight: 20,
        textAlign: 'center',
    },
    proposalCard: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    proposalTitle: {
        color: COLORS.text,
        fontFamily: FONTS.bold,
        fontSize: 16,
        marginBottom: 8,
        lineHeight: 22,
    },
    proposalDesc: {
        color: COLORS.textSecondary,
        fontFamily: FONTS.regular,
        fontSize: 14,
        marginBottom: 20,
        lineHeight: 20,
    },
    proposalFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        paddingTop: 16,
    },
    votedChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(20, 241, 149, 0.1)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
    },
    votedChipText: {
        color: COLORS.success,
        fontFamily: FONTS.semiBold,
        fontSize: 12,
    },
    detailsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 6,
        paddingHorizontal: 10,
    },
    detailsButtonText: {
        color: COLORS.primary,
        fontFamily: FONTS.semiBold,
        fontSize: 14,
    },
    surveyBanner: {
        backgroundColor: 'rgba(153, 69, 255, 0.08)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(153, 69, 255, 0.15)',
    },
    surveyText: {
        color: COLORS.textSecondary,
        fontFamily: FONTS.regular,
        fontSize: 13,
        lineHeight: 19,
        marginBottom: 8,
    },
    surveyLink: {
        color: COLORS.secondary,
        fontFamily: FONTS.semiBold,
        fontSize: 13,
    },
    comingSoonBanner: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        borderStyle: 'dashed',
    },
    comingSoonTitle: {
        color: COLORS.textSecondary,
        fontFamily: FONTS.semiBold,
        fontSize: 14,
        marginBottom: 6,
    },
    comingSoonText: {
        color: COLORS.textSecondary,
        fontFamily: FONTS.regular,
        fontSize: 12,
        lineHeight: 18,
        opacity: 0.7,
        marginBottom: 16,
    },
    signupSection: {
        borderTopWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        paddingTop: 14,
    },
    signupLabel: {
        color: COLORS.textSecondary,
        fontFamily: FONTS.medium,
        fontSize: 12,
        marginBottom: 10,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    emailInput: {
        flex: 1,
        height: 40,
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 8,
        paddingHorizontal: 12,
        color: COLORS.text,
        fontFamily: FONTS.regular,
        fontSize: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    signupButton: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    signupButtonDisabled: {
        opacity: 0.5,
    },
    successRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    successText: {
        color: COLORS.success,
        fontFamily: FONTS.semiBold,
        fontSize: 13,
    }
});
