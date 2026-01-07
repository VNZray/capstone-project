import apiClient from '@/services/apiClient';
import type { Business, BusinessDetails } from '@/types/Business';
import type { Address } from '@/types/Address';
import type { Category, CategoryTree, EntityCategory, EntityType } from '@/types/Category';

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

/** Fetch Businesses by Owner */
export const fetchBusinessesByOwner = async (
  owner_id: string
): Promise<Business[]> => {
  const { data } = await apiClient.get(`/business/owner/${owner_id}`);
  return Array.isArray(data) ? data : [data];
};

// ==================== HIERARCHICAL CATEGORY FUNCTIONS ====================

/** Fetch all hierarchical categories */
export const fetchCategories = async (params?: {
  applicable_to?: EntityType;
  status?: 'active' | 'inactive';
  parent_id?: number | 'root';
}): Promise<Category[]> => {
  const { data } = await apiClient.get<Category[]>('/category-and-type/categories', { params });
  return data;
};

/** Fetch category tree structure */
export const fetchCategoryTree = async (
  applicable_to?: EntityType
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

/** Get categories for an entity */
export const fetchEntityCategories = async (
  entityType: EntityType,
  entityId: string
): Promise<EntityCategory[]> => {
  const { data } = await apiClient.get<EntityCategory[]>(
    `/category-and-type/entity-categories/${entityType}/${entityId}`
  );
  return data;
};

/** Add category to an entity */
export const addEntityCategory = async (
  entityType: EntityType,
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
  entityType: EntityType,
  entityId: string,
  categoryId: number
): Promise<void> => {
  await apiClient.delete(
    `/category-and-type/entity-categories/${entityType}/${entityId}/${categoryId}`
  );
};

// ==================== ADDRESS & BUSINESS DATA ====================

/** Fetch Address */
export const fetchAddress = async (barangay_id: number): Promise<Address> => {
  const { data } = await apiClient.get<Address>(`/address/${barangay_id}`);
  return data;
};

/** Fetch Complete Business Data with categories from entity_categories */
export const fetchBusinessData = async (
  id: string
): Promise<BusinessDetails> => {
  const business = await fetchBusinessDetails(id);
  const address = await fetchAddress(business.barangay_id);
  
  // Fetch categories from entity_categories
  const categories = await fetchEntityCategories('business', id);
  const primaryCategory = categories.find(c => c.is_primary) || categories[0];

  const businessDetails: BusinessDetails = {
    id: business.id,
    owner_id: business.owner_id ?? '',
    business_name: business.business_name,
    phone_number: business.phone_number ?? '',
    email: business.email,
    address: business.address ?? '',
    description: business.description ?? '',
    instagram_url: business.instagram_url ?? '',
    x_url: business.x_url ?? '',
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
    categories: categories,
    primary_category: primaryCategory?.category_title ?? '',
    province_name: address.province_name ?? '',
    municipality_name: address.municipality_name ?? '',
    barangay_name: address.barangay_name ?? '',
  };

  return businessDetails;
};
