import ShopGridScreen from '@/components/shops/ShopGridScreen';
import { useRecommendedShops } from '@/hooks/useShops';
import React from 'react';

const RecommendedShopsScreen = () => {
  const {
    data: shops = [],
    isLoading,
    isError,
    refetch,
  } = useRecommendedShops();

  return (
    <ShopGridScreen
      title="Recommended For You"
      shops={shops}
      isLoading={isLoading}
      isError={isError}
      onRefresh={refetch}
      emptyMessage="We're still finding the perfect spots for you. Explore more to help us learn your preferences!"
    />
  );
};

export default RecommendedShopsScreen;
