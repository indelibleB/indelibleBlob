import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';
import { LinearGradient } from 'expo-linear-gradient';
import { ShieldCheck, Fingerprint } from 'lucide-react-native';
import { COLORS, FONTS } from '../../constants/config';
import { BlurView } from 'expo-blur';

interface LoginModalProps {
    visible: boolean;
    onClose: () => void;
    onLoginSuccess: () => void;
}

export function LoginModal({ visible, onClose, onLoginSuccess }: LoginModalProps) {
    const currentAccount = useCurrentAccount();

    // Effect: Auto-close if account becomes available
    React.useEffect(() => {
        if (currentAccount) {
            onLoginSuccess();
        }
    }, [currentAccount, onLoginSuccess]);

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <BlurView intensity={20} style={StyleSheet.absoluteFill} />

                <LinearGradient
                    colors={[COLORS.backgroundDark, 'rgba(10, 10, 15, 0.95)']}
                    style={styles.container}
                >
                    <View style={styles.iconContainer}>
                        <Fingerprint color={COLORS.primary} size={64} />
                    </View>

                    <Text style={styles.title}>Authenticate Session</Text>
                    <Text style={styles.subtitle}>
                        Connect a wallet to establish a secure provenance chain for your captures.
                    </Text>

                    <View style={styles.connectWrapper}>
                        {/* 
                            NOTE: @mysten/dapp-kit's ConnectButton is web-optimized. 
                            For React Native, we might need a custom button calling useConnect() 
                            if the standard storage adapter doesn't play nice.
                            For now, assuming the standard button works or we wrap it.
                        */}
                        <ConnectButton
                            connectText="Connect Wallet"
                            style={{ backgroundColor: COLORS.primary, borderRadius: 12 }}
                        />
                    </View>

                    <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
                        <Text style={styles.cancelText}>Start as Guest (No Provenance)</Text>
                    </TouchableOpacity>
                </LinearGradient>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    container: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 32,
        paddingBottom: 60,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: COLORS.glassBorder,
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(0, 212, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    title: {
        fontSize: 24,
        fontFamily: FONTS.bold,
        color: COLORS.text,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        fontFamily: FONTS.regular,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 20,
    },
    connectWrapper: {
        width: '100%',
        height: 50,
        justifyContent: 'center',
        marginBottom: 16,
    },
    cancelButton: {
        padding: 12,
    },
    cancelText: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontFamily: FONTS.medium,
    },
});
