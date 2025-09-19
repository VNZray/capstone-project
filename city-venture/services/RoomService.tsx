import api from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import type { Room } from '../types/Business';

/** Get stored Room ID */
export const getStoredRoomId = async (): Promise<string | null> => {
  return await AsyncStorage.getItem('selectedRoomId');
};

/** Set Room ID */
export const setStoredRoomId = async (id: string) => {
  await AsyncStorage.setItem('selectedRoomId', id);
};

/** Clear stored Room ID */
export const clearStoredRoomId = async () => {
  await AsyncStorage.removeItem('selectedRoomId');
};

/** Fetch Room Details from API */
export const fetchRoomDetails = async (room_id: string): Promise<Room> => {
  const { data } = await axios.get<Room>(`${api}/room/profile/${room_id}`);
  return data;
};

/** Fetch Rooms by Business ID */
export async function fetchRoomsByBusinessId(
  businessId: string
): Promise<Room[]> {
  const { data } = await axios.get(`${api}/room/${businessId}`);
  return Array.isArray(data) ? data : [data];
}

export { api };

