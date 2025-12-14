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

const FavoriteSkeleton: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <ShimmerBlock style={styles.searchBar} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
        >
          {[1, 2, 3, 4, 5].map((i) => (
            <ShimmerBlock key={i} style={styles.tab} />
          ))}
        </ScrollView>
      </View>

      {/* Cards List */}
      <ScrollView
        style={styles.listContainer}
        showsVerticalScrollIndicator={false}
      >
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <View key={i} style={styles.card}>
            <ShimmerBlock style={styles.cardImage} />
            <View style={styles.cardContent}>
              <ShimmerBlock style={styles.cardTitle} />
              <ShimmerBlock style={styles.cardSubtitle} />
            </View>
            <ShimmerBlock style={styles.favoriteIcon} />
          </View>
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
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
  },
  searchBar: {
    height: 48,
    borderRadius: 12,
  },
  tabsContainer: {
    paddingBottom: 16,
  },
  tabsContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  tab: {
    height: 36,
    width: 100,
    borderRadius: 18,
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  cardImage: {
    width: 64,
    height: 64,
    borderRadius: 14,
  },
  cardContent: {
    flex: 1,
    gap: 8,
  },
  cardTitle: {
    height: 18,
    width: '80%',
    borderRadius: 4,
  },
  cardSubtitle: {
    height: 14,
    width: '60%',
    borderRadius: 4,
  },
  favoriteIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
});

export default FavoriteSkeleton;
