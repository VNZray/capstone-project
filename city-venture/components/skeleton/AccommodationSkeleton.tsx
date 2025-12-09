import { Colors } from '@/constants/color';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  View,
  useColorScheme,
} from 'react-native';

const ShimmerBlock = ({ style }: { style?: any }) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.shimmer,
        { backgroundColor: colors.surfaceOverlay, opacity },
        style,
      ]}
    />
  );
};

const AccommodationCardSkeleton = () => (
  <View style={styles.card}>
    <ShimmerBlock style={styles.cardImage} />
    <View style={styles.cardContent}>
      <ShimmerBlock style={styles.cardTitle} />
      <ShimmerBlock style={styles.cardSubtitle} />
      <View style={styles.cardRow}>
        <ShimmerBlock style={styles.cardBadge} />
        <ShimmerBlock style={styles.cardBadge} />
      </View>
      <ShimmerBlock style={styles.cardPrice} />
    </View>
  </View>
);

const AccommodationSkeleton: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Bar */}
      <View style={styles.header}>
        <ShimmerBlock style={styles.searchBar} />
      </View>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        {[1, 2, 3, 4].map((i) => (
          <ShimmerBlock key={i} style={styles.chip} />
        ))}
      </ScrollView>

      {/* Category Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryContainer}
      >
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <ShimmerBlock key={i} style={styles.categoryChip} />
        ))}
      </ScrollView>

      {/* Accommodation Cards */}
      <ScrollView
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      >
        {[1, 2, 3, 4].map((i) => (
          <AccommodationCardSkeleton key={i} />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  shimmer: {
    borderRadius: 8,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBar: {
    height: 48,
    borderRadius: 12,
  },
  filterContainer: {
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    height: 36,
    width: 120,
    borderRadius: 18,
  },
  categoryContainer: {
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  categoryChip: {
    height: 32,
    width: 80,
    borderRadius: 16,
  },
  listContainer: {
    paddingHorizontal: 16,
    gap: 16,
    paddingBottom: 100,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
  },
  cardContent: {
    padding: 12,
    gap: 8,
  },
  cardTitle: {
    height: 20,
    width: '70%',
    borderRadius: 10,
  },
  cardSubtitle: {
    height: 14,
    width: '50%',
    borderRadius: 7,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  cardBadge: {
    height: 24,
    width: 60,
    borderRadius: 12,
  },
  cardPrice: {
    height: 18,
    width: 100,
    borderRadius: 9,
    marginTop: 4,
  },
});

export default AccommodationSkeleton;
