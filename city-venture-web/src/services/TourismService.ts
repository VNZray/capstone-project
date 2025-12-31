// TourismService.tsx
// Handles tourism staff profile management

import apiClient from "./apiClient";
import type { Tourism } from "@/src/types/Tourism";

/** Fetch Tourism Details by ID */
export const fetchTourismDetails = async (
  tourism_id: string
): Promise<Tourism> => {
  const { data } = await apiClient.get<Tourism>(`/tourism/${tourism_id}`);
  return data;
};

/** Fetch Tourism by User ID */
export const fetchTourismByUserId = async (
  user_id: string
): Promise<Tourism> => {
  const { data } = await apiClient.get<Tourism>(`/tourism/user/${user_id}`);
  return data;
};

/** Insert new Tourism */
export const insertTourism = async (
  tourism: Omit<Tourism, "id">
): Promise<Tourism> => {
  const { data } = await apiClient.post<Tourism>(`/tourism`, tourism);
  return data;
};

/** Update Tourism */
export const updateTourism = async (
  tourism_id: string,
  tourism: Partial<Tourism>
): Promise<Tourism> => {
  const { data } = await apiClient.put<Tourism>(
    `/tourism/${tourism_id}`,
    tourism
  );
  return data;
};

/** Local storage helpers for selected tourism context */
export const getStoredTourismId = async (): Promise<string | null> => {
  return localStorage.getItem("selectedTourismId");
};

export const setStoredTourismId = async (id: string) => {
  localStorage.setItem("selectedTourismId", id);
};

export const clearStoredTourismId = async () => {
  localStorage.removeItem("selectedTourismId");
};
