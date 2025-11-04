import Container from '@/components/Container';
import { ThemedText } from '@/components/themed-text';
import { card, colors } from '@/constants/color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { FontAwesome5 } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';

type RatingSummaryProps = {
  avgRating: number;
  totalReviews: number;
  distribution: Array<{
    stars: number;
    count: number;
    pct: number;
  }>;
};

const RatingSummary = ({ avgRating, totalReviews, distribution }: RatingSummaryProps) => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const renderDistributionBar = (stars: number, pct: number, count: number) => {
    let barColor = colors.success;
    if (stars <= 2) barColor = colors.error;
    else if (stars === 3) barColor = colors.warning;
    else if (stars === 4) barColor = '#f0ad4e';
    
    return (
      <View key={stars} style={styles.distRow}>
        <ThemedText endIcon={<FontAwesome5 name="star" size={12} color="#FFC107" solid />} type="label-small" style={{ width: 10 }}>
          {stars}
        </ThemedText>
        <View style={styles.distBarTrack}>
          <View
            style={[
              styles.distBarFill,
              { width: `${pct}%`, backgroundColor: barColor },
            ]}
          />
        </View>
        <ThemedText
          type="label-small"
          style={{ width: 38, textAlign: 'right' }}
        >
          {count}
        </ThemedText>
      </View>
    );
  };

  return (
    <Container
      padding={16}
      backgroundColor={isDark ? card.dark : card.light}
      style={styles.summaryCard}
    >
      <View style={styles.summaryLeft}>
        <ThemedText type="title-large" weight="bold">
          {avgRating.toFixed(1)}
        </ThemedText>
        <ThemedText type="body-small" style={{ marginTop: 2 }}>
          {totalReviews} Reviews
        </ThemedText>
        <View style={[styles.inline, { marginTop: 6 }]}>
          {Array.from({ length: 5 }).map((_, i) => (
            <FontAwesome5
              key={i}
              name="star"
              size={14}
              color={i < Math.round(avgRating) ? '#FFC107' : '#CBD5E1'}
              solid={i < Math.round(avgRating)}
            />
          ))}
        </View>
      </View>
      <View style={styles.summaryRight}>
        {distribution.map((d) => (
          <React.Fragment key={d.stars}>
            {renderDistributionBar(d.stars, d.pct, d.count)}
          </React.Fragment>
        ))}
      </View>
    </Container>
  );
};

export default RatingSummary;

const styles = StyleSheet.create({
  summaryCard: {
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  summaryLeft: {
    width: '35%',
  },
  summaryRight: {
    flex: 1,
    justifyContent: 'center',
  },
  distRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  distBarTrack: {
    flex: 1,
    height: 8,
    borderRadius: 6,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
    marginHorizontal: 6,
  },
  distBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});