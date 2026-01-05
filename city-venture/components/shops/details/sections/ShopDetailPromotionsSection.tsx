import { ShopDetailPromotionCard } from '@/components/shops/details/elements';
import type { BusinessProfileView } from '@/components/shops/details/types';
import { ShopColors } from '@/constants/color';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

// Brand colors for luxurious theme
const NAVY = '#0A1B47';
const GOLD = '#C5A059';
const GOLD_LIGHT = 'rgba(197, 160, 89, 0.12)';

interface ShopDetailPromotionsSectionProps {
  shop: BusinessProfileView;
}

const ShopDetailPromotionsSection: React.FC<ShopDetailPromotionsSectionProps> = ({ shop }) => {
  const hasPromotions = (shop.promotions?.length ?? 0) > 0;

  return (
    <View style={styles.container}>
      {/* Section Header - Icon | Title & Subtitle */}
      <View style={styles.sectionHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name="pricetag" size={16} color={GOLD} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.sectionTitle}>Promotions</Text>
          <Text style={styles.sectionSubtitle}>
            {hasPromotions 
              ? `${shop.promotions?.length} special ${shop.promotions?.length === 1 ? 'offer' : 'offers'} available`
              : 'Check back for deals'
            }
          </Text>
        </View>
      </View>

      {hasPromotions ? (
        <View style={styles.listContent}>
          {shop.promotions?.map((item) => (
            <ShopDetailPromotionCard key={item.id} promotion={item} />
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="gift-outline" size={28} color={GOLD} />
          </View>
          <Text style={styles.emptyStateTitle}>No promotions yet</Text>
          <Text style={styles.emptyStateText}>
            Stay tuned for exclusive deals and offers
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 20,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: GOLD_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: NAVY,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
    marginTop: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 64,
    gap: 14,
  },
  emptyState: {
    paddingVertical: 32,
    paddingHorizontal: 24,
    marginHorizontal: 16,
    alignItems: 'center',
    backgroundColor: GOLD_LIGHT,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.2)',
    borderStyle: 'dashed',
  },
  emptyIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyStateTitle: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    color: NAVY,
    marginBottom: 4,
  },
  emptyStateText: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
    textAlign: 'center',
  },
});

export default ShopDetailPromotionsSection;
