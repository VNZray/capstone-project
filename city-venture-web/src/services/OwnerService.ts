/**
 * Owner Service
 * Handles owner profile management
 * Updated to use new backend v1 API endpoints
 */
import apiClient from "./apiClient";
import type { Owner } from "../types/Owner";

/** Fetch Owner Details by owner ID */
export const fetchOwnerDetails = async (owner_id: string): Promise<Owner> => {
  const { data } = await apiClient.get<Owner>(`/owners/${owner_id}`);
  return data;
};

/** Fetch Owner by user_id */
export const fetchOwnerByUserId = async (
  user_id: string
): Promise<Owner | null> => {
  const { data } = await apiClient.get<Owner>(`/owners/user/${user_id}`);
  // Backend may return an array or a single object depending on controller
  return Array.isArray(data) ? (data.length > 0 ? data[0] : null) : data;
};

/** Insert new Owner */
export const insertOwner = async (owner: Omit<Owner, "id">): Promise<Owner> => {
  const { data } = await apiClient.post<Owner>(`/owners`, owner);
  return data;
};

/** Update Owner by ID */
export const updateOwner = async (
  owner_id: string,
  owner: Partial<Owner>
): Promise<Owner> => {
  const { data } = await apiClient.put<Owner>(`/owners/${owner_id}`, owner);
  return data;
};
