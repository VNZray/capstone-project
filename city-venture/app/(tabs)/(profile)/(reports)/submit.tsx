import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  Alert,
  ActivityIndicator,
  Animated,
  TextInput as RNTextInput,
} from 'react-native';
import Button from '@/components/Button';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import {
  uploadReportFileAndGetPublicUrl,
  createReportWithAttachments,
} from '@/services/ReportService';
import { router } from 'expo-router';
import Dropdown, { DropdownItem } from '@/components/Dropdown';
import { fetchAllTouristSpots } from '@/services/TouristSpotService';
import { fetchAllBusinessDetails } from '@/services/AccommodationService';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/color';
import FormTextInput from '@/components/TextInput';
import PageContainer from '@/components/PageContainer';

const targetTypes = [
  { id: 'accommodation', label: 'Accommodation', icon: 'bed' },
  { id: 'business', label: 'Shop', icon: 'store' },
  { id: 'event', label: 'Event', icon: 'calendar-star' },
  { id: 'tourist_spot', label: 'Tourist Spot', icon: 'map-marker' },
];

export default function SubmitReport() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const bg = isDark ? '#0F1222' : '#F5F7FB';
  const { user } = useAuth();
  const [targetType, setTargetType] = useState('accommodation');
  const [targetId, setTargetId] = useState('');
  const [targetOptions, setTargetOptions] = useState<DropdownItem[]>([]);
  const [loadingTargets, setLoadingTargets] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<
    { uri: string; name: string; type: string; size?: number }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    targetId?: string;
  }>({});

  const pickImages = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        allowsMultipleSelection: true,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: false,
      });
      if (!res.canceled) {
        const assets = res.assets.map((a: any) => ({
          uri: a.uri,
          name: a.fileName || `report-${Date.now()}.jpg`,
          type: a.mimeType || 'image/jpeg',
          size: a.fileSize,
        }));
        setFiles((prev) => [...prev, ...assets]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick images');
    }
  };

  const removeImage = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!targetId) newErrors.targetId = 'Please select a target';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Load selectable targets when target type changes
  useEffect(() => {
    (async () => {
      setTargetOptions([]);
      setTargetId('');
      setErrors({});
      if (!targetType) return;
      setLoadingTargets(true);
      try {
        if (targetType === 'tourist_spot') {
          const spots = await fetchAllTouristSpots();
          setTargetOptions(
            spots.map((s) => ({
              id: String(s.id),
              label: String(s.name || s.id),
            }))
          );
        } else if (
          targetType === 'business' ||
          targetType === 'accommodation'
        ) {
          const businesses = await fetchAllBusinessDetails();
          const filtered =
            targetType === 'accommodation'
              ? businesses.filter((b) => b.business_category_id === 1) // Assuming 1 is accommodation
              : businesses.filter((b) => b.business_category_id !== 1);
          setTargetOptions(
            filtered.map((b) => ({
              id: String(b.id),
              label: String(b.business_name || b.id),
            }))
          );
        } else if (targetType === 'event') {
          // For events, manual entry for now
          setTargetOptions([]);
        }
      } catch (e) {
        console.warn('Failed to load target options', e);
      } finally {
        setLoadingTargets(false);
      }
    })();
  }, [targetType]);

  const onSubmit = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to submit a report');
      return;
    }

    if (!validateForm()) {
      Alert.alert(
        'Validation Error',
        'Please fill all required fields correctly.'
      );
      return;
    }

    try {
      setLoading(true);
      setUploadProgress(0);

      const uploaded = [] as {
        file_url: string;
        file_name: string;
        file_type: string;
        file_size?: number;
      }[];
      const reporter = (user.user_id as string) || (user.id as string);

      // Upload files with progress
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const up = await uploadReportFileAndGetPublicUrl(
          f.uri,
          f.name,
          f.type,
          reporter
        );
        uploaded.push({
          file_url: up.publicUrl,
          file_name: f.name,
          file_type: f.type,
          file_size: f.size,
        });
        setUploadProgress(((i + 1) / (files.length + 1)) * 100);
      }

      // Create report
      await createReportWithAttachments({
        reporter_id: reporter,
        target_type: targetType,
        target_id: targetId,
        title: title.trim(),
        description: description.trim(),
        attachments: uploaded,
      });

      setUploadProgress(100);

      Alert.alert(
        'Success',
        'Your report has been submitted successfully. We will review it shortly.',
        [
          {
            text: 'View My Reports',
            onPress: () =>
              router.replace('/(tabs)/(profile)/(reports)/my-reports' as any),
          },
          {
            text: 'OK',
            style: 'cancel',
          },
        ]
      );
    } catch (e: any) {
      Alert.alert(
        'Error',
        e.message || 'Failed to submit report. Please try again.'
      );
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <PageContainer padding={0} style={{ paddingBottom: 100 }}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <MaterialCommunityIcons
            name="flag-outline"
            size={32}
            color={Colors.light.primary}
          />
          <ThemedText
            type="title-medium"
            weight="bold"
            style={{ marginTop: 8 }}
          >
            Submit a Report
          </ThemedText>
          <ThemedText
            type="body-small"
            style={{ marginTop: 4, opacity: 0.7, textAlign: 'center' }}
          >
            Help us maintain quality by reporting issues
          </ThemedText>
        </View>

        {/* Target Type Selection */}
        <View style={styles.section}>
          <ThemedText
            type="body-medium"
            weight="semi-bold"
            style={{ marginBottom: 12 }}
          >
            What would you like to report?
          </ThemedText>
          <View style={styles.typeGrid}>
            {targetTypes.map((tt) => {
              const active = tt.id === targetType;
              return (
                <Pressable
                  key={tt.id}
                  onPress={() => setTargetType(tt.id)}
                  style={[
                    styles.typeCard,
                    {
                      backgroundColor: isDark ? '#161A2E' : '#fff',
                      borderColor: active
                        ? Colors.light.primary
                        : isDark
                        ? '#28304a'
                        : '#E2E8F0',
                    },
                    active && styles.typeCardActive,
                  ]}
                >
                  <MaterialCommunityIcons
                    name={tt.icon as any}
                    size={28}
                    color={
                      active
                        ? Colors.light.primary
                        : isDark
                        ? '#A9B2D0'
                        : '#64748B'
                    }
                  />
                  <ThemedText
                    type="label-small"
                    weight={active ? 'semi-bold' : 'normal'}
                    style={{ marginTop: 8, textAlign: 'center' }}
                  >
                    {tt.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Target Selection */}
        <View style={styles.section}>
          <ThemedText
            type="body-medium"
            weight="semi-bold"
            style={{ marginBottom: 12 }}
          >
            Select Specific{' '}
            {targetTypes.find((t) => t.id === targetType)?.label}
          </ThemedText>
          {targetOptions.length > 0 ? (
            <View>
              <Dropdown
                label=""
                placeholder={
                  loadingTargets
                    ? 'Loading...'
                    : `Choose ${targetTypes
                        .find((t) => t.id === targetType)
                        ?.label.toLowerCase()}`
                }
                items={targetOptions}
                value={targetId}
                onSelect={(item) => {
                  setTargetId(String(item.id));
                  setErrors((prev) => ({ ...prev, targetId: undefined }));
                }}
              />
              {errors.targetId && (
                <ThemedText
                  type="label-small"
                  style={{ color: Colors.light.error, marginTop: 4 }}
                >
                  {errors.targetId}
                </ThemedText>
              )}
            </View>
          ) : loadingTargets ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color={Colors.light.primary} />
              <ThemedText type="body-small" style={{ marginLeft: 8 }}>
                Loading options...
              </ThemedText>
            </View>
          ) : (
            <View>
              <FormTextInput
                placeholder="Enter Target ID"
                value={targetId}
                onChangeText={(text) => {
                  setTargetId(text);
                  setErrors((prev) => ({ ...prev, targetId: undefined }));
                }}
              />
              {errors.targetId && (
                <ThemedText
                  type="label-small"
                  style={{ color: Colors.light.error, marginTop: 4 }}
                >
                  {errors.targetId}
                </ThemedText>
              )}
            </View>
          )}
        </View>

        {/* Report Details */}
        <View style={styles.section}>
          <ThemedText
            type="body-medium"
            weight="semi-bold"
            style={{ marginBottom: 12 }}
          >
            Report Details
          </ThemedText>

          <FormTextInput
            label="Title"
            placeholder="Brief summary of the issue"
            value={title}
            onChangeText={(text) => {
              setTitle(text);
              setErrors((prev) => ({ ...prev, title: undefined }));
            }}
            required
          />
          {errors.title && (
            <ThemedText
              type="label-small"
              style={{ color: Colors.light.error, marginTop: 4 }}
            >
              {errors.title}
            </ThemedText>
          )}

          <View style={{ marginTop: 16 }}>
            <FormTextInput
              label="Description"
              placeholder="Provide detailed information about the issue"
              value={description}
              onChangeText={(text) => {
                setDescription(text);
                setErrors((prev) => ({ ...prev, description: undefined }));
              }}
              multiline
              numberOfLines={4}
              required
            />
          </View>
        </View>

        {/* Attachments */}
        <View style={styles.section}>
          <ThemedText
            type="body-medium"
            weight="semi-bold"
            style={{ marginBottom: 12 }}
          >
            Attachments (Optional)
          </ThemedText>
          <ThemedText
            type="label-small"
            style={{ marginBottom: 12, opacity: 0.7 }}
          >
            Add photos to help us understand the issue better
          </ThemedText>

          <View style={styles.imageGrid}>
            {files.map((f, i) => (
              <View key={i} style={styles.imageWrapper}>
                <Image source={{ uri: f.uri }} style={styles.imagePreview} />
                <Pressable
                  onPress={() => removeImage(i)}
                  style={styles.removeButton}
                >
                  <MaterialCommunityIcons
                    name="close-circle"
                    size={24}
                    color="#fff"
                  />
                </Pressable>
              </View>
            ))}

            {files.length < 5 && (
              <Pressable
                onPress={pickImages}
                style={[
                  styles.addImageBox,
                  {
                    backgroundColor: isDark ? '#161A2E' : '#F8FAFC',
                    borderColor: isDark ? '#28304a' : '#CBD5E1',
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="camera-plus"
                  size={32}
                  color={isDark ? '#A9B2D0' : '#94A3B8'}
                />
                <ThemedText
                  type="label-small"
                  style={{ marginTop: 8, opacity: 0.7 }}
                >
                  Add Photo
                </ThemedText>
              </Pressable>
            )}
          </View>

          {files.length >= 5 && (
            <ThemedText
              type="label-small"
              style={{ marginTop: 8, opacity: 0.7 }}
            >
              Maximum 5 images allowed
            </ThemedText>
          )}
        </View>

        {/* Progress Indicator */}
        {loading && uploadProgress > 0 && (
          <View style={styles.progressSection}>
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${uploadProgress}%` }]}
              />
            </View>
            <ThemedText
              type="label-small"
              style={{ marginTop: 8, textAlign: 'center' }}
            >
              Uploading... {Math.round(uploadProgress)}%
            </ThemedText>
          </View>
        )}

        {/* Submit Button */}
        <View style={{ marginTop: 24 }}>
          <Button
            label={loading ? 'Submitting Report...' : 'Submit Report'}
            onPress={onSubmit}
            fullWidth
            size="large"
            variant="solid"
            disabled={loading}
          />
        </View>

        {/* Help Text */}
        <View style={styles.helpBox}>
          <MaterialCommunityIcons
            name="information"
            size={20}
            color={Colors.light.info}
          />
          <ThemedText
            type="label-small"
            style={{ marginLeft: 8, flex: 1, opacity: 0.8 }}
          >
            Your report will be reviewed by our team. We typically respond
            within 24-48 hours.
          </ThemedText>
        </View>
      </ScrollView>
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeCard: {
    flex: 1,
    minWidth: '45%',
    maxWidth: '48%',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 110,
  },
  typeCardActive: {
    borderWidth: 2,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  imageWrapper: {
    position: 'relative',
    width: 100,
    height: 100,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Colors.light.error,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  addImageBox: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressSection: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.light.primary,
    borderRadius: 4,
  },
  helpBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: Colors.light.infoLight,
    borderWidth: 1,
    borderColor: Colors.light.info,
  },
});
