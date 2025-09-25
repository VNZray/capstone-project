import {
  clearStoredBusinessId,
  fetchAllBusinessDetails,
  fetchBusinessData,
  getStoredBusinessId,
  setStoredBusinessId
} from '@/services/AccommodationService';
import type { Business, BusinessDetails } from '@/types/Business';
import debugLogger from '@/utils/debugLogger';
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
    debugLogger({
      title: 'AccommodationContext: setAccommodationId',
      data: { id }
    });
    setSelectedAccommodationId(id);
    setStoredBusinessId(id);
  }, []);

  /** Clear selected accommodation */
  const clearAccommodationId = useCallback(() => {
    debugLogger({
      title: 'AccommodationContext: clearAccommodationId',
      successMessage: 'Cleared selected accommodation.'
    });
    setSelectedAccommodationId(null);
    setAccommodationDetails(null);
    clearStoredBusinessId();
  }, []);

  /** Fetch accommodation details from API */
  const fetchAccommodation = useCallback(async () => {
    if (!selectedAccommodationId) return;
    setLoading(true);
    try {
      debugLogger({
        title: 'AccommodationContext: Fetching business data',
        data: { id: selectedAccommodationId }
      });
      const data = await fetchBusinessData(selectedAccommodationId);
      debugLogger({
        title: 'AccommodationContext: Fetched business data',
        data: { id: data?.id, name: data?.business_name },
        successMessage: 'Fetched business data.'
      });
      setAccommodationDetails(data);
    } catch (error) {
      debugLogger({
        title: 'AccommodationContext: Failed to fetch accommodation',
        error
      });
      setAccommodationDetails(null);
    } finally {
      setLoading(false);
    }
  }, [selectedAccommodationId]);

  const fetchAllAccommodations = async () => {
    setLoading(true);
    try {
      debugLogger({
        title: 'AccommodationContext: Fetching all businesses',
      });
      const data = await fetchAllBusinessDetails();
      debugLogger({
        title: 'AccommodationContext: Total businesses',
        data: { count: data?.length ?? 0 },
        successMessage: 'Fetched all businesses.'
      });
      setAllAccommodationDetails(data);
      if (data.length === 0) {
        setAccommodationDetails(null);
        setSelectedAccommodationId(null);
        clearStoredBusinessId();
        return;
      }
    } catch (error) {
      debugLogger({
        title: 'AccommodationContext: Failed to fetch business listed',
        error
      });
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
