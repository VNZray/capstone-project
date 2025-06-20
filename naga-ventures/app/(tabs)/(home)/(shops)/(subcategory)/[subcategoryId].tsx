// app/(tabs)/(home)/(shops)/(subcategory)/[subcategoryId].tsx - REFACTORED

import ShopGridScreen from '@/components/shops/ShopGridScreen';
import { getCategoryById } from '@/Controller/ShopData'; // OK for static data
import { useShopsBySubcategory } from '@/hooks/useShops';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';

const SubcategoryPage = () => {
  const { subcategoryId } = useLocalSearchParams();
  const id = Array.isArray(subcategoryId)
    ? subcategoryId[0]
    : subcategoryId || '';

  const subcategoryData = getCategoryById(id);
  const subcategoryName = subcategoryData
    ? subcategoryData.name
    : 'Subcategory';

  const {
    data: shops,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useShopsBySubcategory(id);

  return (
    <ShopGridScreen
      title={subcategoryName}
      shops={shops || []}
      isLoading={isLoading}
      isError={isError}
      onRefresh={refetch}
      isRefreshing={isRefetching}
      emptyMessage="No shops have been added to this subcategory yet."
    />
  );
};

export default SubcategoryPage;
