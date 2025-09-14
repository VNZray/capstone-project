// ownerService.tsx

import axios from "axios";
import api from "@/src/services/api";
import type { Tourism } from "@/src/types/Tourism";
/** Fetch Tourism Details */
export const fetchTourismDetails = async (tourism_id: string) => {
  const { data } = await axios.get(`${api}/tourism/${tourism_id}`);
  return data; // { id, first_name, last_name, ... }
};

/** Insert new Tourism */
export const insertTourism = async (
  tourism: Omit<Tourism, "id"> // exclude id because backend generates it
): Promise<Tourism> => {
  const { data } = await axios.post<Tourism>(`${api}/tourism`, tourism);
  return data;
};
