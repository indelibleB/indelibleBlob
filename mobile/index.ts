/**
 * ============================================================================
 * INDELIBLE.BLOB ENTRY POINT
 * ============================================================================
 */

import '@walletconnect/react-native-compat'; // [FIX] Must be the ABSOLUTE FIRST line executed in the app
import './shim';

import { registerRootComponent } from 'expo';
import App from './App';

console.log('TRACE: [index.ts] Shim loaded, registering App...');
registerRootComponent(App);
