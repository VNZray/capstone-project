import axios from 'axios';
import api from '@/services/api';
import { getToken } from '@/utils/secureStorage';

export interface ProductReviewStats {
  product_id: string;
  product_name: string;
  total_reviews: number;
  average_rating: string;
  rating_1_count: number;
  rating_2_count: number;
  rating_3_count: number;
  rating_4_count: number;
  rating_5_count: number;
}

export interface BusinessReviewStats {
  overall_statistics: {
    business_id: string;
    business_name: string;
    total_reviews: number;
    average_rating: string;
    total_products_reviewed: number;
  };
  product_statistics: ProductReviewStats[];
}

export interface ProductReview {
  id: string;
  product_id: string;
  user_id: string;
  order_id?: string;
  rating: number;
  review_title?: string;
  review_text?: string;
  is_verified_purchase: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

const getAuthAxios = async () => {
  const token = await getToken();
  return axios.create({
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
};

/**
 * Fetch business review statistics
 * GET /api/product-reviews/business/:businessId/stats
 */
export const fetchBusinessReviewStats = async (
  businessId: string
): Promise<BusinessReviewStats | null> => {
  try {
    const authAxios = await getAuthAxios();
    const { data } = await authAxios.get<BusinessReviewStats>(
      `${api}/product-reviews/business/${businessId}/stats`
    );
    return data;
  } catch (error) {
    console.error('[ProductReviewService] fetchBusinessReviewStats error:', error);
    return null;
  }
};

/**
 * Fetch reviews for a business
 * GET /api/product-reviews/business/:businessId
 */
export const fetchReviewsByBusinessId = async (
  businessId: string
): Promise<ProductReview[]> => {
  try {
    const authAxios = await getAuthAxios();
    const { data } = await authAxios.get<ProductReview[]>(
      `${api}/product-reviews/business/${businessId}`
    );
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('[ProductReviewService] fetchReviewsByBusinessId error:', error);
    return [];
  }
};

/**
 * Fetch reviews for a specific product
 * GET /api/product-reviews/product/:productId
 */
export const fetchReviewsByProductId = async (
  productId: string
): Promise<ProductReview[]> => {
  try {
    const authAxios = await getAuthAxios();
    const { data } = await authAxios.get<ProductReview[]>(
      `${api}/product-reviews/product/${productId}`
    );
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('[ProductReviewService] fetchReviewsByProductId error:', error);
    return [];
  }
};

/**
 * Create a new product review
 * POST /api/product-reviews
 */
export const createProductReview = async (reviewData: {
  product_id: string;
  user_id: string;
  order_id?: string;
  rating: number;
  review_title?: string;
  review_text?: string;
  is_verified_purchase?: boolean;
}): Promise<ProductReview | null> => {
  try {
    const authAxios = await getAuthAxios();
    const { data } = await authAxios.post<{ data: ProductReview }>(
      `${api}/product-reviews`,
      reviewData
    );
    return data.data;
  } catch (error) {
    console.error('[ProductReviewService] createProductReview error:', error);
    throw error;
  }
};
