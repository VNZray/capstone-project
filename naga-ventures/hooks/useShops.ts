// hooks/useShops.ts - Professional Shop Data Management
import queryKeys from '@/api/queryKeys';
import {
  getMainCategoryById,
  getShopsByIds,
  getSpecialOfferById,
  shopsData,
  specialOffersData,
  featuredShops as staticFeatured,
  mainCategories as staticMainCategories,
} from '@/Controller/ShopData';
import type {
  MainCategory as MainShopCategory,
  ShopData,
  SpecialOffer,
} from '@/types/shop';

import { useMutation, useQuery, useQueryClient, QueryClientProvider, QueryClient } from '@tanstack/react-query';
import debounce from 'lodash.debounce';
import { useEffect, useState } from 'react';

// --- SINGLE SOURCE OF TRUTH ---
// All shop operations use Object.values(shopsData) as the authoritative data source
const getAllShopsData = (): ShopData[] =>
  Object.values(shopsData) as ShopData[];

// --- SIMULATED API CALLS ---
// These functions mimic fetching from a real API with proper error handling.

const fetchAllShops = async (): Promise<ShopData[]> => {
  console.log('Fetching all shops...');
  await new Promise((resolve) => setTimeout(resolve, 300));
  try {
    return getAllShopsData();
  } catch (error) {
    console.error('Error fetching all shops:', error);
    throw new Error('Failed to fetch shops');
  }
};

const fetchShopById = async (id: string): Promise<ShopData | null> => {
  console.log(`Fetching shop by ID: ${id}`);
  await new Promise((resolve) => setTimeout(resolve, 200));
  try {
    return (shopsData[id as unknown as keyof typeof shopsData] ||
      null) as ShopData | null;
  } catch (error) {
    console.error(`Error fetching shop ${id}:`, error);
    throw new Error(`Failed to fetch shop with ID: ${id}`);
  }
};

const fetchFeaturedShops = async (): Promise<ShopData[]> => {
  console.log('Fetching featured shops...');
  await new Promise((resolve) => setTimeout(resolve, 300));
  try {
    return staticFeatured as ShopData[];
  } catch (error) {
    console.error('Error fetching featured shops:', error);
    throw new Error('Failed to fetch featured shops');
  }
};

const fetchRecommendedShops = async (): Promise<ShopData[]> => {
  console.log('Fetching recommended shops...');
  await new Promise((resolve) => setTimeout(resolve, 300));
  try {
    // Filter shops with rating >= 4.5 for recommendations using single source of truth
    return getAllShopsData().filter((shop) => shop.rating >= 4.5);
  } catch (error) {
    console.error('Error fetching recommended shops:', error);
    throw new Error('Failed to fetch recommended shops');
  }
};

const searchShops = async (query: string): Promise<ShopData[]> => {
  console.log(`Searching shops with query: "${query}"`);
  await new Promise((resolve) => setTimeout(resolve, 400));

  if (!query.trim()) {
    return [];
  }

  try {
    const lowercaseQuery = query.toLowerCase();
    // Use single source of truth for search
    return getAllShopsData().filter((shop) => {
      return (
        shop.name.toLowerCase().includes(lowercaseQuery) ||
        shop.category?.toLowerCase().includes(lowercaseQuery) ||
        shop.description?.toLowerCase().includes(lowercaseQuery)
      );
    });
  } catch (error) {
    console.error('Error searching shops:', error);
    throw new Error('Failed to search shops');
  }
};

// FIXED: Use shop.category instead of shop.subcategory for filtering
const fetchShopsByCategory = async (
  categoryId: string
): Promise<ShopData[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  try {
    const mainCategory = getMainCategoryById(categoryId);
    if (!mainCategory) return [];

    const subcategoryIds = mainCategory.subcategories.map(
      (sub: { id: string }) => sub.id
    );
    // FIXED: Filter by shop.category, not shop.subcategory
    return getAllShopsData().filter((shop) =>
      subcategoryIds.includes(shop.category || '')
    );
  } catch (error) {
    console.error(`Error fetching shops by category ${categoryId}:`, error);
    throw new Error(`Failed to fetch shops by category: ${categoryId}`);
  }
};

const fetchShopsBySubcategory = async (
  subcategoryId: string
): Promise<ShopData[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  try {
    // Use single source of truth for subcategory filtering
    return getAllShopsData().filter(
      (shop) => shop.subcategory === subcategoryId
    );
  } catch (error) {
    console.error(
      `Error fetching shops by subcategory ${subcategoryId}:`,
      error
    );
    throw new Error(`Failed to fetch shops by subcategory: ${subcategoryId}`);
  }
};

const fetchMainCategories = async (): Promise<MainShopCategory[]> => {
  console.log('Fetching main categories...');
  await new Promise((resolve) => setTimeout(resolve, 400));
  try {
    return staticMainCategories;
  } catch (error) {
    console.error('Error fetching main categories:', error);
    throw new Error('Failed to fetch main categories');
  }
};

// --- SPECIAL OFFER API CALLS ---
const fetchAllSpecialOffers = async (): Promise<SpecialOffer[]> => {
  console.log('Fetching all special offers...');
  await new Promise((resolve) => setTimeout(resolve, 300));
  try {
    return Object.values(specialOffersData) as unknown as SpecialOffer[];
  } catch (error) {
    console.error('Error fetching special offers:', error);
    throw new Error('Failed to fetch special offers');
  }
};

const fetchSpecialOfferById = async (
  id: string
): Promise<SpecialOffer | null> => {
  console.log(`Fetching special offer by ID: ${id}`);
  await new Promise((resolve) => setTimeout(resolve, 200));
  try {
    const offer = getSpecialOfferById(id);
    return offer ? (offer as unknown as SpecialOffer) : null;
  } catch (error) {
    console.error(`Error fetching special offer ${id}:`, error);
    throw new Error(`Failed to fetch special offer with ID: ${id}`);
  }
};

// FIXED: Sort IDs for consistent cache key
const fetchShopsByIds = async (ids: string[]): Promise<ShopData[]> => {
  console.log(`Fetching shops by IDs: ${ids.join(', ')}`);
  await new Promise((resolve) => setTimeout(resolve, 200));
  try {
    return getShopsByIds(ids) as ShopData[];
  } catch (error) {
    console.error('Error fetching shops by IDs:', error);
    throw new Error('Failed to fetch shops by IDs');
  }
};

// --- CUSTOM HOOKS ---
// Professional hooks with centralized query keys and consistent patterns

export const useShops = () => {
  return useQuery<ShopData[], Error>({
    queryKey: queryKeys.shops.all,
    queryFn: fetchAllShops,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
};

export const useShop = (shopId: string) => {
  return useQuery<ShopData | null, Error>({
    queryKey: queryKeys.shops.detail(shopId),
    queryFn: () => fetchShopById(shopId),
    enabled: !!shopId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useFeaturedShops = () => {
  return useQuery<ShopData[], Error>({
    queryKey: queryKeys.shops.featured(),
    queryFn: fetchFeaturedShops,
    staleTime: 10 * 60 * 1000, // Featured shops change less frequently
    gcTime: 15 * 60 * 1000,
  });
};

export const useRecommendedShops = () => {
  return useQuery<ShopData[], Error>({
    queryKey: queryKeys.shops.recommended(),
    queryFn: fetchRecommendedShops,
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
};

export const useShopsByCategory = (categoryId: string) => {
  return useQuery<ShopData[], Error>({
    queryKey: queryKeys.shops.byCategory(categoryId),
    queryFn: () => fetchShopsByCategory(categoryId),
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useShopsBySubcategory = (subcategoryId: string) => {
  return useQuery<ShopData[], Error>({
    queryKey: queryKeys.shops.bySubcategory(subcategoryId),
    queryFn: () => fetchShopsBySubcategory(subcategoryId),
    enabled: !!subcategoryId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Search hook with enhanced debouncing and error handling
export const useSearchShops = (query: string) => {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  // Enhanced debounce with proper cleanup
  useEffect(() => {
    const handler = debounce((searchQuery: string) => {
      setDebouncedQuery(searchQuery);
    }, 300);

    handler(query);

    return () => {
      handler.cancel();
    };
  }, [query]);

  return useQuery<ShopData[], Error>({
    queryKey: queryKeys.shops.search(debouncedQuery),
    queryFn: () => searchShops(debouncedQuery),
    enabled: !!debouncedQuery.trim(),
    staleTime: 2 * 60 * 1000, // Search results stale faster
    gcTime: 5 * 60 * 1000,
  });
};

export const useMainCategories = () => {
  return useQuery<MainShopCategory[], Error>({
    queryKey: queryKeys.categories.main(),
    queryFn: fetchMainCategories,
    staleTime: 30 * 60 * 1000, // Categories change very infrequently
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};

// --- SPECIAL OFFER HOOKS ---
export const useAllSpecialOffers = () => {
  return useQuery<SpecialOffer[], Error>({
    queryKey: queryKeys.specialOffers.all,
    queryFn: fetchAllSpecialOffers,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useSpecialOffer = (offerId: string) => {
  return useQuery<SpecialOffer | null, Error>({
    queryKey: queryKeys.specialOffers.detail(offerId),
    queryFn: () => fetchSpecialOfferById(offerId),
    enabled: !!offerId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// FIXED: Sort IDs for consistent cache key
export const useShopsByIds = (shopIds: string[]) => {
  return useQuery<ShopData[], Error>({
    queryKey: queryKeys.shops.byIds(shopIds), // Now uses sorted IDs internally
    queryFn: () => fetchShopsByIds(shopIds),
    enabled: !!shopIds && shopIds.length > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// --- ENHANCED MUTATION HOOK ---
// Professional mutation with comprehensive optimistic updates and error handling
export const useToggleFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (shopId: string) => {
      // In a real app, this would be a POST/PATCH request to your API
      await new Promise((resolve) => setTimeout(resolve, 500));
      const shop = shopsData[shopId as unknown as keyof typeof shopsData];
      if (shop) {
        shop.isFavorited = !shop.isFavorited;
      }
      return shop;
    },

    // Optimistic updates with comprehensive query invalidation
    onMutate: async (shopId) => {
      // Cancel any outgoing refetches to prevent race conditions
      await Promise.all([
        queryClient.cancelQueries({ queryKey: queryKeys.shops.all }),
        queryClient.cancelQueries({ queryKey: queryKeys.shops.detail(shopId) }),
        queryClient.cancelQueries({ queryKey: queryKeys.shops.featured() }),
        queryClient.cancelQueries({ queryKey: queryKeys.shops.recommended() }),
      ]);

      // Snapshot the previous values for rollback
      const previousShops = queryClient.getQueryData(queryKeys.shops.all);
      const previousFeaturedShops = queryClient.getQueryData(
        queryKeys.shops.featured()
      );
      const previousRecommendedShops = queryClient.getQueryData(
        queryKeys.shops.recommended()
      );
      const previousShop = queryClient.getQueryData(
        queryKeys.shops.detail(shopId)
      );

      // Optimistic update function
      const toggleFavorite = (shop: ShopData) =>
        shop.id === shopId ? { ...shop, isFavorited: !shop.isFavorited } : shop;

      // Apply optimistic updates to all relevant queries
      queryClient.setQueryData(
        queryKeys.shops.all,
        (old: ShopData[] | undefined) => (old ? old.map(toggleFavorite) : [])
      );

      queryClient.setQueryData(
        queryKeys.shops.featured(),
        (old: ShopData[] | undefined) => (old ? old.map(toggleFavorite) : [])
      );

      queryClient.setQueryData(
        queryKeys.shops.recommended(),
        (old: ShopData[] | undefined) => (old ? old.map(toggleFavorite) : [])
      );

      queryClient.setQueryData(
        queryKeys.shops.detail(shopId),
        (old: ShopData | null | undefined) =>
          old ? { ...old, isFavorited: !old.isFavorited } : old
      );

      return {
        previousShops,
        previousFeaturedShops,
        previousRecommendedShops,
        previousShop,
      };
    },

    // Rollback on error
    onError: (err, shopId, context) => {
      console.error('Failed to toggle favorite:', err);

      if (context?.previousShops) {
        queryClient.setQueryData(queryKeys.shops.all, context.previousShops);
      }
      if (context?.previousFeaturedShops) {
        queryClient.setQueryData(
          queryKeys.shops.featured(),
          context.previousFeaturedShops
        );
      }
      if (context?.previousRecommendedShops) {
        queryClient.setQueryData(
          queryKeys.shops.recommended(),
          context.previousRecommendedShops
        );
      }
      if (context?.previousShop) {
        queryClient.setQueryData(
          queryKeys.shops.detail(shopId),
          context.previousShop
        );
      }
    },

    // Ensure server state consistency
    onSettled: (data, error, shopId) => {
      // Invalidate related queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.shops.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.shops.detail(shopId),
      });
    },
  });
};
