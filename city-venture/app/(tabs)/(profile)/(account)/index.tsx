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
import SectionHeader from '@/components/ui/SectionHeader';
import MenuItem from '@/components/ui/MenuItem';
import ChangeName from './components/ChangeName';
import ChangeBirthday from './components/ChangeBirthday';
import ChangeGender from './components/ChangeGender';
import ChangeNationality from './components/ChangeNationality';
import ChangePhoneNumber from './components/ChangePhoneNumber';
import ChangeAddress from './components/ChangeAddraess';

const ProfileInformation = () => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const { user, updateUser } = useAuth();

  const bg = Colors.light.background;
  const cardBg = isDark ? '#1E293B' : '#FFFFFF';
  const textColor = isDark ? '#ECEDEE' : '#0D1B2A';
  const subTextColor = isDark ? '#9BA1A6' : '#6B7280';
  const borderColor = isDark ? '#262B3A' : '#E3E7EF';

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
    setIsNameModalVisible(true);
  };

  const handleEditBirthday = () => {
    setIsBirthdayModalVisible(true);
  };

  const handleEditGender = () => {
    setIsGenderModalVisible(true);
  };

  const handleEditNationality = () => {
    setIsNationalityModalVisible(true);
  };

  const handleEditPhone = () => {
    setIsPhoneModalVisible(true);
  };

  const handleEditAddress = () => {
    setIsAddressModalVisible(true);
  };

  // Handle successful updates
  const handleUpdateSuccess = () => {
    // Data will be automatically updated through AuthContext
    Alert.alert('Success', 'Your information has been updated successfully!');
  };

  // State for photo upload
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);

  // State for modals
  const [isNameModalVisible, setIsNameModalVisible] = useState(false);
  const [isBirthdayModalVisible, setIsBirthdayModalVisible] = useState(false);
  const [isGenderModalVisible, setIsGenderModalVisible] = useState(false);
  const [isNationalityModalVisible, setIsNationalityModalVisible] =
    useState(false);
  const [isPhoneModalVisible, setIsPhoneModalVisible] = useState(false);
  const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);

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
                <Ionicons name="camera" size={24} color="#FFFFFF" />
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
        <Container gap={8} backgroundColor="transparent">
          {/* Basic Information */}
          <SectionHeader title="Personal Details" />

          <Container
            style={[styles.section, { backgroundColor: cardBg }]}
            elevation={1}
            gap={0}
            padding={0}
          >
            <MenuItem
              icon="person-outline"
              iconColor="#6366F1"
              iconBg="#EEF2FF"
              label="Full Name"
              subLabel={getFullName()}
              onPress={handleEditName}
              border={borderColor}
            />

            <MenuItem
              icon="calendar-outline"
              iconColor="#6366F1"
              iconBg="#EEF2FF"
              label="Birthday"
              subLabel={formatBirthdate(user?.birthdate)}
              onPress={handleEditBirthday}
              border={borderColor}
            />
            <MenuItem
              icon="male-female-outline"
              iconColor="#6366F1"
              iconBg="#EEF2FF"
              label="Gender"
              subLabel={formatGender(user?.gender)}
              onPress={handleEditGender}
              border={borderColor}
            />
            <MenuItem
              icon="flag-outline"
              iconColor="#6366F1"
              iconBg="#EEF2FF"
              label="Nationality"
              subLabel={user?.nationality}
              onPress={handleEditNationality}
              border={borderColor}
            />
          </Container>

          {/* Contact Information */}
          <SectionHeader title="Contact Information" />

          <Container
            style={[styles.section, { backgroundColor: cardBg }]}
            elevation={1}
            gap={0}
            padding={0}
          >
            <MenuItem
              icon="call-outline"
              iconColor="#6366F1"
              iconBg="#EEF2FF"
              label="Phone Number"
              subLabel={user?.phone_number}
              onPress={handleEditPhone}
              border={borderColor}
            />
            <MenuItem
              icon="location-outline"
              label="Address"
              iconColor="#6366F1"
              iconBg="#EEF2FF"
              subLabel={user?.address}
              onPress={handleEditAddress}
              border={borderColor}
            />
          </Container>

          {/* Account Info */}
          <SectionHeader title="Account Details" />

          <Container
            style={[styles.section, { backgroundColor: cardBg }]}
            elevation={1}
            gap={0}
            padding={0}
          >
            <MenuItem
              icon="id-card-outline"
              label="Account ID"
              iconColor="#6366F1"
              iconBg="#EEF2FF"
              subLabel={user?.user_id}
              border={borderColor}
              last={false}
            />
            <MenuItem
              icon="time-outline"
              label="Member Since"
              iconColor="#6366F1"
              iconBg="#EEF2FF"
              last={false}
              subLabel={
                user?.created_at
                  ? new Date(user.created_at).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric',
                    })
                  : undefined
              }
              border={borderColor}
            />
          </Container>
        </Container>
      </ScrollView>

      {/* Edit Modals */}
      <ChangeName
        visible={isNameModalVisible}
        onClose={() => setIsNameModalVisible(false)}
        onSuccess={handleUpdateSuccess}
      />
      <ChangeBirthday
        visible={isBirthdayModalVisible}
        onClose={() => setIsBirthdayModalVisible(false)}
        onSuccess={handleUpdateSuccess}
      />
      <ChangeGender
        visible={isGenderModalVisible}
        onClose={() => setIsGenderModalVisible(false)}
        onSuccess={handleUpdateSuccess}
      />
      <ChangeNationality
        visible={isNationalityModalVisible}
        onClose={() => setIsNationalityModalVisible(false)}
        onSuccess={handleUpdateSuccess}
      />
      <ChangePhoneNumber
        visible={isPhoneModalVisible}
        onClose={() => setIsPhoneModalVisible(false)}
        onSuccess={handleUpdateSuccess}
      />
      <ChangeAddress
        visible={isAddressModalVisible}
        onClose={() => setIsAddressModalVisible(false)}
        onSuccess={handleUpdateSuccess}
      />
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
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
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
