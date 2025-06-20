// app/(tabs)/(home)/(shops)/(details)/[shopId].tsx - REFACTORED

import { ErrorState } from '@/components/shops/ErrorState';
import ShopDetail from '@/components/shops/ShopDetail';
import ShopNotFound from '@/components/shops/ShopNotFound'; // Import reusable ShopNotFound
import ShopDetailSkeleton from '@/components/shops/skeletons/ShopDetailSkeleton';
import { useShop, useToggleFavorite } from '@/hooks/useShops';
import {
  callPhoneNumber,
  openDirections,
  openWebsite,
  shareShop,
} from '@/services/InteractionService'; // Import service functions
import type { ShopData } from '@/types/shop';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';

const ShopDetailsPage = () => {
  const { shopId } = useLocalSearchParams();
  const id = Array.isArray(shopId) ? shopId[0] : shopId || '';

  const { data: shop, isLoading, isError, refetch } = useShop(id);
  const toggleFavoriteMutation = useToggleFavorite();

  const handleFavoriteToggle = () => {
    if (shop) {
      toggleFavoriteMutation.mutate(shop.id);
    }
  };

  // Use functions from InteractionService
  const handleShare = () => {
    shareShop(shop);
  };

  const handleCall = () => {
    callPhoneNumber(shop?.contact, shop?.name);
  };

  const handleDirections = () => {
    openDirections(shop?.name || 'Shop', shop?.location, shop?.mapLocation);
  };

  const handleWebsite = () => {
    openWebsite(shop?.socialLinks?.website, shop?.name);
  };

  if (isLoading) {
    return <ShopDetailSkeleton />;
  }

  if (isError) {
    return (
      <ErrorState message="Could not load shop details." onRetry={refetch} />
    );
  }

  if (!shop) {
    // Use the new ShopNotFound component
    return <ShopNotFound />;
  }

  const currentShop = shop as ShopData;

  return (
    <ShopDetail
      shop={currentShop}
      onFavoriteToggle={handleFavoriteToggle}
      onShare={handleShare}
      onCall={handleCall}
      onDirections={handleDirections}
      onWebsite={handleWebsite}
    />
  );
};

export default ShopDetailsPage;
