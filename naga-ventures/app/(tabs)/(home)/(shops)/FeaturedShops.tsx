import ShopGridScreen from '@/components/shops/ShopGridScreen';
import { useFeaturedShops } from '@/hooks/useShops';
import React from 'react';

const FeaturedShopsScreen = () => {
  const { data: shops = [], isLoading, isError, refetch } = useFeaturedShops();

  return (
    <ShopGridScreen
      title="Featured Shops"
      shops={shops}
      isLoading={isLoading}
      isError={isError}
      onRefresh={refetch}
      emptyMessage="Check back later for our hand-picked selections!"
    />
  );
};

export default FeaturedShopsScreen;
