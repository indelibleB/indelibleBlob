/**
 * ============================================================================
 * LoadingSpinner Component
 * ============================================================================
 * 
 * Animated loading indicator.
 * 
 * PROPS:
 * - size?: 'small' | 'large' - Size of the spinner
 * - message?: string - Optional loading message
 * 
 * USAGE:
 * <LoadingSpinner size="large" message="Processing..." />
 */

import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/config';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  message?: string;
}

export function LoadingSpinner({ size = 'large', message }: LoadingSpinnerProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={COLORS.primary} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});