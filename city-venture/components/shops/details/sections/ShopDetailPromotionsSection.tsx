import { ShopDetailPromotionCard } from '@/components/shops/details/elements';
import type { BusinessProfileView } from '@/components/shops/details/types';
import { ShopColors } from '@/constants/ShopColors';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

interface ShopDetailPromotionsSectionProps {
  shop: BusinessProfileView;
}

const ShopDetailPromotionsSection: React.FC<ShopDetailPromotionsSectionProps> = ({ shop }) => {
  const hasPromotions = (shop.promotions?.length ?? 0) > 0;

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Promotions</Text>
          <Text style={styles.sectionSubtitle}>Limited-time deals from {shop.name}</Text>
        </View>
        {hasPromotions && (
          <Text style={styles.promoCount}>{shop.promotions?.length} active</Text>
        )}
      </View>

      {hasPromotions ? (
        <FlatList
          data={shop.promotions}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.promoList}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => <ShopDetailPromotionCard promotion={item} />}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>No promos right now</Text>
          <Text style={styles.emptyStateText}>Check back soon for new offers</Text>
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
    alignItems: 'center',
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
  promoCount: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: ShopColors.accent,
  },
  promoList: {
    paddingVertical: 4,
  },
  separator: {
    width: 12,
  },
  emptyState: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: ShopColors.textPrimary,
    marginBottom: 4,
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
  },
});

export default ShopDetailPromotionsSection;
