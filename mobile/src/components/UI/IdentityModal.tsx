import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal } from 'react-native';
import { COLORS, FONTS } from '../../constants/config';
import { IdentityService } from '../../services/identity';
import { Shield, Wallet, X } from 'lucide-react-native';
import { blobLog } from '../../utils/logger';

interface IdentityModalProps {
    visible: boolean;
    onClose: () => void;
    onLoginSuccess: () => void;
}

export const IdentityModal: React.FC<IdentityModalProps> = ({ visible, onClose, onLoginSuccess }) => {

    const handleSuiLogin = async () => {
        try {
            await IdentityService.loginSui();
            onLoginSuccess();
            onClose();
        } catch (error) {
            blobLog.error('Sui Login Failed:', error);
        }
    };

    const handleSolanaLogin = async () => {
        try {
            await IdentityService.loginSolana();
            onLoginSuccess();
            onClose();
        } catch (error) {
            blobLog.error('Solana Login Failed:', error);
        }
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    {/* Close button */}
                    <TouchableOpacity style={styles.closeX} onPress={onClose}>
                        <X color={COLORS.textSecondary} size={20} />
                    </TouchableOpacity>

                    <Shield color={COLORS.primary} size={36} />
                    <Text style={styles.title}>Secure Identity</Text>
                    <Text style={styles.subtitle}>Choose your chain to sign the truth.</Text>

                    <TouchableOpacity
                        style={[styles.button, styles.suiButton]}
                        onPress={handleSuiLogin}
                    >
                        <Wallet color={COLORS.primary} size={20} />
                        <View style={styles.buttonContent}>
                            <Text style={styles.buttonText}>Sign with Sui (zkLogin)</Text>
                            <Text style={styles.buttonSmallText}>Universal Web2 Onboarding</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.solanaButton]}
                        onPress={handleSolanaLogin}
                    >
                        <Wallet color={COLORS.tertiary} size={20} />
                        <View style={styles.buttonContent}>
                            <Text style={styles.buttonText}>Connect Solana (MWA)</Text>
                            <Text style={styles.buttonSmallText}>Hardware-Secured Economy</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                    >
                        <Text style={styles.closeButtonText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.85)',
    },
    modalView: {
        width: '85%',
        backgroundColor: COLORS.backgroundDark,
        borderRadius: 24,
        padding: 30,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 5,
    },
    closeX: {
        position: 'absolute',
        top: 16,
        right: 16,
    },
    title: {
        fontSize: 24,
        fontFamily: FONTS.bold,
        color: COLORS.text,
        marginTop: 12,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        fontFamily: FONTS.regular,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: 30,
    },
    button: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
    },
    buttonContent: {
        flex: 1,
    },
    suiButton: {
        backgroundColor: 'rgba(0, 212, 255, 0.08)',
        borderColor: COLORS.primary,
    },
    solanaButton: {
        backgroundColor: 'rgba(20, 241, 149, 0.08)',
        borderColor: COLORS.tertiary,
    },
    buttonText: {
        color: COLORS.text,
        fontSize: 16,
        fontFamily: FONTS.semiBold,
    },
    buttonSmallText: {
        color: COLORS.textSecondary,
        fontSize: 12,
        fontFamily: FONTS.regular,
        marginTop: 2,
    },
    closeButton: {
        marginTop: 10,
    },
    closeButtonText: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontFamily: FONTS.medium,
    },
});
