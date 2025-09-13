import axios from "axios";
import api from "@/src/services/api";
import type { Room } from "../types/Business";
/** Get stored Room ID */
export const getStoredRoomId = (): string | null => {
  return localStorage.getItem("selectedRoomId");
};

/** Set Room ID */
export const setStoredRoomId = (id: string) => {
  localStorage.setItem("selectedRoomId", id);
};

/** Clear stored Room ID */
export const clearStoredRoomId = () => {
  localStorage.removeItem("selectedRoomId");
};

/** Fetch Room Details from API */
export const fetchRoomDetails = async (room_id: string): Promise<Room> => {
  const { data } = await axios.get<Room>(`${api}/room/profile/${room_id}`);
  return data;
};

/** Fetch Rooms by Business ID */
export const fetchRoomsByBusinessId = async (
  business_id: string
): Promise<Room[]> => {
  const { data } = await axios.get(`${api}/room/${business_id}`);
  return Array.isArray(data) ? data : [data]; // ensure it's always an array
};

export { api };
