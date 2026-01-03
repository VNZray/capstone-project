
import apiClient from '@/services/apiClient';
import type { Promotion } from '@/types/Promotion';

/**
 * Fetch all active promotions for a specific business
 * GET /api/promotions/business/:businessId
 */
export const fetchPromotionsByBusinessId = async (businessId: string): Promise<Promotion[]> => {
  try {
    console.log('[PromotionService] Fetching promotions for business:', businessId);
    const { data } = await apiClient.get<Promotion[]>(
      `/promotions/business/${businessId}`
    );

    console.log('[PromotionService] Raw promotions from API:', data);
    console.log('[PromotionService] Total promotions received:', data?.length || 0);

    // Log each promotion's details
    data?.forEach((promo, index) => {
      console.log(`[PromotionService] Promotion ${index + 1}:`, {
        id: promo.id,
        title: promo.title,
        promo_type: promo.promo_type,
        is_active: promo.is_active,
        discount_percentage: promo.discount_percentage,
        start_date: promo.start_date,
        end_date: promo.end_date,
      });
    });

    // Return ALL promotions - let components do their own filtering
    // This allows components to have full control over validation logic
    return data || [];
  } catch (error) {
    console.error('[PromotionService] fetchPromotionsByBusinessId error:', error);
    return []; // Return empty array instead of throwing
  }
};

/**
 * Fetch single promotion by ID
 * GET /api/promotions/:id
 */
export const fetchPromotionById = async (promotionId: string): Promise<Promotion> => {
  try {
    const { data } = await apiClient.get<Promotion>(
      `/promotions/${promotionId}`
    );
    return data;
  } catch (error) {
    console.error('[PromotionService] fetchPromotionById error:', error);
    throw error;
  }
};
