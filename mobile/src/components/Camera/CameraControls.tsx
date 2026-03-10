/**
 * ============================================================================
 * CameraControls Component
 * ============================================================================
 * 
 * Camera control buttons (mode switch, flip camera, etc.).
 * 
 * PROPS:
 * - mode: 'photo' | 'video' - Current capture mode
 * - cameraType: 'front' | 'back' - Current camera facing
 * - isRecording: boolean - Whether currently recording
 * - onToggleMode: () => void - Handler for mode toggle
 * - onFlipCamera: () => void - Handler for camera flip
 * 
 * USAGE:
 * <CameraControls 
 *   mode="photo"
 *   cameraType="back"
 *   onToggleMode={toggleMode}
 *   onFlipCamera={flipCamera}
 * />
 */

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/config';

interface CameraControlsProps {
  mode: 'photo' | 'video';
  cameraType: 'front' | 'back';
  isRecording: boolean;
  onToggleMode: () => void;
  onFlipCamera: () => void;
}

export function CameraControls({
  mode,
  cameraType,
  isRecording,
  onToggleMode,
  onFlipCamera,
}: CameraControlsProps) {
  
  return (
    <View style={styles.container}>
      {/* Mode Toggle Button */}
      <TouchableOpacity
        style={[styles.button, isRecording && styles.buttonDisabled]}
        onPress={onToggleMode}
        disabled={isRecording}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonIcon}>
          {mode === 'photo' ? '🎥' : '📸'}
        </Text>
        <Text style={styles.buttonText}>
          {mode === 'photo' ? 'Video' : 'Photo'}
        </Text>
      </TouchableOpacity>

      {/* Flip Camera Button */}
      <TouchableOpacity
        style={[styles.button, isRecording && styles.buttonDisabled]}
        onPress={onFlipCamera}
        disabled={isRecording}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonIcon}>🔄</Text>
        <Text style={styles.buttonText}>
          {cameraType === 'back' ? 'Front' : 'Back'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.glass,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    minWidth: 100,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  buttonText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '600',
  },
});