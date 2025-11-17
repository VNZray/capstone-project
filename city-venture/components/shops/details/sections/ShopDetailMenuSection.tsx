import { ShopDetailMenuItemCard } from '@/components/shops/details/elements';
import type { BusinessProfileMenuItem, BusinessProfileView } from '@/components/shops/details/types';
import { ShopColors } from '@/constants/ShopColors';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ShopDetailMenuSectionProps {
  shop: BusinessProfileView;
  onMenuItemPress?: (item: BusinessProfileMenuItem) => void;
}

const ShopDetailMenuSection: React.FC<ShopDetailMenuSectionProps> = ({
  shop,
  onMenuItemPress,
}) => {
  const menuCategories = useMemo(() => shop.menu ?? [], [shop.menu]);
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);
  const selectedCategory = menuCategories[selectedCategoryIndex];
  const menuItems = selectedCategory?.items ?? [];

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Menu</Text>
          <Text style={styles.sectionSubtitle}>{shop.tagline || 'Popular picks and best sellers'}</Text>
        </View>
        {shop.menu?.length ? (
          <Text style={styles.menuCategoryCount}>{shop.menu.length} categories</Text>
        ) : null}
      </View>

      {menuCategories.length > 0 ? (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryTabs}
          >
            {menuCategories.map((category, index) => (
              <TouchableOpacity
                key={category.category}
                style={[
                  styles.categoryTab,
                  selectedCategoryIndex === index && styles.categoryTabActive,
                ]}
                onPress={() => setSelectedCategoryIndex(index)}
              >
                <Text
                  style={[
                    styles.categoryTabText,
                    selectedCategoryIndex === index && styles.categoryTabTextActive,
                  ]}
                >
                  {category.category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.menuItemsContainer}>
            {menuItems.map((item) => (
              <ShopDetailMenuItemCard
                key={item.id}
                item={item}
                onPress={() => onMenuItemPress?.(item)}
              />
            ))}
          </View>
        </>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Menu coming soon</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    backgroundColor: ShopColors.cardBackground,
    margin: 16,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: ShopColors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
    marginTop: 4,
  },
  menuCategoryCount: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: ShopColors.textSecondary,
  },
  categoryTabs: {
    flexGrow: 1,
    paddingBottom: 12,
  },
  categoryTab: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: ShopColors.border,
    marginRight: 10,
    backgroundColor: '#FFFFFF',
  },
  categoryTabActive: {
    backgroundColor: ShopColors.accent,
    borderColor: ShopColors.accent,
  },
  categoryTabText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: ShopColors.textSecondary,
  },
  categoryTabTextActive: {
    color: '#FFFFFF',
  },
  menuItemsContainer: {
    rowGap: 12,
  },
  emptyState: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: ShopColors.textSecondary,
  },
});

export default ShopDetailMenuSection;
