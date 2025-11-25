import { ThemedText } from '@/components/themed-text';
import { card, Colors, colors } from '@/constants/color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { CreateReviewPayload, ReviewWithAuthor } from '@/types/Feedback';
import { uploadReviewImage } from '@/utils/uploadReviewImage';
import { useAccommodation } from '@/context/AccommodationContext';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateReviewPayload) => Promise<void>;
  editReview?: ReviewWithAuthor | null;
  touristId: string;
  reviewType: string;
  reviewTypeId: string;
};

const AddReview = ({
  visible = false,
  onClose,
  onSubmit,
  editReview,
  touristId,
  reviewType,
  reviewTypeId,
}: Props) => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const { accommodationDetails } = useAccommodation();

  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');

  useEffect(() => {
    if (editReview) {
      setRating(editReview.rating);
      setMessage(editReview.message);
      setImages(editReview.photos?.map((p) => p.photo_url) || []);
    } else {
      // Reset form
      setRating(5);
      setMessage('');
      setImages([]);
    }
    setUploadProgress('');
  }, [editReview, visible]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need permission to access your photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      const newImages = result.assets.map((asset) => asset.uri);
      setImages((prev) => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!message.trim()) {
      Alert.alert('Error', 'Please write a review message');
      return;
    }

    setLoading(true);
    setUploadProgress('Preparing...');
    
    try {
      let uploadedImageUrls: string[] = [];

      // Upload images to Supabase if there are new local images
      if (images.length > 0) {
        setUploadProgress(`Uploading images (0/${images.length})...`);
        
        const businessName = accommodationDetails?.business_name || 'unknown-business';
        
        uploadedImageUrls = await Promise.all(
          images.map(async (imageUri, index) => {
            // Skip if already a URL (already uploaded)
            if (imageUri.startsWith('http')) {
              return imageUri;
            }
            
            setUploadProgress(`Uploading images (${index + 1}/${images.length})...`);
            
            // Determine mime type from URI
            const mimeType = imageUri.endsWith('.png') 
              ? 'image/png' 
              : imageUri.endsWith('.gif')
              ? 'image/gif'
              : imageUri.endsWith('.webp')
              ? 'image/webp'
              : 'image/jpeg';
            
            const publicUrl = await uploadReviewImage({
              uri: imageUri,
              businessName,
              mimeType,
            });
            
            return publicUrl;
          })
        );
      }

      setUploadProgress('Submitting review...');

      const payload: CreateReviewPayload = {
        review_type: reviewType as any,
        review_type_id: reviewTypeId,
        rating,
        message: message.trim(),
        tourist_id: touristId,
        photos: uploadedImageUrls.length > 0 ? uploadedImageUrls : undefined,
      };

      await onSubmit(payload);
      setUploadProgress('');
      onClose();
    } catch (error) {
      console.error('Submit review error:', error);
      Alert.alert(
        'Error', 
        error instanceof Error ? error.message : 'Failed to submit review'
      );
      setUploadProgress('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.container,
            { backgroundColor: isDark ? card.dark : card.light },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <ThemedText type="header-medium">
              {editReview ? 'Edit Review' : 'Write a Review'}
            </ThemedText>
            <Pressable onPress={onClose}>
              <Ionicons
                name="close"
                size={24}
                color={isDark ? Colors.dark.text : Colors.light.text}
              />
            </Pressable>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Rating */}
            <View style={styles.section}>
              <ThemedText type="label-medium" style={styles.label}>
                Rating
              </ThemedText>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Pressable key={star} onPress={() => setRating(star)}>
                    <Ionicons
                      name={star <= rating ? 'star' : 'star-outline'}
                      size={40}
                      color={colors.warning}
                    />
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Message */}
            <View style={styles.section}>
              <ThemedText type="label-medium" style={styles.label}>
                Your Review
              </ThemedText>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: isDark
                      ? 'rgba(255,255,255,0.05)'
                      : 'rgba(0,0,0,0.05)',
                    color: isDark ? Colors.dark.text : Colors.light.text,
                  },
                ]}
                placeholder="Share your experience..."
                placeholderTextColor={colors.placeholder}
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>

            {/* Images */}
            <View style={styles.section}>
              <ThemedText type="label-medium" style={styles.label}>
                Photos (Optional)
              </ThemedText>
              <Pressable style={styles.imageButton} onPress={pickImage}>
                <Ionicons
                  name="camera-outline"
                  size={24}
                  color={isDark ? Colors.dark.text : Colors.light.text}
                />
                <ThemedText type="body-medium">Add Photos</ThemedText>
              </Pressable>

              {images.length > 0 && (
                <ScrollView
                  horizontal
                  style={styles.imagesContainer}
                  showsHorizontalScrollIndicator={false}
                >
                  {images.map((uri, index) => (
                    <View key={index} style={styles.imageWrapper}>
                      <Image source={{ uri }} style={styles.image} />
                      <Pressable
                        style={styles.removeButton}
                        onPress={() => removeImage(index)}
                      >
                        <Ionicons name="close-circle" size={24} color={colors.error} />
                      </Pressable>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            {uploadProgress ? (
              <View style={styles.progressContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <ThemedText type="body-small" style={styles.progressText}>
                  {uploadProgress}
                </ThemedText>
              </View>
            ) : null}
            
            <View style={styles.buttonRow}>
              <Pressable
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
                disabled={loading}
              >
                <ThemedText type="body-medium">Cancel</ThemedText>
              </Pressable>
              <Pressable
                style={[
                  styles.button,
                  styles.submitButton,
                  { backgroundColor: colors.primary },
                  loading && styles.buttonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading && !uploadProgress ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <ThemedText type="body-medium" style={{ color: 'white' }}>
                    {editReview ? 'Update' : 'Submit'}
                  </ThemedText>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AddReview;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128,128,128,0.2)',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 10,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  textInput: {
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    minHeight: 110,
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.3)',
    borderRadius: 8,
    borderStyle: 'dashed',
  },
  imagesContainer: {
    marginTop: 12,
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 8,
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128,128,128,0.2)',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    justifyContent: 'center',
  },
  progressText: {
    opacity: 0.7,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(128,128,128,0.2)',
  },
  submitButton: {
    minHeight: 48,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
