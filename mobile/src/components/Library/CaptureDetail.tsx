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
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Linking, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
// Use require for potentially missing native modules to prevent crash at boot
const VideoModule = require('expo-av');
const SharingModule = require('expo-sharing');
import { COLORS } from '../../constants/config';
import { StatusTag, MetadataRow, ProvenanceBadge } from '../UI';
import type { CapturedPhoto, CapturedVideo } from '@shared/types';

interface CaptureDetailProps {
  capture: CapturedPhoto | CapturedVideo;
  onBack: () => void;
}

type Tab = 'basic' | 'gps' | 'blockchain' | 'advanced';

export function CaptureDetail({ capture, onBack }: CaptureDetailProps) {

  const [activeTab, setActiveTab] = useState<Tab>('basic');
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadingMedia, setLoadingMedia] = useState(false);

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

  const handleShare = async () => {
    try {
      if (!SharingModule || !SharingModule.shareAsync) {
        Alert.alert("Feature Unavailable", "The sharing module is not installed. Please run 'npx expo install expo-sharing' once online.");
        return;
      }

      if (!(await SharingModule.isAvailableAsync())) {
        Alert.alert("Sharing Unavailable", "Sharing is not available on this platform");
        return;
      }

      await SharingModule.shareAsync(capture.uri, {
        mimeType: isVideo ? 'video/mp4' : 'image/jpeg',
        dialogTitle: `Export indelible.Blob: ${isVideo ? 'Video' : 'Photo'}`,
      });
    } catch (error) {
      console.error('Export Failed:', error);
      Alert.alert("Export Error", "Failed to share media.");
    }
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
            {/* Sovereign state is now displayed in the top header banner and in Advanced tab */}

            {/* Consumer Proof Link */}
            {(capture.walrusData || capture.suiData) && (
              <MetadataRow
                label="Verification Proof"
                value="View Certificate"
                icon="📜"
                onPressValue={() => {
                  const id = capture.walrusData?.blobId || capture.suiData?.digest;
                  Linking.openURL(`https://indelible-blob.com/verify?id=${id}`);
                }}
              />
            )}

            {capture.walrusData ? (
              <>
                <MetadataRow
                  label="Walrus Blob"
                  value={capture.walrusData.blobId}
                  icon="🦭"
                  copyable
                  onPressValue={() => Linking.openURL(capture.walrusData!.url)}
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
                  label="Sui Digest"
                  value={capture.suiData.digest}
                  icon="⛓️"
                  copyable
                  onPressValue={() => Linking.openURL(`https://suivision.xyz/txblock/${capture.suiData!.digest}?network=testnet`)}
                />
                <MetadataRow
                  label="Object ID"
                  value={capture.suiData.objectId || 'N/A'}
                  icon="🆔"
                  copyable
                  onPressValue={() => capture.suiData?.objectId && Linking.openURL(`https://suivision.xyz/object/${capture.suiData!.objectId}?network=testnet`)}
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
            <MetadataRow
              label="Provenance Grade"
              value={capture.provenanceGrade || 'UNTRUSTED'}
              icon="🛡️"
            />
            {capture.isSovereign && (
              <MetadataRow
                label="Protection State"
                value="Sovereign Mode Active"
                icon="🧿"
              />
            )}
            <MetadataRow
              label="Forensic Score"
              value={`${capture.forensicScore || 100}%`}
              icon="🎯"
            />
            {capture.contentHash && (
              <MetadataRow
                label="Content Hash"
                value={capture.contentHash}
                icon="🔐"
                copyable
              />
            )}

            {/* Forensic Sensor Data */}
            {capture.sensorData && (
              <>
                <MetadataRow
                  label="Orientation (X/Y/Z)"
                  value={`${capture.sensorData.accelerometer.x.toFixed(2)}, ${capture.sensorData.accelerometer.y.toFixed(2)}, ${capture.sensorData.accelerometer.z.toFixed(2)}`}
                  icon="📐"
                />
                <MetadataRow
                  label="Magnetic Field"
                  value={`${capture.sensorData.magnetometer.x.toFixed(0)}, ${capture.sensorData.magnetometer.y.toFixed(0)}, ${capture.sensorData.magnetometer.z.toFixed(0)}`}
                  icon="🧲"
                />
              </>
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
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
              <Text style={styles.shareButtonText}>📤 Export</Text>
            </TouchableOpacity>
            <StatusTag status={capture.uploadStatus} size="medium" />
          </View>
        </View>

        {/* Provenance Grade & Sovereign State — Inline Badge Row */}
        <View style={styles.truthGradeContainer}>
          <View style={styles.badgeRow}>
            <ProvenanceBadge
              grade={capture.provenanceGrade || 'UNTRUSTED'}
              score={capture.forensicScore}
            />
            {capture.isSovereign && (
              <View style={styles.sovereignHeaderBadge}>
                <Text style={styles.sovereignHeaderIcon}>🧿</Text>
                <Text style={styles.sovereignHeaderText}>Sovereign Protected</Text>
              </View>
            )}
          </View>
          {capture.anomalies && capture.anomalies.length > 0 && (
            <View style={styles.anomalyList}>
              {capture.anomalies.map((anomaly, idx) => (
                <Text key={idx} style={styles.anomalyText}>⚠️ {anomaly}</Text>
              ))}
            </View>
          )}
        </View>

        {/* Image/Video Preview */}
        <View style={styles.previewContainer}>
          {isVideo && isPlaying && VideoModule ? (
            <VideoModule.Video
              source={{ uri: capture.uri }}
              rate={1.0}
              volume={1.0}
              isMuted={false}
              resizeMode={VideoModule.ResizeMode.CONTAIN}
              shouldPlay
              useNativeControls
              style={styles.previewImage}
              onPlaybackStatusUpdate={(status: any) => {
                if (status.didJustFinish) setIsPlaying(false);
              }}
              onError={(error: any) => {
                console.error('Video Player Error:', error);
                setIsPlaying(false);
                Alert.alert("Playback Error", "Failed to play video.");
              }}
            />
          ) : (
            <>
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
                <TouchableOpacity
                  style={styles.playOverlay}
                  onPress={() => setIsPlaying(true)}
                >
                  <Text style={styles.playIcon}>▶</Text>
                  <Text style={styles.playDuration}>{formatTime(capture.duration)}</Text>
                </TouchableOpacity>
              )}
            </>
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
              <Text
                style={[styles.tabText, activeTab === tab && styles.tabTextActive]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
              >
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  shareButton: {
    backgroundColor: COLORS.glass,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  shareButtonText: {
    color: COLORS.text,
    fontSize: 12,
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
  truthGradeContainer: {
    marginHorizontal: 20,
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  anomalyList: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  anomalyText: {
    color: '#FF6B6B',
    fontSize: 11,
    marginBottom: 4,
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
    paddingHorizontal: 6,
    borderRadius: 8,
    backgroundColor: COLORS.glass,
    alignItems: 'center',
    justifyContent: 'center',
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
  sovereignHeaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.4)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  sovereignHeaderIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  sovereignHeaderText: {
    color: '#60a5fa',
    fontSize: 12,
    fontWeight: 'bold',
  },
});