import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useSuiWallet } from '../contexts/SuiWalletContext';
import { blobLog } from '../utils/logger';

export function useSlushWallet() {
    const [isConnecting, setIsConnecting] = useState(false);
    const { provider, connect } = useSuiWallet();

    const connectToSlush = useCallback(async () => {
        setIsConnecting(true);
        try {
            blobLog.info('Triggering WalletConnect session via Modal...');
            await connect();
        } catch (error: any) {
            blobLog.error('Failed to trigger Slush WalletConnect modal:', error);
            Alert.alert('Connection Error', 'Could not open the WalletConnect modal.');
        } finally {
            setIsConnecting(false);
        }
    }, [connect]);

    return {
        connectToSlush,
        isConnecting,
        provider,
    };
}
