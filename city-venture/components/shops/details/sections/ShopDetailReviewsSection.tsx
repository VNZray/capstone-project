import {
  ReviewSubmittedModal,
  ReviewValidationModal,
  ShopDetailRatingBreakdown,
  ShopDetailReviewCard,
  WriteReviewModal,
  ShopDetailFilterChips,
} from '@/components/shops/details/elements';
import type { ShopDetailFilterChipsProps } from '@/components/shops/details/elements/ShopDetailFilterChips';
import type { BusinessProfileView } from '@/components/shops/details/types';
import { ShopColors } from '@/constants/color';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useCallback, useState, useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, LayoutAnimation, Platform, UIManager } from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type FilterType = ShopDetailFilterChipsProps['activeFilter'];

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
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  // Sorting and Filtering Logic
  const filteredReviews = useMemo(() => {
    let reviews = [...shop.reviews];

    // Filtering
    if (activeFilter === 'photos') {
      reviews = reviews.filter((r) => r.images && r.images.length > 0);
    }

    // Sorting
    switch (activeFilter) {
      case 'recent':
        reviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case 'highest':
        reviews.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest':
        reviews.sort((a, b) => a.rating - b.rating);
        break;
      default:
        break;
    }
    return reviews;
  }, [shop.reviews, activeFilter]);

  const toggleFilters = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsFilterVisible(!isFilterVisible);
  };

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
    <View style={styles.container}>
      <View style={styles.spacer} />

      <ShopDetailRatingBreakdown
        rating={shop.rating}
        ratingCount={shop.ratingCount}
        breakdown={shop.ratingBreakdown}
        onWriteReviewPress={() => setWriteReviewVisible(true)}
      />

      <View style={styles.filterspacer} />

      {/* Filter Header Row */}
      <View style={styles.filterHeaderRow}>
        <TouchableOpacity style={styles.filterTrigger} onPress={toggleFilters}>
          <Ionicons name="options-outline" size={20} color={ShopColors.accent} />
          <Text style={styles.filterTriggerText}>Filters & Sort</Text>
          <Ionicons 
            name={isFilterVisible ? "chevron-up" : "chevron-down"} 
            size={16} 
            color={ShopColors.textSecondary} 
          />
        </TouchableOpacity>
        
        <Text style={styles.reviewCountText}>
          {filteredReviews.length} of {shop.reviews.length} reviews
        </Text>
      </View>

      {isFilterVisible && (
        <View style={styles.filterContent}>
          <ShopDetailFilterChips
            activeFilter={activeFilter}
            onFilterSelect={setActiveFilter}
          />
        </View>
      )}

      <View style={styles.reviewsList}>
        {filteredReviews.length ? (
          filteredReviews.map((review) => (
            <ShopDetailReviewCard
              key={review.id}
              review={review}
              onHelpfulPress={onHelpfulPress}
              onImagePress={onImagePress}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No reviews found matching your filter.
            </Text>
          </View>
        )}
      </View>

      <View style={styles.bottomSpacer} />

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
  container: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  spacer: {
    height: 0,
  },
  filterspacer: {
    height: 16,
  },
  bottomSpacer: {
    height: 40,
  },
  filterHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
    paddingTop: 8,
  },
  filterTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterTriggerText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: ShopColors.accent,
  },
  reviewCountText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
  },
  filterContent: {
    marginBottom: 8,
  },
  reviewsList: {
    marginTop: 8,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: ShopColors.textSecondary,
    textAlign: 'center',
  },
});

export default ShopDetailReviewsSection;
