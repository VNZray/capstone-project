import type { BusinessProfilePromotion } from '@/components/shops/details/types';
import { ShopColors } from '@/constants/color';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

interface ShopDetailPromotionCardProps {
  promotion: BusinessProfilePromotion;
}

const ShopDetailPromotionCard: React.FC<ShopDetailPromotionCardProps> = ({ promotion }) => (
  <View style={styles.card}>
    {promotion.image && <Image source={{ uri: promotion.image }} style={styles.image} />}
    <View style={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>{promotion.title}</Text>
        {promotion.discountPercent && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{promotion.discountPercent}% OFF</Text>
          </View>
        )}
      </View>
      <Text style={styles.description}>{promotion.description}</Text>
      {promotion.validUntil && (
        <Text style={styles.validity}>Valid until {promotion.validUntil}</Text>
      )}
      {promotion.terms && <Text style={styles.terms}>{promotion.terms}</Text>}
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    width: 280,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: ShopColors.border,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 140,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: ShopColors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  badge: {
    backgroundColor: ShopColors.accent,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
  },
  description: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
    marginBottom: 8,
  },
  validity: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: ShopColors.accent,
    marginBottom: 4,
  },
  terms: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
  },
});

export default ShopDetailPromotionCard;
