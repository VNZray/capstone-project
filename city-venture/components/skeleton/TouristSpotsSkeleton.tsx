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

const TouristSpotsSkeleton: React.FC = () => {
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
          {[1, 2, 3, 4].map((i) => (
            <ShimmerBlock key={i} style={styles.filterChip} />
          ))}
        </View>

        {/* Tourist Spot Cards */}
        <View style={styles.cardsContainer}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <View key={i} style={styles.card}>
              <ShimmerBlock style={styles.cardImage} />
              <View style={styles.cardContent}>
                <ShimmerBlock style={styles.cardTitle} />
                <ShimmerBlock style={styles.cardSubtitle} />
                <View style={styles.cardFooter}>
                  <ShimmerBlock style={styles.cardTag} />
                  <ShimmerBlock style={styles.cardRating} />
                </View>
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
    width: 80,
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
    height: 180,
    borderRadius: 16,
  },
  cardContent: {
    padding: 12,
    gap: 8,
  },
  cardTitle: {
    height: 20,
    width: '70%',
    borderRadius: 4,
  },
  cardSubtitle: {
    height: 16,
    width: '50%',
    borderRadius: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  cardTag: {
    height: 24,
    width: 60,
    borderRadius: 12,
  },
  cardRating: {
    height: 24,
    width: 80,
    borderRadius: 4,
  },
});

export default TouristSpotsSkeleton;
