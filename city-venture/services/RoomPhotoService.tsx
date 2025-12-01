import apiClient from './apiClient';

export interface RoomPhoto {
  id: string;
  room_id: string;
  file_url: string;
  file_format?: string;
  file_size?: number;
  created_at?: Date;
}

/**
 * Fetch all photos for a specific room
 */
export const fetchRoomPhotosByRoomId = async (roomId: string): Promise<RoomPhoto[]> => {
  try {
    const response = await apiClient.get(`/room-photos/room/${roomId}`);
    return response.data || [];
  } catch (error) {
    console.error('Failed to fetch room photos:', error);
    return [];
  }
};

/**
 * Fetch a single room photo by ID
 */
export const fetchRoomPhotoById = async (photoId: string): Promise<RoomPhoto | null> => {
  try {
    const response = await apiClient.get(`/room-photos/${photoId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch room photo:', error);
    return null;
  }
};
