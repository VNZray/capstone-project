import {
  clearStoredBusinessId,
  fetchAllBusinessDetails,
  fetchBusinessDetails,
  getStoredBusinessId,
  setStoredBusinessId,
} from '@/services/AccommodationService';
import type { Business } from '@/types/Business';
import type { ReactNode } from 'react';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

interface AccommodationContextType {
  selectedAccommodationId: string | null;
  accommodationDetails: Business | null;
  allAccommodationDetails: Business[] | [];
  loading: boolean;
  setAccommodationId: (id: string) => void;
  clearAccommodationId: () => void;
  refreshAccommodation: () => Promise<void>;
}

const AccommodationContext = createContext<
  AccommodationContextType | undefined
>(undefined);

interface AccommodationProviderProps {
  children: ReactNode;
}

export const AccommodationProvider: React.FC<AccommodationProviderProps> = ({
  children,
}) => {
  const [selectedAccommodationId, setSelectedAccommodationId] = useState<
    string | null
  >(null);

  useEffect(() => {
    const fetchStoredId = async () => {
      const storedId = await getStoredBusinessId();
      setSelectedAccommodationId(storedId);
    };
    fetchStoredId();
  }, []);
  const [accommodationDetails, setAccommodationDetails] =
    useState<Business | null>(null);

  const [allAccommodationDetails, setAllAccommodationDetails] = useState<
    Business[] | []
  >([]);

  const [loading, setLoading] = useState(false);

  /** Set the selected accommodation ID and store it locally */
  const setAccommodationId = useCallback((id: string) => {
    setSelectedAccommodationId(id);
    setStoredBusinessId(id);
  }, []);

  /** Clear selected accommodation */
  const clearAccommodationId = useCallback(() => {
    setSelectedAccommodationId(null);
    setAccommodationDetails(null);
    clearStoredBusinessId();
  }, []);

  /** Fetch accommodation details from API */
  const fetchAccommodation = useCallback(async () => {
    if (!selectedAccommodationId) return;
    setLoading(true);
    try {
      const data = await fetchBusinessDetails(selectedAccommodationId);
      setAccommodationDetails(data);
    } catch (error) {
      console.error('Failed to fetch accommodation:', error);
      setAccommodationDetails(null);
    } finally {
      setLoading(false);
    }
  }, [selectedAccommodationId]);

  const fetchAllAccommodations = async () => {
    setLoading(true);
    try {
      const data = await fetchAllBusinessDetails();
      setAllAccommodationDetails(data);
    } catch (error) {
      console.error('Failed to fetch accommodation:', error);
      setAllAccommodationDetails([]);
    } finally {
      setLoading(false);
    }
  };

  /** Fetch when ID changes */
  useEffect(() => {
    fetchAllAccommodations();

    if (selectedAccommodationId) {
      fetchAccommodation();
    }
  }, [selectedAccommodationId, fetchAccommodation]);

  return (
    <AccommodationContext.Provider
      value={{
        allAccommodationDetails,
        selectedAccommodationId,
        accommodationDetails,
        loading,
        setAccommodationId,
        clearAccommodationId,
        refreshAccommodation: fetchAccommodation,
      }}
    >
      {children}
    </AccommodationContext.Provider>
  );
};

export const useAccommodation = (): AccommodationContextType => {
  const context = useContext(AccommodationContext);
  if (!context) {
    throw new Error(
      'useAccommodation must be used within a AccommodationProvider'
    );
  }
  return context;
};
