/**
 * Tourist Spot Service
 * Handles tourist spot data management
 * Updated to use new backend v1 API endpoints
 */
import apiClient from "./apiClient";
import type { TouristSpot } from "@/src/types/TouristSpot";

const STORAGE_KEY = "selectedTouristSpotId";

export const getStoredTouristSpotId = async (): Promise<string | null> => {
  return localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
};

export const setStoredTouristSpotId = (id: string, remember = true): void => {
  const primary = remember ? localStorage : sessionStorage;
  const secondary = remember ? sessionStorage : localStorage;
  primary.setItem(STORAGE_KEY, id);
  secondary.removeItem(STORAGE_KEY);
};

export const clearStoredTouristSpotId = (): void => {
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
};

/** Fetch tourist spot by ID */
export const fetchTouristSpotDetails = async (id: string): Promise<TouristSpot> => {
  const { data } = await apiClient.get<TouristSpot>(`/tourist-spots/${id}`);
  return data;
};

/** Fetch all tourist spots */
export const fetchAllTouristSpots = async (): Promise<TouristSpot[]> => {
  const { data } = await apiClient.get<TouristSpot[]>(`/tourist-spots`);
  return Array.isArray(data) ? data : [];
};

/** Fetch featured tourist spots */
export const fetchFeaturedTouristSpots = async (): Promise<TouristSpot[]> => {
  const { data } = await apiClient.get<TouristSpot[]>(`/tourist-spots/featured`);
  return Array.isArray(data) ? data : [];
};

/** Fetch tourist spots by category */
export const fetchTouristSpotsByCategory = async (category: string): Promise<TouristSpot[]> => {
  const { data } = await apiClient.get<TouristSpot[]>(`/tourist-spots/category/${category}`);
  return Array.isArray(data) ? data : [];
};

export default {
  getStoredTouristSpotId,
  setStoredTouristSpotId,
  clearStoredTouristSpotId,
  fetchTouristSpotDetails,
  fetchAllTouristSpots,
  fetchFeaturedTouristSpots,
  fetchTouristSpotsByCategory,
};
