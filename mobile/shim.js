import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto'; // [NEW] Essential for Sui RPC
import { Buffer } from 'buffer';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 0. LocalStorage Polyfill (Required for WalletProvider persistence)
if (typeof global.localStorage === 'undefined') {
    global.localStorage = {
        getItem: async (key) => {
            try { return await AsyncStorage.getItem(key); } catch (e) { return null; }
        },
        setItem: async (key, value) => {
            try { await AsyncStorage.setItem(key, value); } catch (e) { }
        },
        removeItem: async (key) => {
            try { await AsyncStorage.removeItem(key); } catch (e) { }
        },
        clear: async () => {
            try { await AsyncStorage.clear(); } catch (e) { }
        },
        length: 0,
        key: (index) => null,
    };
}

// 0.1 Aggressive DOM Polyfills for Web3 UI Kits
// Many web-first libraries (like @mysten/dapp-kit) extend HTMLElement or check window
if (typeof global.self === 'undefined') global.self = global;
if (typeof global.window === 'undefined') global.window = global;
if (typeof global.document === 'undefined') {
    global.document = {
        readyState: 'complete',
        addEventListener: (type, listener) => { },
        removeEventListener: (type, listener) => { },
        createElement: () => ({ style: {} }),
        head: { appendChild: () => { } },
        body: { appendChild: () => { } },
    };
}
if (typeof global.navigator === 'undefined') global.navigator = { userAgent: 'ReactNative' };
if (typeof global.location === 'undefined') global.location = { href: '', protocol: 'https:' };
if (typeof global.HTMLElement === 'undefined') global.HTMLElement = class HTMLElement { };
if (typeof global.CustomEvent === 'undefined') global.CustomEvent = class CustomEvent { };

// 1. Install Buffer reference
if (typeof global.Buffer === 'undefined') {
    global.Buffer = Buffer;
}

// 2. Install Process polyfill
// Note: We check if it exists or if it's missing key properties like 'env'
if (typeof global.process === 'undefined') {
    global.process = require('process');
} else {
    // If process exists (e.g. from Hermes), we extend it rather than overwrite
    const process = global.process;
    if (!process.env) {
        process.env = { NODE_ENV: __DEV__ ? 'development' : 'production' };
    }
    if (!process.version) {
        process.version = 'v16.14.0'; // Fake version to satisfy some libs
    }
}

// 3. TextEncoder/Decoder (Standard in newer RN, but safe to verify)
if (typeof global.TextEncoder === 'undefined') {
    const encoding = require('text-encoding');
    global.TextEncoder = encoding.TextEncoder;
    global.TextDecoder = encoding.TextDecoder;
}

// 5. Event Polyfill (Required for some Web3/URL libs)
if (typeof global.Event === 'undefined') {
    global.Event = class Event {
        constructor(type, eventInitDict) {
            this.type = type;
            this.bubbles = eventInitDict?.bubbles || false;
            this.cancelable = eventInitDict?.cancelable || false;
            this.defaultPrevented = false;
            this.composed = eventInitDict?.composed || false;
            this.timeStamp = Date.now();
        }
    };
}

// 6. ReadableStream / Stream Polyfill (Crucial for socket connections)
// Some libraries check for global.stream or require('stream')
// 6. ReadableStream / Stream Polyfill (Crucial for socket connections)
// Many Web3 libs (like @solana/web3.js) check for global.stream or require('stream')
if (typeof global.ReadableStream === 'undefined' || typeof global.stream === 'undefined') {
    try {
        const stream = require('stream-browserify');
        global.stream = stream;
        global.ReadableStream = stream.Readable;
        console.log('✅ [shim.js] stream-browserify loaded:', {
            stream: typeof stream,
            Readable: typeof stream.Readable
        });
    } catch (e) {
        console.error('⚠️ [shim.js] Failed to load stream-browserify:', e.message);
    }
}

// 7. Crypto Polyfill (Hybrid: Node + Web)
// We need both 'crypto-browserify' (for createHash, etc.) AND 'react-native-get-random-values' (for getRandomValues)
if (typeof global.crypto === 'undefined') {
    global.crypto = {};
}

// Ensure getRandomValues is present (from react-native-get-random-values)
if (!global.crypto.getRandomValues) {
    try {
        require('react-native-get-random-values');
    } catch (e) {
        console.warn('⚠️ [shim.js] react-native-get-random-values failed:', e.message);
    }
}

// Extend with Node.js crypto methods
try {
    const nodeCrypto = require('crypto-browserify');
    // Copy all properties from nodeCrypto to global.crypto, but don't overwrite existing ones like getRandomValues
    Object.assign(global.crypto, nodeCrypto, global.crypto);

    console.log('✅ [shim.js] Hybrid Crypto loaded:', {
        createHash: typeof global.crypto.createHash,
        getRandomValues: typeof global.crypto.getRandomValues,
    });
} catch (e) {
    console.error('⚠️ [shim.js] Failed to load crypto-browserify:', e.message);
}

console.log('✅ [shim.js] Polyfills installed successfully');
