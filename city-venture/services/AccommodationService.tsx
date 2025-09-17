import type { Business } from "@/types/Business";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";

import api from "@/services/api";
/** Get stored Business ID */
export const getStoredBusinessId = async (): Promise<string | null> => {
  return await AsyncStorage.getItem("selectedBusinessId");
};

/** Set Business ID */
export const setStoredBusinessId = async (id: string) => {
  await AsyncStorage.setItem("selectedBusinessId", id);
};

/** Clear stored Business ID */
export const clearStoredBusinessId = async () => {
  await AsyncStorage.removeItem("selectedBusinessId");
};

/** Fetch Business Details from API */
export const fetchAllBusinessDetails = async (): Promise<Business[]> => {
  const { data } = await axios.get<Business[]>(`${api}/business`);
  return data;
};

/** Fetch Business Details from API */
export const fetchBusinessDetails = async (
  business_id: string
): Promise<Business> => {
  const { data } = await axios.get<Business>(`${api}/business/${business_id}`);
  return data;
};

export const fetchBusinessesByOwner = async (
  owner_id: string
): Promise<Business[]> => {
  const { data } = await axios.get(`${api}/business/owner/${owner_id}`);
  return Array.isArray(data) ? data : [data]; // ensure it's always an array
};

export { api };

