import { ShopColors } from '@/constants/ShopColors';
import type { ShopReview } from '@/types/shop';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import PhotoGalleryModal from './PhotoGalleryModal';

interface ShopDetailReviewCardProps {
  review: ShopReview;
  onImagePress?: (imageUrl: string) => void; // Keep for backward compatibility but don't use
  onHelpfulPress?: (reviewId: string) => void;
}

const ShopDetailReviewCard: React.FC<ShopDetailReviewCardProps> = ({ 
  review, 
  onImagePress, // Keep but don't use to prevent double modal
  onHelpfulPress 
}) => {
  const [isHelpfulPressed, setIsHelpfulPressed] = useState(false);
  const [photoGalleryVisible, setPhotoGalleryVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const handleHelpfulPress = () => {
    setIsHelpfulPressed(!isHelpfulPressed);
    onHelpfulPress?.(review.id);
  };

  const handleImagePress = (imageUrl: string, index: number) => {
    setSelectedImageIndex(index);
    setPhotoGalleryVisible(true);
    // REMOVED: Don't call onImagePress to prevent double modal
    // onImagePress?.(imageUrl);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const renderStars = (rating: number) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <Ionicons
        key={star}
        name="star"
        size={12}
        color={star <= rating ? ShopColors.warning : ShopColors.border}
      />
    ));
  };

  return (
    <>
      <View style={styles.reviewCard}>
        {/* Review Header */}
        <View style={styles.reviewHeader}>
          <View style={styles.reviewUserInfo}>
            {review.userAvatar ? (
              <Image source={{ uri: review.userAvatar }} style={styles.reviewUserAvatar} />
            ) : (
              <View style={styles.reviewUserAvatarPlaceholder}>
                <Ionicons name="person" size={16} color={ShopColors.textSecondary} />
              </View>
            )}
            <View style={styles.reviewUserDetails}>
              <Text style={styles.reviewUserName}>{review.userName}</Text>
              <View style={styles.reviewRatingContainer}>
                {renderStars(review.rating)}
                <Text style={styles.reviewDate}>
                  • {formatDate(review.date)}
                </Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* Review Content */}
        <Text style={styles.reviewComment}>{review.comment}</Text>
        
        {/* Review Images */}
        {review.images && review.images.length > 0 && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.reviewImages}
            contentContainerStyle={styles.reviewImagesContent}
          >
            {review.images.map((imageUrl, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleImagePress(imageUrl, index)}
                activeOpacity={0.8}
                style={styles.imageContainer}
              >
                <Image source={{ uri: imageUrl }} style={styles.reviewImage} />
                {/* Show indicator if multiple images */}
                {review.images!.length > 1 && (
                  <View style={styles.imageCountBadge}>
                    <Text style={styles.imageCountText}>
                      {index + 1}/{review.images!.length}
                    </Text>
                  </View>
                )}
                {/* Add gallery icon overlay for better UX */}
                <View style={styles.galleryIconOverlay}>
                  <Ionicons name="expand-outline" size={16} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
        
        {/* Review Actions */}
        <View style={styles.reviewActions}>
          <TouchableOpacity 
            style={[
              styles.reviewHelpfulButton,
              isHelpfulPressed && styles.reviewHelpfulButtonPressed
            ]}
            onPress={handleHelpfulPress}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={isHelpfulPressed ? "thumbs-up" : "thumbs-up-outline"} 
              size={14} 
              color={isHelpfulPressed ? ShopColors.accent : ShopColors.textSecondary} 
            />
            <Text style={[
              styles.reviewHelpfulText,
              isHelpfulPressed && styles.reviewHelpfulTextPressed
            ]}>
              Helpful ({(review.helpfulCount || 0) + (isHelpfulPressed ? 1 : 0)})
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Owner Response */}
        {review.response && (
          <View style={styles.ownerResponse}>
            <View style={styles.ownerResponseHeader}>
              <Ionicons name="storefront" size={14} color={ShopColors.accent} />
              <Text style={styles.ownerResponseLabel}>Owner Response</Text>
              <Text style={styles.ownerResponseDate}>
                {formatDate(review.response.date)}
              </Text>
            </View>
            <Text style={styles.ownerResponseText}>{review.response.message}</Text>
          </View>
        )}
      </View>

      {/* Photo Gallery Modal - Only this one will show */}
      <PhotoGalleryModal
        visible={photoGalleryVisible}
        onClose={() => setPhotoGalleryVisible(false)}
        images={review.images || []}
        initialIndex={selectedImageIndex}
      />
    </>
  );
};

const styles = StyleSheet.create({
  reviewCard: {
    backgroundColor: ShopColors.cardBackground,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ShopColors.border,
    elevation: 2,
    shadowColor: ShopColors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reviewUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reviewUserAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  reviewUserAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ShopColors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  reviewUserDetails: {
    flex: 1,
  },
  reviewUserName: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: ShopColors.textPrimary,
  },
  reviewRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 2,
  },
  reviewDate: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
    marginLeft: 4,
  },
  reviewComment: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  reviewImages: {
    marginBottom: 12,
  },
  reviewImagesContent: {
    paddingRight: 16,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 8,
  },
  reviewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  imageCountBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  imageCountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Poppins-Bold',
  },
  galleryIconOverlay: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 4,
  },
  reviewActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewHelpfulButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 4,
  },
  reviewHelpfulButtonPressed: {
    backgroundColor: ShopColors.accent + '10',
  },
  reviewHelpfulText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
  },
  reviewHelpfulTextPressed: {
    color: ShopColors.accent,
    fontFamily: 'Poppins-SemiBold',
  },
  ownerResponse: {
    backgroundColor: ShopColors.accent + '10',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  ownerResponseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  ownerResponseLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: ShopColors.accent,
    flex: 1,
  },
  ownerResponseDate: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
  },
  ownerResponseText: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textPrimary,
    lineHeight: 18,
  },
});

export default React.memo(ShopDetailReviewCard);