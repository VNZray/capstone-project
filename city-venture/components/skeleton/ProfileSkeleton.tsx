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

const ProfileSkeleton: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <ShimmerBlock style={styles.avatar} />
          <View style={styles.headerInfo}>
            <ShimmerBlock style={styles.name} />
            <ShimmerBlock style={styles.email} />
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={styles.statCard}>
              <ShimmerBlock style={styles.statValue} />
              <ShimmerBlock style={styles.statLabel} />
            </View>
          ))}
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <View key={i} style={styles.menuItem}>
              <View style={styles.menuLeft}>
                <ShimmerBlock style={styles.menuIcon} />
                <View style={styles.menuText}>
                  <ShimmerBlock style={styles.menuTitle} />
                  <ShimmerBlock style={styles.menuSubtitle} />
                </View>
              </View>
              <ShimmerBlock style={styles.menuArrow} />
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <ShimmerBlock style={styles.actionButton} />
          <ShimmerBlock style={styles.actionButton} />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  headerInfo: {
    flex: 1,
    gap: 8,
  },
  name: {
    height: 24,
    width: '70%',
    borderRadius: 4,
  },
  email: {
    height: 18,
    width: '85%',
    borderRadius: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    height: 28,
    width: 50,
    borderRadius: 4,
  },
  statLabel: {
    height: 16,
    width: '80%',
    borderRadius: 4,
  },
  menuContainer: {
    paddingHorizontal: 20,
    gap: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  menuText: {
    flex: 1,
    gap: 6,
  },
  menuTitle: {
    height: 18,
    width: '60%',
    borderRadius: 4,
  },
  menuSubtitle: {
    height: 14,
    width: '40%',
    borderRadius: 4,
  },
  menuArrow: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  actionButtons: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  actionButton: {
    height: 48,
    borderRadius: 12,
  },
});

export default ProfileSkeleton;
