import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/color';
import { useAuth } from '@/context/AuthContext';
import {
  getReviewsByTouristId,
  updateReview,
  deleteReview,
} from '@/services/FeedbackService';
import { getTouristByUserId } from '@/services/TouristService';
import { ReviewWithEntityDetails } from '@/types/Feedback';
import { Ionicons } from '@expo/vector-icons';
import ReviewCard from './components/ReviewCard';
import EditReviewModal from './components/EditReviewModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';

type FilterType =
  | 'all'
  | 'accommodation'
  | 'room'
  | 'shop'
  | 'tourist_spot'
  | 'service';

const FILTER_OPTIONS: { label: string; value: FilterType }[] = [
  { label: 'All', value: 'all' },
  { label: 'Accommodation', value: 'accommodation' },
  { label: 'Room', value: 'room' },
  { label: 'Shop', value: 'shop' },
  { label: 'Tourist Spot', value: 'tourist_spot' },
];

const MyReviews = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ReviewWithEntityDetails[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<
    ReviewWithEntityDetails[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  // Edit/Delete modal state
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedReview, setSelectedReview] =
    useState<ReviewWithEntityDetails | null>(null);

  const fetchReviews = useCallback(async () => {
    // Use user_id (the actual user identifier) instead of id
    const userId = user?.user_id || user?.id;
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      // First get the tourist profile to get the tourist_id
      const tourist = await getTouristByUserId(userId);
      if (!tourist?.id) {
        setLoading(false);
        return;
      }

      const data = await getReviewsByTouristId(tourist.id);
      // Filter out invalid entries
      const validReviews = data.filter(
        (r) => r && typeof r === 'object' && 'id' in r && 'rating' in r
      );
      setReviews(validReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.user_id, user?.id]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Apply filter when reviews or filter changes
  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredReviews(reviews);
    } else {
      setFilteredReviews(reviews.filter((r) => r.review_type === activeFilter));
    }
  }, [reviews, activeFilter]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchReviews();
  }, [fetchReviews]);

  // Handle edit review
  const handleEditReview = (review: ReviewWithEntityDetails) => {
    setSelectedReview(review);
    setEditModalVisible(true);
  };

  // Handle delete review
  const handleDeleteReview = (review: ReviewWithEntityDetails) => {
    setSelectedReview(review);
    setDeleteModalVisible(true);
  };

  // Save edited review
  const handleSaveReview = async (
    id: string,
    rating: number,
    message: string
  ) => {
    await updateReview(id, { rating, message });
    // Update local state
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, rating, message } : r))
    );
  };

  // Confirm delete review
  const handleConfirmDelete = async (id: string) => {
    await deleteReview(id);
    // Remove from local state
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filter Chips */}
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          {FILTER_OPTIONS.map((option) => (
            <FilterChip
              key={option.value}
              label={option.label}
              active={activeFilter === option.value}
              onPress={() => setActiveFilter(option.value)}
              count={
                option.value === 'all'
                  ? reviews.length
                  : reviews.filter((r) => r.review_type === option.value).length
              }
            />
          ))}
        </ScrollView>
      </View>

      {/* Reviews List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.light.primary]}
            tintColor={Colors.light.primary}
          />
        }
      >
        {filteredReviews.length === 0 ? (
          <EmptyState filter={activeFilter} />
        ) : (
          filteredReviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onEdit={handleEditReview}
              onDelete={handleDeleteReview}
            />
          ))
        )}
      </ScrollView>

      {/* Edit Review Modal */}
      <EditReviewModal
        visible={editModalVisible}
        review={selectedReview}
        onClose={() => {
          setEditModalVisible(false);
          setSelectedReview(null);
        }}
        onSave={handleSaveReview}
        onPhotosUpdated={fetchReviews}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        visible={deleteModalVisible}
        review={selectedReview}
        onClose={() => {
          setDeleteModalVisible(false);
          setSelectedReview(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </View>
  );
};

// Filter Chip Component
interface FilterChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
  count: number;
}

const FilterChip: React.FC<FilterChipProps> = ({
  label,
  active,
  onPress,
  count,
}) => (
  <View style={[styles.chip, active && styles.chipActive]} onTouchEnd={onPress}>
    <ThemedText
      type="body-small"
      weight={active ? 'semi-bold' : 'normal'}
      style={[styles.chipText, active && styles.chipTextActive]}
    >
      {label} {count > 0 && `(${count})`}
    </ThemedText>
  </View>
);

// Empty State Component
interface EmptyStateProps {
  filter: FilterType;
}

const EmptyState: React.FC<EmptyStateProps> = ({ filter }) => (
  <View style={styles.emptyContainer}>
    <View style={styles.emptyIcon}>
      <Ionicons
        name="chatbubble-ellipses-outline"
        size={48}
        color={Colors.light.textSecondary}
      />
    </View>
    <ThemedText
      type="title-medium"
      weight="semi-bold"
      style={styles.emptyTitle}
    >
      No Reviews Yet
    </ThemedText>
    <ThemedText type="body-medium" style={styles.emptyText}>
      {filter === 'all'
        ? "You haven't written any reviews yet. Share your experiences with others!"
        : `No ${filter.toLowerCase()} reviews found.`}
    </ThemedText>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.background,
    height: '100%',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.background,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.light.surface,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  chipActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  chipText: {
    color: Colors.light.textSecondary,
  },
  chipTextActive: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.light.textSecondary,
    lineHeight: 22,
  },
});

export default MyReviews;
