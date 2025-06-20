import ShopCategories from '@/components/shops/ShopCategories';
import { ShopNavigator } from '@/navigation/ShopNavigator';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface CategoriesSectionProps {
  categories: Category[];
}

export const CategoriesSection: React.FC<CategoriesSectionProps> = ({
  categories,
}) => {
  const handleCategoryPress = (categoryId: string) => {
    ShopNavigator.goToCategory(categoryId);
  };

  const handleViewAllCategories = () => {
    ShopNavigator.goToAllCategories();
  };

  if (!categories || categories.length === 0) {
    return null; // Don't render the section if there's no data
  }

  return (
    <View style={styles.section}>
      <ShopCategories
        categories={categories}
        onCategoryPress={handleCategoryPress}
        showViewAll={true}
        onViewAllPress={handleViewAllCategories}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 12,
  },
});
