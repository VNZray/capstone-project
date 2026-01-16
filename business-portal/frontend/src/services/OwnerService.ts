// ownerService.tsx

import apiClient from "./apiClient";
import type { Owner } from "../types/Owner";
/** Fetch Owner Details */
export const fetchOwnerDetails = async (owner_id: string) => {
  const { data } = await apiClient.get(`/owner/${owner_id}`);
  return data; // { id, first_name, last_name, ... }
};

/** Fetch Owner by user_id */
export const fetchOwnerByUserId = async (user_id: string) => {
  const { data } = await apiClient.get(`/owner/user/${user_id}`);
  // Backend may return an array or a single object depending on controller
  return Array.isArray(data) ? (data.length > 0 ? data[0] : null) : data;
};

/** Insert new Owner */
export const insertOwner = async (
  owner: Omit<Owner, "id"> // exclude id because backend generates it
): Promise<Owner> => {
  const { data } = await apiClient.post<Owner>(`/owner`, owner);
  return data;
};
