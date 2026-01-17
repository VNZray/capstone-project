import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Image,
  Pressable,
  Modal,
  Dimensions,
  ScrollView,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/color';
import { Ionicons } from '@expo/vector-icons';
import { ReviewWithEntityDetails, ReviewPhoto } from '@/types/Feedback';
import { format } from 'date-fns';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ReviewCardProps {
  review: ReviewWithEntityDetails;
  onPress?: () => void;
  onEdit?: (review: ReviewWithEntityDetails) => void;
  onDelete?: (review: ReviewWithEntityDetails) => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  onPress,
  onEdit,
  onDelete,
}) => {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(
    null
  );
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const openGallery = (index: number) => {
    setSelectedPhotoIndex(index);
    setIsGalleryOpen(true);
  };

  const closeGallery = () => {
    setIsGalleryOpen(false);
    setSelectedPhotoIndex(null);
  };

  const formattedDate = review.created_at
    ? format(new Date(review.created_at), 'MMM dd, yyyy')
    : '';

  // Format review type for display (convert snake_case to Title Case)
  const formatReviewTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      accommodation: 'Accommodation',
      room: 'Room',
      shop: 'Shop',
      tourist_spot: 'Tourist Spot',
      service: 'Service',
    };
    return labels[type] || type;
  };

  // Get display name based on review type
  const getDisplayName = () => {
    if (review.review_type === 'room' && review.accommodation_name) {
      return `${review.entity_name} - ${review.accommodation_name}`;
    }
    return review.entity_name || 'Unknown';
  };

  // Get icon based on review type
  const getTypeIcon = () => {
    switch (review.review_type) {
      case 'accommodation':
        return 'bed-outline';
      case 'room':
        return 'key-outline';
      case 'shop':
        return 'storefront-outline';
      case 'tourist_spot':
        return 'location-outline';
      case 'service':
        return 'construct-outline';
      default:
        return 'star-outline';
    }
  };

  // Render star rating
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= review.rating ? 'star' : 'star-outline'}
          size={14}
          color={i <= review.rating ? '#F59E0B' : Colors.light.textSecondary}
        />
      );
    }
    return stars;
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={onPress}
    >
      {/* Header: Type Badge + Actions */}
      <View style={styles.header}>
        <View style={styles.typeBadge}>
          <Ionicons
            name={getTypeIcon() as any}
            size={14}
            color={Colors.light.primary}
          />
          <ThemedText type="label-small" style={styles.typeText}>
            {formatReviewTypeLabel(review.review_type)}
          </ThemedText>
        </View>
        <View style={styles.headerRight}>
          <ThemedText type="body-small" style={styles.date}>
            {formattedDate}
          </ThemedText>
          {(onEdit || onDelete) && (
            <View style={styles.actionButtons}>
              {onEdit && (
                <Pressable
                  style={styles.actionButton}
                  onPress={() => onEdit(review)}
                  hitSlop={8}
                >
                  <Ionicons
                    name="pencil-outline"
                    size={18}
                    color={Colors.light.primary}
                  />
                </Pressable>
              )}
              {onDelete && (
                <Pressable
                  style={styles.actionButton}
                  onPress={() => onDelete(review)}
                  hitSlop={8}
                >
                  <Ionicons
                    name="trash-outline"
                    size={18}
                    color={Colors.light.error}
                  />
                </Pressable>
              )}
            </View>
          )}
        </View>
      </View>

      {/* Entity Name */}
      <ThemedText
        type="body-medium"
        weight="semi-bold"
        style={styles.entityName}
      >
        {getDisplayName()}
      </ThemedText>

      {/* Star Rating */}
      <View style={styles.ratingRow}>
        {renderStars()}
        <ThemedText type="body-small" style={styles.ratingText}>
          ({review.rating}/5)
        </ThemedText>
      </View>

      {/* Message Preview */}
      <ThemedText type="body-small" style={styles.message} numberOfLines={3}>
        {review.message}
      </ThemedText>

      {/* Photos Preview (if any) */}
      {review.photos && review.photos.length > 0 && (
        <View style={styles.photosContainer}>
          {review.photos
            .slice(0, 3)
            .map((photo: ReviewPhoto, index: number) => (
              <Pressable
                key={photo.id || index}
                onPress={() => openGallery(index)}
              >
                <Image
                  source={{ uri: photo.photo_url }}
                  style={styles.photoThumbnail}
                  resizeMode="cover"
                />
              </Pressable>
            ))}
          {review.photos.length > 3 && (
            <Pressable style={styles.morePhotos} onPress={() => openGallery(3)}>
              <ThemedText type="body-small" style={styles.morePhotosText}>
                +{review.photos.length - 3}
              </ThemedText>
            </Pressable>
          )}
        </View>
      )}

      {/* Photo Gallery Modal */}
      <Modal
        visible={isGalleryOpen}
        transparent
        animationType="fade"
        onRequestClose={closeGallery}
      >
        <View style={styles.photoViewerOverlay}>
          {/* Close button */}
          <Pressable style={styles.photoViewerClose} onPress={closeGallery}>
            <Ionicons name="close" size={28} color="#fff" />
          </Pressable>

          {/* Photo counter */}
          {review.photos &&
            review.photos.length > 1 &&
            selectedPhotoIndex !== null && (
              <View style={styles.photoCounter}>
                <ThemedText type="body-small" style={styles.photoCounterText}>
                  {selectedPhotoIndex + 1} / {review.photos.length}
                </ThemedText>
              </View>
            )}

          {/* Scrollable photo gallery */}
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentOffset={{
              x: (selectedPhotoIndex || 0) * SCREEN_WIDTH,
              y: 0,
            }}
            onMomentumScrollEnd={(e) => {
              // Only update if gallery is open
              if (!isGalleryOpen) return;
              const newIndex = Math.round(
                e.nativeEvent.contentOffset.x / SCREEN_WIDTH
              );
              setSelectedPhotoIndex(newIndex);
            }}
            style={styles.photoScrollView}
          >
            {review.photos?.map((photo, index) => (
              <View key={photo.id || index} style={styles.photoSlide}>
                <Image
                  source={{ uri: photo.photo_url }}
                  style={styles.fullScreenPhoto}
                  resizeMode="contain"
                />
              </View>
            ))}
          </ScrollView>

          {/* Navigation arrows */}
          {review.photos &&
            review.photos.length > 1 &&
            selectedPhotoIndex !== null && (
              <>
                {selectedPhotoIndex > 0 && (
                  <Pressable
                    style={[styles.navArrow, styles.navArrowLeft]}
                    onPress={() =>
                      setSelectedPhotoIndex(selectedPhotoIndex - 1)
                    }
                  >
                    <Ionicons name="chevron-back" size={32} color="#fff" />
                  </Pressable>
                )}
                {selectedPhotoIndex < review.photos.length - 1 && (
                  <Pressable
                    style={[styles.navArrow, styles.navArrowRight]}
                    onPress={() =>
                      setSelectedPhotoIndex(selectedPhotoIndex + 1)
                    }
                  >
                    <Ionicons name="chevron-forward" size={32} color="#fff" />
                  </Pressable>
                )}
              </>
            )}
        </View>
      </Modal>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.secondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  typeText: {
    color: Colors.light.primary,
    fontSize: 12,
  },
  date: {
    color: Colors.light.textSecondary,
  },
  entityName: {
    marginBottom: 6,
    color: Colors.light.text,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginBottom: 8,
  },
  ratingText: {
    marginLeft: 6,
    color: Colors.light.textSecondary,
  },
  message: {
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
  photosContainer: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  photoThumbnail: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
  morePhotos: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: Colors.light.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  morePhotosText: {
    color: Colors.light.primary,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: Colors.light.background,
  },
  // Photo viewer styles
  photoViewerOverlay: {
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
  photoCounter: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  photoCounterText: {
    color: '#fff',
    fontWeight: '600',
  },
  photoScrollView: {
    flex: 1,
  },
  photoSlide: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenPhoto: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
  },
  navArrow: {
    position: 'absolute',
    top: '50%',
    marginTop: -24,
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 24,
    zIndex: 10,
  },
  navArrowLeft: {
    left: 16,
  },
  navArrowRight: {
    right: 16,
  },
});

export default ReviewCard;
