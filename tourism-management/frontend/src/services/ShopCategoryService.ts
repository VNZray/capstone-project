import apiClient from "./apiClient";
import type {
  ShopCategory,
  CreateShopCategoryPayload,
  UpdateShopCategoryPayload,
  ShopCategoryStats,
} from "@/src/types/ShopCategory";

// Utility to normalize array responses
const normalizeArrayResponse = <T,>(data: T[] | T[][] | any): T[] => {
  if (!data) return [];
  if (Array.isArray(data)) {
    // If it's an array of arrays, take the first array
    if (data.length > 0 && Array.isArray(data[0])) {
      return data[0] as T[];
    }
    return data as T[];
  }
  return [];
};

// ==================== SHOP CATEGORY API ====================

/**
 * Get all shop categories
 */
export const fetchAllShopCategories = async (): Promise<ShopCategory[]> => {
  try {
    const { data } = await apiClient.get<ShopCategory[]>(`/shop-categories`);
    return normalizeArrayResponse<ShopCategory>(data);
  } catch (error) {
    console.error("Error fetching all shop categories:", error);
    throw error;
  }
};

/**
 * Get shop categories by business ID
 */
export const fetchShopCategoriesByBusinessId = async (
  businessId: string
): Promise<ShopCategory[]> => {
  try {
    const { data } = await apiClient.get<ShopCategory[]>(
      `/shop-categories/business/${businessId}`
    );
    return normalizeArrayResponse<ShopCategory>(data);
  } catch (error) {
    console.error("Error fetching shop categories by business:", error);
    throw error;
  }
};

/**
 * Get shop categories by business ID and type
 * @param businessId - The business ID
 * @param type - Filter by category type ('product', 'service', or 'both')
 */
export const fetchShopCategoriesByBusinessIdAndType = async (
  businessId: string,
  type: 'product' | 'service' | 'both'
): Promise<ShopCategory[]> => {
  try {
    const { data } = await apiClient.get<ShopCategory[]>(
      `/shop-categories/business/${businessId}/filter?type=${type}`
    );
    return normalizeArrayResponse<ShopCategory>(data);
  } catch (error) {
    console.error("Error fetching shop categories by type:", error);
    throw error;
  }
};

/**
 * Get shop category by ID
 */
export const fetchShopCategoryById = async (id: string): Promise<ShopCategory> => {
  try {
    const { data } = await apiClient.get<ShopCategory>(`/shop-categories/${id}`);
    return data;
  } catch (error) {
    console.error("Error fetching shop category by ID:", error);
    throw error;
  }
};

/**
 * Create a new shop category
 */
export const createShopCategory = async (
  payload: CreateShopCategoryPayload
): Promise<ShopCategory> => {
  try {
    const { data } = await apiClient.post<{ data: ShopCategory }>(
      `/shop-categories`,
      payload
    );
    return data.data;
  } catch (error) {
    console.error("Error creating shop category:", error);
    throw error;
  }
};

/**
 * Update a shop category
 */
export const updateShopCategory = async (
  id: string,
  payload: UpdateShopCategoryPayload
): Promise<ShopCategory> => {
  try {
    const { data } = await apiClient.put<{ data: ShopCategory }>(
      `/shop-categories/${id}`,
      payload
    );
    return data.data;
  } catch (error) {
    console.error("Error updating shop category:", error);
    throw error;
  }
};

/**
 * Delete a shop category
 */
export const deleteShopCategory = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/shop-categories/${id}`);
  } catch (error) {
    console.error("Error deleting shop category:", error);
    throw error;
  }
};

/**
 * Get shop category statistics for a business
 * Returns categories with product and service counts
 */
export const fetchShopCategoryStats = async (
  businessId: string
): Promise<ShopCategoryStats[]> => {
  try {
    const { data } = await apiClient.get<ShopCategoryStats[]>(
      `/shop-categories/business/${businessId}/stats`
    );
    return normalizeArrayResponse<ShopCategoryStats>(data);
  } catch (error) {
    console.error("Error fetching shop category stats:", error);
    throw error;
  }
};
