import DiscoverMoreShopList from '@/components/shops/DiscoverMoreShopList';
import { ErrorState } from '@/components/shops/ErrorState';
import { SkeletonCardList } from '@/components/shops/SkeletonCard';
import { ShopColors } from '@/constants/ShopColors';
import { useShops } from '@/hooks/useShops';
import { ShopNavigator } from '@/navigation/ShopNavigator';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export const DiscoverMoreSection = () => {
  const { data: shops, isLoading, isError, refetch } = useShops();
  const handleShopPress = (shopId: string) => {
    ShopNavigator.goToShopDetails(shopId);
  };

  if (isLoading) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Discover More</Text>
        <SkeletonCardList count={4} horizontal={false} />
      </View>
    );
  }

  if (isError) {
    return (
      <ErrorState
        message="Could not load shops. Please check your connection and try again."
        onRetry={refetch}
      />
    );
  }

  if (!shops || shops.length === 0) {
    return null; // Don't render the section if there's no data
  }

  return (
    <View style={styles.section}>
      <DiscoverMoreShopList
        shops={shops}
        onShopPress={handleShopPress}
        title="Discover More"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: ShopColors.textPrimary,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
});
