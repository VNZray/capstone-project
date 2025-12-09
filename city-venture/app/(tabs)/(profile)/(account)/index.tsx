import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PageContainer from '@/components/PageContainer';
import Container from '@/components/Container';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/utils/supabase';
import apiClient from '@/services/apiClient';

type InfoRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onEdit?: () => void;
  editable?: boolean;
};

const InfoRow: React.FC<InfoRowProps> = ({
  icon,
  label,
  value,
  onEdit,
  editable = true,
}) => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const textColor = isDark ? '#ECEDEE' : '#0D1B2A';
  const subTextColor = isDark ? '#9BA1A6' : '#6B7280';
  const borderColor = isDark ? '#262B3A' : '#E3E7EF';

  return (
    <Pressable
      onPress={editable ? onEdit : undefined}
      style={[styles.infoRow, { borderBottomColor: borderColor }]}
      disabled={!editable}
    >
      <View style={styles.infoRowLeft}>
        <View
          style={[
            styles.iconWrapper,
            { backgroundColor: isDark ? '#1a1f2e' : '#f3f4f6' },
          ]}
        >
          <Ionicons name={icon} size={18} color={Colors.light.primary} />
        </View>
        <View style={styles.infoTextContainer}>
          <ThemedText type="label-small" style={{ color: subTextColor }}>
            {label}
          </ThemedText>
          <ThemedText
            type="body-medium"
            weight="medium"
            style={{ color: value ? textColor : subTextColor, marginTop: 2 }}
          >
            {value || 'Not set'}
          </ThemedText>
        </View>
      </View>
      {editable && (
        <Ionicons name="chevron-forward" size={20} color={subTextColor} />
      )}
    </Pressable>
  );
};

const ProfileInformation = () => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const { user, updateUser } = useAuth();

  const bg = Colors.light.background;
  const cardBg = isDark ? '#1E293B' : '#FFFFFF';
  const textColor = isDark ? '#ECEDEE' : '#0D1B2A';
  const subTextColor = isDark ? '#9BA1A6' : '#6B7280';

  // Format birthdate
  const formatBirthdate = (date?: string) => {
    if (!date) return undefined;
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Format gender
  const formatGender = (gender?: string) => {
    if (!gender) return undefined;
    return gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
  };

  // Get full name
  const getFullName = () => {
    const parts = [user?.first_name, user?.middle_name, user?.last_name].filter(
      Boolean
    );
    return parts.length > 0 ? parts.join(' ') : undefined;
  };

  // Get initials for avatar
  const getInitials = () => {
    const first = user?.first_name?.[0] || '';
    const last = user?.last_name?.[0] || '';
    return (first + last).toUpperCase() || 'U';
  };

  // Handle edit actions
  const handleEditName = () => {
    Alert.alert('Edit Name', 'Name editing will be available soon.');
  };

  const handleEditBirthday = () => {
    Alert.alert('Edit Birthday', 'Birthday editing will be available soon.');
  };

  const handleEditGender = () => {
    Alert.alert('Edit Gender', 'Gender editing will be available soon.');
  };

  const handleEditNationality = () => {
    Alert.alert(
      'Edit Nationality',
      'Nationality editing will be available soon.'
    );
  };

  const handleEditPhone = () => {
    Alert.alert(
      'Edit Phone Number',
      'Phone number editing will be available soon.'
    );
  };

  const handleEditAddress = () => {
    Alert.alert('Edit Address', 'Address editing will be available soon.');
  };

  // State for photo upload
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);

  useEffect(() => {
    console.log('User profile image URL:', user);
  }, [user]);
  // Generate file name: User/User Full Name - Date
  const generateFileName = () => {
    const fullName =
      [user?.first_name, user?.middle_name, user?.last_name]
        .filter(Boolean)
        .join(' ')
        .replace(/\s+/g, '_') || 'Unknown';
    const date = new Date().toISOString().split('T')[0];
    const timestamp = Date.now();
    return `User/${fullName}_-_${date}_${timestamp}`;
  };

  const handleChangePhoto = async () => {
    // Show action sheet for camera or gallery
    Alert.alert('Change Profile Photo', 'Choose an option', [
      {
        text: 'Take Photo',
        onPress: () => pickImage('camera'),
      },
      {
        text: 'Choose from Library',
        onPress: () => pickImage('library'),
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]);
  };

  const pickImage = async (source: 'camera' | 'library') => {
    try {
      // Request permissions
      if (source === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission Denied',
            'Camera permission is required to take photos.'
          );
          return;
        }
      }

      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            })
          : await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });

      if (!result.canceled && result.assets[0]) {
        await uploadProfilePhoto(result.assets[0]);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const uploadProfilePhoto = async (asset: ImagePicker.ImagePickerAsset) => {
    setIsUploadingPhoto(true);

    try {
      const fileName = generateFileName();
      const fileExt = asset.uri.split('.').pop()?.toLowerCase() || 'jpg';
      const filePath = `${fileName}.${fileExt}`;

      // Convert URI to blob for upload
      const response = await fetch(asset.uri);
      const blob = await response.blob();

      // Convert blob to ArrayBuffer for Supabase
      const arrayBuffer = await new Response(blob).arrayBuffer();

      // Upload to Supabase bucket "user"
      const { data, error: uploadError } = await supabase.storage
        .from('user')
        .upload(filePath, arrayBuffer, {
          contentType: `image/${fileExt}`,
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('user')
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        throw new Error('Failed to get public URL');
      }

      // Update user profile in backend
      await apiClient.put(`/users/${user?.user_id}`, {
        user_profile: urlData.publicUrl,
      });

      // Update local state
      setProfileImageUri(urlData.publicUrl);

      // Update AuthContext and secure storage
      await updateUser({ user_profile: urlData.publicUrl });

      Alert.alert('Success', 'Profile photo updated successfully!');
    } catch (error: any) {
      console.error('Upload error:', error);
      Alert.alert(
        'Upload Failed',
        error?.message || 'Failed to upload photo. Please try again.'
      );
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  return (
    <PageContainer style={{ backgroundColor: bg }} padding={0}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Photo Section */}
        <View style={styles.photoSection}>
          <Pressable
            onPress={handleChangePhoto}
            style={styles.avatarContainer}
            disabled={isUploadingPhoto}
          >
            {user?.user_profile ? (
              <Image
                source={{ uri: user.user_profile }}
                style={styles.avatar}
              />
            ) : (
              <View
                style={[
                  styles.avatarPlaceholder,
                  { backgroundColor: Colors.light.primary },
                ]}
              >
                <ThemedText
                  type="header-large"
                  weight="bold"
                  style={{ color: '#FFFFFF' }}
                >
                  {getInitials()}
                </ThemedText>
              </View>
            )}
            {isUploadingPhoto ? (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator size="small" color="#FFFFFF" />
              </View>
            ) : (
              <View style={styles.cameraButton}>
                <Ionicons name="camera" size={16} color="#FFFFFF" />
              </View>
            )}
          </Pressable>
          <ThemedText
            type="body-medium"
            style={{ color: Colors.light.primary, marginTop: 12 }}
          >
            {isUploadingPhoto ? 'Uploading...' : 'Change Photo'}
          </ThemedText>
        </View>

        {/* Basic Information */}
        <Container
          style={[styles.section, { backgroundColor: cardBg }]}
          elevation={1}
          gap={0}
          padding={0}
        >
          <View style={styles.sectionHeader}>
            <ThemedText
              type="card-title-medium"
              weight="semi-bold"
              style={{ color: textColor }}
            >
              Basic Information
            </ThemedText>
          </View>
          <InfoRow
            icon="person-outline"
            label="Full Name"
            value={user?.user_profile}
            onEdit={handleEditName}
          />

          <InfoRow
            icon="person-outline"
            label="Full Name"
            value={getFullName()}
            onEdit={handleEditName}
          />
          <InfoRow
            icon="calendar-outline"
            label="Birthday"
            value={formatBirthdate(user?.birthdate)}
            onEdit={handleEditBirthday}
          />
          <InfoRow
            icon="male-female-outline"
            label="Gender"
            value={formatGender(user?.gender)}
            onEdit={handleEditGender}
          />
          <InfoRow
            icon="flag-outline"
            label="Nationality"
            value={user?.nationality}
            onEdit={handleEditNationality}
          />
        </Container>

        {/* Contact Information */}
        <Container
          style={[styles.section, { backgroundColor: cardBg }]}
          elevation={1}
          gap={0}
          padding={0}
        >
          <View style={styles.sectionHeader}>
            <ThemedText
              type="card-title-medium"
              weight="semi-bold"
              style={{ color: textColor }}
            >
              Contact Information
            </ThemedText>
          </View>

          <InfoRow
            icon="call-outline"
            label="Phone Number"
            value={user?.phone_number}
            onEdit={handleEditPhone}
          />
          <InfoRow
            icon="location-outline"
            label="Address"
            value={
              user?.address ||
              [
                user?.barangay_name,
                user?.municipality_name,
                user?.province_name,
              ]
                .filter(Boolean)
                .join(', ') ||
              undefined
            }
            onEdit={handleEditAddress}
          />
        </Container>

        {/* Account Info */}
        <Container
          style={[styles.section, { backgroundColor: cardBg }]}
          elevation={1}
          gap={0}
          padding={0}
        >
          <View style={styles.sectionHeader}>
            <ThemedText
              type="card-title-medium"
              weight="semi-bold"
              style={{ color: textColor }}
            >
              Account Details
            </ThemedText>
          </View>

          <InfoRow
            icon="id-card-outline"
            label="Account ID"
            value={user?.id || user?.user_id}
            editable={false}
          />
          <InfoRow
            icon="time-outline"
            label="Member Since"
            value={
              user?.created_at
                ? new Date(user.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })
                : undefined
            }
            editable={false}
          />
        </Container>
      </ScrollView>
    </PageContainer>
  );
};

export default ProfileInformation;

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 220,
  },
  photoSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  infoRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
});
