import type { BusinessProfileMenuItem, BusinessProfileView } from '@/components/shops/details/types';
import { ShopColors } from '@/constants/color';
import React, { useMemo } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ShopDetailMenuSectionProps {
  shop: BusinessProfileView;
  onMenuItemPress?: (item: BusinessProfileMenuItem) => void;
}

const ShopDetailMenuSection: React.FC<ShopDetailMenuSectionProps> = ({
  shop,
  onMenuItemPress,
}) => {
  const menuCategories = useMemo(() => shop.menu ?? [], [shop.menu]);

  const allMenuItems = useMemo(() => {
    return menuCategories.flatMap((category) => category.items ?? []);
  }, [menuCategories]);

  const featuredOffers = useMemo(() => {
    if (!allMenuItems.length) return [];

    const popular = allMenuItems.filter((item) => item.isPopular);
    if (popular.length >= 3) return popular.slice(0, 3);

    return allMenuItems.slice(0, 3);
  }, [allMenuItems]);

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Featured Offers</Text>
          <Text style={styles.sectionSubtitle}>
            Curated highlights from this shop
          </Text>
        </View>
        {!!featuredOffers.length && (
          <Text style={styles.menuCategoryCount}>{featuredOffers.length} picks</Text>
        )}
      </View>

      {featuredOffers.length ? (
        <ScrollView
          style={styles.featuredScroll}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuredList}
        >
          {featuredOffers.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.featuredCard}
              activeOpacity={0.9}
              onPress={() => onMenuItemPress?.(item)}
            >
              <View style={styles.featuredImageWrapper}>
                <Image
                  source={
                    item.image
                      ? { uri: item.image }
                      : require('@/assets/images/placeholder.png')
                  }
                  style={styles.featuredImage}
                />
                <View style={styles.featuredPriceBadge}>
                  <Text style={styles.featuredPriceText}>{item.price}</Text>
                </View>
              </View>
              <View style={styles.featuredContent}>
                <Text style={styles.featuredName} numberOfLines={2}>
                  {item.item}
                </Text>
                {item.description ? (
                  <Text style={styles.featuredDescription} numberOfLines={1}>
                    {item.description}
                  </Text>
                ) : null}
                <View style={styles.featuredFooter}>
                  <Text style={styles.featuredTag}>Special</Text>
                  <TouchableOpacity
                    style={styles.featuredAction}
                    onPress={() => onMenuItemPress?.(item)}
                  >
                    <Text style={styles.featuredActionText}>Add</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No featured offers yet</Text>
        </View>
      )}

      <View style={[styles.sectionHeader, styles.sectionSpacer]}>
        <View>
          <Text style={styles.sectionTitle}>All Menu Items</Text>
          <Text style={styles.sectionSubtitle}>Everything available right now</Text>
        </View>
        {!!allMenuItems.length && (
          <Text style={styles.menuCategoryCount}>{allMenuItems.length} items</Text>
        )}
      </View>

      {allMenuItems.length ? (
        <View style={styles.menuGrid}>
          {allMenuItems.map((item) => {
            const isUnavailable = !item.isAvailable || item.productData?.is_unavailable;
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuCard,
                  isUnavailable && styles.menuCardDisabled,
                ]}
                activeOpacity={0.9}
                onPress={() => onMenuItemPress?.(item)}
              >
                <View style={styles.menuImageWrapper}>
                  <Image
                    source={
                      item.image
                        ? { uri: item.image }
                        : require('@/assets/images/placeholder.png')
                    }
                    style={styles.menuImage}
                  />
                </View>
                <Text style={styles.menuName} numberOfLines={2}>
                  {item.item}
                </Text>
                {item.description ? (
                  <Text style={styles.menuDescription} numberOfLines={2}>
                    {item.description}
                  </Text>
                ) : null}
                <View style={styles.menuFooter}>
                  <Text style={styles.menuPrice}>{item.price}</Text>
                  <TouchableOpacity
                    style={[
                      styles.menuAddButton,
                      isUnavailable && styles.menuAddButtonDisabled,
                    ]}
                    disabled={isUnavailable}
                    onPress={() => onMenuItemPress?.(item)}
                  >
                    <Text style={styles.menuAddText}>
                      {isUnavailable ? 'Sold out' : 'Add'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
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
    backgroundColor: ShopColors.background,
    marginHorizontal: 12,
    marginVertical: 12,
    borderRadius: 16,
    padding: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
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
  sectionSpacer: {
    marginTop: 16,
  },
  featuredScroll: {
    marginRight: -12,
    paddingRight: 12,
  },
  featuredList: {
    paddingVertical: 4,
    paddingLeft: 4,
  },
  featuredCard: {
    width: 220,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: ShopColors.border,
    marginRight: 12,
    shadowColor: '#40506A',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  featuredImageWrapper: {
    position: 'relative',
    height: 130,
    backgroundColor: ShopColors.cardBackground,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  featuredPriceBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#2BA245',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  featuredPriceText: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
  },
  featuredContent: {
    padding: 12,
  },
  featuredName: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: ShopColors.textPrimary,
  },
  featuredDescription: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
    marginTop: 2,
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  featuredTag: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: ShopColors.accent,
    backgroundColor: ShopColors.highlight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  featuredAction: {
    backgroundColor: '#E0ECFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  featuredActionText: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: ShopColors.accent,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: ShopColors.border,
    marginBottom: 12,
    shadowColor: '#40506A',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  menuCardDisabled: {
    opacity: 0.6,
  },
  menuImageWrapper: {
    alignItems: 'center',
    marginBottom: 10,
  },
  menuImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    resizeMode: 'cover',
  },
  menuName: {
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
    color: ShopColors.textPrimary,
  },
  menuDescription: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
    marginTop: 4,
    minHeight: 34,
  },
  menuFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  menuPrice: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: ShopColors.textPrimary,
  },
  menuAddButton: {
    backgroundColor: ShopColors.accent,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  menuAddButtonDisabled: {
    backgroundColor: ShopColors.disabled,
  },
  menuAddText: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
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
