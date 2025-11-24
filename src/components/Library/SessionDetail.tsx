/**
 * ============================================================================
 * SessionDetail Component
 * ============================================================================
 * 
 * Displays all captures within a specific session.
 * 
 * FEATURES:
 * - Grid of photo/video thumbnails
 * - Tap to view capture details
 * - Session metadata header
 * - Back navigation
 * 
 * PROPS:
 * - session: CaptureSessionData - The session to display
 * - onSelectCapture: (capture: CapturedPhoto | CapturedVideo) => void
 * - onBack: () => void
 * 
 * USAGE:
 * <SessionDetail 
 *   session={selectedSession}
 *   onSelectCapture={handleSelectCapture}
 *   onBack={handleBack}
 * />
 */

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/config';
import { StatusTag } from '../UI';
import type { CaptureSessionData, CapturedPhoto, CapturedVideo } from '../../types';

interface SessionDetailProps {
  session: CaptureSessionData;
  onSelectCapture: (capture: CapturedPhoto | CapturedVideo) => void;
  onBack: () => void;
  onDeleteSession: (sessionId: string) => void;
}

export function SessionDetail({ session, onSelectCapture, onBack, onDeleteSession }: SessionDetailProps) {
  
  // ============================================================================
  // COMBINE ALL CAPTURES
  // ============================================================================
  
  const allCaptures = [
    ...session.photos.map(p => ({ ...p, type: 'photo' as const })),
    ...session.videos.map(v => ({ ...v, type: 'video' as const })),
  ].sort((a, b) => b.timestamp - a.timestamp); // Most recent first

  // ============================================================================
  // FORMAT TIME
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
      <LinearGradient
        colors={[COLORS.backgroundDark, COLORS.background]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Sessions</Text>
          </TouchableOpacity>
          <View style={styles.headerRight}>
            <StatusTag 
              status={session.status === 'active' ? 'uploading' : 'verified'} 
              size="small"
            />
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => {
                onDeleteSession(session.id);
                onBack();
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.deleteButtonText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Session Info */}
        <View style={styles.sessionInfo}>
          <Text style={styles.sessionName}>{session.name}</Text>
          <Text style={styles.sessionStats}>
            {session.photos.length} photos • {session.videos.length} videos
          </Text>
        </View>

        {/* Captures Grid */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
        >
          {allCaptures.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No captures yet</Text>
            </View>
          ) : (
            allCaptures.map((capture, index) => (
              <TouchableOpacity
                key={`${capture.type}-${index}`}
                style={styles.gridItem}
                onPress={() => onSelectCapture(capture)}
                activeOpacity={0.8}
              >
                <Image
                  source={{ 
                    uri: capture.type === 'video' && 'thumbnailUri' in capture
                      ? capture.thumbnailUri || capture.uri
                      : capture.uri
                  }}
                  style={styles.thumbnail}
                  resizeMode="cover"
                />
                
                {/* Video Overlay */}
                {capture.type === 'video' && 'duration' in capture && (
                  <View style={styles.videoOverlay}>
                    <Text style={styles.videoDuration}>
                      {formatTime(capture.duration)}
                    </Text>
                  </View>
                )}

                {/* Status Badge */}
                <View style={styles.statusBadge}>
                  <StatusTag status={capture.uploadStatus} size="small" />
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
  },
  deleteButtonText: {
    fontSize: 18,
  },
  sessionInfo: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sessionName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  sessionStats: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  gridItem: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.backgroundDark,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  videoDuration: {
    color: COLORS.text,
    fontSize: 10,
    fontWeight: 'bold',
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
});