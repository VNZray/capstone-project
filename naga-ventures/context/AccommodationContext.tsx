import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  rooms as roomData,
  accommodations as staticAccommodationsData,
} from '@/Controller/AccommodationData';

// Types
type Room = {
  id: number;
  roomNumber: number;
  capacity: number;
  status: string;
  roomPrice: number;
  roomImage: string;
  ratings: number;
  accommodationId: number;
  description: string;
};

type Accommodation = {
  id: number;
  name: string;
  location: string;
  priceRange: string;
  imageUri: string;
  description: string;
  ratings: number;
  latitude: number;
  longitude: number;
  rooms: Room[];
};

type AccommodationContextType = {
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  handleSearch: (query: string) => void;
  filteredAccommodations: Accommodation[];
  loading: boolean;
};

const AccommodationContext = createContext<
  AccommodationContextType | undefined
>(undefined);

type ProviderProps = {
  children: ReactNode;
};

export const AccommodationProvider = ({ children }: ProviderProps) => {
  const [search, setSearch] = useState<string>('');
  const [filteredAccommodations, setFilteredAccommodations] = useState<
    Accommodation[]
  >([]);
  const [loading, setLoading] = useState<boolean>(false);

  // ✅ Memoize combined accommodations to avoid infinite loop
  const combinedAccommodations = useMemo(() => {
    return staticAccommodationsData.map((acc) => ({
      ...acc,
      rooms: roomData.filter((room) => room.accommodationId === acc.id),
    }));
  }, []); // Add [roomData, staticAccommodationsData] if they are dynamic

  useEffect(() => {
    setFilteredAccommodations(combinedAccommodations);
  }, [combinedAccommodations]);

  const handleSearch = (query: string) => {
    setLoading(true);
    setSearch(query);

    setTimeout(() => {
      const lowerSearch = query.toLowerCase();
      const filtered = combinedAccommodations.filter((acc) => {
        return (
          acc.name.toLowerCase().includes(lowerSearch) ||
          acc.location.toLowerCase().includes(lowerSearch)
        );
      });

      setFilteredAccommodations(filtered);
      setLoading(false);
    }, 800);
  };

  return (
    <AccommodationContext.Provider
      value={{
        search,
        setSearch,
        handleSearch,
        filteredAccommodations,
        loading,
      }}
    >
      {children}
    </AccommodationContext.Provider>
  );
};

export const useAccommodation = () => {
  const context = useContext(AccommodationContext);
  if (!context) {
    throw new Error(
      'useAccommodation must be used within an AccommodationProvider'
    );
  }
  return context;
};
