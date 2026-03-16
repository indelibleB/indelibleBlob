const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Find the project and workspace directories
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [workspaceRoot];

// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, 'node_modules'),
    path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Force Metro to resolve (sub)dependencies only from the listed nodeModulesPaths
//    Required for monorepo — prevents duplicate React from workspace root
config.resolver.disableHierarchicalLookup = true;

// 4. Support CJS and MJS extensions
config.resolver.sourceExts = ['mjs', 'js', 'json', 'ts', 'tsx', 'cjs'];

// 5. Polyfill Node.js core modules
config.resolver.extraNodeModules = {
    stream: require.resolve('stream-browserify'),
    events: require.resolve('events'),
    vm: require.resolve('vm-browserify'),
    pino: path.resolve(projectRoot, 'shims', 'pino-stub.js'),
};

// 6. WSL2 NETWORKING FIX: Bridge Metro to Windows
config.server = {
    ...config.server,
    port: 8081,
};

// 7. Intercept pino — Hermes cannot run pino@10's class syntax.
//    WalletConnect uses pino for debug logging only; relay is unaffected.
// 8. Intercept react-native-url-polyfill — RN 0.74+ has built-in URL.
//    @walletconnect/react-native-compat imports it, causing
//    "Cannot read property 'prototype' of undefined" crash on Hermes.
const pinoStub = path.resolve(projectRoot, 'shims', 'pino-stub.js');
const urlPolyfillNoop = path.resolve(projectRoot, 'shims', 'url-polyfill-noop.js');
config.resolver.resolveRequest = (context, moduleName, platform) => {
    if (moduleName === 'pino' || moduleName.startsWith('pino/')) {
        return { type: 'sourceFile', filePath: pinoStub };
    }
    if (moduleName === 'react-native-url-polyfill/auto' || moduleName === 'react-native-url-polyfill') {
        return { type: 'sourceFile', filePath: urlPolyfillNoop };
    }
    return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;