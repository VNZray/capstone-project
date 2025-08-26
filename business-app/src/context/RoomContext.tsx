import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import type { ReactNode } from "react";
import type { Room } from "../types/Business";

import {
  clearStoredRoomId,
  fetchRoomDetails,
  getStoredRoomId,
  setStoredRoomId,
} from "../services/RoomService";

interface RoomContextType {
  selectedRoomId: string | null;
  roomDetails: Room | null;
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
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(() =>
    getStoredRoomId()
  );
  const [roomDetails, setRoomDetails] = useState<Room | null>(null);
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
    console.log("Fetched Room Details:", data);
    setRoomDetails(data);
  } catch (error) {
    console.error("Failed to fetch room:", error);
    setRoomDetails(null);
  } finally {
    setLoading(false);
  }
}, [selectedRoomId]);


  /** Fetch when ID changes */
  useEffect(() => {
    if (selectedRoomId) {
      fetchRoom();
    }
  }, [selectedRoomId, fetchRoom]);

  return (
    <RoomContext.Provider
      value={{
        selectedRoomId,
        roomDetails,
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
    throw new Error("useRoom must be used within a RoomProvider");
  }
  return context;
};
