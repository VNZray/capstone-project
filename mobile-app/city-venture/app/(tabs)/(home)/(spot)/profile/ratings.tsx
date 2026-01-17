import PageContainer from '@/components/PageContainer';
import AddReview from '@/components/reviews/AddReview';
import RatingStatsCard from '@/components/reviews/RatingStatsCard';
import ReviewCard from '@/components/reviews/ReviewCard';
import { ThemedText } from '@/components/themed-text';
import { colors } from '@/constants/color';
import { useTouristSpot } from '@/context/TouristSpotContext';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRequireAuthWithModal } from '@/hooks/useRequireAuth';
import LoginPromptModal from '@/components/LoginPromptModal';
import FeedbackService from '@/services/FeedbackService';
import type { CreateReviewPayload, ReviewWithAuthor } from '@/types/Feedback';
import debugLogger from '@/utils/debugLogger';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';

type RatingBreakdown = {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
};

type Props = {
  onRefreshRequested?: () => void;
  refreshKey?: number;
};

const Ratings = ({ onRefreshRequested, refreshKey }: Props) => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const { selectedSpot } = useTouristSpot();
  const { checkAuth, showLoginPrompt, setShowLoginPrompt, actionName } =
    useRequireAuthWithModal();

  debugLogger({
    title: 'Ratings Component Mounted',
    data: {
      params,
      userId: user?.id,
      touristSpotId: selectedSpot?.id,
    },
  });

  // Get tourist spot ID from params or context
  const reviewTypeId = (params.id as string) || selectedSpot?.id || '';

  debugLogger({
    title: 'Review Type IDs',
    data: { reviewTypeId },
  });

  const [reviews, setReviews] = useState<ReviewWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddReview, setShowAddReview] = useState(false);
  const [editingReview, setEditingReview] = useState<ReviewWithAuthor | null>(
    null
  );

  // Calculate statistics
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const breakdown: RatingBreakdown = {
    5: reviews.filter((r) => r.rating === 5).length,
    4: reviews.filter((r) => r.rating === 4).length,
    3: reviews.filter((r) => r.rating === 3).length,
    2: reviews.filter((r) => r.rating === 2).length,
    1: reviews.filter((r) => r.rating === 1).length,
  };

  const fetchReviews = useCallback(async () => {
    if (!reviewTypeId) {
      debugLogger({
        title: 'Fetch Reviews Skipped',
        error: 'No reviewTypeId available',
      });
      setLoading(false);
      return;
    }

    debugLogger({
      title: 'Fetching Reviews',
      data: { reviewTypeId, reviewType: 'tourist_spot' },
    });

    try {
      const data = await FeedbackService.getBusinessReviews(
        reviewTypeId,
        'tourist_spot'
      );

      debugLogger({
        title: 'Reviews Fetched Successfully',
        data: {
          count: data.length,
          dataType: typeof data,
          isArray: Array.isArray(data),
          firstReview: data[0]
            ? {
                id: data[0].id,
                rating: data[0].rating,
                message: data[0].message?.substring(0, 50),
                tourist_id: data[0].tourist_id,
                created_at: data[0].created_at,
                hasTourist: !!data[0].tourist,
                hasUser: !!data[0].user,
              }
            : null,
        },
      });

      setReviews(data);
    } catch (error) {
      console.error('Full error:', error);
      debugLogger({
        title: 'Error Fetching Reviews',
        error: error instanceof Error ? error.message : String(error),
      });
      Alert.alert('Error', 'Failed to load reviews');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [reviewTypeId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews, refreshKey]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchReviews();
  };

  const handleAddReview = () => {
    if (!checkAuth('leave a review')) return;
    setEditingReview(null);
    setShowAddReview(true);
  };

  const handleEditReview = (review: ReviewWithAuthor) => {
    setEditingReview(review);
    setShowAddReview(true);
  };

  const handleSubmitReview = async (payload: CreateReviewPayload) => {
    try {
      if (editingReview) {
        // Update existing review
        await FeedbackService.updateReview(editingReview.id, {
          rating: payload.rating,
          message: payload.message,
        });
        Alert.alert('Success', 'Review updated successfully');
      } else {
        // Create new review
        await FeedbackService.createReview(payload);
        Alert.alert('Success', 'Review submitted successfully');
      }

      setShowAddReview(false);
      setEditingReview(null);
      fetchReviews();
      onRefreshRequested?.();
    } catch (error) {
      console.error('Error submitting review:', error);
      throw error;
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await FeedbackService.deleteReview(reviewId);
      Alert.alert('Success', 'Review deleted successfully');
      fetchReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      Alert.alert('Error', 'Failed to delete review');
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      {reviews.length > 0 && (
        <RatingStatsCard
          averageRating={averageRating}
          totalReviews={reviews.length}
          breakdown={breakdown}
        />
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons
        name="chatbubbles-outline"
        size={64}
        color={colors.placeholder}
      />
      <ThemedText type="body-large" style={styles.emptyText}>
        No reviews yet
      </ThemedText>
      <ThemedText type="body-medium" style={styles.emptySubtext}>
        Be the first to share your experience
      </ThemedText>
    </View>
  );

  if (loading) {
    return (
      <PageContainer style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </PageContainer>
    );
  }

  return (
    <>
      <PageContainer style={{ paddingTop: 0, marginBottom: 40 }}>
        <FlatList
          data={reviews}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyState}
          renderItem={({ item }) => (
            <ReviewCard
              review={item}
              currentUserId={user?.id}
              onEdit={handleEditReview}
              onDelete={handleDeleteReview}
            />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      </PageContainer>

      {user && (
        <AddReview
          visible={showAddReview}
          onClose={() => {
            setShowAddReview(false);
            setEditingReview(null);
          }}
          onSubmit={handleSubmitReview}
          editReview={editingReview}
          touristId={user.id || ''}
          reviewType="tourist_spot"
          reviewTypeId={reviewTypeId}
        />
      )}

      {/* Login Prompt Modal */}
      <LoginPromptModal
        visible={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        actionName={actionName}
        title="Login to Leave a Review"
        message="Sign in to share your experience and help other travelers."
      />
    </>
  );
};

export default Ratings;

const styles = StyleSheet.create({
  header: {},
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
    marginBottom: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 20,
    minHeight: 300,
  },
  emptyText: {
    marginTop: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtext: {
    marginTop: 8,
    opacity: 0.6,
    textAlign: 'center',
  },
});