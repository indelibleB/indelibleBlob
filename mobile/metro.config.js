const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Find the project and workspace directories
const projectRoot = __dirname;
// This can be replaced with `find-up` or a similar library if needed
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [workspaceRoot];

// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, 'node_modules'),
    path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Force Metro to resolve (sub)dependencies only from the `node_modules` directories
config.resolver.disableHierarchicalLookup = true;

// 4. Support CJS and MJS extensions
// IMPORTANT: 'mjs' must constitute a source extension for Metro to parse it as ESM
config.resolver.sourceExts = ['mjs', 'js', 'json', 'ts', 'tsx', 'cjs'];

// 5. Polyfill Node.js core modules
// 5. Polyfill Node.js core modules and Mock Web Libraries
config.resolver.extraNodeModules = {
    stream: require.resolve('stream-browserify'),
    events: require.resolve('events'),
    crypto: require.resolve('crypto-browserify'),
    vm: require.resolve('vm-browserify'),
    // Mock Radix UI to prevent crash in @mysten/dapp-kit
    '@radix-ui/react-dialog': path.resolve(projectRoot, 'radix-mock.js'),
    '@radix-ui/react-slot': path.resolve(projectRoot, 'radix-mock.js'),
    '@radix-ui/react-dropdown-menu': path.resolve(projectRoot, 'radix-mock.js'),
    '@radix-ui/react-icons': path.resolve(projectRoot, 'radix-mock.js'),
};

// 5. WSL2 NETWORKING FIX: Bridge Metro to Windows
// This allows the device to reach Metro through the USB tunnel
config.server = {
    ...config.server,
    port: 8081,
};

module.exports = config;