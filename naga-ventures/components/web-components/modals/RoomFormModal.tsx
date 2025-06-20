import { Room } from '@/types/Business';
import { supabase } from '@/utils/supabase';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type Props = {
  visible: boolean;
  onClose: () => void;
  form: Omit<Room, 'id' | 'business_id' | 'status'>;
  setForm: React.Dispatch<
    React.SetStateAction<Omit<Room, 'id' | 'business_id' | 'status'>>
  >;
  businessId: string | number | undefined;
  onSuccess: () => void;
};

const extractStoragePath = (url: string) => {
  const match = url.match(/room-images\/(.+?)$/);
  return match ? match[1] : null;
};

const RoomFormModal: React.FC<Props> = ({
  visible,
  onClose,
  form,
  setForm,
  businessId,
  onSuccess,
}) => {
  const handleSubmit = async () => {
    if (!businessId) return;

    const amenitiesArray =
      typeof form.amenities === 'string'
        ? form.amenities.split(',').map((item) => item.trim())
        : form.amenities;

    const { data, error } = await supabase.from('Room').insert([
      {
        ...form,
        amenities: amenitiesArray,
        business_id: businessId,
        status: 'available',
      },
    ]);

    if (error) {
      console.error('Error adding room:', error);
    } else {
      setForm({
        room_number: '',
        room_type: '',
        capacity: '',
        room_price: '',
        amenities: '',
        description: '',
        room_image: '',
        room_photos: [],
      });
      onClose();
      onSuccess();
    }
  };

  const pickAndUploadImage = async () => {
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
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      base64: Platform.OS === 'web',
    });

    if (!result.canceled) {
      const file = result.assets[0];

      if (form.room_image) {
        const path = extractStoragePath(form.room_image);
        if (path) {
          try {
            const { error } = await supabase.storage
              .from('room-images')
              .remove([path]);
            if (error) {
              Alert.alert(
                'Delete Failed',
                `Failed to delete previous image:\n${error.message}`
              );
            } else {
              Alert.alert('Success', 'Previous room image removed.');
            }
          } catch (err: any) {
            Alert.alert(
              'Delete Error',
              err.message || 'Unexpected error occurred.'
            );
          }
        }
      }

      setForm((prev) => ({ ...prev, room_image: '' }));
      await uploadRoomImage(file);
    }
  };

  const uploadRoomImage = async (file: ImagePicker.ImagePickerAsset) => {
    try {
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

      const folder = form.room_number || 'default';
      const fileName = `Room Profile/${folder}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('room-images')
        .upload(fileName, blob, {
          contentType: mimeType,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage
        .from('room-images')
        .getPublicUrl(fileName);

      const publicUrl = publicData?.publicUrl;

      if (publicUrl) {
        setForm((prev) => ({ ...prev, room_image: publicUrl }));
      } else {
        throw new Error('Public URL not found');
      }
    } catch (error: any) {
      Alert.alert(
        'Upload Error',
        error.message || 'Something went wrong during upload.'
      );
    }
  };

  const renderInput = (
    label: string,
    key: keyof typeof form,
    multiline: boolean = false,
    fullWidth: boolean = false,
    keyboardType: 'default' | 'numeric' = 'default'
  ) => (
    <View
      key={key}
      style={[
        styles.inputGroup,
        fullWidth ? styles.fullWidth : styles.halfWidth,
      ]}
    >
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.textarea]}
        value={
          Array.isArray(form[key])
            ? (form[key] as string[]).join(', ')
            : (form[key] as string | undefined) || ''
        }
        onChangeText={(text) => {
          let processedText = text;
          if (keyboardType === 'numeric') {
            // Remove non-numeric characters (except dot for decimals)
            processedText = text.replace(/[^0-9.]/g, '');
          }
          setForm((prev) => ({ ...prev, [key]: processedText }));
        }}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        placeholder={`Enter ${label.toLowerCase()}`}
        placeholderTextColor="#999"
        keyboardType={keyboardType}
      />
    </View>
  );

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.title}>Add New Room</Text>

            <View style={styles.row}>
              {renderInput('Room Number', 'room_number')}

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Room Type</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    style={styles.input}
                    selectedValue={form.room_type}
                    onValueChange={(value) =>
                      setForm((prev) => ({ ...prev, room_type: value }))
                    }
                  >
                    <Picker.Item label="Select Room Type" value="" />
                    <Picker.Item label="Single" value="Single" />
                    <Picker.Item label="Double" value="Double" />
                    <Picker.Item label="Family" value="Family" />
                    <Picker.Item label="Suite" value="Suite" />
                  </Picker>
                </View>
              </View>
            </View>

            <View style={styles.row}>
              {renderInput('Capacity', 'capacity', false, false, 'numeric')}
              {renderInput('Room Price', 'room_price', false, false, 'numeric')}
            </View>

            <View style={styles.row}>
              {renderInput(
                'Amenities (comma separated)',
                'amenities',
                false,
                true
              )}
            </View>

            <View style={styles.row}>
              {renderInput('Description', 'description', true, true)}
            </View>

            <View style={[styles.inputGroup, styles.fullWidth]}>
              <Text style={styles.label}>Room Image</Text>
              <Pressable
                style={styles.uploadButton}
                onPress={pickAndUploadImage}
              >
                <Text style={styles.uploadButtonText}>
                  {form.room_image ? 'Change Image' : 'Upload Image'}
                </Text>
              </Pressable>
              {form.room_image ? (
                <Text style={styles.imageUrlText}>{form.room_image}</Text>
              ) : null}
            </View>

            <View style={styles.buttonGroup}>
              <Pressable style={styles.buttonCancel} onPress={onClose}>
                <Text style={styles.buttonTextAlt}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.buttonSubmit} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Save</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#fff',
    width: Platform.OS === 'web' ? '30%' : '90%',
    borderRadius: 16,
    padding: 24,
    maxHeight: '90%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  scroll: {
    paddingBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
    color: '#0A1B47',
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  inputGroup: {
    marginBottom: 14,
  },
  halfWidth: {
    width: '48%',
  },
  fullWidth: {
    width: '100%',
  },
  label: {
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: '#f9f9f9',
  },
  textarea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    overflow: 'hidden',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    gap: 10,
  },
  buttonCancel: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  buttonSubmit: {
    backgroundColor: '#0A1B47',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  buttonTextAlt: {
    color: '#333',
    fontWeight: '500',
    fontSize: 14,
  },
  uploadButton: {
    backgroundColor: '#0A1B47',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  imageUrlText: {
    fontSize: 12,
    marginTop: 6,
    color: '#555',
    fontStyle: 'italic',
  },
});

export default RoomFormModal;
