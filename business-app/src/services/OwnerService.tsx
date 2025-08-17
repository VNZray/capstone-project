// ownerService.tsx

import axios from "axios";
import api from "@/src/services/api";
import type { Owner } from "../types/Owner";
/** Fetch Owner Details */
export const fetchOwnerDetails = async (owner_id: string) => {
  const { data } = await axios.get(`${api}/owner/${owner_id}`);
  return data; // { id, first_name, last_name, ... }
};

/** Insert new Owner */
export const insertOwner = async (
  owner: Omit<Owner, "id"> // exclude id because backend generates it
): Promise<Owner> => {
  const { data } = await axios.post<Owner>(`${api}/owner`, owner);
  return data;
};
