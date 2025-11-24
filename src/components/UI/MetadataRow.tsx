/**
 * ============================================================================
 * MetadataRow Component
 * ============================================================================
 * 
 * Displays a key-value pair with consistent styling.
 * 
 * PROPS:
 * - label: string - The key/label
 * - value: string - The value
 * - icon?: string - Optional emoji icon
 * - copyable?: boolean - Whether value can be copied
 * 
 * USAGE:
 * <MetadataRow label="Latitude" value="37.7749" icon="📍" />
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { COLORS } from '../../constants/config';

interface MetadataRowProps {
  label: string;
  value: string;
  icon?: string;
  copyable?: boolean;
}

export function MetadataRow({ label, value, icon, copyable = false }: MetadataRowProps) {
  // ============================================================================
  // COPY TO CLIPBOARD
  // ============================================================================
  
  const handleCopy = async () => {
    await Clipboard.setStringAsync(value);
    Alert.alert('Copied', `${label} copied to clipboard`);
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  
  const content = (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        {icon && <Text style={styles.icon}>{icon}</Text>}
        <Text style={styles.label}>{label}</Text>
      </View>
      <Text style={styles.value} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );

  if (copyable) {
    return (
      <TouchableOpacity onPress={handleCopy} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.glass,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 16,
    marginRight: 8,
  },
  label: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
    marginLeft: 16,
    flex: 1,
    textAlign: 'right',
  },
});