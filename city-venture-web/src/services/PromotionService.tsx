import axios from 'axios';
import api from '@/src/services/api';
import type {
  Promotion,
  CreatePromotionPayload,
  UpdatePromotionPayload,
} from '@/src/types/Promotion';

function normalizeArrayResponse<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) {
    if (payload.length === 2 && Array.isArray(payload[0]) && typeof payload[1] === 'object') {
      return normalizeArrayResponse<T>(payload[0]);
    }
    return payload as T[];
  }

  if (payload && typeof payload === 'object') {
    const dataField = (payload as { data?: unknown }).data;
    if (Array.isArray(dataField)) {
      return normalizeArrayResponse<T>(dataField);
    }
    if (dataField && typeof dataField === 'object') {
      const rows = (dataField as { rows?: unknown }).rows;
      if (Array.isArray(rows)) {
        return normalizeArrayResponse<T>(rows);
      }
    }
  }

  return [] as T[];
}

// ==================== PROMOTION MANAGEMENT ====================

/** Update expired promotions in database */
export const updateExpiredPromotions = async (): Promise<void> => {
  try {
    await axios.post(`${api}/promotions/maintenance/update-expired`);
  } catch (error) {
    console.warn("Failed to update expired promotions:", error);
  }
};

/** Get all promotions */
export const fetchAllPromotions = async (): Promise<Promotion[]> => {
  await updateExpiredPromotions();
  const { data } = await axios.get<Promotion[]>(`${api}/promotions`);
  return normalizeArrayResponse<Promotion>(data);
};

/** Get all active promotions */
export const fetchAllActivePromotions = async (): Promise<Promotion[]> => {
  await updateExpiredPromotions();
  const { data } = await axios.get<Promotion[]>(`${api}/promotions/active`);
  return normalizeArrayResponse<Promotion>(data);
};

/** Get promotions by business ID */
export const fetchPromotionsByBusinessId = async (
  businessId: string
): Promise<Promotion[]> => {
  await updateExpiredPromotions();
  const { data } = await axios.get<Promotion[]>(
    `${api}/promotions/business/${businessId}`
  );
  return normalizeArrayResponse<Promotion>(data);
};

/** Get active promotions by business ID */
export const fetchActivePromotionsByBusinessId = async (
  businessId: string
): Promise<Promotion[]> => {
  await updateExpiredPromotions();
  const { data } = await axios.get<Promotion[]>(
    `${api}/promotions/business/${businessId}/active`
  );
  return normalizeArrayResponse<Promotion>(data);
};

/** Get promotion by ID */
export const fetchPromotionById = async (promotionId: string): Promise<Promotion> => {
  const { data } = await axios.get<Promotion | Promotion[]>(`${api}/promotions/${promotionId}`);
  
  // Handle if data is returned as an array
  if (Array.isArray(data)) {
    return data[0];
  }
  
  return data;
};

/** Create promotion */
export const createPromotion = async (
  payload: CreatePromotionPayload
): Promise<Promotion> => {
  const { data } = await axios.post<{ message: string; data: Promotion }>(
    `${api}/promotions`,
    payload
  );
  return data.data;
};

/** Update promotion */
export const updatePromotion = async (
  promotionId: string,
  payload: UpdatePromotionPayload
): Promise<Promotion> => {
  const { data } = await axios.put<{ message: string; data: Promotion }>(
    `${api}/promotions/${promotionId}`,
    payload
  );
  return data.data;
};

/** Delete promotion */
export const deletePromotion = async (promotionId: string): Promise<void> => {
  await axios.delete(`${api}/promotions/${promotionId}`);
};
