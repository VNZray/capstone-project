import {
  ReviewSubmittedModal,
  ReviewValidationModal,
  ShopDetailRatingBreakdown,
  ShopDetailReviewCard,
  WriteReviewModal,
} from '@/components/shops/details/elements';
import type { BusinessProfileView } from '@/components/shops/details/types';
import { ShopColors } from '@/constants/ShopColors';
import * as ImagePicker from 'expo-image-picker';
import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ShopDetailReviewsSectionProps {
  shop: BusinessProfileView;
  onHelpfulPress?: (reviewId: string) => void;
  onImagePress?: (imageUrl: string) => void;
}

const ShopDetailReviewsSection: React.FC<ShopDetailReviewsSectionProps> = ({
  shop,
  onHelpfulPress,
  onImagePress,
}) => {
  const [writeReviewVisible, setWriteReviewVisible] = useState(false);
  const [reviewSubmittedVisible, setReviewSubmittedVisible] = useState(false);
  const [validationVisible, setValidationVisible] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const validateReview = useCallback(() => {
    if (!rating) {
      setValidationMessage('Please select a rating.');
      setValidationVisible(true);
      return false;
    }
    if (!reviewText.trim()) {
      setValidationMessage('Please share your review details.');
      setValidationVisible(true);
      return false;
    }
    if (!reviewerName.trim()) {
      setValidationMessage('Please provide your display name.');
      setValidationVisible(true);
      return false;
    }
    return true;
  }, [rating, reviewText, reviewerName]);

  const handleSubmitReview = () => {
    if (!validateReview()) return;

    setWriteReviewVisible(false);
    setReviewSubmittedVisible(true);
    setRating(5);
    setReviewText('');
    setReviewerName('');
    setSelectedImages([]);
  };

  const handleAddPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 0.8,
    });

    if (!result.canceled) {
      const uri = result.assets[0]?.uri;
      if (uri) {
        setSelectedImages((prev) => [...prev, uri]);
      }
    }
  };

  const handleRemovePhoto = (uri: string) => {
    setSelectedImages((prev) => prev.filter((item) => item !== uri));
  };

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Reviews</Text>
          <Text style={styles.sectionSubtitle}>What locals and visitors say</Text>
        </View>
        <TouchableOpacity style={styles.writeReviewButton} onPress={() => setWriteReviewVisible(true)}>
          <Text style={styles.writeReviewText}>Write a Review</Text>
        </TouchableOpacity>
      </View>

      <ShopDetailRatingBreakdown
        rating={shop.rating}
        ratingCount={shop.ratingCount}
        breakdown={shop.ratingBreakdown}
      />

      <View style={styles.reviewsList}>
        {shop.reviews.length ? (
          shop.reviews.map((review) => (
            <ShopDetailReviewCard
              key={review.id}
              review={review}
              onHelpfulPress={onHelpfulPress}
              onImagePress={onImagePress}
            />
          ))
        ) : (
          <Text style={styles.emptyState}>No reviews yet. Be the first to share!</Text>
        )}
      </View>

      <WriteReviewModal
        visible={writeReviewVisible}
        rating={rating}
        reviewText={reviewText}
        reviewerName={reviewerName}
        selectedImages={selectedImages}
        onClose={() => setWriteReviewVisible(false)}
        onSubmit={handleSubmitReview}
        onRatingChange={setRating}
        onReviewTextChange={setReviewText}
        onReviewerNameChange={setReviewerName}
        onAddPhoto={handleAddPhoto}
        onRemovePhoto={handleRemovePhoto}
      />

      <ReviewSubmittedModal
        visible={reviewSubmittedVisible}
        onClose={() => setReviewSubmittedVisible(false)}
      />

      <ReviewValidationModal
        visible={validationVisible}
        onClose={() => setValidationVisible(false)}
        message={validationMessage}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    backgroundColor: ShopColors.cardBackground,
    margin: 16,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: ShopColors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
  },
  writeReviewButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: ShopColors.accent,
  },
  writeReviewText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
  },
  reviewsList: {
    marginTop: 20,
  },
  emptyState: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
  },
});

export default ShopDetailReviewsSection;
