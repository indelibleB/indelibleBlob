/**
 * ============================================================================
 * StatusTag Component
 * ============================================================================
 * 
 * Visual indicator for capture upload status.
 * 
 * PROPS:
 * - status: UploadStatus - Current status of the capture
 * - size?: 'small' | 'medium' | 'large' - Size variant
 * 
 * USAGE:
 * <StatusTag status="verified" size="medium" />
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/config';
import type { UploadStatus } from '@shared/types';

interface StatusTagProps {
  status: UploadStatus;
  size?: 'small' | 'medium' | 'large';
}

export function StatusTag({ status, size = 'medium' }: StatusTagProps) {
  // ============================================================================
  // STATUS CONFIGURATION
  // ============================================================================

  const statusConfig = {
    local: {
      label: 'Local',
      icon: '📱',
      color: COLORS.textSecondary,
      bgColor: 'rgba(255, 255, 255, 0.1)',
    },
    uploading: {
      label: 'Uploading',
      icon: '📤',
      color: COLORS.info,
      bgColor: 'rgba(59, 130, 246, 0.2)',
    },
    stored: {
      label: 'Stored',
      icon: '💾',
      color: COLORS.warning,
      bgColor: 'rgba(251, 191, 36, 0.2)',
    },
    verifying: {
      label: 'Verifying',
      icon: '🔍',
      color: COLORS.info,
      bgColor: 'rgba(59, 130, 246, 0.2)',
    },
    verified: {
      label: 'Verified',
      icon: '✅',
      color: COLORS.success,
      bgColor: 'rgba(34, 197, 94, 0.2)',
    },
    failed: {
      label: 'Failed',
      icon: '❌',
      color: COLORS.error,
      bgColor: 'rgba(239, 68, 68, 0.2)',
    },
  };

  const config = statusConfig[status];

  // ============================================================================
  // SIZE VARIANTS
  // ============================================================================

  const sizeStyles = {
    small: { paddingHorizontal: 6, paddingVertical: 2, fontSize: 10 },
    medium: { paddingHorizontal: 10, paddingVertical: 4, fontSize: 12 },
    large: { paddingHorizontal: 14, paddingVertical: 6, fontSize: 14 },
  };

  const currentSize = sizeStyles[size];

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: config.bgColor,
          paddingHorizontal: currentSize.paddingHorizontal,
          paddingVertical: currentSize.paddingVertical,
        },
      ]}
    >
      <Text style={[styles.text, { color: config.color, fontSize: currentSize.fontSize }]}>
        {config.icon} {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '600',
  },
});