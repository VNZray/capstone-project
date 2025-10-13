import axios from 'axios';
import api from '@/src/services/api';
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

/** Get all discounts */
export const fetchAllDiscounts = async (): Promise<Discount[]> => {
  const { data } = await axios.get<Discount[]>(`${api}/discounts`);
  return normalizeArrayResponse<Discount>(data);
};

/** Get discounts by business ID */
export const fetchDiscountsByBusinessId = async (
  businessId: string
): Promise<Discount[]> => {
  const { data } = await axios.get<Discount[]>(
    `${api}/discounts/business/${businessId}`
  );
  return normalizeArrayResponse<Discount>(data);
};

/** Get active discounts by business ID */
export const fetchActiveDiscountsByBusinessId = async (
  businessId: string
): Promise<Discount[]> => {
  const { data } = await axios.get<Discount[]>(
    `${api}/discounts/business/${businessId}/active`
  );
  return normalizeArrayResponse<Discount>(data);
};

/** Get discount by ID */
export const fetchDiscountById = async (discountId: string): Promise<Discount> => {
  const { data } = await axios.get<Discount>(`${api}/discounts/${discountId}`);
  return data;
};

/** Create discount */
export const createDiscount = async (
  payload: CreateDiscountPayload
): Promise<Discount> => {
  const { data } = await axios.post<{ message: string; data: Discount }>(
    `${api}/discounts`,
    payload
  );
  return data.data;
};

/** Update discount */
export const updateDiscount = async (
  discountId: string,
  payload: UpdateDiscountPayload
): Promise<Discount> => {
  const { data } = await axios.put<{ message: string; data: Discount }>(
    `${api}/discounts/${discountId}`,
    payload
  );
  return data.data;
};

/** Delete discount */
export const deleteDiscount = async (discountId: string): Promise<void> => {
  await axios.delete(`${api}/discounts/${discountId}`);
};

// ==================== DISCOUNT VALIDATION & USAGE ====================

/** Validate discount for order */
export const validateDiscount = async (
  discountId: string,
  payload: ValidateDiscountPayload
): Promise<ValidateDiscountResponse> => {
  const { data } = await axios.post<ValidateDiscountResponse>(
    `${api}/discounts/${discountId}/validate`,
    payload
  );
  return data;
};

/** Update discount usage count */
export const updateDiscountUsage = async (discountId: string): Promise<void> => {
  await axios.put(`${api}/discounts/${discountId}/usage`);
};

/** Get discount statistics */
export const fetchDiscountStats = async (
  discountId: string
): Promise<DiscountStats> => {
  const { data } = await axios.get<DiscountStats>(
    `${api}/discounts/${discountId}/stats`
  );
  return data;
};
