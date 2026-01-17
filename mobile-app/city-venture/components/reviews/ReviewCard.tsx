import Container from '@/components/Container';
import { ThemedText } from '@/components/themed-text';
import { Colors, card, colors } from '@/constants/color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { ReviewWithAuthor } from '@/types/Feedback';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { format, isValid, parseISO } from 'date-fns';
import Chip from '../Chip';
import { useAccommodation } from '@/context/AccommodationContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const formatDate = (dateString?: string): string => {
  if (!dateString) return 'Date unknown';

  try {
    const date =
      typeof dateString === 'string'
        ? parseISO(dateString)
        : new Date(dateString);
    if (isValid(date)) {
      return format(date, 'MMM dd, yyyy');
    }
  } catch (error) {
    console.error('Date formatting error:', error, dateString);
  }

  return 'Date unknown';
};

type Props = {
  review: ReviewWithAuthor;
  currentUserId?: string;
  onEdit?: (review: ReviewWithAuthor) => void;
  onDelete?: (reviewId: string) => void;
  isVerified?: boolean; // Whether the reviewer has checked in
};

const ReviewCard = ({
  review,
  currentUserId,
  onEdit,
  onDelete,
  isVerified = false,
}: Props) => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const [showMenu, setShowMenu] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const { accommodationDetails } = useAccommodation();

  const openGallery = (index: number) => {
    setSelectedImageIndex(index);
    setIsGalleryOpen(true);
  };

  const closeGallery = () => {
    setIsGalleryOpen(false);
    setSelectedImageIndex(null);
  };

  // Check if this review belongs to the current user
  // Compare tourist_id with currentUserId since user.id is the tourist_id
  const isCurrentUser =
    currentUserId &&
    (review.tourist_id === currentUserId ||
      review.tourist?.id === currentUserId ||
      review.tourist?.user_id === currentUserId);

  console.log('ReviewCard Debug:', {
    reviewId: review.id,
    currentUserId,
    touristId: review.tourist_id,
    touristUserId: review.tourist?.user_id,
    touristIdField: review.tourist?.id,
    isCurrentUser,
  });

  const fullName = isCurrentUser
    ? 'You'
    : review.tourist
    ? `${review.tourist.first_name} ${
        review.tourist.middle_name ? review.tourist.middle_name + ' ' : ''
      }${review.tourist.last_name}`.trim()
    : 'Anonymous';

  const userProfile = review.user?.user_profile;
  const formattedDate = formatDate(review.created_at);

  const handleEdit = () => {
    setShowMenu(false);
    onEdit?.(review);
  };

  const handleDelete = () => {
    setShowMenu(false);
    Alert.alert(
      'Delete Review',
      'Are you sure you want to delete this review?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete?.(review.id),
        },
      ]
    );
  };

  return (
    <>
      <Container
        style={[
          styles.container,
          { backgroundColor: isDark ? card.dark : card.light },
        ]}
        gap={0}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            {/* Avatar */}
            <View
              style={[
                styles.avatar,
                {
                  backgroundColor: colors.secondary,
                },
              ]}
            >
              {userProfile ? (
                <Image
                  source={{ uri: userProfile }}
                  style={styles.avatarImage}
                />
              ) : (
                <Ionicons
                  name="person"
                  size={32}
                  color={isDark ? Colors.dark.text : Colors.light.text}
                />
              )}
            </View>

            {/* Name, Rating and Date */}
            <View style={styles.userDetails}>
              <View style={styles.nameRatingRow}>
                {fullName === 'You' ? (
                  <Chip
                    color="secondary"
                    size="small"
                    variant="soft"
                    label="You"
                  />
                ) : (
                  <ThemedText type="card-title-medium" style={styles.userName}>
                    {fullName}
                  </ThemedText>
                )}
                {isVerified && (
                  <View style={styles.verifiedBadge}>
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color={colors.success}
                    />
                  </View>
                )}
                <ThemedText type="body-small" style={styles.date}>
                  {formattedDate}
                </ThemedText>
              </View>
              <View style={styles.ratingContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name={star <= review.rating ? 'star' : 'star-outline'}
                    size={18}
                    color={colors.warning}
                  />
                ))}
              </View>
            </View>
          </View>

          {/* Three-dot menu */}
          <Pressable
            onPress={() => setShowMenu(true)}
            style={styles.menuButton}
          >
            <Ionicons
              name="ellipsis-vertical"
              size={22}
              color={isDark ? Colors.dark.text : Colors.light.text}
            />
          </Pressable>
        </View>

        {/* Message */}
        <ThemedText type="body-medium" style={styles.message}>
          {review.message}
        </ThemedText>

        {/* Images */}
        {review.photos && review.photos.length > 0 && (
          <View style={styles.imagesContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {review.photos.map((photo, index) => (
                <Pressable key={photo.id} onPress={() => openGallery(index)}>
                  <Image
                    source={{ uri: photo.photo_url }}
                    style={styles.reviewImage}
                    resizeMode="cover"
                  />
                </Pressable>
              ))}
            </ScrollView>
            {/* Photo count badge */}
            {review.photos.length > 1 && (
              <View style={styles.photoCountBadge}>
                <Ionicons name="images-outline" size={12} color="#fff" />
                <ThemedText
                  type="body-extra-small"
                  style={styles.photoCountText}
                >
                  {review.photos.length}
                </ThemedText>
              </View>
            )}
          </View>
        )}

        {/* Replies */}
        {review.replies && review.replies.length > 0 && (
          <View style={styles.repliesContainer}>
            {review.replies.map((reply) => (
              <View
                key={reply.id}
                style={[
                  styles.replyCard,
                  {
                    backgroundColor: isDark
                      ? 'rgba(255,255,255,0.05)'
                      : 'rgba(0,0,0,0.03)',
                  },
                ]}
              >
                <ThemedText
                  type="card-sub-title-medium"
                  weight="bold"
                  endIcon={
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color={colors.success}
                    />
                  }
                >
                  {accommodationDetails?.business_name}
                </ThemedText>
                <ThemedText type="body-small" style={styles.replyMessage}>
                  {reply.message}
                </ThemedText>
                <ThemedText type="body-extra-small" style={styles.replyDate}>
                  {formatDate(reply.created_at)}
                </ThemedText>
              </View>
            ))}
          </View>
        )}
      </Container>

      {/* Menu Modal */}
      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowMenu(false)}
        >
          <View
            style={[
              styles.menuContainer,
              { backgroundColor: isDark ? card.dark : card.light },
            ]}
          >
            {isCurrentUser && (
              <>
                <Pressable style={styles.menuItem} onPress={handleEdit}>
                  <Ionicons
                    name="create-outline"
                    size={20}
                    color={isDark ? Colors.dark.text : Colors.light.text}
                  />
                  <ThemedText type="body-medium">Edit</ThemedText>
                </Pressable>
                <View style={styles.menuDivider} />
                <Pressable style={styles.menuItem} onPress={handleDelete}>
                  <Ionicons
                    name="trash-outline"
                    size={20}
                    color={colors.error}
                  />
                  <ThemedText
                    type="body-medium"
                    style={{ color: colors.error }}
                  >
                    Delete
                  </ThemedText>
                </Pressable>
                <View style={styles.menuDivider} />
              </>
            )}
            <Pressable
              style={styles.menuItem}
              onPress={() => setShowMenu(false)}
            >
              <Ionicons
                name="flag-outline"
                size={20}
                color={isDark ? Colors.dark.text : Colors.light.text}
              />
              <ThemedText type="body-medium">Report</ThemedText>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Image Gallery Modal */}
      <Modal
        visible={isGalleryOpen}
        transparent
        animationType="fade"
        onRequestClose={closeGallery}
      >
        <View style={styles.imageModalOverlay}>
          {/* Close button */}
          <Pressable style={styles.closeButton} onPress={closeGallery}>
            <Ionicons name="close" size={30} color="white" />
          </Pressable>

          {/* Photo counter */}
          {review.photos &&
            review.photos.length > 1 &&
            selectedImageIndex !== null && (
              <View style={styles.galleryCounter}>
                <ThemedText type="body-small" style={styles.galleryCounterText}>
                  {selectedImageIndex + 1} / {review.photos.length}
                </ThemedText>
              </View>
            )}

          {/* Scrollable photo gallery */}
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentOffset={{
              x: (selectedImageIndex || 0) * SCREEN_WIDTH,
              y: 0,
            }}
            onMomentumScrollEnd={(e) => {
              if (!isGalleryOpen) return;
              const newIndex = Math.round(
                e.nativeEvent.contentOffset.x / SCREEN_WIDTH
              );
              setSelectedImageIndex(newIndex);
            }}
            style={styles.galleryScrollView}
          >
            {review.photos?.map((photo, index) => (
              <View key={photo.id || index} style={styles.gallerySlide}>
                <Image
                  source={{ uri: photo.photo_url }}
                  style={styles.fullImage}
                  resizeMode="contain"
                />
              </View>
            ))}
          </ScrollView>

          {/* Navigation arrows */}
          {review.photos &&
            review.photos.length > 1 &&
            selectedImageIndex !== null && (
              <>
                {selectedImageIndex > 0 && (
                  <Pressable
                    style={[styles.navArrow, styles.navArrowLeft]}
                    onPress={() =>
                      setSelectedImageIndex(selectedImageIndex - 1)
                    }
                  >
                    <Ionicons name="chevron-back" size={32} color="#fff" />
                  </Pressable>
                )}
                {selectedImageIndex < review.photos.length - 1 && (
                  <Pressable
                    style={[styles.navArrow, styles.navArrowRight]}
                    onPress={() =>
                      setSelectedImageIndex(selectedImageIndex + 1)
                    }
                  >
                    <Ionicons name="chevron-forward" size={32} color="#fff" />
                  </Pressable>
                )}
              </>
            )}
        </View>
      </Modal>
    </>
  );
};

export default ReviewCard;

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  userDetails: {
    marginLeft: 12,
    flex: 1,
  },
  nameRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  userName: {
    fontWeight: '700',
    fontSize: 16,
  },
  verifiedBadge: {
    marginLeft: 4,
  },
  date: {
    fontSize: 12,
    opacity: 0.5,
  },
  menuButton: {
    padding: 4,
    marginLeft: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  message: {
    lineHeight: 22,
    marginBottom: 12,
    fontSize: 15,
  },
  imagesContainer: {
    marginBottom: 10,
  },
  reviewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 8,
  },
  repliesContainer: {
    marginTop: 8,
    gap: 8,
  },
  replyCard: {
    padding: 10,
    borderRadius: 8,
  },
  replyAuthor: {},
  replyMessage: {
    marginBottom: 4,
    fontSize: 13,
  },
  replyDate: {
    fontSize: 11,
    opacity: 0.6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    minWidth: 140,
    borderRadius: 8,
    padding: 6,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
  },
  menuDivider: {
    height: 1,
    backgroundColor: 'rgba(128,128,128,0.2)',
    marginVertical: 4,
  },
  imageModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    padding: 10,
    zIndex: 10,
  },
  photoCountBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  photoCountText: {
    color: '#fff',
    fontWeight: '600',
  },
  galleryCounter: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  galleryCounterText: {
    color: '#fff',
    fontWeight: '600',
  },
  galleryScrollView: {
    flex: 1,
  },
  gallerySlide: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
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
