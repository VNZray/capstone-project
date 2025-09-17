import {
  clearStoredBusinessId,
  fetchAllBusinessDetails,
  fetchBusinessData,
  fetchBusinessDetails,
  getStoredBusinessId,
  setStoredBusinessId,
} from '@/services/AccommodationService';
import type { Business, BusinessDetails } from '@/types/Business';
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
  accommodationDetails: BusinessDetails | null;
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
    useState<BusinessDetails | null>(null);

  const [allAccommodationDetails, setAllAccommodationDetails] = useState<
    Business[] | []
  >([]);

  const [loading, setLoading] = useState(false);

  /** Set the selected accommodation ID and store it locally */
  const setAccommodationId = useCallback((id: string) => {
    console.debug('[AccommodationContext] setAccommodationId ->', id);
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
      console.debug('[AccommodationContext] Fetching business data for id=', selectedAccommodationId);
      const data = await fetchBusinessData(selectedAccommodationId);
      console.debug('[AccommodationContext] Fetched business data ->', {
        id: data?.id,
        name: data?.business_name,
      });
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
      console.debug('[AccommodationContext] Fetching all businesses...');
      const data = await fetchAllBusinessDetails();
      console.debug('[AccommodationContext] Total businesses ->', data?.length ?? 0);
      setAllAccommodationDetails(data);
      if (data.length === 0) {
        setAccommodationDetails(null);
        setSelectedAccommodationId(null);
        clearStoredBusinessId();
        return;
      }
    } catch (error) {
      console.error('Failed to fetch business listed:', error);
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
