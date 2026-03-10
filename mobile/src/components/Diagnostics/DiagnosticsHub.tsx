import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/config';
// Import directly to avoid loading @mysten/seal via the barrel export
// (@mysten/seal crashes Hermes with "property is not configurable")
import { SuiService } from '@shared/services/sui';
import { WalrusService } from '@shared/services/walrus';
import { SolanaService } from '../../services/solana';
import { IdentityService } from '../../services/identity';

interface DiagnosticItemProps {
    label: string;
    status: 'pending' | 'success' | 'error' | 'loading';
    message?: string;
}

const DiagnosticItem = ({ label, status, message }: DiagnosticItemProps) => (
    <View style={styles.itemContainer}>
        <View style={styles.itemHeader}>
            <Text style={styles.itemLabel}>{label}</Text>
            <View style={[styles.statusDot, { backgroundColor: status === 'success' ? '#14F195' : status === 'error' ? '#FF4444' : status === 'loading' ? '#FF9500' : '#b0b0b0' }]} />
        </View>
        {message && <Text style={styles.itemMessage}>{message}</Text>}
    </View>
);

interface DiagnosticResult {
    status: 'pending' | 'success' | 'error' | 'loading';
    message: string;
}

export function DiagnosticsHub({ onBack }: { onBack: () => void }) {
    const [results, setResults] = useState<{
        sui: DiagnosticResult;
        walrusPublisher: DiagnosticResult;
        walrusAggregator: DiagnosticResult;
        solana: DiagnosticResult;
        teepin: DiagnosticResult;
    }>({
        sui: { status: 'pending', message: '' },
        walrusPublisher: { status: 'pending', message: '' },
        walrusAggregator: { status: 'pending', message: '' },
        solana: { status: 'pending', message: '' },
        teepin: { status: 'pending', message: '' },
    });
    const [isRunning, setIsRunning] = useState(false);

    const runDiagnostics = async () => {
        setIsRunning(true);

        // 1. Sui RPC
        setResults(prev => ({ ...prev, sui: { status: 'loading', message: 'Pinging Sui RPC...' } }));
        const suiHealth = await SuiService.checkHealth();
        setResults(prev => ({
            ...prev, sui: {
                status: suiHealth ? 'success' : 'error',
                message: suiHealth ? 'Sui Testnet Connected' : 'Cannot reach Sui RPC'
            }
        }));

        // 2. Walrus
        setResults(prev => ({
            ...prev,
            walrusPublisher: { status: 'loading', message: 'Testing Publisher...' },
            walrusAggregator: { status: 'loading', message: 'Testing Aggregator...' }
        }));
        const walrusHealth = await WalrusService.checkHealth();
        setResults(prev => ({
            ...prev,
            walrusPublisher: {
                status: walrusHealth.publisher ? 'success' : 'error',
                message: walrusHealth.publisher ? 'Publisher Ready' : 'Publisher Unreachable'
            },
            walrusAggregator: {
                status: walrusHealth.aggregator ? 'success' : 'error',
                message: walrusHealth.aggregator ? 'Aggregator Ready' : 'Aggregator Unreachable'
            }
        }));

        // 3. Solana
        setResults(prev => ({ ...prev, solana: { status: 'loading', message: 'Pinging Solana RPC...' } }));
        const solanaHealth = await SolanaService.checkHealth();
        setResults(prev => ({
            ...prev, solana: {
                status: solanaHealth ? 'success' : 'error',
                message: solanaHealth ? 'Solana Testnet Connected' : 'Cannot reach Solana RPC'
            }
        }));

        // 4. TEEPIN / Identity Readiness
        const user = IdentityService.getCurrentUser();
        const isGold = user?.provenanceGrade === 'GOLD';
        const isSilver = user?.provenanceGrade === 'SILVER';
        setResults(prev => ({
            ...prev, teepin: {
                status: isGold ? 'success' : isSilver ? 'success' : user ? 'pending' : 'pending',
                message: isGold
                    ? `GOLD — Hardware Enclave Active (${user?.solanaAddress ? 'Seeker Bound' : 'Device Attested'})`
                    : isSilver
                        ? 'SILVER — Device Attested (Secure Enclave)'
                        : user
                            ? `Identity loaded but provenance: ${user.provenanceGrade || 'unknown'}`
                            : 'Start a session to bind identity'
            }
        }));

        setIsRunning(false);
    };

    useEffect(() => {
        runDiagnostics();
    }, []);

    return (
        <View style={styles.container}>
            <LinearGradient colors={[COLORS.background, COLORS.backgroundDark]} style={styles.gradient}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onBack} style={styles.backButton}>
                        <Text style={styles.backText}>← Back</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Network Diagnostics</Text>
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    <Text style={styles.description}>
                        Verifying connection to decentralized infrastructure for the "Indelible" pedigree.
                    </Text>

                    <DiagnosticItem
                        label="Sui Blockchain (L1)"
                        status={results.sui.status}
                        message={results.sui.message}
                    />

                    <View style={styles.group}>
                        <Text style={styles.groupTitle}>WALRUS BLOB STORAGE</Text>
                        <DiagnosticItem
                            label="Publisher Node"
                            status={results.walrusPublisher.status}
                            message={results.walrusPublisher.message}
                        />
                        <DiagnosticItem
                            label="Aggregator Node"
                            status={results.walrusAggregator.status}
                            message={results.walrusAggregator.message}
                        />
                    </View>

                    <View style={styles.group}>
                        <Text style={styles.groupTitle}>IDENTITY & HARDWARE</Text>
                        <DiagnosticItem
                            label="Solana Ecosystem"
                            status={results.solana.status}
                            message={results.solana.message}
                        />
                        <DiagnosticItem
                            label="Secure Element (TEEPIN)"
                            status={results.teepin.status}
                            message={results.teepin.message}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.runButton, isRunning && styles.disabledButton]}
                        onPress={runDiagnostics}
                        disabled={isRunning}
                    >
                        {isRunning ? (
                            <ActivityIndicator color={COLORS.background} />
                        ) : (
                            <Text style={styles.runButtonText}>Re-Run Tests</Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.glassBorder,
    },
    backButton: {
        marginRight: 20,
    },
    backText: {
        color: COLORS.primary,
        fontSize: 16,
        fontWeight: 'bold',
    },
    title: {
        color: COLORS.text,
        fontSize: 20,
        fontWeight: 'bold',
    },
    content: {
        padding: 20,
        gap: 20,
    },
    description: {
        color: COLORS.textSecondary,
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 10,
    },
    group: {
        gap: 12,
    },
    groupTitle: {
        color: COLORS.primary,
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1,
        marginBottom: 4,
    },
    itemContainer: {
        backgroundColor: COLORS.glass,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    itemLabel: {
        color: COLORS.text,
        fontSize: 15,
        fontWeight: '600',
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    itemMessage: {
        color: COLORS.textSecondary,
        fontSize: 12,
    },
    runButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 20,
    },
    disabledButton: {
        opacity: 0.5,
    },
    runButtonText: {
        color: COLORS.background,
        fontSize: 16,
        fontWeight: 'bold',
    },
});
