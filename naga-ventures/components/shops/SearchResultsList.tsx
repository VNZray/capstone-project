import ShopList from '@/components/shops/ShopList';
import { useSearchShops } from '@/hooks/useShops';
import { ShopNavigator } from '@/navigation/ShopNavigator';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { ErrorState } from './ErrorState';
import { SkeletonCardList } from './SkeletonCard';

interface SearchResultsListProps {
  query: string;
}

const SearchResultsList: React.FC<SearchResultsListProps> = ({ query }) => {
  const { data: shops, isLoading, isError, refetch } = useSearchShops(query);
  const handleShopPress = (shopId: string) => {
    ShopNavigator.goToShopDetails(shopId);
  };

  const searchResultsTitle = useMemo(() => {
    if (!query) return 'Search Results';
    return `Search Results (${shops?.length || 0})`;
  }, [query, shops?.length]);

  // Show loading state
  if (isLoading) {
    return (
      <View style={styles.section}>
        <SkeletonCardList count={3} />
      </View>
    );
  }
  // Show error state
  if (isError) {
    return (
      <View style={styles.section}>
        <ErrorState
          message="Failed to search shops. Please try again."
          onRetry={refetch}
        />
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <ShopList
        shops={shops || []}
        onShopPress={handleShopPress}
        title={searchResultsTitle}
        horizontal={false}
        showRating={true}
        showCategory={true}
        emptyMessage="No shops found matching your search."
      />
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 12,
  },
});

export default React.memo(SearchResultsList);
