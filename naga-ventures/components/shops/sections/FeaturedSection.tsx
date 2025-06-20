import { ErrorState } from '@/components/shops/ErrorState';
import ShopCarousel from '@/components/shops/ShopCarousel';
import { SkeletonCarousel } from '@/components/shops/SkeletonCard';
import { useFeaturedShops } from '@/hooks/useShops';
import { ShopNavigator } from '@/navigation/ShopNavigator';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export const FeaturedSection = () => {
  const { data: shops, isLoading, isError, refetch } = useFeaturedShops();
  const handleShopPress = (shopId: string) => {
    ShopNavigator.goToShopDetails(shopId);
  };

  const handleViewAll = () => {
    ShopNavigator.goToFeaturedShops();
  };
  if (isLoading) {
    return <SkeletonCarousel />;
  }

  if (isError) {
    return (
      <ErrorState
        message="Could not load featured shops. Please check your connection and try again."
        onRetry={refetch}
      />
    );
  }

  if (!shops || shops.length === 0) {
    return null; // Don't render the section if there's no data
  }

  return (
    <View style={styles.section}>
      <ShopCarousel
        shops={shops}
        onShopPress={handleShopPress}
        onViewAllPress={handleViewAll}
        title="Featured Shops"
        showViewAll={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 12,
  },
});
