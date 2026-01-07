import apiClient from "./apiClient";

export async function fetchCategoryAndType(id: number) {
  const response = await apiClient.get(`/category-and-type/${id}`);
  return response.data;
}
