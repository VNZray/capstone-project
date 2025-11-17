import type { BusinessProfileRatingBreakdown } from '@/components/shops/details/types';
import { ShopColors } from '@/constants/ShopColors';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ShopDetailRatingBreakdownProps {
  rating: number;
  ratingCount: number;
  breakdown: BusinessProfileRatingBreakdown;
}

const RATINGS: Array<keyof BusinessProfileRatingBreakdown> = [5, 4, 3, 2, 1];

const ShopDetailRatingBreakdown: React.FC<ShopDetailRatingBreakdownProps> = ({
  rating,
  ratingCount,
  breakdown,
}) => {
  // Defensive null check for rating
  const safeRating = typeof rating === 'number' && !isNaN(rating) ? rating : 0;
  
  return (
    <View style={styles.container}>
      <View style={styles.summary}>
        <Text style={styles.ratingValue}>{safeRating.toFixed(1)}</Text>
        <Text style={styles.ratingCount}>{ratingCount || 0} reviews</Text>
      </View>

      <View style={styles.breakdown}>
        {RATINGS.map((value) => {
          const count = breakdown[value] ?? 0;
          const percentage = ratingCount ? (count / ratingCount) * 100 : 0;
          return (
            <View key={value} style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>{value}</Text>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${percentage}%` }]} />
              </View>
              <Text style={styles.breakdownCount}>{count}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: ShopColors.border,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  summary: {
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingValue: {
    fontSize: 36,
    fontFamily: 'Poppins-Bold',
    color: ShopColors.textPrimary,
  },
  ratingCount: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
  },
  breakdown: {
    marginTop: 0,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  breakdownLabel: {
    width: 24,
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: ShopColors.textPrimary,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: ShopColors.background,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: ShopColors.accent,
  },
  breakdownCount: {
    width: 40,
    textAlign: 'right',
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: ShopColors.textSecondary,
  },
});

export default ShopDetailRatingBreakdown;
