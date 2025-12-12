import { Colors } from '@/constants/color';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  View,
  useColorScheme,
} from 'react-native';

const { width } = Dimensions.get('window');

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

const TouristSpotsProfileSkeleton: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <ShimmerBlock style={styles.heroImage} />

        {/* Content Container */}
        <View style={styles.content}>
          {/* Header Section */}
          <View style={styles.header}>
            <ShimmerBlock style={styles.title} />
            <ShimmerBlock style={styles.subtitle} />
            <View style={styles.ratingRow}>
              <ShimmerBlock style={styles.rating} />
              <ShimmerBlock style={styles.reviews} />
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {[1, 2, 3, 4].map((i) => (
              <ShimmerBlock key={i} style={styles.actionButton} />
            ))}
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            {[1, 2, 3].map((i) => (
              <ShimmerBlock key={i} style={styles.tab} />
            ))}
          </View>

          {/* Content Sections */}
          <View style={styles.sections}>
            {/* Description Section */}
            <View style={styles.section}>
              <ShimmerBlock style={styles.sectionTitle} />
              <ShimmerBlock style={styles.textLine} />
              <ShimmerBlock style={styles.textLine} />
              <ShimmerBlock style={[styles.textLine, { width: '70%' }]} />
            </View>

            {/* Features Section */}
            <View style={styles.section}>
              <ShimmerBlock style={styles.sectionTitle} />
              <View style={styles.featuresGrid}>
                {[1, 2, 3, 4].map((i) => (
                  <View key={i} style={styles.featureItem}>
                    <ShimmerBlock style={styles.featureIcon} />
                    <ShimmerBlock style={styles.featureLabel} />
                  </View>
                ))}
              </View>
            </View>

            {/* Hours Section */}
            <View style={styles.section}>
              <ShimmerBlock style={styles.sectionTitle} />
              {[1, 2, 3].map((i) => (
                <View key={i} style={styles.hourRow}>
                  <ShimmerBlock style={styles.day} />
                  <ShimmerBlock style={styles.time} />
                </View>
              ))}
            </View>

            {/* Map Section */}
            <View style={styles.section}>
              <ShimmerBlock style={styles.sectionTitle} />
              <ShimmerBlock style={styles.map} />
            </View>
          </View>
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
  heroImage: {
    width,
    height: 280,
    borderRadius: 0,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    height: 28,
    width: '80%',
    borderRadius: 6,
    marginBottom: 12,
  },
  subtitle: {
    height: 18,
    width: '60%',
    borderRadius: 4,
    marginBottom: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 12,
  },
  rating: {
    height: 24,
    width: 100,
    borderRadius: 12,
  },
  reviews: {
    height: 24,
    width: 80,
    borderRadius: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
  },
  tabs: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 12,
  },
  tab: {
    height: 20,
    width: 80,
    borderRadius: 4,
  },
  sections: {
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    height: 24,
    width: 140,
    borderRadius: 4,
    marginBottom: 8,
  },
  textLine: {
    height: 16,
    width: '100%',
    borderRadius: 4,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureItem: {
    width: (width - 64) / 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  featureLabel: {
    height: 16,
    flex: 1,
    borderRadius: 4,
  },
  hourRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  day: {
    height: 18,
    width: 100,
    borderRadius: 4,
  },
  time: {
    height: 18,
    width: 120,
    borderRadius: 4,
  },
  map: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
});

export default TouristSpotsProfileSkeleton;
