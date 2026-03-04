import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Globe, Smartphone, ShieldCheck } from 'lucide-react-native';
import { COLORS, FONTS } from '../../constants/config';
import { useSuiWallet } from '../../contexts/SuiWalletContext';
import { useZkLogin } from '../../hooks/useZkLogin';
import { useSlushWallet } from '../../hooks/useSlushWallet';

interface LoginModalProps {
    visible: boolean;
    onClose: () => void;
    onLoginSuccess: (address: string) => void;
}

export function LoginModal({ visible, onClose, onLoginSuccess }: LoginModalProps) {
    const { address, provider } = useSuiWallet();
    const insets = useSafeAreaInsets();

    const { loginWithGoogle, derivedAddress, isDeriving, error: zkLoginError } = useZkLogin();
    const { connectToSlush, isConnecting: isConnectingSlush } = useSlushWallet();

    const [connectingState, setConnectingState] = useState<'idle' | 'zklogin' | 'slush'>('idle');

    // Auto-close if address is set from any source
    React.useEffect(() => {
        if (address && visible) {
            onLoginSuccess(address);
        }
    }, [address, visible, onLoginSuccess]);

    // Handle zkLogin success
    React.useEffect(() => {
        if (derivedAddress && visible) {
            onLoginSuccess(derivedAddress);
            setConnectingState('idle');
        }
    }, [derivedAddress, visible, onLoginSuccess]);

    // Handle zkLogin error
    React.useEffect(() => {
        if (zkLoginError && visible) {
            Alert.alert('zkLogin Error', zkLoginError);
            setConnectingState('idle');
        }
    }, [zkLoginError, visible]);

    const handleZkLogin = async () => {
        setConnectingState('zklogin');
        await loginWithGoogle();
        // Result handled by effects watching derivedAddress / zkLoginError
    };

    const handleSlushLogin = async () => {
        setConnectingState('slush');
        await connectToSlush();
        // Reset immediately because deep link pushes user to external app
        setConnectingState('idle');
    };

    if (!visible) return null;

    return (
        <View style={styles.overlay}>
            <LinearGradient
                colors={[COLORS.backgroundDark, 'rgba(10, 10, 15, 0.98)']}
                style={[styles.container, { paddingBottom: Math.max(insets.bottom + 20, 40) }]}
            >
                <View style={styles.iconContainer}>
                    <ShieldCheck color={COLORS.primary} size={56} />
                </View>

                <Text style={styles.title}>Secure Hardware Bind</Text>
                <Text style={styles.subtitle}>
                    Authenticate with a supported Sui protocol to pair your hardware Seed Vault and establish cryptographic provenance.
                </Text>

                {/* zkLogin Option (Google) */}
                <TouchableOpacity
                    style={[styles.authButton, styles.zkLoginButton, connectingState !== 'idle' && styles.disabled]}
                    onPress={handleZkLogin}
                    disabled={connectingState !== 'idle'}
                >
                    {connectingState === 'zklogin' || isDeriving ? (
                        <ActivityIndicator color="#000" style={styles.loader} />
                    ) : (
                        <Globe color="#000" size={24} style={styles.buttonIcon} />
                    )}
                    <Text style={styles.zkLoginText}>
                        {connectingState === 'zklogin' || isDeriving ? 'Verifying Identity...' : 'Continue with Google'}
                    </Text>
                </TouchableOpacity>

                {/* Slush Wallet — Roadmapped (Pending Mysten Native SDK) */}
                <TouchableOpacity
                    style={[
                        styles.authButton,
                        styles.slushWalletButton,
                        styles.disabled
                    ]}
                    disabled={true}
                >
                    <Smartphone color={COLORS.textSecondary} size={24} style={styles.buttonIcon} />
                    <Text style={[styles.nativeWalletText, { color: COLORS.textSecondary }]}>
                        Slush Wallet — Coming Soon
                    </Text>
                </TouchableOpacity>

                <Text style={styles.fineprint}>
                    zkLogin uses Google authentication to derive a Sui address for metadata provenance signing. Native Slush wallet integration is on the roadmap pending Mysten mobile SDK support.
                </Text>

            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        zIndex: 999,
    },
    container: {
        width: '100%',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingHorizontal: 24,
        paddingTop: 40,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 20,
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
        fontSize: 26,
        fontFamily: FONTS.bold,
        color: COLORS.text,
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 15,
        fontFamily: FONTS.medium,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 22,
        paddingHorizontal: 10,
    },
    authButton: {
        width: '100%',
        height: 60,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    zkLoginButton: {
        backgroundColor: COLORS.primary,
    },
    slushWalletButton: {
        backgroundColor: '#0066FF',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    disabled: {
        opacity: 0.6,
    },
    buttonIcon: {
        marginRight: 12,
    },
    loader: {
        marginRight: 12,
    },
    zkLoginText: {
        color: '#000',
        fontSize: 17,
        fontFamily: FONTS.semiBold,
    },
    nativeWalletText: {
        color: COLORS.text,
        fontSize: 17,
        fontFamily: FONTS.semiBold,
    },
    fineprint: {
        marginTop: 16,
        fontSize: 12,
        fontFamily: FONTS.regular,
        color: 'rgba(255, 255, 255, 0.4)',
        textAlign: 'center',
        lineHeight: 18,
    },
});
