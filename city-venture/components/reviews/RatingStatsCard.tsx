import Container from '@/components/Container';
import { ThemedText } from '@/components/themed-text';
import { card, colors } from '@/constants/color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type RatingBreakdown = {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
};

type Props = {
  averageRating: number;
  totalReviews: number;
  breakdown: RatingBreakdown;
};

const RatingStatsCard = ({ averageRating, totalReviews, breakdown }: Props) => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const renderStarRow = (stars: number) => {
    const count = breakdown[stars as keyof RatingBreakdown];
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

    return (
      <View key={stars} style={styles.starRow}>
        <ThemedText type="body-medium" style={styles.starLabel}>
          {stars} ★
        </ThemedText>
        <View style={styles.barContainer}>
          <View
            style={[
              styles.barFill,
              {
                width: `${percentage}%`,
                backgroundColor: colors.primary,
              },
            ]}
          />
        </View>
        <ThemedText type="body-medium" style={styles.countText}>
          {count}
        </ThemedText>
      </View>
    );
  };

  return (
    <Container
      style={[
        styles.container,
        { backgroundColor: isDark ? card.dark : card.light },
      ]}
    >
      <View style={styles.content}>
        {/* Left side - Overall Rating */}
        <View style={styles.leftSection}>
          <ThemedText type="header-large" style={styles.ratingNumber}>
            {averageRating.toFixed(1)}
          </ThemedText>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name={
                  star <= averageRating
                    ? 'star'
                    : star - averageRating < 1
                    ? 'star-half'
                    : 'star-outline'
                }
                size={20}
                color={colors.warning}
              />
            ))}
          </View>
          <ThemedText type="body-small" style={styles.totalReviews}>
            {totalReviews} review{totalReviews !== 1 ? 's' : ''}
          </ThemedText>
        </View>

        {/* Right side - Bar Ratings */}
        <View style={styles.rightSection}>
          {[5, 4, 3, 2, 1].map((stars) => renderStarRow(stars))}
        </View>
      </View>
    </Container>
  );
};

export default RatingStatsCard;

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  content: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  leftSection: {
    flex: 1,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  ratingNumber: {
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 8,
  },
  totalReviews: {
    fontSize: 13,
    opacity: 0.7,
  },
  rightSection: {
    flex: 2,
    minWidth: 180,
    gap: 6,
    paddingVertical: 16,
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starLabel: {
    width: 36,
    fontSize: 13,
  },
  barContainer: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(128, 128, 128, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  countText: {
    width: 28,
    fontSize: 13,
    textAlign: 'right',
  },
});
