import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '@/services/apiClient';
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
  const { data } = await apiClient.get<Room>(`/room/profile/${room_id}`);
  return data;
};

/** Fetch Rooms by Business ID */
export async function fetchRoomsByBusinessId(
  businessId: string,
  opts?: { noCache?: boolean }
): Promise<Room[]> {
  const cacheSuffix = opts?.noCache ? `?ts=${Date.now()}` : '';
  const { data } = await apiClient.get(`/room/${businessId}${cacheSuffix}` , {
    headers: opts?.noCache
      ? {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
          Expires: '0',
        }
      : undefined,
  });
  return Array.isArray(data) ? data : [data];
}
