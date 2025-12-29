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
  const { data } = await apiClient.get(`/room/${businessId}${cacheSuffix}`, {
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

// ==================== Room Blocked Dates ====================

export type BlockReason = 'Maintenance' | 'Renovation' | 'Private' | 'Seasonal' | 'Other';

export type RoomBlockedDate = {
  id: string;
  room_id: string;
  business_id: string;
  start_date: string;
  end_date: string;
  block_reason: BlockReason;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
};

/**
 * Fetch blocked dates for a specific room
 */
export const fetchBlockedDatesByRoomId = async (roomId: string): Promise<RoomBlockedDate[]> => {
  const { data } = await apiClient.get<RoomBlockedDate[]>(`/room-blocked-dates/room/${roomId}`);
  return Array.isArray(data) ? data : [];
};

/**
 * Fetch blocked dates for a business
 */
export const fetchBlockedDatesByBusinessId = async (businessId: string): Promise<RoomBlockedDate[]> => {
  const { data } = await apiClient.get<RoomBlockedDate[]>(`/room-blocked-dates/business/${businessId}`);
  return Array.isArray(data) ? data : [];
};

/**
 * Generate date markers from blocked dates for calendar display
 */
export const generateBlockedDateMarkers = (blockedDates: RoomBlockedDate[]): Array<{
  date: Date;
  status: 'error';
  label: string;
}> => {
  const markers: Array<{ date: Date; status: 'error'; label: string }> = [];

  blockedDates.forEach((block) => {
    const start = new Date(block.start_date);
    const end = new Date(block.end_date);

    // Generate a marker for each day in the range
    const current = new Date(start);
    while (current <= end) {
      markers.push({
        date: new Date(current),
        status: 'error',
        label: block.block_reason,
      });
      current.setDate(current.getDate() + 1);
    }
  });

  return markers;
};
