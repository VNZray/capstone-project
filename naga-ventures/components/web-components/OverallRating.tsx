import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import StarRating from 'react-native-star-rating-widget';
import { ThemedText } from '../ThemedText';

interface Review {
  rating: number;
}

interface OverallRatingProps {
  reviews: Review[];
}

// Utility function to round to nearest 0.5
const sanitizeRating = (value: number) => {
  return Math.max(0, Math.min(5, Math.round(value * 2) / 2));
};

const OverallRating: React.FC<OverallRatingProps> = ({ reviews }) => {
  // Calculate rating distribution
  const ratingDistribution = useMemo(() => {
    const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => {
      const cleanRating = Math.max(1, Math.min(5, Math.round(r.rating))); // Clamp to [1–5]
      dist[cleanRating]++;
    });
    return dist;
  }, [reviews]);

  // Calculate average rating
  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, r) => sum + r.rating, 0);
    return total / reviews.length;
  }, [reviews]);

  const averageRatingRounded = sanitizeRating(averageRating);
  const maxCount = Math.max(...Object.values(ratingDistribution));

  return (
    <View style={{ flexDirection: 'row' }}>
      <View style={styles.averageContainer}>
        <ThemedText type="defaultSemiBold" style={styles.averageText}>
          {averageRatingRounded}
        </ThemedText>
        <StarRating
          rating={averageRatingRounded}
          onChange={() => {}}
          starSize={22}
          color="#FFD700"
          enableSwiping={false}
          enableHalfStar={true}
          maxStars={5}
        />
        <ThemedText style={styles.reviewCount}>
          {reviews.length} review{reviews.length !== 1 ? 's' : ''}
        </ThemedText>
      </View>

      <View style={styles.ratingBarsContainer}>
        {[5, 4, 3, 2, 1].map((star) => (
          <View key={star} style={styles.ratingBarRow}>
            <View style={styles.ratingLabelContainer}>
              <ThemedText style={styles.ratingLabel}>{star}</ThemedText>
              <ThemedText style={styles.starIcon}>★</ThemedText>
            </View>
            <View style={styles.ratingBarBackground}>
              <View
                style={[
                  styles.ratingBarFill,
                  {
                    width: `${
                      (ratingDistribution[star] / (maxCount || 1)) * 100
                    }%`,
                    backgroundColor: '#0A1B47',
                  },
                ]}
              />
            </View>
            <ThemedText style={styles.ratingCount}>
              {ratingDistribution[star]}
            </ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  averageContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  averageText: {
    fontSize: 42,
  },
  reviewCount: {
    fontSize: 12,
    color: 'gray',
    marginTop: 4,
  },
  ratingBarsContainer: {
    flex: 1,
    paddingLeft: 16,
    justifyContent: 'center',
    gap: 8,
    width: '100%',
  },
  ratingBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  ratingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 24,
    justifyContent: 'flex-end',
  },
  ratingLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  starIcon: {
    fontSize: 10,
    color: '#FFD700',
    marginLeft: 2,
  },
  ratingBarBackground: {
    flex: 1,
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
    marginLeft: 8,
  },
  ratingBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  ratingCount: {
    fontSize: 12,
    color: 'gray',
    marginLeft: 8,
  },
});

export default OverallRating;
