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
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1500,
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

const EventSkeleton: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <ShimmerBlock style={styles.searchBar} />
        </View>

        {/* Filter Chips */}
        <View style={styles.filterContainer}>
          {[1, 2, 3].map((i) => (
            <ShimmerBlock key={i} style={styles.filterChip} />
          ))}
        </View>

        {/* Event Cards */}
        <View style={styles.cardsContainer}>
          {[1, 2, 3, 4, 5].map((i) => (
            <View key={i} style={styles.card}>
              <ShimmerBlock style={styles.cardImage} />
              <View style={styles.cardContent}>
                <ShimmerBlock style={styles.cardTitle} />
                <ShimmerBlock style={styles.cardDate} />
                <ShimmerBlock style={styles.cardLocation} />
                <ShimmerBlock style={styles.cardCategory} />
              </View>
            </View>
          ))}
        </View>
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
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  searchBar: {
    height: 48,
    borderRadius: 24,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
  },
  filterChip: {
    height: 32,
    width: 90,
    borderRadius: 16,
  },
  cardsContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 140,
    borderRadius: 16,
  },
  cardContent: {
    padding: 12,
    gap: 8,
  },
  cardTitle: {
    height: 22,
    width: '80%',
    borderRadius: 4,
  },
  cardDate: {
    height: 16,
    width: '40%',
    borderRadius: 4,
  },
  cardLocation: {
    height: 16,
    width: '60%',
    borderRadius: 4,
  },
  cardCategory: {
    height: 24,
    width: 70,
    borderRadius: 12,
    marginTop: 4,
  },
});

export default EventSkeleton;
