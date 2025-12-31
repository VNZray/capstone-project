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
    outputRange: [1, 1],
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

const RoomCardSkeleton = () => (
  <View style={styles.card}>
    <ShimmerBlock style={styles.cardImage} />
    <View style={styles.cardContent}>
      <ShimmerBlock style={styles.cardTitle} />
      <ShimmerBlock style={styles.cardSubtitle} />
      <View style={styles.cardRow}>
        <ShimmerBlock style={styles.cardBadge} />
        <ShimmerBlock style={styles.cardBadge} />
      </View>
      <View style={styles.cardFooter}>
        <ShimmerBlock style={styles.cardPrice} />
        <ShimmerBlock style={styles.cardButton} />
      </View>
    </View>
  </View>
);

const RoomsSkeleton: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header Section */}
      <View style={styles.header}>
        {/* View Toggle */}
        <View style={styles.viewToggle}>
          <ShimmerBlock style={styles.toggleButton} />
          <ShimmerBlock style={styles.toggleButton} />
        </View>

        {/* Filter Dropdowns */}
        <View style={styles.filterRow}>
          <ShimmerBlock style={styles.dropdown} />
          <ShimmerBlock style={styles.dropdown} />
        </View>
      </View>

      {/* Date Range Info (if dates selected) */}
      <View style={styles.dateInfo}>
        <ShimmerBlock style={styles.dateText} />
      </View>

      {/* Room Cards */}
      <ScrollView
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      >
        {[1, 2, 3, 4].map((i) => (
          <RoomCardSkeleton key={i} />
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
    gap: 12,
  },
  viewToggle: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dropdown: {
    flex: 1,
    height: 48,
    borderRadius: 12,
  },
  dateInfo: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  dateText: {
    height: 16,
    width: '70%',
    borderRadius: 8,
  },
  listContainer: {
    paddingHorizontal: 16,
    gap: 16,
    paddingBottom: 120,
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
    width: '60%',
    borderRadius: 10,
  },
  cardSubtitle: {
    height: 14,
    width: '40%',
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
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  cardPrice: {
    height: 24,
    width: 100,
    borderRadius: 12,
  },
  cardButton: {
    height: 36,
    width: 80,
    borderRadius: 18,
  },
});

export default RoomsSkeleton;
