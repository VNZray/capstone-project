import type { Room } from '@/types/Business';
import debugLogger from '@/utils/debugLogger';
import type { ReactNode } from 'react';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  clearStoredRoomId,
  fetchRoomDetails,
  fetchRoomsByBusinessId,
  getStoredRoomId,
  setStoredRoomId
} from '../services/RoomService';
import { useAccommodation } from './AccommodationContext';
interface RoomContextType {
  selectedRoomId: string | null;
  roomDetails: Room | null;
  rooms: Room[] | null;
  loading: boolean;
  setRoomId: (id: string) => void;
  clearRoomId: () => void;
  refreshRoom: () => Promise<void>;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

interface RoomProviderProps {
  children: ReactNode;
}

export const RoomProvider: React.FC<RoomProviderProps> = ({ children }) => {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  // Fetch stored room ID on mount
  useEffect(() => {
    const fetchStoredRoomId = async () => {
      const storedId = await getStoredRoomId();
      if (storedId) {
        setSelectedRoomId(storedId);
      }
    };
    fetchStoredRoomId();
  }, []);

  const { selectedAccommodationId } = useAccommodation();
  const [roomDetails, setRoomDetails] = useState<Room | null>(null);
  const [rooms, setRooms] = useState<Room[] | null>(null);
  const [loading, setLoading] = useState(false);

  /** Set the selected room ID and store it locally */
  const setRoomId = useCallback((id: string) => {
    setSelectedRoomId(id);
    setStoredRoomId(id);
  }, []);

  /** Clear selected room */
  const clearRoomId = useCallback(() => {
    setSelectedRoomId(null);
    setRoomDetails(null);
    clearStoredRoomId();
  }, []);

  /** Fetch room details from API */
  const fetchRoom = useCallback(async () => {
    if (!selectedRoomId) return;
    setLoading(true);
    try {
      const data = await fetchRoomDetails(selectedRoomId);
      setRoomDetails(data);
    } catch (e) {
      debugLogger({
        title: 'RoomContext: Failed to fetch room details',
        error: e
      });
    } finally {
      setLoading(false);
    }
  }, [selectedRoomId]);

  /** Fetch rooms for the selected business */
  const fetchRoomsForBusiness = useCallback(async () => {
    if (!selectedAccommodationId) return;
    setLoading(true);
    try {
      const data = await fetchRoomsByBusinessId(selectedAccommodationId);
      setRooms(data);
    } catch (e) {
      debugLogger({
        title: 'RoomContext: Failed to fetch rooms by business id',
        error: e
      });
    } finally {
      setLoading(false);
    }
  }, [selectedAccommodationId]);

  /** Fetch when ID changes */
  // Fetch room details when a specific room is selected
  useEffect(() => {
    if (selectedRoomId) {
      fetchRoom();
    }
  }, [selectedRoomId, fetchRoom]);

  // Fetch room list whenever the selected accommodation changes
  useEffect(() => {
    fetchRoomsForBusiness();
  }, [fetchRoomsForBusiness]);

  return (
    <RoomContext.Provider
      value={{
        selectedRoomId,
        roomDetails,
        rooms,
        loading,
        setRoomId,
        clearRoomId,
        refreshRoom: fetchRoom,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};

export const useRoom = (): RoomContextType => {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRoom must be used within a RoomProvider');
  }
  return context;
};
