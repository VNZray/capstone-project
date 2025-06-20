import { ErrorState } from '@/components/shops/ErrorState';
import RecommendedShopCard from '@/components/shops/RecommendedShopCard';
import { SkeletonCardList } from '@/components/shops/SkeletonCard';
import { ShopColors } from '@/constants/ShopColors';
import { useRecommendedShops } from '@/hooks/useShops';
import { ShopNavigator } from '@/navigation/ShopNavigator';
import type { ShopData } from '@/types/shop';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export const RecommendedSection = () => {
  const { data: shops, isLoading, isError, refetch } = useRecommendedShops();
  const handleShopPress = (shopId: string) => {
    ShopNavigator.goToShopDetails(shopId);
  };

  const handleViewAll = () => {
    ShopNavigator.goToRecommendedShops();
  };

  const renderRecommendedShopCard = ({ item }: { item: ShopData }) => (
    <RecommendedShopCard shop={item} onPress={handleShopPress} width={260} />
  );
  if (isLoading) {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recommended for you</Text>
        </View>
        <SkeletonCardList count={3} horizontal={true} />
      </View>
    );
  }

  if (isError) {
    return (
      <ErrorState
        message="Could not load recommended shops. Please check your connection and try again."
        onRetry={refetch}
      />
    );
  }

  if (!shops || shops.length === 0) {
    return null; // Don't render the section if there's no data
  }

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recommended for you</Text>
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={handleViewAll}
          activeOpacity={0.7}
        >
          <Text style={styles.viewAllText}>View All</Text>
          <Ionicons
            name="chevron-forward"
            size={14}
            color={ShopColors.accent}
          />
        </TouchableOpacity>
      </View>
      <FlatList
        data={shops.slice(0, 10)} // Limit to first 10 items for horizontal scroll
        renderItem={renderRecommendedShopCard}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalListContentContainer}
        ItemSeparatorComponent={() => (
          <View style={styles.horizontalListItemSeparator} />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: ShopColors.textPrimary,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: ShopColors.accent,
    marginRight: 4,
  },
  horizontalListContentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 0,
  },
  horizontalListItemSeparator: {
    width: 12,
  },
  loadingContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  loadingText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: ShopColors.textSecondary,
    textAlign: 'center',
  },
});
