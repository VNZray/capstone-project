import type { BusinessProfilePromotion } from '@/components/shops/details/types';
import { ShopColors } from '@/constants/color';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Brand colors for luxurious theme
const NAVY = '#0A1B47';
const GOLD = '#C5A059';
const GOLD_LIGHT = 'rgba(197, 160, 89, 0.12)';

interface ShopDetailPromotionCardProps {
  promotion: BusinessProfilePromotion;
  onPress?: () => void;
}

const ShopDetailPromotionCard: React.FC<ShopDetailPromotionCardProps> = ({ 
  promotion,
  onPress,
}) => (
  <TouchableOpacity 
    style={styles.card} 
    activeOpacity={0.9}
    onPress={onPress}
  >
    {/* Image Section - ~60% of card */}
    <View style={styles.imageContainer}>
      {promotion.image ? (
        <Image source={{ uri: promotion.image }} style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Ionicons name="gift-outline" size={40} color={GOLD} />
        </View>
      )}
      
      {/* Discount Badge */}
      {promotion.discountPercent && (
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{promotion.discountPercent}%</Text>
          <Text style={styles.discountLabel}>OFF</Text>
        </View>
      )}
      
      {/* Gold accent line */}
      <View style={styles.accentBar} />
    </View>

    {/* Content Section */}
    <View style={styles.content}>
      <Text style={styles.title} numberOfLines={1}>{promotion.title}</Text>
      <Text style={styles.description} numberOfLines={2}>
        {promotion.description}
      </Text>
      
      <View style={styles.footer}>
        {promotion.validUntil && (
          <View style={styles.validityRow}>
            <Ionicons name="calendar-outline" size={12} color={ShopColors.textSecondary} />
            <Text style={styles.validityText}>Until {promotion.validUntil}</Text>
          </View>
        )}
        <View style={styles.ctaButton}>
          <Text style={styles.ctaText}>View Details</Text>
          <Ionicons name="chevron-forward" size={14} color={NAVY} />
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: ShopColors.border,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 16 / 10,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: GOLD_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accentBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: GOLD,
  },
  discountBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: NAVY,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  discountText: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
    lineHeight: 18,
  },
  discountLabel: {
    fontSize: 9,
    fontFamily: 'Poppins-SemiBold',
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  content: {
    padding: 14,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: NAVY,
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  validityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  validityText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: ShopColors.textSecondary,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: GOLD_LIGHT,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  ctaText: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: NAVY,
  },
});

export default ShopDetailPromotionCard;
