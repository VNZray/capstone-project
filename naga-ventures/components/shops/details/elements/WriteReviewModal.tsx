import { ShopColors } from '@/constants/ShopColors';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ReviewValidationModal from './ReviewValidationModal';

const { height: screenHeight } = Dimensions.get('window');

interface WriteReviewModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string, images: ImagePicker.ImagePickerAsset[]) => void;
  shopName: string;
  onSubmissionSuccess: () => void;
}

interface ValidationModalState {
  visible: boolean;
  title: string;
  message: string;
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
}

const WriteReviewModal: React.FC<WriteReviewModalProps> = ({
  visible,
  onClose,
  onSubmit,
  shopName,
  onSubmissionSuccess,
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedImages, setSelectedImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const insets = useSafeAreaInsets();
  
  // State for validation modal
  const [validationModal, setValidationModal] = useState<ValidationModalState>({
    visible: false,
    title: '',
    message: '',
    iconName: 'warning',
    iconColor: ShopColors.warning,
  });

  const showValidationModal = (title: string, message: string, iconName: keyof typeof Ionicons.glyphMap, iconColor?: string) => {
    setValidationModal({
      visible: true,
      title,
      message,
      iconName,
      iconColor: iconColor || ShopColors.warning,
    });
  };

  const hideValidationModal = () => {
    setValidationModal(prev => ({ ...prev, visible: false }));
  };

  const handleStarPress = (selectedRating: number) => {
    setRating(selectedRating);
  };

  const pickImage = async () => {
    if (selectedImages.length >= 5) {
      showValidationModal(
        'Maximum Photos Reached',
        'You can select up to 5 photos per review. Please remove some photos before adding new ones.',
        'images',
        ShopColors.warning
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 5 - selectedImages.length,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      setSelectedImages(prevImages => [...prevImages, ...result.assets]);
    }
  };

  const removeImage = (uri: string) => {
    setSelectedImages(prevImages => prevImages.filter(image => image.uri !== uri));
  };

  const handleSubmit = async () => {
    // Validation: Rating Required
    if (rating === 0) {
      showValidationModal(
        'Rating Required',
        'Please tap the stars above to select a rating before submitting your review.',
        'star-outline',
        ShopColors.warning
      );
      return;
    }

    // Validation: Comment Too Short
    if (comment.trim().length < 10) {
      showValidationModal(
        'Comment Too Short',
        'Please write a more detailed comment (at least 10 characters) to help other customers understand your experience.',
        'chatbubble-outline',
        ShopColors.warning
      );
      return;
    }

    setIsSubmitting(true);
    onSubmit(rating, comment, selectedImages);

    // Simulate submission delay for feedback before showing success
    await new Promise(resolve => setTimeout(resolve, 1200)); 

    // Reset form state
    setRating(0);
    setComment('');
    setSelectedImages([]);
    setIsSubmitting(false);
    
    onClose(); // Close this modal
    onSubmissionSuccess(); // Trigger the success modal in parent
  };

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((starValue) => (
      <TouchableOpacity
        key={starValue}
        onPress={() => handleStarPress(starValue)}
        onPressIn={() => setHoverRating(starValue)}
        onPressOut={() => setHoverRating(0)}
        style={styles.starButton}
      >
        <Ionicons
          name={starValue <= (hoverRating || rating) ? 'star' : 'star-outline'}
          size={30}
          color={starValue <= (hoverRating || rating) ? ShopColors.warning : ShopColors.textSecondary}
        />
      </TouchableOpacity>
    ));
  };

  const getCharacterCountColor = () => {
    const length = comment.trim().length;
    if (length === 0) return ShopColors.textSecondary;
    if (length < 10) return ShopColors.warning;
    return ShopColors.success;
  };

  // Calculate dynamic container height to prevent overflow
  const maxContainerHeight = screenHeight - insets.top - insets.bottom - 80;

  return (
    <>
      <Modal
        animationType="slide"
        transparent
        visible={visible}
        onRequestClose={() => {
          if (!isSubmitting) onClose();
        }}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardContainer}
          >
            <View style={[styles.modalContainer, { maxHeight: maxContainerHeight }]}>
              {/* Fixed Header */}
              <View style={styles.modalHeader}>
                <View style={styles.headerContent}>
                  <Text style={styles.modalTitle}>Write Review</Text>
                  {!isSubmitting && (
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                      <Ionicons name="close" size={24} color={ShopColors.textSecondary} />
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={styles.modalShopName}>Reviewing: {shopName}</Text>
              </View>

              {/* Scrollable Content */}
              <ScrollView 
                style={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled={true} // Allow nested scrolling
              >
                <View style={styles.ratingSection}>
                  <Text style={styles.sectionLabel}>How would you rate it?</Text>
                  <View style={styles.starsContainer}>{renderStars()}</View>
                  {rating > 0 && (
                    <Text style={styles.ratingFeedback}>
                      {rating === 5 ? '⭐ Excellent!' :
                       rating === 4 ? '😊 Great!' :
                       rating === 3 ? '👍 Good' :
                       rating === 2 ? '😐 Fair' :
                       '👎 Poor'}
                    </Text>
                  )}
                </View>

                <View style={styles.commentSection}>
                  <Text style={styles.sectionLabel}>Tell us more:</Text>
                  <TextInput
                    style={[
                      styles.commentInput,
                      comment.trim().length > 0 && comment.trim().length < 10 && styles.commentInputWarning
                    ]}
                    placeholder={`What did you like or dislike about ${shopName}?`}
                    multiline
                    value={comment}
                    onChangeText={setComment}
                    textAlignVertical="top"
                    placeholderTextColor={ShopColors.textSecondary}
                  />
                  <View style={styles.commentFooter}>
                    <Text style={[styles.characterCount, { color: getCharacterCountColor() }]}>
                      {comment.trim().length < 10 
                        ? `${comment.trim().length}/10 minimum characters`
                        : `${comment.trim().length} characters`
                      }
                    </Text>
                  </View>
                </View>

                <View style={styles.photoSection}>
                  <Text style={styles.sectionLabel}>Add Photos (Optional):</Text>
                  
                  {/* Use flex wrap instead of horizontal ScrollView to avoid nested scroll warning */}
                  <View style={styles.imagePreviewContainer}>
                    {selectedImages.map((image, index) => (
                      <View key={index} style={styles.imagePreviewItem}>
                        <Image source={{ uri: image.uri }} style={styles.imagePreview} />
                        <TouchableOpacity style={styles.removeImageButton} onPress={() => removeImage(image.uri)}>
                          <Ionicons name="close-circle" size={20} color={ShopColors.error} />
                        </TouchableOpacity>
                      </View>
                    ))}
                    {selectedImages.length < 5 && (
                      <TouchableOpacity style={styles.addPhotoButton} onPress={pickImage}>
                        <Ionicons name="camera-outline" size={24} color={ShopColors.accent} />
                        <Text style={styles.addPhotoButtonText}>Add</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  
                  <Text style={[
                    styles.photoLimitText,
                    selectedImages.length === 5 && { color: ShopColors.warning }
                  ]}>
                    {selectedImages.length}/5 photos added
                    {selectedImages.length === 5 && ' (Maximum reached)'}
                  </Text>
                </View>
              </ScrollView>

              {/* Fixed Footer */}
              <View style={styles.modalFooter}>
                <TouchableOpacity 
                  style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]} 
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <View style={styles.submittingContainer}>
                      <Text style={styles.submitButtonText}>Submitting...</Text>
                    </View>
                  ) : (
                    <Text style={styles.submitButtonText}>Submit Review</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Validation Modal */}
      <ReviewValidationModal
        visible={validationModal.visible}
        onClose={hideValidationModal}
        title={validationModal.title}
        message={validationModal.message}
        iconName={validationModal.iconName}
        iconColor={validationModal.iconColor}
      />
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  keyboardContainer: {
    width: '100%',
    maxWidth: 400,
  },
  modalContainer: {
    backgroundColor: ShopColors.cardBackground,
    borderRadius: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: ShopColors.border,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: ShopColors.textPrimary,
  },
  closeButton: {
    padding: 4,
  },
  modalShopName: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
  },
  scrollContent: {
    maxHeight: screenHeight * 0.5,
    paddingHorizontal: 20,
  },
  sectionLabel: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    color: ShopColors.textPrimary,
    marginBottom: 10,
  },
  ratingSection: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  starButton: {
    padding: 3,
  },
  ratingFeedback: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: ShopColors.success,
    marginTop: 6,
  },
  commentSection: {
    paddingBottom: 16,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: ShopColors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textPrimary,
    height: 80,
    backgroundColor: '#F9FAFB',
  },
  commentInputWarning: {
    borderColor: ShopColors.warning,
    backgroundColor: ShopColors.warning + '05',
  },
  commentFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 6,
  },
  characterCount: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
  },
  photoSection: {
    paddingBottom: 16,
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap', // Allow wrapping to next line
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  addPhotoButton: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: ShopColors.background,
    borderWidth: 1,
    borderColor: ShopColors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoButtonText: {
    fontSize: 10,
    fontFamily: 'Poppins-Medium',
    color: ShopColors.accent,
    marginTop: 3,
  },
  imagePreviewItem: {
    position: 'relative',
  },
  imagePreview: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: ShopColors.cardBackground,
    borderRadius: 10,
    padding: 1,
  },
  photoLimitText: {
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
    textAlign: 'right',
    marginTop: 6,
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: ShopColors.border,
  },
  submitButton: {
    backgroundColor: ShopColors.accent,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: ShopColors.disabled,
  },
  submitButtonText: {
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
  },
  submittingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});

export default WriteReviewModal;