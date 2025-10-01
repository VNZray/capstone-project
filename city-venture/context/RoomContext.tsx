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
  refreshRooms: (opts?: { force?: boolean }) => Promise<void>;
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
  const fetchRoomsForBusiness = useCallback(async (opts?: { force?: boolean }) => {
    if (!selectedAccommodationId) {
      setRooms(null);
      setSelectedRoomId(null);
      return;
    }
    setLoading(true);
    const currentAccommodation = selectedAccommodationId;
    try {
      const data = await fetchRoomsByBusinessId(currentAccommodation, { noCache: opts?.force });
      // Prevent stale overwrite if accommodation changed mid-fetch
      if (currentAccommodation === selectedAccommodationId) {
        setRooms(data);
      }
    } catch (e) {
      debugLogger({
        title: 'RoomContext: Failed to fetch rooms by business id',
        error: e
      });
      if (currentAccommodation === selectedAccommodationId) {
        setRooms(null);
      }
    } finally {
      if (currentAccommodation === selectedAccommodationId) {
        setLoading(false);
      }
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
    // When accommodation changes, reset selected room and existing list immediately to avoid stale UI
    setRooms(null);
    setSelectedRoomId(null);
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
        refreshRooms: fetchRoomsForBusiness,
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
