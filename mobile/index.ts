/**
 * ============================================================================
 * INDELIBLE.BLOB ENTRY POINT
 * ============================================================================
 *
 * ALL polyfills are now loaded via './shim.ts' to guarantee execution order.
 */

// 1. Load Polyfills FIRST (Standard Web3 Shim)
// 1. Load Polyfills FIRST (Standard Web3 Shim)
// Logs inside shim.js will confirm if it runs.
console.log('TRACE: [index.ts] Loading shim...');
try {
    require('./shim');
} catch (e: any) {
    console.error('CRITICAL: [index.ts] Shim failed to load:', e.message);
}

console.log('TRACE: [index.ts] Shim loaded.');

// DIAGNOSTIC: Check Environment
console.log('TRACE: [index.ts] Environment Check:', {
    TextEncoder: typeof global.TextEncoder,
    URL: typeof global.URL,
    window: typeof global.window,
    self: typeof global.self,
    document: typeof global.document,
    crypto: typeof global.crypto,
    localStorage: typeof global.localStorage,
    HTMLElement: typeof global.HTMLElement,
});

// PROBE: Identify which library is crashing (Static Requires for Metro)
try {
    console.log('TRACE: [index.ts] Probing stream...');
    require('stream');
    console.log('TRACE: [index.ts] stream OK');

    console.log('TRACE: [index.ts] Probing crypto...');
    require('crypto');
    console.log('TRACE: [index.ts] crypto OK');

    console.log('TRACE: [index.ts] Probing events...');
    require('events');
    console.log('TRACE: [index.ts] events OK');

    console.log('TRACE: [index.ts] Probing @solana/web3.js...');
    require('@solana/web3.js');
    console.log('TRACE: [index.ts] @solana/web3.js OK');

    console.log('TRACE: [index.ts] Probing @mysten/sui/client...');
    require('@mysten/sui/client');
    console.log('TRACE: [index.ts] @mysten/sui/client OK');

    try {
        try {
            registerRootComponent(App);
            console.log('TRACE: [index.ts] registerRootComponent called');
        } catch (e: any) {
            console.error('TRACE: [index.ts] Critical App Launch FAILED:', e?.message, e?.stack);
        }
