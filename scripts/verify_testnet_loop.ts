/**
 * ============================================================================
 * TESTNET LOOP VERIFICATION SCRIPT
 * ============================================================================
 * 
 * Usage: npx ts-node scripts/verify_testnet_loop.ts
 * 
 * Purpose:
 * Verify that the core "Indelible Blob" engine works on Sui Testnet.
 * 1. Initialize Identity (Keypair)
 * 2. Fund Wallet (GasManager)
 * 3. Mock a Capture (Photo)
 * 4. Record to Sui (SuiService)
 */

// Polyfills for Node.js environment
import 'react-native-get-random-values';
import * as crypto from 'crypto';
// Mock AsyncStorage for Node environment
const mockStorage = new Map<string, string>();
const AsyncStorage = {
    getItem: async (key: string) => mockStorage.get(key) || null,
    setItem: async (key: string, val: string) => mockStorage.set(key, val),
    removeItem: async (key: string) => mockStorage.delete(key),
} as any;
// Mock Expo modules
jest.mock('expo-secure-store', () => ({
    getItemAsync: async () => null,
    setItemAsync: async () => { },
}));
jest.mock('expo-file-system', () => ({}));
jest.mock('@react-native-async-storage/async-storage', () => AsyncStorage);

// Import Services (We need to handle module aliasing or relative paths carefully)
// For this script, we might need to rely on relative paths if tsconfig isn't set up for aliases in scripts
import { IdentityService } from '../mobile/src/services/identity';
import { SuiService } from '../shared/services/sui';
import { activeGasManager } from '../mobile/src/services/gas'; // Ensure this export exists
import { Capture, WalrusData } from '../shared/types';

async function main() {
    console.log('🚀 STOP! HAMMER TIME! (Starting Testnet Verification)');
    console.log('==================================================');

    try {
        // 1. Initialize Identity
        console.log('\n👤 1. Initializing Identity...');
        const user = await IdentityService.loginSui();
        console.log('   > Address:', user.suiAddress);
        console.log('   > Grade:', user.provenanceGrade);

        if (!user.suiAddress) throw new Error('Failed to generate address');

        // 2. Check Gas
        console.log('\n⛽ 2. Checking Gas...');
        const hasGas = await activeGasManager.ensureGas(user.suiAddress);
        if (!hasGas) {
            console.log('   > ⚠️ Gas request might have failed or pending. Waiting 5s...');
            await new Promise(r => setTimeout(r, 5000));
        } else {
            console.log('   > Gas OK.');
        }

        // 3. Mock Capture
        console.log('\n📸 3. Creating Mock Capture...');
        const mockCapture: Capture = {
            uri: 'file://mock/photo.jpg',
            timestamp: Date.now(),
            sessionId: 'test-session-' + Date.now(),
            index: 0,
            gpsData: {
                latitude: 37.7749,
                longitude: -122.4194,
                altitude: 10,
                accuracy: 5,
                heading: 180,
                speed: 0,
                timestamp: Date.now(),
                isRTK: false
            },
            surveyMetadata: {
                relativeToBase: { deltaLat: 0, deltaLon: 0, deltaAlt: 0 },
                captureQuality: { gpsAccuracy: 5, isRTKEnabled: false, coordinateSystem: 'WGS84' }
            },
            uploadStatus: 'uploading',
            contentHash: '0x' + crypto.randomBytes(32).toString('hex'), // Mock SHA256
            provenanceGrade: 'SILVER', // Mock grade
            sensorData: {
                accelerometer: { x: 0, y: 9.8, z: 0 },
                magnetometer: { x: 10, y: 0, z: 0 },
                compassHeading: 180
            },
            teepinSignature: 'MOCKED_TEEPIN_SIG',
            teepinPublicKey: 'MOCKED_SOLANA_PUBKEY'
        };

        const mockWalrus: WalrusData = {
            blobId: 'mock-walrus-blob-' + Date.now(),
            url: 'https://walrus.site/mock',
            size: 1024,
            uploadedAt: Date.now()
        };

        // 4. Record on Sui
        console.log('\n⛓️ 4. Recording to Sui Testnet...');
        // Note: verify IdentityService.signAndExecuteTransaction is called
        const result = await SuiService.recordCapture(mockCapture, mockWalrus, user.suiAddress);

        console.log('\n✅ SUCCESS! Capture Recorded.');
        console.log('   > Digest:', result.digest);
        console.log('   > Object ID:', result.objectId);
        console.log(`   > Explorer: https://suiscan.xyz/testnet/tx/${result.digest}`);

    } catch (error) {
        console.error('\n❌ VERIFICATION FAILED:', error);
        process.exit(1);
    }
}

main();
