import { apiService } from "@/src/utils/api";
import type { TouristSpot } from "@/src/types/TouristSpot";

const STORAGE_KEY = "selectedTouristSpotId";

export const getStoredTouristSpotId = async (): Promise<string | null> => {
  return localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
};

export const setStoredTouristSpotId = (id: string, remember = true): void => {
  // Mirror BusinessService behavior: persist to localStorage by default
  const primary = remember ? localStorage : sessionStorage;
  const secondary = remember ? sessionStorage : localStorage;
  primary.setItem(STORAGE_KEY, id);
  secondary.removeItem(STORAGE_KEY);
};

export const clearStoredTouristSpotId = (): void => {
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
};

export const fetchTouristSpotDetails = async (id: string): Promise<TouristSpot> => {
  const data = await apiService.getTouristSpotById(id);
  return data;
};

export default {
  getStoredTouristSpotId,
  setStoredTouristSpotId,
  clearStoredTouristSpotId,
  fetchTouristSpotDetails,
};
