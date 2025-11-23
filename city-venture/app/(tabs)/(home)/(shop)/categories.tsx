import PageContainer from '@/components/PageContainer';
import ShopCategoryTile from '@/components/shops/ShopCategoryTile';
import { ShopColors } from '@/constants/color';
import { SHOP_CATEGORIES } from '@/constants/ShopCategories';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

const ShopCategoriesScreen = () => {
  const router = useRouter();
  // In a real app, you might want to pass the active category or handle selection
  // For now, we'll just display them and maybe navigate back with a filter?
  // Or just let the user browse.
  
  const handleCategoryPress = (categoryKey: string) => {
    // In the future, this could navigate back to ShopDirectory with the selected category
    // or filter a list on this page.
    // For now, let's just go back to the shop directory (which is the previous screen usually)
    // and maybe we could pass a param, but ShopDirectory state is local.
    // Let's just go back for now.
    router.back();
  };

  return (
    <PageContainer style={{ backgroundColor: ShopColors.background }}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {Object.entries(SHOP_CATEGORIES).map(([key, { label, icon }]) => (
            <View key={key} style={styles.itemWrapper}>
              <ShopCategoryTile
                label={label}
                icon={icon}
                active={false} // Or handle active state if passed via params
                onPress={() => handleCategoryPress(key)}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    padding: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  itemWrapper: {
    marginBottom: 16,
  },
});

export default ShopCategoriesScreen;

