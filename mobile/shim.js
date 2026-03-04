import 'react-native-get-random-values';
// import 'react-native-url-polyfill/auto'; // REMOVED: RN 0.74+ has built-in URL, this causes 'property is not configurable' crash
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
    global.Event = function Event(type, eventInitDict) {
        this.type = type;
        this.bubbles = eventInitDict?.bubbles || false;
        this.cancelable = eventInitDict?.cancelable || false;
        this.defaultPrevented = false;
        this.composed = eventInitDict?.composed || false;
        this.timeStamp = Date.now();
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
    } catch (e) {
        console.error('⚠️ [shim.js] Failed to load stream-browserify:', e.message);
    }
}

// 7. Crypto — getRandomValues only (from react-native-get-random-values, imported at top of file)
// No Node.js crypto polyfill needed: Sui SDK uses @noble/curves, Solana uses MWA/Seed Vault.
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
