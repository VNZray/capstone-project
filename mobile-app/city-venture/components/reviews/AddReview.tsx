import { ThemedText } from '@/components/themed-text';
import { Colors, colors } from '@/constants/color';
import { useAccommodation } from '@/context/AccommodationContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { CreateReviewPayload, ReviewWithAuthor } from '@/types/Feedback';
import { uploadReviewImage } from '@/utils/uploadReviewImage';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import Button from '../Button';
import BottomSheetModal from '../ui/BottomSheetModal';
import Container from '../Container';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateReviewPayload) => Promise<void>;
  editReview?: ReviewWithAuthor | null;
  touristId: string;
  reviewType: string;
  reviewTypeId: string;
  title?: string;
};

const AddReview = ({
  visible = false,
  onClose,
  onSubmit,
  editReview,
  touristId,
  reviewType,
  reviewTypeId,
  title,
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
      Alert.alert(
        'Permission Denied',
        'We need permission to access your photos'
      );
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

        const businessName =
          accommodationDetails?.business_name || 'unknown-business';

        uploadedImageUrls = await Promise.all(
          images.map(async (imageUri, index) => {
            // Skip if already a URL (already uploaded)
            if (imageUri.startsWith('http')) {
              return imageUri;
            }

            setUploadProgress(
              `Uploading images (${index + 1}/${images.length})...`
            );

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
    <BottomSheetModal
      isOpen={visible}
      onClose={onClose}
      headerTitle={
        title || (editReview ? 'Edit Your Review' : 'How was your stay?')
      }
      snapPoints={['60%']}
      index={0}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      closeButton={false}
      content={
        <Container backgroundColor="transparent">
          {/* Star Rating */}
          <View style={styles.ratingSection}>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Pressable
                  key={star}
                  onPress={() => setRating(star)}
                  style={styles.starButton}
                >
                  <Ionicons
                    name={star <= rating ? 'star' : 'star-outline'}
                    size={44}
                    color={
                      star <= rating ? colors.secondary : colors.placeholder
                    }
                  />
                </Pressable>
              ))}
            </View>
          </View>

          {/* Message Input */}
          <View style={styles.section}>
            <ThemedText type="label-medium" style={styles.label}>
              Your Review
            </ThemedText>
            <BottomSheetTextInput
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
              numberOfLines={4}
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
              <View style={styles.imagesRow}>
                {images.map((uri, index) => (
                  <View key={index} style={styles.imageWrapper}>
                    <Image source={{ uri }} style={styles.image} />
                    <Pressable
                      style={styles.removeButton}
                      onPress={() => removeImage(index)}
                    >
                      <Ionicons
                        name="close-circle"
                        size={22}
                        color={colors.error}
                      />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
          </View>
        </Container>
      }
      bottomActionButton={
        <>
          {uploadProgress ? (
            <View style={styles.progressContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <ThemedText type="body-small" style={styles.progressText}>
                {uploadProgress}
              </ThemedText>
            </View>
          ) : null}

          <Button width={'100%'} onPress={handleSubmit} disabled={loading}>
            {loading && !uploadProgress ? (
              <ActivityIndicator color="white" />
            ) : editReview ? (
              'Update Review'
            ) : (
              'Submit Review'
            )}
          </Button>
        </>
      }
    />
  );
};

export default AddReview;

const styles = StyleSheet.create({
  ratingSection: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 10,
  },
  textInput: {
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    minHeight: 100,
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.3)',
    borderRadius: 12,
    borderStyle: 'dashed',
  },
  imagesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  removeButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: 'white',
    borderRadius: 11,
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
});
