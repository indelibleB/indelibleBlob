/**
 * ============================================================================
 * SUI WALLET CONTEXT (WalletConnect v2 Integration)
 * ============================================================================
 * 
 * Lightweight wallet context using @mysten/sui directly.
 * Integrates @walletconnect/modal-react-native for universal mobile support.
 */

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { WalletConnectModal, useWalletConnectModal } from '@walletconnect/modal-react-native';
import UniversalProvider from '@walletconnect/universal-provider';
import { Modal, Linking } from 'react-native';
import { SecureStorage, SECURE_STORAGE_KEYS } from '../services/secureStorage';
import { blobLog } from '../utils/logger';

const WC_PROJECT_ID = process.env.EXPO_PUBLIC_WC_PROJECT_ID || '14ae6da30a9d0557bde031a062358824';

const providerMetadata = {
    name: 'Indelible.Blob',
    description: 'Cryptographic Hardware Provenance Network',
    url: 'https://indelible.blob',
    icons: ['https://indelible.blob/icon.png'],
    redirect: {
        native: 'indelible-blob://',
        universal: 'https://indelible.blob'
    }
};

interface SuiWalletState {
    address: string | null;
    client: SuiClient;
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;
    provider: UniversalProvider | null;
    isConnected: boolean;
    close: () => void;
}

const SuiWalletContext = createContext<SuiWalletState | null>(null);

interface SuiWalletProviderProps {
    network?: 'testnet' | 'mainnet' | 'devnet';
    children: React.ReactNode;
}

export function SuiWalletProvider({ network = 'testnet', children }: SuiWalletProviderProps) {
    const [address, setAddress] = useState<string | null>(null);
    const { open, close, isConnected, provider: wcProvider } = useWalletConnectModal();

    const client = useMemo(() => new SuiClient({ url: getFullnodeUrl(network) }), [network]);

    // Load cached address
    useEffect(() => {
        const loadAddress = async () => {
            try {
                const saved = await SecureStorage.getSecureItem(SECURE_STORAGE_KEYS.SUI_WALLET_ADDRESS);
                if (saved && isConnected) {
                    setAddress(saved);
                } else if (!isConnected && saved) {
                    // Cleanup if WC session was killed externally
                    await SecureStorage.deleteSecureItem(SECURE_STORAGE_KEYS.SUI_WALLET_ADDRESS);
                    setAddress(null);
                }
            } catch (error) {
                blobLog.warn('Failed to load wallet address:', error);
            }
        };

        loadAddress();
    }, [isConnected]);

    // WalletConnect session callback
    useEffect(() => {
        if (isConnected && wcProvider) {
            // Extract the Sui address from the WalletConnect session
            const session = wcProvider.session;
            if (session) {
                const namespaces = session.namespaces;
                const suiNamespace = namespaces['sui'];
                if (suiNamespace && suiNamespace.accounts.length > 0) {
                    // Format: "sui:testnet:0xADDRESS"
                    const accountParts = suiNamespace.accounts[0].split(':');
                    const extractedAddress = accountParts[accountParts.length - 1];

                    setAddress(extractedAddress);
                    SecureStorage.setSecureItem(SECURE_STORAGE_KEYS.SUI_WALLET_ADDRESS, extractedAddress);
                    blobLog.success('WalletConnect Session Established: ' + extractedAddress);
                }
            }
        }
    }, [isConnected, wcProvider]);

    // Intercept display_uri from the modal's provider and deep-link to Slush
    useEffect(() => {
        if (!wcProvider) return;

        const handleDisplayUri = (uri: string) => {
            blobLog.info('display_uri intercepted! Deep-linking to Slush...');
            // Hide our Modal overlay but DO NOT call close() — that kills the relay
            setWcModalVisible(false);
            // Deep-link to the Slush app with the WC pairing URI
            const encoded = encodeURIComponent(uri);
            Linking.openURL(`suiwallet://wc?uri=${encoded}`).catch((err) => {
                blobLog.warn('Failed to open Slush deep-link:', err);
            });
        };

        (wcProvider as any).on('display_uri', handleDisplayUri);
        return () => {
            (wcProvider as any).removeListener('display_uri', handleDisplayUri);
        };
    }, [wcProvider, close]);

    const connect = useCallback(async () => {
        // Open the WalletConnect UI Modal. If the provider is lazy-loading, 
        // calling open() will trigger it to finish initializing.
        open();
    }, [open]);

    const disconnect = useCallback(async () => {
        if (wcProvider) {
            try {
                if (wcProvider.session) {
                    await wcProvider.disconnect();
                }
            } catch (e) {
                blobLog.warn('Error disconnecting from WC provider', e);
            }
        }
        setAddress(null);
        await SecureStorage.deleteSecureItem(SECURE_STORAGE_KEYS.SUI_WALLET_ADDRESS);
    }, [wcProvider]);

    // Track whether WC modal should be elevated above camera surface
    const [wcModalVisible, setWcModalVisible] = useState(false);

    // Watch for WC open/close to toggle the native Modal wrapper
    const originalConnect = connect;
    const wrappedConnect = useCallback(async () => {
        setWcModalVisible(true);
        await originalConnect();
    }, [originalConnect]);



    // Auto-dismiss the native modal wrapper when connected or address changes
    useEffect(() => {
        if (isConnected || address) {
            setWcModalVisible(false);
        }
    }, [isConnected, address]);

    return (
        <SuiWalletContext.Provider
            value={{
                address,
                client,
                connect: wrappedConnect,
                disconnect,
                close,
                provider: wcProvider as unknown as UniversalProvider,
                isConnected
            }}
        >
            {children}
            {/* Native Modal wrapper forces WalletConnect above camera hardware surface */}
            <Modal
                visible={wcModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setWcModalVisible(false)}
                statusBarTranslucent={true}
            >
                <WalletConnectModal
                    projectId={WC_PROJECT_ID}
                    providerMetadata={providerMetadata}
                    sessionParams={{
                        namespaces: {
                            sui: {
                                methods: ['sui_signAndExecuteTransaction', 'sui_signTransaction', 'sui_signPersonalMessage', 'sui_getAccounts'],
                                chains: ['sui:testnet', 'sui:mainnet'],
                                events: ['chainChanged', 'accountsChanged']
                            }
                        }
                    }}
                />
            </Modal>
        </SuiWalletContext.Provider>
    );
}

export function useSuiWallet(): SuiWalletState {
    const ctx = useContext(SuiWalletContext);
    if (!ctx) throw new Error('useSuiWallet must be used within SuiWalletProvider');
    return ctx;
}
