/**
 * ============================================================================
 * SessionList Component
 * ============================================================================
 * 
 * Displays all capture sessions in a scrollable list.
 * 
 * FEATURES:
 * - Session cards with preview thumbnails
 * - Session metadata (date, location, count)
 * - Tap to view session details
 * - Empty state when no sessions
 * 
 * PROPS:
 * - sessions: CaptureSessionData[] - Array of all sessions
 * - onSelectSession: (session: CaptureSessionData) => void
 * 
 * USAGE:
 * <SessionList 
 *   sessions={allSessions}
 *   onSelectSession={handleSelectSession}
 * />
 */

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/config';
import { StatusTag } from '../UI';
import type { CaptureSessionData } from '@shared/types';

interface SessionListProps {
  sessions: CaptureSessionData[];
  onSelectSession: (session: CaptureSessionData) => void;
  onDeleteSession: (sessionId: string) => void;
}

export function SessionList({ sessions, onSelectSession, onDeleteSession }: SessionListProps) {

  // ============================================================================
  // FORMAT DATE
  // ============================================================================

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ============================================================================
  // FORMAT LOCATION
  // ============================================================================

  const formatLocation = (lat: number, lon: number): string => {
    return `${lat.toFixed(4)}°, ${lon.toFixed(4)}°`;
  };

  // ============================================================================
  // RENDER EMPTY STATE
  // ============================================================================

  if (sessions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📚</Text>
        <Text style={styles.emptyTitle}>No Sessions Yet</Text>
        <Text style={styles.emptyText}>
          Start a new capture session to begin collecting verified photos and videos
        </Text>
      </View>
    );
  }

  // ============================================================================
  // RENDER SESSION LIST
  // ============================================================================

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {sessions.map((session) => {
        // Get preview thumbnails (first 4 captures)
        const allCaptures = [...session.photos, ...session.videos];
        const previews = allCaptures.slice(0, 4);

        return (
          <TouchableOpacity
            key={session.id}
            style={styles.sessionCard}
            onPress={() => onSelectSession(session)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[COLORS.glassDark, COLORS.glass]}
              style={styles.cardGradient}
            >
              {/* Session Header */}
              <View style={styles.sessionHeader}>
                <View style={styles.sessionHeaderLeft}>
                  <Text style={styles.sessionName}>{session.name}</Text>
                  <Text style={styles.sessionDate}>
                    {formatDate(session.startTime)}
                  </Text>
                </View>
                <View style={styles.sessionHeaderRight}>
                  <StatusTag
                    status={session.status === 'active' ? 'uploading' : 'verified'}
                    size="small"
                  />
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.deleteButtonText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Preview Grid */}
              {previews.length > 0 && (
                <View style={styles.previewGrid}>
                  {previews.map((capture, index) => (
                    <View key={index} style={styles.previewItem}>
                      <Image
                        source={{ uri: 'thumbnailUri' in capture ? capture.thumbnailUri || capture.uri : capture.uri }}
                        style={styles.previewImage}
                        resizeMode="cover"
                      />
                      {'duration' in capture && (
                        <View style={styles.videoBadge}>
                          <Text style={styles.videoBadgeText}>🎥</Text>
                        </View>
                      )}
                    </View>
                  ))}
                  {/* Fill empty slots */}
                  {[...Array(4 - previews.length)].map((_, index) => (
                    <View key={`empty-${index}`} style={[styles.previewItem, styles.previewEmpty]} />
                  ))}
                </View>
              )}

              {/* Session Stats */}
              <View style={styles.sessionStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statIcon}>📸</Text>
                  <Text style={styles.statText}>{session.photos.length}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statIcon}>🎥</Text>
                  <Text style={styles.statText}>{session.videos.length}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statIcon}>📍</Text>
                  <Text style={styles.statText}>
                    {formatLocation(session.location.latitude, session.location.longitude)}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  sessionCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  cardGradient: {
    padding: 16,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sessionHeaderLeft: {
    flex: 1,
  },
  sessionHeaderRight: {
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
  sessionName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  sessionDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  previewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  previewItem: {
    width: '23%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.backgroundDark,
  },
  previewEmpty: {
    backgroundColor: COLORS.glass,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  videoBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 4,
    padding: 2,
  },
  videoBadgeText: {
    fontSize: 10,
  },
  sessionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statIcon: {
    fontSize: 14,
  },
  statText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
});