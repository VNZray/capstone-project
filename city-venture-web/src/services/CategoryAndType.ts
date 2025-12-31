/**
 * Category And Type Service
 * Handles category and type lookups
 * Updated to use new backend v1 API endpoints
 */
import apiClient from "./apiClient";
import type { Category, CategoryTree } from "@/src/types/Category";

/** Fetch category by ID */
export async function fetchCategoryById(id: number): Promise<Category> {
  const { data } = await apiClient.get<Category>(`/categories/${id}`);
  return data;
}

/** Fetch all categories */
export async function fetchAllCategories(): Promise<Category[]> {
  const { data } = await apiClient.get<Category[]>(`/categories`);
  return Array.isArray(data) ? data : [];
}

/** Fetch category tree */
export async function fetchCategoryTree(
  applicableTo?: string
): Promise<CategoryTree[]> {
  const { data } = await apiClient.get<CategoryTree[]>(`/categories/tree`, {
    params: applicableTo ? { applicable_to: applicableTo } : undefined,
  });
  return Array.isArray(data) ? data : [];
}

/** Fetch children of a category */
export async function fetchCategoryChildren(
  parentId: number
): Promise<Category[]> {
  const { data } = await apiClient.get<Category[]>(
    `/categories/${parentId}/children`
  );
  return Array.isArray(data) ? data : [];
}

/** Legacy alias for backward compatibility */
export const fetchCategoryAndType = fetchCategoryById;
