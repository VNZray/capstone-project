import { supabase } from '@/utils/supabase';
import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const RoomPhotos = ({ business, room }: { room: any; business: any }) => {
  const [uploading, setUploading] = useState(false);
  const [photos, setPhotos] = useState<string[]>(room?.room_photos || []);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (room?.room_photos && Array.isArray(room.room_photos)) {
      setPhotos(room.room_photos);
    }
  }, [room?.room_photos]);
  const sanitizeFileName = (name: string) =>
    name.replace(/[^a-z0-9]/gi, '_').toLowerCase();

  const handleUpload = async () => {
    if (!room || !business) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: false,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      base64: Platform.OS === 'web',
    });

    if (result.canceled) return;

    try {
      setUploading(true);

      const file = result.assets[0];
      let blob: Blob;
      let fileExt = 'png';
      const mimeType = file.mimeType || 'image/png';

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

      const cleanBusinessName = sanitizeFileName(business.business_name);
      const filePath = `Room Photos/${cleanBusinessName}/${
        room.id
      }-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('room-images')
        .upload(filePath, blob, {
          contentType: mimeType,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage
        .from('room-images')
        .getPublicUrl(filePath);

      const publicUrl = publicData?.publicUrl;
      if (!publicUrl) throw new Error('Failed to retrieve public URL.');

      const updatedPhotos = [...photos, publicUrl];

      const { data, error: updateError } = await supabase
        .from('Room')
        .update({ room_photos: updatedPhotos })
        .eq('id', room.id)
        .select();

      if (updateError) throw updateError;

      setPhotos(updatedPhotos);
      Alert.alert('Success', 'Photo uploaded!');
    } catch (error: any) {
      Alert.alert('Upload failed', error.message || 'Unknown error occurred.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Room Photos</Text>

      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.cardTitle}>Gallery</Text>
          <Pressable style={styles.uploadButton} onPress={handleUpload}>
            <FontAwesome name="upload" size={16} color="#fff" />
            <Text style={styles.uploadButtonText}>
              {uploading ? 'Uploading...' : 'Upload Photo'}
            </Text>
          </Pressable>
        </View>

        {selectedImage && (
          <View style={styles.modalOverlay}>
            <Pressable
              style={styles.modalBackdrop}
              onPress={() => setSelectedImage(null)}
            />
            <View style={styles.modalContent}>
              <Image
                source={{ uri: selectedImage }}
                style={styles.fullscreenImage}
                resizeMode="contain"
              />
              <Pressable
                onPress={() => setSelectedImage(null)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </Pressable>
            </View>
          </View>
        )}

        <View style={styles.galleryGrid}>
          {photos.map((url, index) => (
            <Pressable key={index} onPress={() => setSelectedImage(url)}>
              <Image source={{ uri: url }} style={styles.gridPhoto} />
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    backgroundColor: '#F4F6FA',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0A1B47',
    textAlign: 'center',
    marginVertical: 20,
  },
  card: {
    backgroundColor: '#F4F6FA',
    borderRadius: 12,
    padding: 18,
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0A1B47',
  },
  uploadButton: {
    backgroundColor: '#0A1B47',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  photo: {
    width: 300,
    height: 300,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: '#eee',
  },
  placeholder: {
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 10,
  },

  gridPhoto: {
    width: 295,
    aspectRatio: 1,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#eee',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },

  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },

  modalContent: {
    width: '90%',
    height: '80%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  fullscreenImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },

  closeButton: {
    position: 'absolute',
    bottom: 20,
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },

  closeButtonText: {
    color: '#0A1B47',
    fontWeight: '600',
  },
});

export default RoomPhotos;
