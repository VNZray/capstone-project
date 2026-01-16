import apiClient from './apiClient';
import type {
  Discount,
  DiscountStats,
  CreateDiscountPayload,
  UpdateDiscountPayload,
  ValidateDiscountPayload,
  ValidateDiscountResponse,
} from '@/src/types/Discount';

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

// ==================== DISCOUNT MANAGEMENT ====================

/** Update expired discounts in database (auto-mark as expired if end_datetime has passed) */
export const updateExpiredDiscounts = async (): Promise<void> => {
  try {
    await apiClient.post(`/discounts/maintenance/update-expired`);
  } catch (error) {
    // Silently fail - this is a maintenance operation
    console.warn("Failed to update expired discounts:", error);
  }
};

/** Get all discounts */
export const fetchAllDiscounts = async (): Promise<Discount[]> => {
  // First, update expired discounts in database
  await updateExpiredDiscounts();
  
  const { data } = await apiClient.get<Discount[]>(`/discounts`);
  return normalizeArrayResponse<Discount>(data);
};

/** Get discounts by business ID */
export const fetchDiscountsByBusinessId = async (
  businessId: string
): Promise<Discount[]> => {
  // First, update expired discounts in database
  await updateExpiredDiscounts();
  
  const { data } = await apiClient.get<Discount[]>(
    `/discounts/business/${businessId}`
  );
  return normalizeArrayResponse<Discount>(data);
};

/** Get active discounts by business ID */
export const fetchActiveDiscountsByBusinessId = async (
  businessId: string
): Promise<Discount[]> => {
  // First, update expired discounts in database
  await updateExpiredDiscounts();
  
  const { data } = await apiClient.get<Discount[]>(
    `/discounts/business/${businessId}/active`
  );
  return normalizeArrayResponse<Discount>(data);
};

/** Get discount by ID */
export const fetchDiscountById = async (discountId: string): Promise<Discount> => {
  const { data } = await apiClient.get<Discount>(`/discounts/${discountId}`);
  return data;
};

/** Create discount */
export const createDiscount = async (
  payload: CreateDiscountPayload
): Promise<Discount> => {
  const { data } = await apiClient.post<{ message: string; data: Discount }>(
    `/discounts`,
    payload
  );
  return data.data;
};

/** Update discount */
export const updateDiscount = async (
  discountId: string,
  payload: UpdateDiscountPayload
): Promise<Discount> => {
  const { data } = await apiClient.put<{ message: string; data: Discount }>(
    `/discounts/${discountId}`,
    payload
  );
  return data.data;
};

/** Delete discount */
export const deleteDiscount = async (discountId: string): Promise<void> => {
  await apiClient.delete(`/discounts/${discountId}`);
};

// ==================== DISCOUNT VALIDATION & USAGE ====================

/** Validate discount for order */
export const validateDiscount = async (
  discountId: string,
  payload: ValidateDiscountPayload
): Promise<ValidateDiscountResponse> => {
  const { data } = await apiClient.post<ValidateDiscountResponse>(
    `/discounts/${discountId}/validate`,
    payload
  );
  return data;
};

/** Update discount usage count */
export const updateDiscountUsage = async (discountId: string): Promise<void> => {
  await apiClient.put(`/discounts/${discountId}/usage`);
};

/** Get discount statistics */
export const fetchDiscountStats = async (
  discountId: string
): Promise<DiscountStats> => {
  const { data } = await apiClient.get<DiscountStats>(
    `/discounts/${discountId}/stats`
  );
  return data;
};
