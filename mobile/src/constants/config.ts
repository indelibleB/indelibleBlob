/**
 * ============================================================================
 * INDELIBLE.BLOB CONFIGURATION
 * ============================================================================
 * 
 * Central configuration file for the entire application.
 * 
 * SECURITY BEST PRACTICES:
 * - Never commit API keys or private keys to version control
 * - Use environment variables for sensitive data
 * - Use expo-secure-store for storing private keys on device
 * - Keep testnet and mainnet configs separate
 * 
 * ENVIRONMENT VARIABLES:
 * In production, these values should come from:
 * - .env file (for local development, add to .gitignore)
 * - Expo environment variables (for builds)
 * - Runtime configuration (for dynamic updates)
 */

import { AppConfig } from '@shared/types';

/**
 * Load environment variables
 * 
 * NOTE: In React Native/Expo, environment variables must be prefixed with EXPO_PUBLIC_
 * to be accessible at runtime. For sensitive keys, use expo-secure-store instead.
 */
const ENV = {
  WALRUS_PUBLISHER_URL: process.env.EXPO_PUBLIC_WALRUS_PUBLISHER_URL || 'https://publisher.walrus-testnet.walrus.space',
  WALRUS_AGGREGATOR_URL: process.env.EXPO_PUBLIC_WALRUS_AGGREGATOR_URL || 'https://aggregator.walrus-testnet.walrus.space',
  SUI_RPC_URL: process.env.EXPO_PUBLIC_SUI_RPC_URL || 'https://fullnode.testnet.sui.io:443',
  INDELIBLE_BLOB_PACKAGE_ID: process.env.EXPO_PUBLIC_INDELIBLE_BLOB_PACKAGE_ID && process.env.EXPO_PUBLIC_INDELIBLE_BLOB_PACKAGE_ID !== '0x0000000000000000000000000000000000000000000000000000000000000000'
    ? process.env.EXPO_PUBLIC_INDELIBLE_BLOB_PACKAGE_ID
    : '0xde8e70a68f79698646dc56f7d99e80b4831422618354047deb1780837e51aae3',
  SOLANA_RPC_URL: process.env.EXPO_PUBLIC_SOLANA_RPC_URL || 'https://api.testnet.solana.com',
  SOLANA_NETWORK: (process.env.EXPO_PUBLIC_SOLANA_NETWORK as any) || 'testnet',
};

/**
 * Main application configuration
 * 
 * CAPTURE SETTINGS:
 * - MAX_PHOTOS: Maximum photos per session (prevents memory issues)
 * - MAX_VIDEO_DURATION: Maximum video length in seconds
 * - MIN_PHOTOS_FOR_PROCESSING: Minimum photos needed for 3D reconstruction
 * - BURST_COUNT: Number of photos in burst mode
 * 
 * GPS SETTINGS:
 * - GPS_UPDATE_INTERVAL: How often to update location (milliseconds)
 * - GPS_DISTANCE_INTERVAL: Minimum distance change to trigger update (meters)
 * - RTK_ACCURACY_THRESHOLD: Accuracy threshold for RTK GPS (meters)
 * 
 * WALRUS SETTINGS:
 * - WALRUS_EPOCHS: How long to store data (1 epoch ≈ 1 day on testnet)
 * 
 * SUI SETTINGS:
 * - SUI_NETWORK: Which Sui network to use (testnet/mainnet/devnet)
 */
export const CAPTURE_CONFIG: AppConfig = {
  // Capture limits
  MAX_PHOTOS: 1000,
  MAX_VIDEO_DURATION: 600, // 10 minutes
  MIN_PHOTOS_FOR_PROCESSING: 8,
  BURST_COUNT: 20,

  // GPS configuration
  GPS_UPDATE_INTERVAL: 1000, // 1 second
  GPS_DISTANCE_INTERVAL: 0.1, // 10cm
  RTK_ACCURACY_THRESHOLD: 1.0, // 1 meter

  // Walrus configuration
  WALRUS_PUBLISHER_URL: ENV.WALRUS_PUBLISHER_URL,
  WALRUS_AGGREGATOR_URL: ENV.WALRUS_AGGREGATOR_URL,
  WALRUS_EPOCHS: 5, // Store for 5 epochs (~5 days on testnet)

  // Sui configuration
  SUI_NETWORK: 'testnet',
  SUI_RPC_URL: ENV.SUI_RPC_URL,
  INDELIBLE_BLOB_PACKAGE_ID: '0xde8e70a68f79698646dc56f7d99e80b4831422618354047deb1780837e51aae3',

  // Solana configuration
  SOLANA_NETWORK: 'testnet', // Using testnet for hackathon
  SOLANA_RPC_URL: 'https://api.testnet.solana.com',

  // SKR Token Configuration
  SKR_MINT_ADDRESS: 'AZbqUSumvXPYGLmZdepbyZpAJSrUdvetCzDW2gLQgQbT', // Dummy SPL token on testnet (placeholder for official SKR)
  SKR_TREASURY_WALLET: 'BgiixT9sVHkyAqc5jtzTqGgtXHX1rCpp5EocdBNDTWyh', // Testnet treasury wallet
  SKR_CAPTURE_COST: 5, // 5 SKR per capture (configurable placeholder)

  // Security
  STRICT_PROVENANCE: true, // Only allow hardware-backed proofs (Gold/Silver)
  ENABLE_SIMULATION: false, // LIVE MODE: Send real transactions to Sui Testnet
};

/**
 * AsyncStorage keys
 * 
 * BEST PRACTICE: Prefix all storage keys with app name to avoid conflicts
 * with other apps or libraries using AsyncStorage.
 */
export const STORAGE_KEYS = {
  SESSIONS: '@indelible_blob_sessions',
  USER_PREFERENCES: '@indelible_blob_preferences',
  LAST_SYNC: '@indelible_blob_last_sync',
} as const;

/**
 * Design system - Holographic Tech Gradient theme
 * 
 * COLOR PALETTE:
 * - Primary: Electric green (#14F195) - Solana ecosystem color
 * - Secondary: Solana purple (#9945FF) - Brand color
 * - Tertiary: Cyan (#00d4ff) - Accent color
 * 
 * ACCESSIBILITY:
 * - All text colors meet WCAG AA contrast requirements
 * - Glass morphism effects maintain readability
 * - Status colors are distinguishable for color-blind users
 */
export const COLORS = {
  // Base colors
  background: '#1a0b2e',
  backgroundDark: '#0f0619',

  // Brand colors — Sui-aligned
  primary: '#00d4ff',      // Sui cyan — hero action color
  secondary: '#9945FF',    // Solana purple
  tertiary: '#14F195',     // Electric green — success accent

  // Text colors
  text: '#f0f0f0',
  textSecondary: '#b0b0b0',

  // Glass morphism
  glass: 'rgba(255, 255, 255, 0.05)',
  glassDark: 'rgba(20, 20, 30, 0.9)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',

  // Status colors
  success: '#14F195',
  warning: '#FF9500',
  error: '#FF4444',
  recording: '#FF6B6B',
  info: '#00d4ff',

  // Upload status colors
  local: '#b0b0b0',
  uploading: '#FF9500',
  stored: '#9945FF',
  verifying: '#00d4ff',
  verified: '#14F195',
  failed: '#FF4444',
} as const;

/**
 * Typography tokens
 */
export const FONTS = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

/**
 * Animation durations (milliseconds)
 */
export const ANIMATION = {
  PULSE_DURATION: 1000,
  GLOW_DURATION: 2000,
  FADE_DURATION: 300,
  SLIDE_DURATION: 250,
} as const;

/**
 * Layout constants
 */
export const LAYOUT = {
  HEADER_HEIGHT: 60,
  TAB_BAR_HEIGHT: 50,
  THUMBNAIL_SIZE: 80,
  GRID_COLUMNS: 3,
  GRID_SPACING: 10,
} as const;

/**
 * Feature flags
 * 
 * BEST PRACTICE: Use feature flags to enable/disable features
 * without code changes. Useful for:
 * - A/B testing
 * - Gradual rollouts
 * - Emergency kill switches
 */
export const FEATURES = {
  ENABLE_RTK_GPS: true,
  ENABLE_VIDEO_RECORDING: true,
  ENABLE_BURST_MODE: false, // Coming soon
  ENABLE_OFFLINE_MODE: false, // Coming soon
  ENABLE_ANALYTICS: false, // Privacy-first: disabled by default
} as const;

/**
 * API timeouts (milliseconds)
 */
export const TIMEOUTS = {
  WALRUS_UPLOAD: 60000, // 60 seconds
  SUI_TRANSACTION: 30000, // 30 seconds
  GPS_LOCK: 10000, // 10 seconds
} as const;

/**
 * Validation rules
 */
export const VALIDATION = {
  MIN_SESSION_NAME_LENGTH: 1,
  MAX_SESSION_NAME_LENGTH: 50,
  MIN_GPS_ACCURACY: 0.01, // 1cm
  MAX_GPS_ACCURACY: 1000, // 1km
} as const;

