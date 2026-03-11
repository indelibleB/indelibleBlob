// Polyfill navigator.userAgent for Web3 libraries that expect a browser environment
if (typeof navigator !== 'undefined' && typeof navigator.userAgent === 'undefined') {
    navigator.userAgent = 'ReactNative';
} else if (typeof navigator === 'undefined') {
    global.navigator = { userAgent: 'ReactNative' };
}
if (typeof window !== 'undefined' && typeof window.navigator !== 'undefined' && typeof window.navigator.userAgent === 'undefined') {
    window.navigator.userAgent = 'ReactNative';
}
