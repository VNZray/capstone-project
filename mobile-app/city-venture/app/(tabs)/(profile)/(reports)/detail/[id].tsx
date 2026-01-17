import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  Modal,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { getReportById } from '@/services/ReportService';
import { ThemedText } from '@/components/themed-text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/color';
import Button from '@/components/Button';
import PageContainer from '@/components/PageContainer';

const { width } = Dimensions.get('window');

interface StatusHistory {
  id: string;
  status: string;
  remarks: string;
  updated_at: string;
}
interface Attachment {
  id: string;
  file_url: string;
  file_name: string;
}
interface Report {
  id: string;
  title: string;
  description: string;
  status: string;
  target_type: string;
  created_at: string;
  status_history: StatusHistory[];
  attachments: Attachment[];
}

export default function ReportDetail() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const { id } = useLocalSearchParams<{ id: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (id) {
        setLoading(true);
        try {
          const r = await getReportById(id);
          setReport(r);
        } catch (error) {
          console.error('Failed to load report:', error);
        } finally {
          setLoading(false);
        }
      }
    })();
  }, [id]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'check-circle';
      case 'rejected':
        return 'close-circle';
      case 'in_progress':
        return 'clock-outline';
      default:
        return 'information';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return Colors.light.success;
      case 'rejected':
        return Colors.light.error;
      case 'in_progress':
        return Colors.light.warning;
      default:
        return Colors.light.info;
    }
  };

  const getTargetIcon = (type: string) => {
    switch (type) {
      case 'accommodation':
        return 'bed';
      case 'business':
        return 'store';
      case 'event':
        return 'calendar-star';
      case 'tourist_spot':
        return 'map-marker';
      default:
        return 'flag';
    }
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: isDark ? '#0F1222' : '#F5F7FB' },
        ]}
      >
        <View style={styles.loadingContainer}>
          <MaterialCommunityIcons
            name="file-document"
            size={48}
            color={isDark ? '#64748B' : '#CBD5E1'}
          />
          <ThemedText type="body-medium" style={{ marginTop: 16 }}>
            Loading report...
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (!report) {
    return (
      <PageContainer>
        <View style={styles.loadingContainer}>
          <MaterialCommunityIcons
            name="alert-circle"
            size={48}
            color={Colors.light.error}
          />
          <ThemedText type="body-medium" style={{ marginTop: 16 }}>
            Report not found
          </ThemedText>
          <Button
            label="Go Back"
            variant="outlined"
            size="medium"
            onPress={() => router.back()}
            style={{ marginTop: 24 }}
          />
        </View>
      </PageContainer>
    );
  }
  return (
    <PageContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Card */}
        <View
          style={[
            styles.headerCard,
            {
              backgroundColor: isDark ? '#161A2E' : '#fff',
              borderColor: isDark ? '#28304a' : '#E2E8F0',
            },
          ]}
        >
          <View style={styles.headerTop}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: getStatusColor(report.status) + '20' },
              ]}
            >
              <MaterialCommunityIcons
                name={getTargetIcon(report.target_type) as any}
                size={28}
                color={getStatusColor(report.status)}
              />
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(report.status) },
              ]}
            >
              <MaterialCommunityIcons
                name={getStatusIcon(report.status) as any}
                size={16}
                color="#fff"
              />
              <ThemedText
                type="label-small"
                style={{ color: '#fff', marginLeft: 4 }}
              >
                {report.status.replace('_', ' ')}
              </ThemedText>
            </View>
          </View>

          <ThemedText
            type="title-small"
            weight="bold"
            style={{ marginTop: 16 }}
          >
            {report.title}
          </ThemedText>

          <View style={styles.metaRow}>
            <MaterialCommunityIcons
              name="tag"
              size={14}
              color={isDark ? '#A9B2D0' : '#64748B'}
            />
            <ThemedText
              type="label-small"
              style={{ marginLeft: 4, opacity: 0.7 }}
            >
              {report.target_type.replace('_', ' ')}
            </ThemedText>
            <View style={styles.metaDot} />
            <MaterialCommunityIcons
              name="calendar"
              size={14}
              color={isDark ? '#A9B2D0' : '#64748B'}
            />
            <ThemedText
              type="label-small"
              style={{ marginLeft: 4, opacity: 0.7 }}
            >
              {new Date(report.created_at).toLocaleDateString()}
            </ThemedText>
          </View>
        </View>

        {/* Description */}
        <View
          style={[
            styles.section,
            {
              backgroundColor: isDark ? '#161A2E' : '#fff',
              borderColor: isDark ? '#28304a' : '#E2E8F0',
            },
          ]}
        >
          <ThemedText
            type="body-medium"
            weight="semi-bold"
            style={{ marginBottom: 12 }}
          >
            Description
          </ThemedText>
          <ThemedText
            type="body-small"
            style={{ lineHeight: 22, opacity: 0.9 }}
          >
            {report.description}
          </ThemedText>
        </View>

        {/* Attachments */}
        {report.attachments && report.attachments.length > 0 && (
          <View
            style={[
              styles.section,
              {
                backgroundColor: isDark ? '#161A2E' : '#fff',
                borderColor: isDark ? '#28304a' : '#E2E8F0',
              },
            ]}
          >
            <ThemedText
              type="body-medium"
              weight="semi-bold"
              style={{ marginBottom: 12 }}
            >
              Attachments ({report.attachments.length})
            </ThemedText>
            <View style={styles.attachmentGrid}>
              {report.attachments.map((a) => (
                <Pressable
                  key={a.id}
                  onPress={() => setSelectedImage(a.file_url)}
                  style={styles.attachmentWrapper}
                >
                  <Image
                    source={{ uri: a.file_url }}
                    style={styles.attachmentImage}
                  />
                  <View style={styles.attachmentOverlay}>
                    <MaterialCommunityIcons
                      name="magnify-plus"
                      size={24}
                      color="#fff"
                    />
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Status Timeline */}
        <View
          style={[
            styles.section,
            {
              backgroundColor: isDark ? '#161A2E' : '#fff',
              borderColor: isDark ? '#28304a' : '#E2E8F0',
              marginBottom: 100,
            },
          ]}
        >
          <ThemedText
            type="body-medium"
            weight="semi-bold"
            style={{ marginBottom: 16 }}
          >
            Status Timeline
          </ThemedText>

          {report.status_history && report.status_history.length > 0 ? (
            <View>
              {report.status_history.map((s, i) => {
                const isLast = i === report.status_history.length - 1;
                const statusColor = getStatusColor(s.status);
                return (
                  <View key={s.id} style={styles.timelineItem}>
                    <View style={styles.timelineLeft}>
                      <View
                        style={[
                          styles.timelineDot,
                          { backgroundColor: statusColor },
                        ]}
                      >
                        <MaterialCommunityIcons
                          name={getStatusIcon(s.status) as any}
                          size={14}
                          color="#fff"
                        />
                      </View>
                      {!isLast && <View style={styles.timelineLine} />}
                    </View>

                    <View style={[styles.timelineCard, { flex: 1 }]}>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                        }}
                      >
                        <ThemedText type="body-small" weight="semi-bold">
                          {s.status.replace('_', ' ').charAt(0).toUpperCase() +
                            s.status.replace('_', ' ').slice(1)}
                        </ThemedText>
                        <ThemedText type="label-small" style={{ opacity: 0.7 }}>
                          {new Date(s.updated_at).toLocaleDateString()}
                        </ThemedText>
                      </View>
                      <ThemedText
                        type="label-small"
                        style={{ marginTop: 2, opacity: 0.7 }}
                      >
                        {new Date(s.updated_at).toLocaleTimeString()}
                      </ThemedText>
                      {s.remarks && (
                        <View
                          style={[
                            styles.remarksBox,
                            { backgroundColor: isDark ? '#0F1222' : '#F8FAFC' },
                          ]}
                        >
                          <ThemedText
                            type="body-small"
                            style={{ lineHeight: 20 }}
                          >
                            {s.remarks}
                          </ThemedText>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={{ alignItems: 'center', paddingVertical: 24 }}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={32}
                color={isDark ? '#64748B' : '#CBD5E1'}
              />
              <ThemedText
                type="body-small"
                style={{ marginTop: 8, opacity: 0.7 }}
              >
                No status updates yet
              </ThemedText>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Image Viewer Modal */}
      <Modal
        visible={selectedImage !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}
      >
        <View style={styles.modalContainer}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setSelectedImage(null)}
          />
          <View style={styles.modalContent}>
            <Pressable
              style={styles.closeButton}
              onPress={() => setSelectedImage(null)}
            >
              <MaterialCommunityIcons name="close" size={28} color="#fff" />
            </Pressable>
            {selectedImage && (
              <Image
                source={{ uri: selectedImage }}
                style={styles.fullImage}
                resizeMode="contain"
              />
            )}
          </View>
        </View>
      </Modal>
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  headerCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    flexWrap: 'wrap',
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#94A3B8',
    marginHorizontal: 8,
  },
  section: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  attachmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  attachmentWrapper: {
    position: 'relative',
    width: (width - 64) / 3,
    height: (width - 64) / 3,
    borderRadius: 12,
    overflow: 'hidden',
  },
  attachmentImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E2E8F0',
  },
  attachmentOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 16,
  },
  timelineDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E2E8F0',
    marginTop: 4,
  },
  timelineCard: {
    paddingBottom: 8,
  },
  remarksBox: {
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullImage: {
    width: width,
    height: width,
  },
});
