
import apiClient from '@/services/apiClient';
import type { Review, ReviewFormData, ReviewSummary } from '@/types/Review';

/**
 * Fetch all reviews for a specific business
 * GET /api/reviews/business/:businessId
 */
export const fetchReviewsByBusinessId = async (businessId: string): Promise<Review[]> => {
  try {
    const { data } = await apiClient.get<Review[]>(
      `/reviews/business/${businessId}`
    );
    
    // Sort by date DESC (newest first)
    return data.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  } catch (error) {
    console.error('[ReviewService] fetchReviewsByBusinessId error:', error);
    return []; // Return empty array instead of throwing
  }
};

/**
 * Fetch review summary/statistics for a business
 * GET /api/reviews/business/:businessId/summary
 */
export const fetchReviewSummary = async (businessId: string): Promise<ReviewSummary> => {
  try {
    const { data } = await apiClient.get<ReviewSummary>(
      `/reviews/business/${businessId}/summary`
    );
    return data;
  } catch (error) {
    console.error('[ReviewService] fetchReviewSummary error:', error);
    // Return default summary if fetch fails
    return {
      average_rating: 0,
      total_reviews: 0,
      rating_breakdown: {
        '5': 0,
        '4': 0,
        '3': 0,
        '2': 0,
        '1': 0,
      },
    };
  }
};

/**
 * Create a new review
 * POST /api/reviews
 */
export const createReview = async (reviewData: ReviewFormData): Promise<Review> => {
  try {
    const { data } = await apiClient.post<Review>(
      `/reviews`,
      reviewData
    );
    return data;
  } catch (error) {
    console.error('[ReviewService] createReview error:', error);
    throw error;
  }
};

/**
 * Mark a review as helpful
 * POST /api/reviews/:id/helpful
 */
export const markReviewHelpful = async (reviewId: string): Promise<void> => {
  try {
    await apiClient.post(`/reviews/${reviewId}/helpful`);
  } catch (error) {
    console.error('[ReviewService] markReviewHelpful error:', error);
    throw error;
  }
};
