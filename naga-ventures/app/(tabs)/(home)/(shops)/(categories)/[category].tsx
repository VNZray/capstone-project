// app/(tabs)/(home)/(shops)/(categories)/[category].tsx - REFACTORED

import ShopGridScreen from '@/components/shops/ShopGridScreen';
import { getMainCategoryById } from '@/Controller/ShopData'; // OK to use this for static data like category name
import { useShopsByCategory } from '@/hooks/useShops';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';

const MainCategoryPage = () => {
  const { category: categoryId } = useLocalSearchParams();
  const id = Array.isArray(categoryId) ? categoryId[0] : categoryId || '';

  // It's acceptable to get the static category name this way for the title
  const categoryData = getMainCategoryById(id);
  const categoryName = categoryData ? categoryData.name : 'Category';

  // Fetch the list of shops for this category using the hook
  const {
    data: shops,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useShopsByCategory(id);

  // The ShopGridScreen already handles loading, error, and empty states!
  return (
    <ShopGridScreen
      title={categoryName}
      shops={shops || []}
      isLoading={isLoading}
      isError={isError}
      onRefresh={refetch}
      isRefreshing={isRefetching}
      emptyMessage="No shops have been added to this category yet."
    />
  );
};

export default MainCategoryPage;
