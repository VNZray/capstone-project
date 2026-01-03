import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  TextInput,
  ActivityIndicator,
  Image,
  ScrollView,
  Modal,
  Dimensions,
  Alert,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/color';
import { Ionicons } from '@expo/vector-icons';
import { ReviewWithEntityDetails, ReviewPhoto } from '@/types/Feedback';
import BottomSheetModal from '@/components/ui/BottomSheetModal';
import * as ImagePicker from 'expo-image-picker';
import { deleteReviewPhoto, addReviewPhotos } from '@/services/FeedbackService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface EditReviewModalProps {
  visible: boolean;
  review: ReviewWithEntityDetails | null;
  onClose: () => void;
  onSave: (id: string, rating: number, message: string) => Promise<void>;
  onPhotosUpdated?: () => void;
}

const EditReviewModal: React.FC<EditReviewModalProps> = ({
  visible,
  review,
  onClose,
  onSave,
  onPhotosUpdated,
}) => {
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Photo management state
  const [photos, setPhotos] = useState<ReviewPhoto[]>([]);
  const [newPhotos, setNewPhotos] = useState<string[]>([]);
  const [deletedPhotoIds, setDeletedPhotoIds] = useState<string[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [photoViewerVisible, setPhotoViewerVisible] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  useEffect(() => {
    if (review) {
      setRating(review.rating);
      setMessage(review.message);
      setError('');
      // Load existing photos from review
      setPhotos(review.photos || []);
      setNewPhotos([]);
      setDeletedPhotoIds([]);
    }
  }, [review]);

  const handleSave = async () => {
    if (!review) return;

    if (!message.trim()) {
      setError('Please enter a review message');
      return;
    }

    if (message.trim().length < 10) {
      setError('Review message must be at least 10 characters');
      return;
    }

    setSaving(true);
    setError('');

    try {
      // Delete removed photos
      if (deletedPhotoIds.length > 0) {
        for (const photoId of deletedPhotoIds) {
          await deleteReviewPhoto(photoId);
        }
      }

      // Upload new photos
      if (newPhotos.length > 0) {
        await addReviewPhotos(review.id, newPhotos);
      }

      // Save review changes
      await onSave(review.id, rating, message.trim());

      // Notify parent to refresh photos if any photo changes were made
      if (
        (deletedPhotoIds.length > 0 || newPhotos.length > 0) &&
        onPhotosUpdated
      ) {
        onPhotosUpdated();
      }

      onClose();
    } catch (err) {
      setError('Failed to update review. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Handle deleting an existing photo
  const handleDeletePhoto = (photoId: string) => {
    Alert.alert('Remove Photo', 'Are you sure you want to remove this photo?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          setDeletedPhotoIds((prev) => [...prev, photoId]);
          setPhotos((prev) => prev.filter((p) => p.id !== photoId));
        },
      },
    ]);
  };

  // Handle deleting a new photo (not yet uploaded)
  const handleDeleteNewPhoto = (index: number) => {
    setNewPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle adding new photos
  const handleAddPhotos = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit:
          5 - (photos.length - deletedPhotoIds.length + newPhotos.length),
      });

      if (!result.canceled && result.assets.length > 0) {
        const uris = result.assets.map((asset) => asset.uri);
        setNewPhotos((prev) => [...prev, ...uris]);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to pick images. Please try again.');
    }
  };

  // Open photo viewer
  const handleViewPhoto = (photoUrl: string) => {
    setSelectedPhoto(photoUrl);
    setPhotoViewerVisible(true);
  };

  // Calculate remaining photo slots
  const remainingSlots =
    5 - (photos.length - deletedPhotoIds.length + newPhotos.length);

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Pressable
          key={i}
          onPress={() => setRating(i)}
          style={styles.starButton}
        >
          <Ionicons
            name={i <= rating ? 'star' : 'star-outline'}
            size={32}
            color={i <= rating ? '#F59E0B' : Colors.light.textSecondary}
          />
        </Pressable>
      );
    }
    return stars;
  };

  if (!review) return null;

  const content = (
    <View style={styles.content}>
      {/* Entity Name */}
      <View style={styles.entityInfo}>
        <ThemedText type="body-small" style={styles.label}>
          Reviewing
        </ThemedText>
        <ThemedText type="body-medium" weight="semi-bold">
          {review.entity_name || 'Unknown'}
        </ThemedText>
      </View>

      {/* Rating */}
      <View style={styles.section}>
        <ThemedText type="body-small" style={styles.label}>
          Your Rating
        </ThemedText>
        <View style={styles.starsContainer}>{renderStars()}</View>
        <ThemedText type="body-small" style={styles.ratingLabel}>
          {rating === 1 && 'Poor'}
          {rating === 2 && 'Fair'}
          {rating === 3 && 'Good'}
          {rating === 4 && 'Very Good'}
          {rating === 5 && 'Excellent'}
        </ThemedText>
      </View>

      {/* Message */}
      <View style={styles.section}>
        <ThemedText type="body-small" style={styles.label}>
          Your Review
        </ThemedText>
        <TextInput
          style={styles.textInput}
          value={message}
          onChangeText={setMessage}
          placeholder="Share your experience..."
          placeholderTextColor={Colors.light.textSecondary}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />
        <ThemedText type="body-small" style={styles.charCount}>
          {message.length} characters
        </ThemedText>
      </View>

      {/* Error Message */}
      {error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={16} color={Colors.light.error} />
          <ThemedText type="body-small" style={styles.errorText}>
            {error}
          </ThemedText>
        </View>
      ) : null}

      {/* Photos Section */}
      <View style={styles.section}>
        <ThemedText type="body-small" style={styles.label}>
          Photos ({photos.length + newPhotos.length}/5)
        </ThemedText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.photosContainer}
        >
          {/* Existing photos */}
          {photos.map((photo) => (
            <View key={photo.id} style={styles.photoItem}>
              <Pressable onPress={() => handleViewPhoto(photo.photo_url)}>
                <Image
                  source={{ uri: photo.photo_url }}
                  style={styles.photoThumbnail}
                />
              </Pressable>
              <Pressable
                style={styles.deletePhotoButton}
                onPress={() => handleDeletePhoto(photo.id)}
              >
                <Ionicons
                  name="close-circle"
                  size={24}
                  color={Colors.light.error}
                />
              </Pressable>
            </View>
          ))}

          {/* New photos (not yet uploaded) */}
          {newPhotos.map((uri, index) => (
            <View key={`new-${index}`} style={styles.photoItem}>
              <Pressable onPress={() => handleViewPhoto(uri)}>
                <Image source={{ uri }} style={styles.photoThumbnail} />
              </Pressable>
              <View style={styles.newPhotoBadge}>
                <ThemedText type="body-small" style={styles.newPhotoText}>
                  New
                </ThemedText>
              </View>
              <Pressable
                style={styles.deletePhotoButton}
                onPress={() => handleDeleteNewPhoto(index)}
              >
                <Ionicons
                  name="close-circle"
                  size={24}
                  color={Colors.light.error}
                />
              </Pressable>
            </View>
          ))}

          {/* Add photo button */}
          {remainingSlots > 0 && (
            <Pressable style={styles.addPhotoButton} onPress={handleAddPhotos}>
              <Ionicons
                name="camera-outline"
                size={28}
                color={Colors.light.primary}
              />
              <ThemedText type="body-small" style={styles.addPhotoText}>
                Add
              </ThemedText>
            </Pressable>
          )}
        </ScrollView>
      </View>
    </View>
  );

  const actionButton = (
    <View style={styles.actions}>
      <Pressable
        style={styles.cancelButton}
        onPress={onClose}
        disabled={saving}
      >
        <ThemedText type="body-medium" style={styles.cancelButtonText}>
          Cancel
        </ThemedText>
      </Pressable>
      <Pressable
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <ThemedText type="body-medium" style={styles.saveButtonText}>
            Save Changes
          </ThemedText>
        )}
      </Pressable>
    </View>
  );

  return (
    <>
      <BottomSheetModal
        isOpen={visible}
        onClose={onClose}
        headerTitle="Edit Review"
        content={content}
        bottomActionButton={actionButton}
        snapPoints={['80%']}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
      />

      {/* Full-screen Photo Viewer */}
      <Modal
        visible={photoViewerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPhotoViewerVisible(false)}
      >
        <View style={styles.photoViewerContainer}>
          <Pressable
            style={styles.photoViewerClose}
            onPress={() => setPhotoViewerVisible(false)}
          >
            <Ionicons name="close" size={28} color="#fff" />
          </Pressable>
          {selectedPhoto && (
            <Image
              source={{ uri: selectedPhoto }}
              style={styles.fullScreenPhoto}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  entityInfo: {
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    color: Colors.light.textSecondary,
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  ratingLabel: {
    marginTop: 8,
    color: Colors.light.primary,
    fontWeight: '500',
  },
  textInput: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.light.text,
    minHeight: 120,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  charCount: {
    marginTop: 8,
    color: Colors.light.textSecondary,
    textAlign: 'right',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: Colors.light.error,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.light.background,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: Colors.light.textSecondary,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  // Photo styles
  photosContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 8,
  },
  photoItem: {
    position: 'relative',
  },
  photoThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: Colors.light.background,
  },
  deletePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  newPhotoBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  newPhotoText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  addPhotoButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.background,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  addPhotoText: {
    color: Colors.light.primary,
    fontSize: 12,
  },
  // Photo viewer styles
  photoViewerContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoViewerClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  fullScreenPhoto: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
  },
});

export default EditReviewModal;
