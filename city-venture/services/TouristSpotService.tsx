import api from '@/services/api';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  TouristSpot,
  TouristSpotCategoriesAndTypes,
  TouristSpotImage,
  TouristSpotLocationData,
  TouristSpotSchedule,
  TouristSpotCategory,
} from '@/types/TouristSpot';

const STORAGE_KEY_SELECTED_SPOT = 'selectedTouristSpotId';

export const getStoredTouristSpotId = async (): Promise<string | null> => {
  return AsyncStorage.getItem(STORAGE_KEY_SELECTED_SPOT);
};

export const setStoredTouristSpotId = async (id: string) => {
  await AsyncStorage.setItem(STORAGE_KEY_SELECTED_SPOT, id);
};

export const clearStoredTouristSpotId = async () => {
  await AsyncStorage.removeItem(STORAGE_KEY_SELECTED_SPOT);
};

// Fetch all tourist spots (GET /api/tourist-spots)
export const fetchAllTouristSpots = async (): Promise<TouristSpot[]> => {
  const { data } = await axios.get(`${api}/tourist-spots`);
  return data?.data || [];
};

// Fetch single tourist spot by id
export const fetchTouristSpotById = async (id: string): Promise<TouristSpot> => {
  const { data } = await axios.get(`${api}/tourist-spots/${id}`);
  return data?.data;
};

// Fetch categories and types
export const fetchTouristSpotCategoriesAndTypes = async (): Promise<TouristSpotCategoriesAndTypes> => {
  const { data } = await axios.get(`${api}/tourist-spots/categories-types`);
  return data?.data || { types: [], categories: [] };
};

// Fetch location data (all provinces/municipalities/barangays)
export const fetchTouristSpotLocationData = async (): Promise<TouristSpotLocationData> => {
  const { data } = await axios.get(`${api}/tourist-spots/location-data`);
  return data?.data || { provinces: [], municipalities: [], barangays: [] };
};

export const fetchMunicipalitiesByProvince = async (province_id: number) => {
  const { data } = await axios.get(`${api}/tourist-spots/municipalities/${province_id}`);
  return data?.data || [];
};

export const fetchBarangaysByMunicipality = async (municipality_id: number) => {
  const { data } = await axios.get(`${api}/tourist-spots/barangays/${municipality_id}`);
  return data?.data || [];
};

// Categories for a tourist spot
export const fetchTouristSpotCategories = async (id: string): Promise<TouristSpotCategory[]> => {
  const { data } = await axios.get(`${api}/tourist-spots/${id}/categories`);
  return data?.data || [];
};

// Schedules
export const fetchTouristSpotSchedules = async (id: string): Promise<TouristSpotSchedule[]> => {
  const { data } = await axios.get(`${api}/tourist-spots/${id}/schedules`);
  return data?.data || [];
};

// Images
export const fetchTouristSpotImages = async (id: string): Promise<TouristSpotImage[]> => {
  const { data } = await axios.get(`${api}/tourist-spots/${id}/images`);
  return data?.data || [];
};
export { api };
