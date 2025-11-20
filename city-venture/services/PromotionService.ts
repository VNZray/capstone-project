
import axios from 'axios';
import api from '@/services/api';
import { getToken } from '@/utils/secureStorage';
import type { Promotion } from '@/types/Promotion';

/**
 * Helper function to get authorized axios instance
 */
const getAuthAxios = async () => {
  const token = await getToken();
  return axios.create({
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
};

/**
 * Fetch all active promotions for a specific business
 * GET /api/promotions/business/:businessId
 */
export const fetchPromotionsByBusinessId = async (businessId: string): Promise<Promotion[]> => {
  try {
    const authAxios = await getAuthAxios();
    const { data } = await authAxios.get<Promotion[]>(
      `${api}/promotions/business/${businessId}`
    );
    
    // Filter only active promotions
    const now = new Date();
    return data.filter(promo => {
      if (!promo.is_active) return false;
      
      const startDate = new Date(promo.start_date);
      if (startDate > now) return false; // Not started yet
      
      if (promo.end_date) {
        const endDate = new Date(promo.end_date);
        if (endDate < now) return false; // Already ended
      }
      
      return true;
    });
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
    const authAxios = await getAuthAxios();
    const { data } = await authAxios.get<Promotion>(
      `${api}/promotions/${promotionId}`
    );
    return data;
  } catch (error) {
    console.error('[PromotionService] fetchPromotionById error:', error);
    throw error;
  }
};
