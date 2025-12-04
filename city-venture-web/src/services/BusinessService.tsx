import type {
  Business,
  BusinessDetails,
} from '@/src/types/Business';

import apiClient from './apiClient';
import type { Address } from '@/src/types/Address';
import type { Category, CategoryTree, EntityCategory } from '@/src/types/Category';

/** Get stored Business ID */
export const getStoredBusinessId = async (): Promise<string | null> => {
  return localStorage.getItem('selectedBusinessId');
};

/** Set Business ID */
export const setStoredBusinessId = async (id: string) => {
   localStorage.setItem('selectedBusinessId', id);
};

/** Clear stored Business ID */
export const clearStoredBusinessId = async () => {
   localStorage.removeItem('selectedBusinessId');
};

/** Fetch All Listed Business Details from API */
export const fetchAllBusinessDetails = async (): Promise<Business[]> => {
  const { data } = await apiClient.get<Business[]>(`/business`);
  return data;
};

/** Fetch Specific Business Details from API */
export const fetchBusinessDetails = async (
  business_id: string
): Promise<Business> => {
  const { data } = await apiClient.get<Business>(`/business/${business_id}`);
  return data;
};

export const fetchBusinessesByOwner = async (
  owner_id: string
): Promise<Business[]> => {
  const { data } = await apiClient.get(`/business/owner/${owner_id}`);
  return Array.isArray(data) ? data : [data]; // ensure it's always an array
};

// ==================== HIERARCHICAL CATEGORY FUNCTIONS ====================

/** Fetch all hierarchical categories with optional filters */
export const fetchCategories = async (params?: {
  applicable_to?: 'business' | 'tourist_spot' | 'event';
  status?: 'active' | 'inactive';
  parent_id?: number | 'root';
}): Promise<Category[]> => {
  const { data } = await apiClient.get<Category[]>('/category-and-type/categories', { params });
  return data;
};

/** Fetch category tree structure for navigation */
export const fetchCategoryTree = async (
  applicable_to?: 'business' | 'tourist_spot' | 'event'
): Promise<CategoryTree[]> => {
  const { data } = await apiClient.get<CategoryTree[]>('/category-and-type/categories/tree', {
    params: applicable_to ? { applicable_to } : undefined,
  });
  return data;
};

/** Fetch single category by ID */
export const fetchCategoryById = async (id: number): Promise<Category> => {
  const { data } = await apiClient.get<Category>(`/category-and-type/categories/${id}`);
  return data;
};

/** Fetch children of a category */
export const fetchCategoryChildren = async (parentId: number): Promise<Category[]> => {
  const { data } = await apiClient.get<Category[]>(`/category-and-type/categories/${parentId}/children`);
  return data;
};

/** Create a new category */
export const createCategory = async (category: Partial<Category>): Promise<{ id: number }> => {
  const { data } = await apiClient.post<{ id: number }>('/category-and-type/categories', category);
  return data;
};

/** Update a category */
export const updateCategoryService = async (id: number, category: Partial<Category>): Promise<void> => {
  await apiClient.put(`/category-and-type/categories/${id}`, category);
};

/** Delete a category */
export const deleteCategoryService = async (id: number): Promise<void> => {
  await apiClient.delete(`/category-and-type/categories/${id}`);
};

// ==================== ENTITY CATEGORIES FUNCTIONS ====================

/** Get categories for an entity (business, tourist_spot, event) */
export const fetchEntityCategories = async (
  entityType: 'business' | 'tourist_spot' | 'event',
  entityId: string
): Promise<EntityCategory[]> => {
  const { data } = await apiClient.get<EntityCategory[]>(
    `/category-and-type/entity-categories/${entityType}/${entityId}`
  );
  return data;
};

/** Add category to an entity */
export const addEntityCategory = async (
  entityType: 'business' | 'tourist_spot' | 'event',
  entityId: string,
  categoryId: number,
  level?: number,
  isPrimary?: boolean
): Promise<{ id: number }> => {
  const { data } = await apiClient.post<{ id: number }>(
    `/category-and-type/entity-categories/${entityType}/${entityId}`,
    { category_id: categoryId, level, is_primary: isPrimary }
  );
  return data;
};

/** Remove category from an entity */
export const removeEntityCategory = async (
  entityType: 'business' | 'tourist_spot' | 'event',
  entityId: string,
  categoryId: number
): Promise<void> => {
  await apiClient.delete(
    `/category-and-type/entity-categories/${entityType}/${entityId}/${categoryId}`
  );
};

/** Set primary category for an entity */
export const setEntityPrimaryCategory = async (
  entityType: 'business' | 'tourist_spot' | 'event',
  entityId: string,
  categoryId: number
): Promise<void> => {
  await apiClient.put(
    `/category-and-type/entity-categories/${entityType}/${entityId}/${categoryId}/primary`
  );
};

/** Get entities by category */
export const fetchEntitiesByCategory = async (
  categoryId: number,
  entityType?: 'business' | 'tourist_spot' | 'event',
  includeChildren?: boolean
): Promise<{ entity_id: string; entity_type: string; is_primary: boolean; level: number }[]> => {
  const { data } = await apiClient.get(`/category-and-type/categories/${categoryId}/entities`, {
    params: { entity_type: entityType, include_children: includeChildren },
  });
  return data;
};

// ==================== ADDRESS & BUSINESS DATA ====================

export const fetchAddress = async (barangay_id: number): Promise<Address> => {
  const res = await apiClient.get<Address>(`/address/${barangay_id}`);
  return res.data;
};

/** Fetch Complete Business Data with categories from entity_categories */
export const fetchBusinessData = async (
  id: string
): Promise<BusinessDetails> => {
  const business = await fetchBusinessDetails(id);
  const address = await fetchAddress(business.barangay_id);
  
  // Fetch categories from entity_categories
  const categories = await fetchEntityCategories('business', id);
  const primaryCategory = categories.find(c => c.is_primary);

  const businessDetails: BusinessDetails = {
    id: business.id,
    owner_id: business.owner_id ?? '',
    business_name: business.business_name,
    phone_number: business.phone_number ?? '',
    email: business.email,
    address: business.address ?? '',
    description: business.description ?? '',
    instagram_url: business.instagram_url ?? '',
    website_url: business.website_url ?? '',
    facebook_url: business.facebook_url ?? '',
    latitude: business.latitude ?? '',
    longitude: business.longitude ?? '',
    min_price: business.min_price ?? '',
    max_price: business.max_price ?? '',
    status: business.status,
    business_image: business.business_image ?? '',
    hasBooking: business.hasBooking ?? false,
    barangay_id: business.barangay_id,
    province_name: address.province_name ?? '',
    municipality_name: address.municipality_name ?? '',
    barangay_name: address.barangay_name ?? '',
    categories: categories,
    primary_category: primaryCategory?.category_title ?? categories[0]?.category_title ?? '',
  };

  return businessDetails;
};


