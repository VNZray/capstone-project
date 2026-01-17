import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import type {
  TouristSpot,
  TouristSpotCategoriesAndTypes,
  TouristSpotImage,
  TouristSpotLocationData,
  TouristSpotSchedule,
  TouristSpotAddressDetails,
} from '@/types/TouristSpot';
import {
  clearStoredTouristSpotId,
  fetchAllTouristSpots,
  fetchTouristSpotById,
  fetchTouristSpotCategories,
  fetchTouristSpotCategoriesAndTypes,
  fetchTouristSpotImages,
  fetchTouristSpotLocationData,
  fetchTouristSpotSchedules,
  getStoredTouristSpotId,
  setStoredTouristSpotId,
} from '@/services/TouristSpotService';

interface TouristSpotContextType {
  spots: TouristSpot[];
  selectedSpotId: string | null;
  selectedSpot: TouristSpot | null;
  loading: boolean;
  categoriesAndTypes: TouristSpotCategoriesAndTypes | null;
  locationData: TouristSpotLocationData | null;
  schedules: TouristSpotSchedule[];
  images: TouristSpotImage[];
  categories: any[];
  addressDetails: TouristSpotAddressDetails | null;
  setSpotId: (id: string) => void;
  clearSpotId: () => void;
  refreshSpots: () => Promise<void>;
  refreshSelectedSpot: () => Promise<void>;
  refreshImages: () => Promise<void>;
  refreshSchedules: () => Promise<void>;
  refreshCategories: () => Promise<void>;
  loadMeta: () => Promise<void>;
}

const TouristSpotContext = createContext<TouristSpotContextType | undefined>(
  undefined
);

interface ProviderProps {
  children: ReactNode;
}

export const TouristSpotProvider: React.FC<ProviderProps> = ({ children }) => {
  const [spots, setSpots] = useState<TouristSpot[]>([]);
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<TouristSpot | null>(null);
  const [loading, setLoading] = useState(false);
  const [categoriesAndTypes, setCategoriesAndTypes] =
    useState<TouristSpotCategoriesAndTypes | null>(null);
  const [locationData, setLocationData] =
    useState<TouristSpotLocationData | null>(null);
  const [schedules, setSchedules] = useState<TouristSpotSchedule[]>([]);
  const [images, setImages] = useState<TouristSpotImage[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [addressDetails, setAddressDetails] =
    useState<TouristSpotAddressDetails | null>(null);

  // Initialize stored selection
  useEffect(() => {
    (async () => {
      const stored = await getStoredTouristSpotId();
      if (stored) setSelectedSpotId(stored);
    })();
  }, []);

  const setSpotId = useCallback((id: string) => {
    setSelectedSpotId(id);
    setStoredTouristSpotId(id);
  }, []);

  const clearSpotId = useCallback(() => {
    setSelectedSpotId(null);
    setSelectedSpot(null);
    clearStoredTouristSpotId();
  }, []);

  const refreshSpots = useCallback(async () => {
    setLoading(true);
    try {
      const list = await fetchAllTouristSpots();
      setSpots(list);
    } catch (e: any) {
      console.error(
        'Failed to fetch tourist spots',
        e?.response?.status,
        e?.message
      );
      setSpots([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshSelectedSpot = useCallback(async () => {
    if (!selectedSpotId) return;
    setLoading(true);
    try {
      const spot = await fetchTouristSpotById(selectedSpotId);
      setSelectedSpot(spot);
      setImages(spot.images || []);
      setCategories(spot.categories || []);
      // spot already includes barangay/municipality/province fields from backend
      if (spot?.barangay_id) {
        setAddressDetails({
          barangay_id: spot.barangay_id ?? null,
          municipality_id: spot.municipality_id ?? null,
          province_id: spot.province_id ?? null,
          barangay: spot.barangay ?? null,
          municipality: spot.municipality ?? null,
          province: spot.province ?? null,
        });
      } else setAddressDetails(null);
    } catch (e: any) {
      console.error(
        'Failed to fetch tourist spot',
        e?.response?.status,
        e?.message
      );
      setSelectedSpot(null);
    } finally {
      setLoading(false);
    }
  }, [selectedSpotId]);

  const refreshImages = useCallback(async () => {
    if (!selectedSpotId) return;
    try {
      const imgs = await fetchTouristSpotImages(selectedSpotId);
      setImages(imgs);
    } catch (e: any) {
      console.error('Failed to fetch images', e?.response?.status, e?.message);
    }
  }, [selectedSpotId]);

  const refreshSchedules = useCallback(async () => {
    if (!selectedSpotId) return;
    try {
      const scheds = await fetchTouristSpotSchedules(selectedSpotId);
      setSchedules(scheds);
    } catch (e: any) {
      console.error(
        'Failed to fetch schedules',
        e?.response?.status,
        e?.message
      );
    }
  }, [selectedSpotId]);

  const refreshCategories = useCallback(async () => {
    if (!selectedSpotId) return;
    try {
      const cats = await fetchTouristSpotCategories(selectedSpotId);
      setCategories(cats);
    } catch (e: any) {
      console.error(
        'Failed to fetch categories',
        e?.response?.status,
        e?.message
      );
    }
  }, [selectedSpotId]);

  const loadMeta = useCallback(async () => {
    try {
      const [meta, loc] = await Promise.all([
        fetchTouristSpotCategoriesAndTypes(),
        fetchTouristSpotLocationData(),
      ]);
      setCategoriesAndTypes(meta);
      setLocationData(loc);
    } catch (e: any) {
      console.error(
        'Failed loading meta data',
        e?.response?.status,
        e?.message
      );
    }
  }, []);

  // Auto load list and meta
  useEffect(() => {
    refreshSpots();
    loadMeta();
  }, [refreshSpots, loadMeta]);

  // When selected id changes, pull details
  useEffect(() => {
    if (selectedSpotId) {
      refreshSelectedSpot();
      refreshSchedules();
      refreshImages();
    }
  }, [selectedSpotId, refreshSelectedSpot, refreshSchedules, refreshImages]);

  return (
    <TouristSpotContext.Provider
      value={{
        spots,
        selectedSpotId,
        selectedSpot,
        loading,
        categoriesAndTypes,
        locationData,
        schedules,
        images,
        categories,
        addressDetails,
        setSpotId,
        clearSpotId,
        refreshSpots,
        refreshSelectedSpot,
        refreshImages,
        refreshSchedules,
        refreshCategories,
        loadMeta,
      }}
    >
      {children}
    </TouristSpotContext.Provider>
  );
};

export const useTouristSpot = (): TouristSpotContextType => {
  const context = useContext(TouristSpotContext);
  if (!context) {
    throw new Error('useTouristSpot must be used within a TouristSpotProvider');
  }
  return context;
};
