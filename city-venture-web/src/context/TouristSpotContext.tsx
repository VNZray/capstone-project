import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import type { TouristSpot } from "@/src/types/TouristSpot";
import {
  getStoredTouristSpotId,
  setStoredTouristSpotId,
  clearStoredTouristSpotId,
  fetchTouristSpotDetails,
} from "@/src/services/TouristSpotService";

interface TouristSpotContextType {
  selectedTouristSpotId: string | null;
  spotDetails: TouristSpot | null;
  loading: boolean;
  setSpotId: (id: string, remember?: boolean) => void;
  clearSpotId: () => void;
  refreshSpot: () => Promise<void>;
}

const TouristSpotContext = createContext<TouristSpotContextType | undefined>(undefined);

interface TouristSpotProviderProps { children: ReactNode }

export const TouristSpotProvider: React.FC<TouristSpotProviderProps> = ({ children }) => {
  const [selectedTouristSpotId, setSelectedTouristSpotId] = useState<string | null>(null);
  const [spotDetails, setSpotDetails] = useState<TouristSpot | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const id = await getStoredTouristSpotId();
      if (id) setSelectedTouristSpotId(id);
    };
    load();
  }, []);

  const setSpotId = useCallback((id: string, remember = true) => {
    setSelectedTouristSpotId(id);
    setStoredTouristSpotId(id, remember);
  }, []);

  const clearSpotId = useCallback(() => {
    setSelectedTouristSpotId(null);
    setSpotDetails(null);
    clearStoredTouristSpotId();
  }, []);

  const fetchSpot = useCallback(async () => {
    if (!selectedTouristSpotId) return;
    setLoading(true);
    try {
      const data = await fetchTouristSpotDetails(selectedTouristSpotId);
      setSpotDetails(data);
    } catch (e) {
      console.error("[TouristSpotContext] Failed to fetch spot details", e);
      setSpotDetails(null);
    } finally {
      setLoading(false);
    }
  }, [selectedTouristSpotId]);

  useEffect(() => {
    if (selectedTouristSpotId) void fetchSpot();
  }, [selectedTouristSpotId, fetchSpot]);

  return (
    <TouristSpotContext.Provider value={{ selectedTouristSpotId, spotDetails, loading, setSpotId, clearSpotId, refreshSpot: fetchSpot }}>
      {children}
    </TouristSpotContext.Provider>
  );
};

export const useTouristSpot = (): TouristSpotContextType => {
  const ctx = useContext(TouristSpotContext);
  if (!ctx) throw new Error("useTouristSpot must be used within a TouristSpotProvider");
  return ctx;
};
