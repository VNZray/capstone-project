import { ShopColors } from '@/constants/color';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';

interface WriteReviewModalProps {
  visible: boolean;
  rating: number;
  reviewText: string;
  reviewerName: string;
  selectedImages: string[];
  onClose: () => void;
  onSubmit: () => void;
  onRatingChange: (value: number) => void;
  onReviewTextChange: (value: string) => void;
  onReviewerNameChange: (value: string) => void;
  onAddPhoto: () => void;
  onRemovePhoto: (uri: string) => void;
}

const WriteReviewModal: React.FC<WriteReviewModalProps> = ({
  visible,
  rating,
  reviewText,
  reviewerName,
  selectedImages,
  onClose,
  onSubmit,
  onRatingChange,
  onReviewTextChange,
  onReviewerNameChange,
  onAddPhoto,
  onRemovePhoto,
}) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <View style={styles.backdrop}>
      <View style={styles.sheet}>
        <View style={styles.header}>
          <Text style={styles.title}>Write a Review</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={ShopColors.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.label}>Overall Rating</Text>
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((value) => (
              <TouchableOpacity key={value} onPress={() => onRatingChange(value)}>
                <Ionicons
                  name={value <= rating ? 'star' : 'star-outline'}
                  size={32}
                  color={ShopColors.warning}
                />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Your Review</Text>
          <TextInput
            value={reviewText}
            onChangeText={onReviewTextChange}
            style={styles.textArea}
            multiline
            numberOfLines={4}
            placeholder="Share details about your visit..."
            placeholderTextColor={ShopColors.textSecondary}
          />

          <Text style={styles.label}>Display Name</Text>
          <TextInput
            value={reviewerName}
            onChangeText={onReviewerNameChange}
            style={styles.input}
            placeholder="How should we address you?"
            placeholderTextColor={ShopColors.textSecondary}
          />

          <Text style={styles.label}>Photos (optional)</Text>
          <View style={styles.photoRow}>
            {selectedImages.map((uri) => (
              <View key={uri} style={styles.photoWrapper}>
                <Image source={{ uri }} style={styles.photo} />
                <TouchableOpacity
                  style={styles.removePhoto}
                  onPress={() => onRemovePhoto(uri)}
                >
                  <Ionicons name="close" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ))}
            {selectedImages.length < 3 && (
              <TouchableOpacity style={styles.addPhoto} onPress={onAddPhoto}>
                <Ionicons name="camera" size={24} color={ShopColors.textSecondary} />
                <Text style={styles.addPhotoText}>Add Photo</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>

        <TouchableOpacity style={styles.submitButton} onPress={onSubmit}>
          <Text style={styles.submitText}>Submit Review</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: ShopColors.textPrimary,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: ShopColors.textPrimary,
    marginBottom: 8,
    marginTop: 16,
  },
  ratingRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  textArea: {
    borderWidth: 1,
    borderColor: ShopColors.border,
    borderRadius: 16,
    padding: 16,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textPrimary,
    minHeight: 120,
  },
  input: {
    borderWidth: 1,
    borderColor: ShopColors.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textPrimary,
  },
  photoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    marginBottom: 8,
  },
  photoWrapper: {
    position: 'relative',
    margin: 4,
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  removePhoto: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
    padding: 4,
  },
  addPhoto: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ShopColors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
  },
  addPhotoText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: ShopColors.textSecondary,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: ShopColors.accent,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
});

export default WriteReviewModal;
