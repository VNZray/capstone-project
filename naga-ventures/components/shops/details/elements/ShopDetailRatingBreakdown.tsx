import { ShopColors } from '@/constants/ShopColors';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ShopDetailRatingBreakdownProps {
  ratingBreakdown?: { 
    5: number; 
    4: number; 
    3: number; 
    2: number; 
    1: number; 
  };
  totalRatings: number;
}

const ShopDetailRatingBreakdown: React.FC<ShopDetailRatingBreakdownProps> = ({ 
  ratingBreakdown, 
  totalRatings 
}) => {
  if (!ratingBreakdown || totalRatings === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No rating breakdown available</Text>
      </View>
    );
  }

  return (
    <View style={styles.ratingBreakdownContainer}>
      {[5, 4, 3, 2, 1].map((star) => {
        const count = ratingBreakdown[star as keyof typeof ratingBreakdown] || 0;
        const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0;
        
        return (
          <View key={star} style={styles.ratingBreakdownRow}>
            <Text style={styles.ratingBreakdownStar}>{star}★</Text>
            <View style={styles.ratingBreakdownBarContainer}>
              <View 
                style={[
                  styles.ratingBreakdownBar, 
                  { width: `${percentage}%` }
                ]} 
              />
            </View>
            <Text style={styles.ratingBreakdownCount}>{count}</Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  ratingBreakdownContainer: {
    gap: 4,
  },
  ratingBreakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingBreakdownStar: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
    width: 20,
  },
  ratingBreakdownBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: ShopColors.border,
    borderRadius: 3,
  },
  ratingBreakdownBar: {
    height: '100%',
    backgroundColor: ShopColors.warning,
    borderRadius: 3,
  },
  ratingBreakdownCount: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
    width: 20,
    textAlign: 'right',
  },
  emptyContainer: {
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
    textAlign: 'center',
  },
});

export default React.memo(ShopDetailRatingBreakdown);