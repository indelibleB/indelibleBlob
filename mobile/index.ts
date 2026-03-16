/**
 * ============================================================================
 * INDELIBLE.BLOB ENTRY POINT
 * ============================================================================
 */

import './shims/ua-polyfill'; // Must be FIRST — polyfills navigator.userAgent before any Web3 lib touches it
import '@walletconnect/react-native-compat';
import './shims/shim';

import { registerRootComponent } from 'expo';
import App from './App';

console.log('TRACE: [index.ts] Shim loaded, registering App...');
registerRootComponent(App);
