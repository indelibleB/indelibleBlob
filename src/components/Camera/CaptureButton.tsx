/*====================
 * CaptureButton Component
 * ============================================================================
 * 
 * Main capture button for photos and videos.
 * 
 * BEHAVIOR:
 * - Photo mode: Tap to capture
 * - Video mode: Tap to start/stop recording
 * - Visual feedback for recording state
 * - Disabled state when not ready
 * 
 * PROPS:
 * - mode: 'photo' | 'video' - Current capture mode
 * - isRecording: boolean - Whether currently recording
 * - disabled: boolean - Whether button is disabled
 * - onPress: () => void - Handler for button press
 * 
 * USAGE:
 * <CaptureButton 
 *   mode="video" 
 *   isRecording={true} 
 *   onPress={handleCapture}
 * />
 */

import React from 'react';
import { TouchableOpacity, View, StyleSheet, Text } from 'react-native';
import { COLORS } from '../../constants/config';

interface CaptureButtonProps {
  mode: 'photo' | 'video';
  isRecording: boolean;
  disabled: boolean;
  recordingDuration?: number;
  onPress: () => void;
}

export function CaptureButton({ 
  mode, 
  isRecording, 
  disabled, 
  recordingDuration = 0,
  onPress 
}: CaptureButtonProps) {
  
  // ============================================================================
  // FORMAT RECORDING DURATION
  // ============================================================================
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <View style={styles.container}>
      {/* Recording duration indicator */}
      {isRecording && (
        <View style={styles.durationContainer}>
          <View style={styles.recordingDot} />
          <Text style={styles.durationText}>{formatTime(recordingDuration)}</Text>
        </View>
      )}
      
      {/* Main capture button */}
      <TouchableOpacity
        style={[
          styles.button,
          disabled && styles.buttonDisabled,
        ]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <View
          style={[
            styles.innerButton,
            mode === 'video' && styles.innerButtonVideo,
            isRecording && styles.innerButtonRecording,
          ]}
        />
      </TouchableOpacity>
      
      {/* Mode indicator */}
      <Text style={styles.modeText}>
        {mode === 'photo' ? '📸 Photo' : isRecording ? '⏹️  Stop' : '🎥 Record'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.text,
    marginRight: 8,
  },
  durationText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  button: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.text,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: COLORS.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  innerButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
  },
  innerButtonVideo: {
    borderRadius: 8,
    width: 56,
    height: 56,
  },
  innerButtonRecording: {
    backgroundColor: COLORS.error,
    width: 32,
    height: 32,
    borderRadius: 4,
  },
  modeText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
  },
});