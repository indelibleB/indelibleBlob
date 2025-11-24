/**
 * ============================================================================
 * CaptureDetail Component
 * ============================================================================
 * 
 * Detailed view of a single capture with all metadata.
 * 
 * FEATURES:
 * - Full-size image/video preview
 * - Tabbed metadata (GPS, Blockchain, Advanced)
 * - Copy-to-clipboard for hashes and IDs
 * - Status indicator
 * - Back navigation
 * 
 * PROPS:
 * - capture: CapturedPhoto | CapturedVideo - The capture to display
 * - onBack: () => void
 * 
 * USAGE:
 * <CaptureDetail 
 *   capture={selectedCapture}
 *   onBack={handleBack}
 * />
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/config';
import { StatusTag, MetadataRow } from '../UI';
import type { CapturedPhoto, CapturedVideo } from '../../types';

interface CaptureDetailProps {
  capture: CapturedPhoto | CapturedVideo;
  onBack: () => void;
}

type Tab = 'basic' | 'gps' | 'blockchain' | 'advanced';

export function CaptureDetail({ capture, onBack }: CaptureDetailProps) {
  
  const [activeTab, setActiveTab] = useState<Tab>('basic');
  const isVideo = 'duration' in capture;

  // ============================================================================
  // FORMAT HELPERS
  // ============================================================================
  
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ============================================================================
  // RENDER TAB CONTENT
  // ============================================================================
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return (
          <View>
            <MetadataRow label="Type" value={isVideo ? 'Video' : 'Photo'} icon="📁" />
            <MetadataRow label="Captured" value={formatDate(capture.timestamp)} icon="🕐" />
            {isVideo && (
              <MetadataRow label="Duration" value={`${formatTime(capture.duration)}`} icon="⏱️" />
            )}
            <MetadataRow label="Status" value={capture.uploadStatus} icon="📊" />
          </View>
        );

      case 'gps':
        return (
          <View>
            <MetadataRow 
              label="Latitude" 
              value={capture.gpsData.latitude.toFixed(6)} 
              icon="📍" 
              copyable 
            />
            <MetadataRow 
              label="Longitude" 
              value={capture.gpsData.longitude.toFixed(6)} 
              icon="📍" 
              copyable 
            />
            <MetadataRow 
              label="Altitude" 
              value={`${capture.gpsData.altitude.toFixed(2)} m`} 
              icon="⛰️" 
            />
            <MetadataRow 
              label="Accuracy" 
              value={`${capture.gpsData.accuracy.toFixed(2)} m`} 
              icon="🎯" 
            />
            <MetadataRow 
              label="Heading" 
              value={`${capture.gpsData.heading?.toFixed(1) || 'N/A'}°`} 
              icon="🧭" 
            />
            <MetadataRow 
              label="Speed" 
              value={`${capture.gpsData.speed?.toFixed(2) || 'N/A'} m/s`} 
              icon="🚀" 
            />
            <MetadataRow 
              label="RTK Enabled" 
              value={capture.gpsData.isRTK ? 'Yes' : 'No'} 
              icon="📡" 
            />
          </View>
        );

      case 'blockchain':
        return (
          <View>
            {capture.walrusData ? (
              <>
                <MetadataRow 
                  label="Walrus Blob ID" 
                  value={capture.walrusData.blobId} 
                  icon="🐋" 
                  copyable 
                />
                <MetadataRow 
                  label="Walrus URL" 
                  value={capture.walrusData.url} 
                  icon="🔗" 
                  copyable 
                />
                <MetadataRow 
                  label="File Size" 
                  value={`${(capture.walrusData.size / 1024).toFixed(2)} KB`} 
                  icon="💾" 
                />
              </>
            ) : (
              <Text style={styles.noData}>Not uploaded to Walrus yet</Text>
            )}
            
            {capture.suiData ? (
              <>
                <MetadataRow 
                  label="Sui Transaction" 
                  value={capture.suiData.digest} 
                  icon="⛓️" 
                  copyable 
                />
                <MetadataRow 
                  label="Object ID" 
                  value={capture.suiData.objectId || 'N/A'} 
                  icon="🆔" 
                  copyable 
                />
              </>
            ) : (
              <Text style={styles.noData}>Not recorded on Sui yet</Text>
            )}
          </View>
        );

      case 'advanced':
        return (
          <View>
            {capture.contentHash && (
              <MetadataRow 
                label="Content Hash" 
                value={capture.contentHash} 
                icon="🔐" 
                copyable 
              />
            )}
            <MetadataRow 
              label="Session ID" 
              value={capture.sessionId} 
              icon="📚" 
              copyable 
            />
            <MetadataRow 
              label="Index" 
              value={`#${capture.index}`} 
              icon="🔢" 
            />
            <MetadataRow 
              label="Timestamp" 
              value={capture.timestamp.toString()} 
              icon="⏰" 
              copyable 
            />
          </View>
        );

      default:
        return null;
    }
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
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <StatusTag status={capture.uploadStatus} size="medium" />
        </View>

        {/* Image/Video Preview */}
        <View style={styles.previewContainer}>
          <Image
            source={{ 
              uri: isVideo && 'thumbnailUri' in capture
                ? capture.thumbnailUri || capture.uri
                : capture.uri
            }}
            style={styles.previewImage}
            resizeMode="contain"
          />
          {isVideo && (
            <View style={styles.playOverlay}>
              <Text style={styles.playIcon}>▶</Text>
              <Text style={styles.playDuration}>{formatTime(capture.duration)}</Text>
            </View>
          )}
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {(['basic', 'gps', 'blockchain', 'advanced'] as Tab[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {renderTabContent()}
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
  previewContainer: {
    height: 250,
    backgroundColor: '#000',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 50,
    width: 80,
    height: 80,
  },
  playIcon: {
    fontSize: 32,
    color: COLORS.text,
  },
  playDuration: {
    fontSize: 10,
    color: COLORS.text,
    fontWeight: 'bold',
    marginTop: 4,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: COLORS.glass,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  tabTextActive: {
    color: COLORS.background,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  noData: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingVertical: 20,
    fontStyle: 'italic',
  },
});