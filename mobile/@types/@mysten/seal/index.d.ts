declare module '@mysten/seal' {
    import type { SuiClient } from '@mysten/sui/client';

    export interface EncryptionInput {
        encrypt(key: Uint8Array): Promise<any>;
        generateKey(): Promise<Uint8Array>;
    }

    export class AesGcm256 implements EncryptionInput {
        readonly plaintext: Uint8Array;
        readonly aad: Uint8Array;
        constructor(msg: Uint8Array, aad: Uint8Array);
        generateKey(): Promise<Uint8Array>;
        encrypt(key: Uint8Array): Promise<any>;
        static decrypt(key: Uint8Array, ciphertext: any): Promise<Uint8Array>;
    }

    export interface KeyServer {
        objectId: Uint8Array;
        name: string;
        url: string;
        keyType: number;
        pk: Uint8Array;
    }

    export function getAllowlistedKeyServers(network: 'testnet' | 'mainnet'): Uint8Array[];

    export function retrieveKeyServers(opts: {
        objectIds: Uint8Array[];
        client: SuiClient;
    }): Promise<KeyServer[]>;

    export function verifyKeyServer(server: KeyServer): Promise<boolean>;

    export function encrypt<Input extends EncryptionInput>(opts: {
        keyServers: KeyServer[];
        threshold: number;
        packageId: Uint8Array;
        id: Uint8Array;
        encryptionInput: Input;
    }): Promise<{ encryptedObject: Uint8Array; key: Uint8Array }>;

    export class SessionKey {
        constructor(packageId: Uint8Array, ttlMin: number);
        getPersonalMessage(): Uint8Array;
        setPersonalMessageSignature(sig: string): void;
        getCertificate(): any;
        createRequestParams(txBytes: Uint8Array): Promise<{
            decryption_key: Uint8Array;
            request_signature: string;
        }>;
    }

    export const EncryptedObject: any;
    export class KeyStore { }
}
