/**
 * ============================================================================
 * TRUST SERVICE
 * ============================================================================
 * 
 * Determines the "Truth Grade" of the device and available forensic signals.
 * 
 * GRADES:
 * - GOLD: Solana Seeker (MWA + TEEPIN + Sensors)
 * - SILVER: iOS AppAttest or High-End Android StrongBox
 * - UNTRUSTED: Software-only or Unknown (Verification Failed)
 */

import { Platform } from 'react-native';
import * as Device from 'expo-device';
import { SolanaService } from './solana';
import { ProvenanceGrade } from '@shared/types';

// (ProvenanceGrade imported from shared/types)

export interface DeviceProvenanceProfile {
  grade: ProvenanceGrade;
  hasHardwareEnclave: boolean;
  hasLidar: boolean;
  hasMWA: boolean;
  reason: string;
}

class TrustManagerClass {
  private profile: DeviceProvenanceProfile | null = null;

  async getDeviceProfile(): Promise<DeviceProvenanceProfile> {
    if (this.profile) return this.profile;

    const hasMWA = await SolanaService.isMWAAvailable();

    // ⚠️ [TESTING MOCK] Force SILVER grade to test SKR payment pipeline.
    // REVERT THIS before final commit — restore the real isSeeker detection line below.
    // Real line: const isSeeker = hasMWA && (Device.modelName?.toLowerCase().includes('seeker') || Device.deviceName?.toLowerCase().includes('seeker'));
    this.profile = {
      grade: 'SILVER',
      hasHardwareEnclave: true,
      hasLidar: false,
      hasMWA,
      reason: '[TESTING] Forced Silver for SKR Payment Testing',
    };
    return this.profile;
    // ⚠️ [END TESTING MOCK] — Delete everything above this line and uncomment the real detection below.

    const isSeeker = hasMWA && (Device.modelName?.toLowerCase().includes('seeker') || Device.deviceName?.toLowerCase().includes('seeker'));

    let grade: ProvenanceGrade = 'UNTRUSTED';
    let reason = 'Strict Hardware Verification Failed (No TEEPIN or Secure Enclave)';
    let hasHardwareEnclave = false;

    // 1. Detect Seeker (GOLD)
    if (isSeeker) {
      grade = 'GOLD';
      hasHardwareEnclave = true;
      reason = 'Solana Seeker Hardware Enclave (TEEPIN) Active';
    }
    // 2. Detect iOS/Android Enclave (SILVER)
    else if (Platform.OS === 'ios' || (Platform.OS === 'android' && await this.checkAndroidStrongBox())) {
      grade = 'SILVER';
      hasHardwareEnclave = true;
      reason = Platform.OS === 'ios' ? 'Apple Secure Enclave Active' : 'Android StrongBox Keystore Active';
    }

    // [HARDENING] Double-check MWA for Gold
    if (grade === 'GOLD' && !hasMWA) {
      grade = 'SILVER';
      reason = 'Seeker Model Detected but MWA (TEEPIN) Unavailable - Downgraded to Silver';
    }

    this.profile = {
      grade,
      hasHardwareEnclave,
      hasLidar: await this.checkLidar(),
      hasMWA,
      reason,
    };

    return this.profile;
  }

  private async checkAndroidStrongBox(): Promise<boolean> {
    // In a real implementation, we would use a native module to check StrongBox Keystore availability
    // For now, we assume modern high-end Pixels/Galaxies possess it
    if (Platform.OS !== 'android') return false;
    const model = Device.modelName?.toLowerCase() || '';
    return model.includes('pixel') || model.includes('galaxy s') || model.includes('sm-g');
  }

  private async checkLidar(): Promise<boolean> {
    // Detect LiDAR availability (primarily iPhone Pro models)
    if (Platform.OS !== 'ios') return false;
    const model = Device.modelName?.toLowerCase() || '';
    return model.includes('pro') && (model.includes('12') || model.includes('13') || model.includes('14') || model.includes('15') || model.includes('16'));
  }
}

export const TrustManager = new TrustManagerClass();
