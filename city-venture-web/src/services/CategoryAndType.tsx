import apiClient from "./apiClient";

export async function fetchCategoryAndType(id: number) {
  const response = await apiClient.get(`/category-and-type/${id}`);
  return response.data;
}

export interface CategoryTree {
  id: number;
  parent_category: number | null;
  alias: string;
  title: string;
  description: string | null;
  applicable_to: string;
  status: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export async function fetchCategoryTree(applicableTo?: string) {
  const params = applicableTo ? `?applicable_to=${applicableTo}` : "";
  const response = await apiClient.get(
    `/category-and-type/categories/tree${params}`
  );
  return response.data;
}

export async function fetchCategoryChildren(parentId: number) {
  const response = await apiClient.get(
    `/category-and-type/categories/${parentId}/children`
  );
  return response.data;
}
