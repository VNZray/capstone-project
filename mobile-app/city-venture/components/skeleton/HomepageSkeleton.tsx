import { Colors } from '@/constants/color';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, useColorScheme } from 'react-native';

const HERO_HEIGHT = 280;

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

const HomepageSkeleton: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Hero Section */}
      <View style={[styles.hero, { backgroundColor: colors.primary }]}>
        <View style={styles.heroContent}>
          {/* Profile Section */}
          <View style={styles.topRow}>
            <View style={styles.profileSection}>
              <ShimmerBlock style={styles.avatar} />
              <View>
                <ShimmerBlock style={styles.textShort} />
                <ShimmerBlock style={[styles.textShort, { marginTop: 4 }]} />
              </View>
            </View>
            <View style={styles.iconRow}>
              <ShimmerBlock style={styles.iconButton} />
              <ShimmerBlock style={styles.iconButton} />
            </View>
          </View>

          {/* Search Bar */}
          <ShimmerBlock style={styles.searchBar} />
        </View>
      </View>

      {/* Content Section */}
      <View style={styles.content}>
        {/* Action Grid */}
        <View style={styles.actionGrid}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <View key={i} style={styles.actionItem}>
              <ShimmerBlock style={styles.actionIcon} />
              <ShimmerBlock style={styles.actionLabel} />
            </View>
          ))}
        </View>

        {/* Section 1 */}
        <View style={styles.section}>
          <ShimmerBlock style={styles.sectionTitle} />
          <View style={styles.cardRow}>
            <ShimmerBlock style={styles.cardLarge} />
          </View>
        </View>

        {/* Section 2 */}
        <View style={styles.section}>
          <ShimmerBlock style={styles.sectionTitle} />
          <View style={styles.cardRow}>
            <ShimmerBlock style={styles.card} />
            <ShimmerBlock style={styles.card} />
          </View>
        </View>
      </View>
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
  hero: {
    height: HERO_HEIGHT,
    paddingTop: 50,
  },
  heroContent: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  textShort: {
    width: 80,
    height: 12,
    borderRadius: 6,
  },
  iconRow: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  searchBar: {
    height: 48,
    borderRadius: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 30,
  },
  actionItem: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 20,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    marginBottom: 8,
  },
  actionLabel: {
    width: 50,
    height: 10,
    borderRadius: 5,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    width: 150,
    height: 20,
    borderRadius: 10,
    marginBottom: 16,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cardLarge: {
    flex: 1,
    height: 200,
    borderRadius: 16,
  },
  card: {
    flex: 1,
    height: 150,
    borderRadius: 16,
  },
});

export default HomepageSkeleton;
