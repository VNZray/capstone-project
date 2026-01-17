import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { colors } from '@/constants/color';
import { Ionicons } from '@expo/vector-icons';
import PageContainer from '@/components/PageContainer';
import RatingStatsCard from '@/components/reviews/RatingStatsCard';
import ReviewCard from '@/components/reviews/ReviewCard';
import { AddReview } from '@/components/reviews';
import LoginPromptModal from '@/components/LoginPromptModal';
import FeedbackService from '@/services/FeedbackService';
import { useAuth } from '@/context/AuthContext';
import { useRequireAuthWithModal } from '@/hooks/useRequireAuth';
import type { CreateReviewPayload, ReviewWithAuthor } from '@/types/Feedback';

type RatingBreakdown = {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
};

type Props = {
  eventId: string;
  onRefreshRequested?: () => void;
  refreshKey?: number;
};

const EventRatings = ({ eventId, onRefreshRequested, refreshKey }: Props) => {
  const { user } = useAuth();
  const { checkAuth, showLoginPrompt, setShowLoginPrompt, actionName } =
    useRequireAuthWithModal();

  const [reviews, setReviews] = useState<ReviewWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddReview, setShowAddReview] = useState(false);
  const [editingReview, setEditingReview] = useState<ReviewWithAuthor | null>(null);

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
    if (!eventId) {
      setLoading(false);
      return;
    }

    try {
      const data = await FeedbackService.getBusinessReviews(eventId, 'event');
      setReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      Alert.alert('Error', 'Failed to load reviews');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [eventId]);

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
        await FeedbackService.updateReview(editingReview.id, {
          rating: payload.rating,
          message: payload.message,
        });
        Alert.alert('Success', 'Review updated successfully');
      } else {
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
      <Ionicons name="chatbubbles-outline" size={64} color={colors.placeholder} />
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
          reviewType="event"
          reviewTypeId={eventId}
        />
      )}

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

export default EventRatings;

const styles = StyleSheet.create({
  header: {},
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
