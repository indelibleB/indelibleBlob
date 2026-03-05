/**
 * ============================================================================
 * INDELIBLE.BLOB TYPE DEFINITIONS
 * ============================================================================
 * 
 * Central type definitions for the entire application.
 * This file contains all interfaces, types, and enums used across the app.
 * 
 * BEST PRACTICE: Keeping types in a separate file provides:
 * - Single source of truth for data structures
 * - Easy refactoring and maintenance
 * - Better IDE autocomplete and type checking
 * - Clear documentation of data models
 */

// ============================================================================
// CORE DATA TYPES
// ============================================================================

export type ProvenanceGrade = 'GOLD' | 'SILVER' | 'UNTRUSTED';

/**
 * GPS/Location data captured with each photo or video
 * 
 * SECURITY NOTE: GPS data is sensitive personal information.
 * Ensure user consent before storing/transmitting location data.
 */
export interface GPSData {
  latitude: number;        // Decimal degrees (-90 to 90)
  longitude: number;       // Decimal degrees (-180 to 180)
  altitude: number;        // Meters above sea level
  accuracy: number;        // Horizontal accuracy in meters
  heading: number;         // Direction of travel (0-360 degrees)
  speed: number;           // Speed in meters per second
  timestamp: number;       // Unix timestamp (milliseconds)
  isRTK: boolean;          // Real-Time Kinematic GPS (high precision)
}

/**
 * Inertial and magnetic sensor data for forensic orientation proof
 */
export interface SensorData {
  accelerometer: {
    x: number;
    y: number;
    z: number;
  };
  magnetometer: {
    x: number;
    y: number;
    z: number;
  };
  compassHeading: number; // Combined magnetometer/system heading
}

/**
 * Walrus decentralized storage metadata
 * 
 * Walrus is a decentralized blob storage system on Sui.
 * Each uploaded file gets a unique blob ID and can be retrieved via aggregator.
 */
export interface WalrusData {
  blobId: string;          // Unique identifier for the blob on Walrus
  url: string;             // Full URL to retrieve the blob
  size: number;            // File size in bytes
  uploadedAt: number;      // Unix timestamp of upload
}

/**
 * Sui blockchain transaction metadata
 * 
 * Records the on-chain transaction that stores the capture metadata.
 * This provides immutable proof of capture time, location, and content.
 */
export interface SuiData {
  digest: string;          // Transaction digest (hash)
  objectId: string;        // On-chain object ID
  recordedAt: number;      // Unix timestamp when recorded
}

/**
 * Upload/verification status progression
 * 
 * Lifecycle: local → uploading → stored → verifying → verified
 * Can fail at any step and go to 'failed' status
 */
export type UploadStatus =
  | 'local'        // Captured but not yet uploaded
  | 'uploading'    // Currently uploading to Walrus
  | 'stored'       // Successfully stored on Walrus
  | 'verifying'    // Recording metadata on Sui blockchain
  | 'verified'     // Fully verified on-chain
  | 'failed';      // Upload or verification failed

// ============================================================================
// CAPTURE DATA TYPES
// ============================================================================

/**
 * Captured photo with georeferencing and survey metadata
 * 
 * Each photo includes:
 * - Raw image file URI
 * - GPS coordinates at capture time
 * - Survey metadata (relative positioning, quality metrics)
 * - Upload status and blockchain metadata
 */
export interface CapturedPhoto {
  uri: string;                    // Local file URI (file://)
  timestamp: number;              // Capture time (Unix milliseconds)
  sessionId: string;              // ID of capture session
  index: number;                  // Sequential index within session
  gpsData: GPSData;               // GPS coordinates at capture

  /**
   * Survey-specific metadata for photogrammetry
   * Tracks relative positioning and capture quality
   */
  surveyMetadata: {
    relativeToBase: {
      deltaLat: number;           // Latitude offset from session base
      deltaLon: number;           // Longitude offset from session base
      deltaAlt: number;           // Altitude offset from session base
    };
    captureQuality: {
      gpsAccuracy: number;        // GPS accuracy at capture time
      isRTKEnabled: boolean;      // Whether RTK GPS was active
      coordinateSystem: string;   // e.g., "WGS84"
    };
  };

  uploadStatus: UploadStatus;     // Current upload/verification status
  walrusData?: WalrusData;        // Set after Walrus upload
  suiData?: SuiData;              // Set after blockchain recording
  contentHash?: string;           // SHA-256 hash of image file
  isSovereign?: boolean;          // Whether the blob is encrypted
  teepinSignature?: string;       // Hardware attestation (Base64)
  teepinPublicKey?: string;       // Solana signer address
  sessionBindSignature?: string;  // [NEW] Bind Signature (Link between Sui & Solana)
  sensorData?: SensorData;        // Inertial/Magnetic proof
  provenanceGrade?: ProvenanceGrade; // Gold/Silver
  forensicScore?: number;         // 0-100 Confidence
  anomalies?: string[];           // List of detected forensic anomalies
}

/**
 * Captured video with duration and thumbnail
 * 
 * Similar to CapturedPhoto but includes:
 * - Video duration
 * - Generated thumbnail URI
 * - No survey metadata (videos are for context, not photogrammetry)
 */
export interface CapturedVideo {
  uri: string;                    // Local video file URI
  thumbnailUri?: string;          // Generated thumbnail image URI
  timestamp: number;              // Capture time (Unix milliseconds)
  sessionId: string;              // ID of capture session
  index: number;                  // Sequential index within session
  duration: number;               // Video length in seconds
  gpsData: GPSData;               // GPS coordinates at start of recording

  uploadStatus: UploadStatus;     // Current upload/verification status
  walrusData?: WalrusData;        // Set after Walrus upload
  suiData?: SuiData;              // Set after blockchain recording
  contentHash?: string;           // SHA-256 hash of video file
  isSovereign?: boolean;          // Whether the blob is encrypted
  teepinSignature?: string;       // Hardware attestation (Base64)
  teepinPublicKey?: string;       // Solana signer address
  sessionBindSignature?: string;  // [NEW] Bind Signature (Link between Sui & Solana)
  sensorData?: SensorData;        // Inertial/Magnetic proof
  provenanceGrade?: ProvenanceGrade; // Gold/Silver
  forensicScore?: number;         // 0-100 Confidence
  anomalies?: string[];           // List of detected forensic anomalies
}

/**
 * Union type for any capture (photo or video)
 * Use type guards to distinguish: 'duration' in capture
 */
export type Capture = CapturedPhoto | CapturedVideo;

// ============================================================================
// SESSION MANAGEMENT TYPES
// ============================================================================

/**
 * Complete capture session with all photos and videos
 * 
 * ARCHITECTURE: Session-based organization provides:
 * - Logical grouping of related captures
 * - Context for each capture event (time, location, purpose)
 * - Scalability (hundreds of captures across multiple sessions)
 * - User-friendly navigation
 * 
 * Each session represents a discrete capture event (e.g., "Building Survey 2024-01-15")
 */
export interface CaptureSessionData {
  id: string;              // Unique session ID
  name: string;            // User-assigned name
  startTime: number;       // Unix timestamp
  endTime: number | null;  // null if active
  location: GPSData;       // Starting location
  photos: CapturedPhoto[];
  videos: CapturedVideo[];
  totalAssets: number;
  status: 'active' | 'completed' | 'uploaded';

  // [NEW] SKR Commerce Layer Data
  availableCaptures?: number | 'Infinity'; // Infinity for Seeker free-tier
  capturesConsumed?: number;               // Running total of captures taken this session
  paymentPending?: boolean;                // True if post-session SPL transfer failed
}

// ============================================================================
// UI NAVIGATION TYPES
// ============================================================================

/**
 * Library view hierarchy (3 levels)
 * 
 * Navigation flow:
 * 1. 'sessions' - List of all capture sessions
 * 2. 'session-detail' - All captures within a specific session
 * 3. 'capture-detail' - Full metadata for a single photo/video
 */
export type LibraryView = 'sessions' | 'session-detail' | 'capture-detail';

/**
 * Main app view
 */
export type AppView = 'camera' | 'library';

/**
 * Capture mode for camera
 */
export type CaptureMode = 'photo' | 'video';

/**
 * Detail view tabs
 */
export type DetailTab = 'basic' | 'gps' | 'blockchain' | 'advanced';

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

/**
 * App configuration interface
 * 
 * SECURITY NOTE: This should be populated from environment variables,
 * never hardcode API keys or private keys in source code.
 */
export interface AppConfig {
  // Capture settings
  MAX_PHOTOS: number;
  MAX_VIDEO_DURATION: number;
  MIN_PHOTOS_FOR_PROCESSING: number;
  BURST_COUNT: number;
  GPS_UPDATE_INTERVAL: number;
  GPS_DISTANCE_INTERVAL: number;
  RTK_ACCURACY_THRESHOLD: number;

  // Walrus configuration
  WALRUS_PUBLISHER_URL: string;
  WALRUS_AGGREGATOR_URL: string;
  WALRUS_EPOCHS: number;

  // Sui configuration
  SUI_NETWORK: 'testnet' | 'mainnet' | 'devnet';
  SUI_RPC_URL: string;
  INDELIBLE_BLOB_PACKAGE_ID: string;
  SOVEREIGN_BLOB_PACKAGE_ID: string;

  // Solana configuration (optional — not all builds need Solana)
  SOLANA_NETWORK?: 'testnet' | 'mainnet' | 'devnet';
  SOLANA_RPC_URL?: string;

  // SKR Token Configuration (optional)
  SKR_MINT_ADDRESS?: string;
  SKR_TREASURY_WALLET?: string;
  SKR_CAPTURE_COST?: number;

  // Security (optional — defaults to false)
  STRICT_PROVENANCE?: boolean;
  ENABLE_SIMULATION?: boolean;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

/**
 * Custom error types for better error handling
 */
export class WalrusUploadError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'WalrusUploadError';
  }
}

export class SuiTransactionError extends Error {
  constructor(message: string, public digest?: string) {
    super(message);
    this.name = 'SuiTransactionError';
  }
}

export class GPSError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GPSError';
  }
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard to check if a capture is a video
 * 
 * Usage: if (isVideo(capture)) { /* capture is CapturedVideo }
 */
export function isVideo(capture: Capture): capture is CapturedVideo {
  return 'duration' in capture;
}

/**
 * Type guard to check if a capture is a photo
 */
export function isPhoto(capture: Capture): capture is CapturedPhoto {
  return 'surveyMetadata' in capture;
}
