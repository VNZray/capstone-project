import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { ReactNode } from "react";
import type { Tourism } from "@/src/types/Tourism";
import {
  fetchTourismDetails,
  getStoredTourismId,
  setStoredTourismId,
  clearStoredTourismId,
} from "@/src/services/TourismService";

interface TourismContextType {
  selectedTourismId: string | null;
  tourismDetails: Tourism | null;
  loading: boolean;
  setTourismId: (id: string) => void;
  clearTourismId: () => void;
  refreshTourism: () => Promise<void>;
}

const TourismContext = createContext<TourismContextType | undefined>(
  undefined
);

interface TourismProviderProps {
  children: ReactNode;
}

export const TourismProvider: React.FC<TourismProviderProps> = ({ children }) => {
  const [selectedTourismId, setSelectedTourismId] = useState<string | null>(
    null
  );
  const [tourismDetails, setTourismDetails] = useState<Tourism | null>(null);
  const [loading, setLoading] = useState(false);

  // Initialize from storage
  useEffect(() => {
    const loadStored = async () => {
      const id = await getStoredTourismId();
      setSelectedTourismId(id);
    };
    loadStored();
  }, []);

  const setTourismId = useCallback((id: string) => {
    setSelectedTourismId(id);
    setStoredTourismId(id);
  }, []);

  const clearTourismId = useCallback(() => {
    setSelectedTourismId(null);
    setTourismDetails(null);
    clearStoredTourismId();
  }, []);

  const fetchTourism = useCallback(async () => {
    if (!selectedTourismId) return;
    setLoading(true);
    try {
      const data = await fetchTourismDetails(selectedTourismId);
      setTourismDetails(data as Tourism);
    } catch (e) {
      console.error("Failed to fetch tourism details:", e);
      setTourismDetails(null);
    } finally {
      setLoading(false);
    }
  }, [selectedTourismId]);

  useEffect(() => {
    if (selectedTourismId) {
      fetchTourism();
    }
  }, [selectedTourismId, fetchTourism]);

  return (
    <TourismContext.Provider
      value={{
        selectedTourismId,
        tourismDetails,
        loading,
        setTourismId,
        clearTourismId,
        refreshTourism: fetchTourism,
      }}
    >
      {children}
    </TourismContext.Provider>
  );
};

export const useTourism = (): TourismContextType => {
  const ctx = useContext(TourismContext);
  if (!ctx) throw new Error("useTourism must be used within a TourismProvider");
  return ctx;
};
