import * as React from 'react';
import { useState, useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { decodeSuiPrivateKey } from '@mysten/sui/cryptography';
import { generateNonce, generateRandomness, jwtToAddress } from '@mysten/sui/zklogin';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { SecureStorage, SECURE_STORAGE_KEYS } from '../services/secureStorage';
import { blobLog } from '../utils/logger';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || 'dummy-web-client-id';
const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || 'dummy-android-client-id';
const ENOKI_API_KEY = process.env.EXPO_PUBLIC_ENOKI_API_KEY;

export function useZkLogin() {
    const [isReady, setIsReady] = useState(false);
    const [nonce, setNonce] = useState<string | null>(null);
    const [derivedAddress, setDerivedAddress] = useState<string | null>(null);
    const [isDeriving, setIsDeriving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 1. Initialize ephemeral key and nonce on mount
    useEffect(() => {
        async function initZkLogin() {
            try {
                // Generate Ephemeral Key Pair
                const ephemeralKeyPair = new Ed25519Keypair();

                // Fetch current epoch (using Mainnet or Testnet depending on app config, defaulting to testnet for safe defaults)
                const client = new SuiClient({ url: getFullnodeUrl('testnet') });
                const { epoch } = await client.getLatestSuiSystemState();
                const currentEpoch = Number(epoch);
                const maxEpoch = currentEpoch + 2;

                // Generate Randomness & Nonce
                const randomness = generateRandomness();
                const calculatedNonce = generateNonce(ephemeralKeyPair.getPublicKey(), maxEpoch, randomness);

                // Store securely
                await SecureStorage.setSecureItem(SECURE_STORAGE_KEYS.ZKLOGIN_EPHEMERAL, ephemeralKeyPair.getSecretKey());
                await SecureStorage.setSecureItem(SECURE_STORAGE_KEYS.ZKLOGIN_MAX_EPOCH, maxEpoch.toString());
                await SecureStorage.setSecureItem(SECURE_STORAGE_KEYS.ZKLOGIN_RANDOMNESS, randomness.toString());

                setNonce(calculatedNonce);
                setIsReady(true);
            } catch (err: any) {
                blobLog.error('zkLogin: Failed to initialize ephemeral key pair', err);
                setError('Initialization failed');
            }
        }
        initZkLogin();
    }, []);

    // 2. Setup Google Auth Session
    const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
        webClientId: GOOGLE_WEB_CLIENT_ID,
        androidClientId: GOOGLE_ANDROID_CLIENT_ID,
        // The critically important nonce mapping to bind identity
        ...(nonce ? { extraParams: { nonce } } : {}),
    });

    // 3. Handle Auth Response & Salt Retrieval
    useEffect(() => {
        async function handleResponse() {
            if (response?.type === 'success') {
                const { id_token } = response.params;
                if (!id_token) {
                    setError('No ID token received from Google');
                    return;
                }

                setIsDeriving(true);
                try {
                    blobLog.info('zkLogin: Successfully received ID token, fetching Enoki salt...');

                    // Call Mysten Enoki Salt API (Undocumented V1 SDK Route)
                    const saltRes = await fetch('https://api.enoki.mystenlabs.com/v1/zklogin', {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'zklogin-jwt': id_token,
                            ...(ENOKI_API_KEY ? {
                                'Authorization': `Bearer ${ENOKI_API_KEY}`,
                            } : {})
                        }
                        // Note: GET requests don't have bodies. JWT is in the header.
                    });

                    if (!saltRes.ok) {
                        const errorText = await saltRes.text();
                        throw new Error(`Salt API failed with status ${saltRes.status}: ${errorText}`);
                    }

                    const saltData = await saltRes.json();
                    if (!saltData.data || !saltData.data.salt) {
                        throw new Error(`Invalid salt response format: ${JSON.stringify(saltData)}`);
                    }

                    // Derive address natively
                    const userSalt = saltData.data.salt;
                    const address = jwtToAddress(id_token, userSalt);

                    // ====================================================================
                    // NEW: Fetch ZK Proof from Mysten Prover (As directed by 1D)
                    // ====================================================================
                    blobLog.info('zkLogin: Fetching ZK Proof from Mysten Prover...');

                    // Retrieve what we just saved in initZkLogin this session
                    const ephemeralKeySecret = await SecureStorage.getSecureItem(SECURE_STORAGE_KEYS.ZKLOGIN_EPHEMERAL);
                    const maxEpochStr = await SecureStorage.getSecureItem(SECURE_STORAGE_KEYS.ZKLOGIN_MAX_EPOCH);
                    const randomnessStr = await SecureStorage.getSecureItem(SECURE_STORAGE_KEYS.ZKLOGIN_RANDOMNESS);

                    if (!ephemeralKeySecret || !maxEpochStr || !randomnessStr) {
                        throw new Error('Missing ephemeral key data for ZK Prover');
                    }

                    // getSecretKey() returns a bech32-encoded string (suiprivkey1q...)
                    // decodeSuiPrivateKey() properly decodes it to the raw 32-byte seed
                    const { secretKey } = decodeSuiPrivateKey(ephemeralKeySecret);
                    const ephemeralKeyPair = Ed25519Keypair.fromSecretKey(secretKey);

                    // Use Enoki ZKP endpoint (our app's OAuth client IDs are registered there)
                    // The public prover.mystenlabs.com rejects unregistered audiences
                    const proverRes = await fetch('https://api.enoki.mystenlabs.com/v1/zklogin/zkp', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'zklogin-jwt': id_token,
                            ...(ENOKI_API_KEY ? { 'Authorization': `Bearer ${ENOKI_API_KEY}` } : {})
                        },
                        body: JSON.stringify({
                            network: 'testnet',
                            ephemeralPublicKey: ephemeralKeyPair.getPublicKey().toSuiPublicKey(),
                            maxEpoch: Number(maxEpochStr),
                            randomness: randomnessStr,
                            salt: userSalt,
                            keyClaimName: 'sub'
                        })
                    });

                    if (!proverRes.ok) {
                        const errText = await proverRes.text();
                        throw new Error(`ZK Prover failed with status ${proverRes.status}: ${errText}`);
                    }

                    const zkProof = await proverRes.json();

                    // Store the proof and the salt so we can use them during capture signing
                    await SecureStorage.setSecureItem('zklogin_proof', JSON.stringify(zkProof));
                    await SecureStorage.setSecureItem('zklogin_salt', userSalt);
                    await SecureStorage.setSecureItem('zklogin_jwt', id_token);

                    blobLog.success('zkLogin: Successfully derived address & fetched proof:', address);
                    setDerivedAddress(address);
                } catch (err: any) {
                    blobLog.error('zkLogin: Failed to derive address', err);
                    setError(err.message || 'Verification failed');
                } finally {
                    setIsDeriving(false);
                }
            } else if (response?.type === 'error') {
                setError(response.error?.message || 'Authentication error');
            }
        }

        if (response) {
            handleResponse();
        }
    }, [response]);

    return {
        isReady: isReady && !!request,
        loginWithGoogle: promptAsync,
        derivedAddress,
        isDeriving,
        error
    };
}
