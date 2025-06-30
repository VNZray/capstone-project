import { Business, Room } from '@/types/Business';
import { supabase } from '@/utils/supabase';
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

type FilterMode =
  | 'ALL'
  | 'ACTIVE_ONLY'
  | 'PENDING_ONLY'
  | 'BY_OWNER'
  | 'TOURISM_ALL'
  | 'TOURIST_ACTIVE';

type BusinessContextType = {
  businesses: Business[];
  rooms: Room[];
  filteredBusinesses: Business[];
  loading: boolean;
  filterMode: FilterMode;
  filterByOwnerId: (ownerId: number) => void;
  filterActiveOnly: () => void;
  filterPendingOnly: () => void;
  showAll: () => void;
  fetchBusinessById: (id: number) => Promise<Business | null>;
    fetchRoomsByBusinessId: (businessId: number | string) => Promise<any[]>;

};

const BusinessContext = createContext<BusinessContextType | undefined>(
  undefined
);

type ProviderProps = {
  children: ReactNode;
};

export const BusinessProvider = ({ children }: ProviderProps) => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [filterMode, setFilterMode] = useState<FilterMode>('ALL');

  const fetchBusinesses = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('Business').select('*');

    if (error) {
      console.error('Failed to fetch businesses:', error);
      setLoading(false);
      return;
    }

    setBusinesses(data || []);
    setFilteredBusinesses(data || []);
    setLoading(false);
  };

  const fetchRooms = async () => {
    setLoading(true);

    const { data, error } = await supabase.from('Room').select('*');

    if (error) {
      console.error('Failed to fetch rooms:', error);
      setLoading(false);
      return;
    }

    setRooms(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinessById = async (id: number): Promise<Business | null> => {
    setLoading(true);

    const { data, error } = await supabase
      .from('Business')
      .select('*')
      .eq('id', id)
      .single();

    setLoading(false);

    if (error) {
      console.error('Failed to fetch business by ID:', error);
      return null;
    }

    return data;
  };

  const filterByOwnerId = async (ownerId: number) => {
    setLoading(true);
    setFilterMode('BY_OWNER');

    const { data, error } = await supabase
      .from('Business')
      .select('*')
      .eq('owner_id', ownerId);

    if (error) {
      console.error('Failed to fetch businesses by owner:', error);
      setFilteredBusinesses([]);
      setLoading(false);
      return;
    }

    setFilteredBusinesses(data || []);
    setLoading(false);
  };

  const filterActiveOnly = () => {
    setFilterMode('ACTIVE_ONLY');
    const filtered = businesses.filter(
      (b) => b.status.toLowerCase() === 'active'
    );
    setFilteredBusinesses(filtered);
  };

  const filterPendingOnly = () => {
    setFilterMode('PENDING_ONLY');
    const filtered = businesses.filter(
      (b) => b.status.toLowerCase() === 'pending'
    );
    setFilteredBusinesses(filtered);
  };

  const showAll = () => {
    setFilterMode('ALL');
    setFilteredBusinesses(businesses);
  };

  const fetchRoomsByBusinessId = async (
  businessId: number | string
): Promise<any[]> => {
  setLoading(true);

  const { data, error } = await supabase
    .from('Room')
    .select('*')
    .eq('business_id', businessId);

  setLoading(false);

  if (error) {
    console.error('Failed to fetch rooms for business:', error);
    return [];
  }

  return data || [];
};


  return (
    <BusinessContext.Provider
      value={{
        businesses,
        rooms,
        filteredBusinesses,
        loading,
        filterMode,
        filterByOwnerId,
        filterActiveOnly,
        filterPendingOnly,
        showAll,
        fetchBusinessById,
        fetchRoomsByBusinessId,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
};

export const useBusiness = () => {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
};
