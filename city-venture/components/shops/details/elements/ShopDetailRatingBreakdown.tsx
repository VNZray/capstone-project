import type { BusinessProfileRatingBreakdown } from '@/components/shops/details/types';
import { ShopColors } from '@/constants/ShopColors';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ShopDetailRatingBreakdownProps {
  rating: number;
  ratingCount: number;
  breakdown: BusinessProfileRatingBreakdown;
  onWriteReviewPress?: () => void;
}

const RATINGS: Array<keyof BusinessProfileRatingBreakdown> = [5, 4, 3, 2, 1];

const ShopDetailRatingBreakdown: React.FC<ShopDetailRatingBreakdownProps> = ({
  rating,
  ratingCount,
  breakdown,
  onWriteReviewPress,
}) => {
  const safeRating = typeof rating === 'number' && !isNaN(rating) ? rating : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reviews</Text>
        <TouchableOpacity style={styles.writeButton} onPress={onWriteReviewPress}>
          <Ionicons name="create-outline" size={16} color="#FFFFFF" />
          <Text style={styles.writeButtonText}>Write a Review</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Left Side: Big Summary */}
        <View style={styles.summary}>
          <Text style={styles.ratingValue}>{safeRating.toFixed(1)}</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name={star <= Math.round(safeRating) ? 'star' : 'star-outline'}
                size={16}
                color={ShopColors.warning}
              />
            ))}
          </View>
          <Text style={styles.ratingCount}>{ratingCount || 0} reviews</Text>
        </View>

        <View style={styles.divider} />

        {/* Right Side: Bars */}
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
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: ShopColors.textPrimary,
  },
  writeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ShopColors.accent,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 6,
  },
  writeButtonText: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summary: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 16,
    minWidth: 90,
  },
  ratingValue: {
    fontSize: 36,
    fontFamily: 'Poppins-Bold',
    color: ShopColors.textPrimary,
    lineHeight: 42,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
    marginVertical: 4,
  },
  ratingCount: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
  },
  divider: {
    width: 1,
    height: '80%',
    backgroundColor: '#F0F0F0',
    marginRight: 16,
  },
  breakdown: {
    flex: 1,
    justifyContent: 'center',
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  breakdownLabel: {
    width: 12,
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: ShopColors.textSecondary,
    marginRight: 8,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F5F5F5',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: ShopColors.warning,
    borderRadius: 3,
  },
});

export default ShopDetailRatingBreakdown;
