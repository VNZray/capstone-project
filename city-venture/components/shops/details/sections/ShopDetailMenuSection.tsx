import type { BusinessProfileMenuItem, BusinessProfileView } from '@/components/shops/details/types';
import { ShopColors } from '@/constants/color';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.7;
const MENU_CARD_WIDTH = (screenWidth - 48) / 2;

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
    <View style={styles.container}>
      {/* Featured Offers Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionLabel}>Featured</Text>
        <Text style={styles.sectionTitle}>Top Picks</Text>
      </View>

      {featuredOffers.length ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuredScrollContent}
          decelerationRate="fast"
          snapToInterval={CARD_WIDTH + 12}
        >
          {featuredOffers.map((item, idx) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.featuredCard, idx === 0 && styles.featuredCardFirst]}
              activeOpacity={0.7}
              onPress={() => onMenuItemPress?.(item)}
            >
              <Image
                source={
                  item.image
                    ? { uri: item.image }
                    : require('@/assets/images/placeholder.png')
                }
                style={styles.featuredImage}
              />
              <View style={styles.featuredOverlay} />
              <View style={styles.featuredBadge}>
                <Ionicons name="star" size={10} color="#FFFFFF" />
                <Text style={styles.featuredBadgeText}>Featured</Text>
              </View>
              <View style={styles.featuredContent}>
                <Text style={styles.featuredName} numberOfLines={1}>
                  {item.item}
                </Text>
                <Text style={styles.featuredPrice}>{item.price}</Text>
              </View>
              <TouchableOpacity
                style={styles.featuredAddBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                onPress={() => onMenuItemPress?.(item)}
              >
                <Ionicons name="add" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="pricetag-outline" size={32} color={ShopColors.textSecondary} />
          <Text style={styles.emptyStateText}>No featured offers yet</Text>
        </View>
      )}

      {/* Divider */}
      <View style={styles.divider} />

      {/* All Menu Items Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionLabel}>Browse</Text>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>All Items</Text>
          {!!allMenuItems.length && (
            <Text style={styles.itemCount}>{allMenuItems.length} available</Text>
          )}
        </View>
      </View>

      {allMenuItems.length ? (
        <View style={styles.menuGrid}>
          {allMenuItems.map((item) => {
            const isUnavailable = !item.isAvailable || item.productData?.is_unavailable;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.menuCard, isUnavailable && styles.menuCardDisabled]}
                activeOpacity={0.7}
                onPress={() => onMenuItemPress?.(item)}
              >
                <View style={styles.menuImageContainer}>
                  <Image
                    source={
                      item.image
                        ? { uri: item.image }
                        : require('@/assets/images/placeholder.png')
                    }
                    style={styles.menuImage}
                  />
                  {isUnavailable && (
                    <View style={styles.soldOutOverlay}>
                      <Text style={styles.soldOutText}>Sold out</Text>
                    </View>
                  )}
                </View>
                <View style={styles.menuContent}>
                  <Text style={styles.menuName} numberOfLines={2}>
                    {item.item}
                  </Text>
                  {item.description ? (
                    <Text style={styles.menuDescription} numberOfLines={1}>
                      {item.description}
                    </Text>
                  ) : null}
                  <View style={styles.menuFooter}>
                    <Text style={styles.menuPrice}>{item.price}</Text>
                    {!isUnavailable && (
                      <TouchableOpacity
                        style={styles.menuAddBtn}
                        onPress={() => onMenuItemPress?.(item)}
                      >
                        <Ionicons name="add" size={16} color={ShopColors.textPrimary} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="restaurant-outline" size={32} color={ShopColors.textSecondary} />
          <Text style={styles.emptyStateText}>Menu coming soon</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    paddingBottom: 64,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: 'Poppins-SemiBold',
    color: ShopColors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    color: ShopColors.textPrimary,
    letterSpacing: -0.5,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  itemCount: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: ShopColors.border,
    marginVertical: 28,
  },

  // Featured Cards - Hero style
  featuredScrollContent: {
    paddingRight: 16,
  },
  featuredCard: {
    width: CARD_WIDTH,
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginLeft: 12,
    backgroundColor: ShopColors.cardBackground,
  },
  featuredCardFirst: {
    marginLeft: 0,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  featuredBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
  },
  featuredBadgeText: {
    fontSize: 11,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  featuredContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  featuredName: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
    marginBottom: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  featuredPrice: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  featuredAddBtn: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: ShopColors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Menu Grid - Clean cards
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  menuCard: {
    width: MENU_CARD_WIDTH,
    marginHorizontal: 6,
    marginBottom: 16,
    backgroundColor: ShopColors.cardBackground,
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuCardDisabled: {
    opacity: 0.6,
  },
  menuImageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: ShopColors.background,
  },
  menuImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  soldOutOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  soldOutText: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: ShopColors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuContent: {
    padding: 12,
  },
  menuName: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: ShopColors.textPrimary,
    lineHeight: 18,
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
    lineHeight: 16,
    marginBottom: 8,
  },
  menuFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuPrice: {
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
    color: ShopColors.textPrimary,
  },
  menuAddBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: ShopColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Empty State
  emptyState: {
    paddingVertical: 48,
    alignItems: 'center',
    gap: 12,
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: ShopColors.textSecondary,
  },
});

export default ShopDetailMenuSection;
