import PressableButton from '@/components/PressableButton';
import { Business } from '@/types/Business';
import {
  AccommodationTypes,
  businessCategories,
  ShopTypes,
} from '@/types/Category';
import { supabase } from '@/utils/supabase';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type StepBasicsProps = {
  data: Business;
  setData: React.Dispatch<React.SetStateAction<Business>>;
  onNext: () => void;
  onPrev: () => void;
};

const extractStoragePath = (publicUrl: string) => {
  try {
    const url = new URL(publicUrl);
    const path = decodeURIComponent(
      url.pathname.split('/storage/v1/object/public/business-profiles/')[1]
    );
    return path;
  } catch {
    return null;
  }
};

const StepBasics: React.FC<StepBasicsProps> = ({
  data,
  setData,
  onNext,
  onPrev,
}) => {
  const [uploading, setUploading] = useState(false);

  const cancel = () => {
    router.replace('/BusinessApp/(admin)/manage-business');
  };

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        'Permission required',
        'Permission to access media is required!'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      base64: Platform.OS === 'web',
    });

    if (!result.canceled) {
      const file = result.assets[0];

      // elete old image before uploading new one
      if (data.image_url) {
        const path = extractStoragePath(data.image_url);
        if (path) {
          try {
            const { error } = await supabase.storage
              .from('business-profiles')
              .remove([path]);

            if (error) {
              Alert.alert(
                'Delete Failed',
                `Failed to delete previous image:\n${error.message}`
              );
              console.warn('Error deleting old image:', error);
            } else {
              Alert.alert(
                'Success',
                'Previous business profile image removed.'
              );
            }
          } catch (err: any) {
            console.warn('Unexpected error during image deletion:', err);
            Alert.alert(
              'Delete Error',
              err.message ||
                'Unexpected error occurred while deleting the image.'
            );
          }
        }
      }

      // Clear image preview
      setData((prev) => ({ ...prev, image_url: '' }));

      await uploadImage(file);
    }
  };
  const uploadImage = async (file: ImagePicker.ImagePickerAsset) => {
    try {
      setUploading(true);

      let blob: Blob;
      let fileExt = 'png';
      let mimeType = file.mimeType || 'image/png';

      if (Platform.OS === 'web') {
        if (!file.base64) throw new Error('Base64 image data not available.');

        const byteCharacters = atob(file.base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        blob = new Blob([byteArray], { type: mimeType });

        fileExt = mimeType.split('/')[1];
      } else {
        const response = await fetch(file.uri);
        blob = await response.blob();
        fileExt = file.uri.split('.').pop() || 'png';
      }

      const folder = data.business_name || 'default';
      const fileName = `${folder}/business-profile${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('business-profiles')
        .upload(fileName, blob, {
          contentType: mimeType,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage
        .from('business-profiles')
        .getPublicUrl(fileName);

      const publicUrl = publicData?.publicUrl;

      if (publicUrl) {
        setData((prev) => ({ ...prev, image_url: publicUrl }));
      } else {
        throw new Error('Public URL not found');
      }
    } catch (error: any) {
      console.error('Upload failed:', error);
      Alert.alert(
        'Upload Error',
        error.message || 'Something went wrong during upload.'
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Basic Information</Text>

      <Text style={styles.label}>Business Name</Text>
      <TextInput
        style={styles.input}
        value={data.business_name}
        onChangeText={(text) =>
          setData((prev) => ({ ...prev, business_name: text }))
        }
        placeholder="Enter business name"
      />

      <Text style={styles.label}>Business Category</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={data.category}
          onValueChange={(itemValue) =>
            setData((prev) => ({
              ...prev,
              category: itemValue,
              business_type: '',
            }))
          }
          style={styles.picker}
        >
          <Picker.Item label="Select Category" value="" />
          {businessCategories.map((category) => (
            <Picker.Item key={category} label={category} value={category} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Business Type</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={data.business_type}
          onValueChange={(itemValue) =>
            setData((prev) => ({ ...prev, business_type: itemValue }))
          }
          style={styles.picker}
          enabled={!!data.category}
        >
          <Picker.Item label="Select Type" value="" />
          {(data.category === 'Accommodation'
            ? AccommodationTypes
            : data.category === 'Shop'
            ? ShopTypes
            : []
          ).map((type) => (
            <Picker.Item key={type} label={type} value={type} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Business Profile Image</Text>
      <PressableButton
        Title={uploading ? 'Uploading...' : 'Upload Image'}
        type="secondary"
        color="#fff"
        onPress={pickImage}
        width={200}
        disabled={uploading}
      />
      {data.image_url ? (
        <Image
          source={{ uri: data.image_url }}
          style={{
            width: '100%',
            height: '100%',
            marginTop: 10,
            borderRadius: 8,
          }}
          resizeMode="cover"
        />
      ) : null}

      <View style={styles.buttonContainer}>
        <PressableButton
          type="cancel"
          color="#fff"
          Title="Cancel"
          onPress={cancel}
          width={200}
        />
        <PressableButton
          type="primary"
          color="#fff"
          Title="Next"
          onPress={onNext}
          width={200}
        />
      </View>
    </ScrollView>
  );
};

export default StepBasics;

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  label: {
    marginTop: 12,
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 24,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
});
