import axios from "axios";
import type { Business } from "@/src/types/Business";

import api from "@/src/services/api";
/** Get stored Business ID */
export const getStoredBusinessId = (): string | null => {
  return localStorage.getItem("selectedBusinessId");
};

/** Set Business ID */
export const setStoredBusinessId = (id: string) => {
  localStorage.setItem("selectedBusinessId", id);
};

/** Clear stored Business ID */
export const clearStoredBusinessId = () => {
  localStorage.removeItem("selectedBusinessId");
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
