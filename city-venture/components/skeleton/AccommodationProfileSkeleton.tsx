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

const { width, height } = Dimensions.get('window');

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

const AccommodationProfileSkeleton: React.FC = () => {
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
            <View style={styles.headerLeft}>
              <ShimmerBlock style={styles.title} />
              <ShimmerBlock style={styles.subtitle} />
              <View style={styles.ratingRow}>
                <ShimmerBlock style={styles.rating} />
                <ShimmerBlock style={styles.reviews} />
              </View>
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            {[1, 2, 3].map((i) => (
              <ShimmerBlock key={i} style={styles.tab} />
            ))}
          </View>

          {/* Content Sections */}
          <View style={styles.sections}>
            {/* About Section */}
            <View style={styles.section}>
              <ShimmerBlock style={styles.sectionTitle} />
              <ShimmerBlock style={styles.textLine} />
              <ShimmerBlock style={styles.textLine} />
              <ShimmerBlock style={[styles.textLine, { width: '60%' }]} />
            </View>

            {/* Amenities Section */}
            <View style={styles.section}>
              <ShimmerBlock style={styles.sectionTitle} />
              <View style={styles.amenitiesGrid}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <View key={i} style={styles.amenityItem}>
                    <ShimmerBlock style={styles.amenityIcon} />
                    <ShimmerBlock style={styles.amenityLabel} />
                  </View>
                ))}
              </View>
            </View>

            {/* Business Hours Section */}
            <View style={styles.section}>
              <ShimmerBlock style={styles.sectionTitle} />
              {[1, 2, 3, 4, 5].map((i) => (
                <View key={i} style={styles.hourRow}>
                  <ShimmerBlock style={styles.dayLabel} />
                  <ShimmerBlock style={styles.timeLabel} />
                </View>
              ))}
            </View>

            {/* Contact Section */}
            <View style={styles.section}>
              <ShimmerBlock style={styles.sectionTitle} />
              <ShimmerBlock style={styles.contactItem} />
              <ShimmerBlock style={styles.contactItem} />
              <ShimmerBlock style={styles.contactItem} />
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
    width: width,
    height: height * 0.4,
    borderRadius: 0,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  headerLeft: {
    flex: 1,
    gap: 8,
  },
  title: {
    height: 28,
    width: '80%',
    borderRadius: 14,
  },
  subtitle: {
    height: 16,
    width: '50%',
    borderRadius: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  rating: {
    height: 20,
    width: 60,
    borderRadius: 10,
  },
  reviews: {
    height: 20,
    width: 100,
    borderRadius: 10,
  },
  tabs: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  tab: {
    height: 40,
    width: 100,
    borderRadius: 20,
  },
  sections: {
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    height: 24,
    width: 150,
    borderRadius: 12,
    marginBottom: 8,
  },
  textLine: {
    height: 14,
    width: '100%',
    borderRadius: 7,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  amenityItem: {
    width: '30%',
    alignItems: 'center',
    gap: 8,
  },
  amenityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  amenityLabel: {
    height: 12,
    width: 60,
    borderRadius: 6,
  },
  hourRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dayLabel: {
    height: 16,
    width: 80,
    borderRadius: 8,
  },
  timeLabel: {
    height: 16,
    width: 120,
    borderRadius: 8,
  },
  contactItem: {
    height: 20,
    width: '100%',
    borderRadius: 10,
    marginBottom: 8,
  },
  map: {
    height: 200,
    width: '100%',
    borderRadius: 16,
  },
});

export default AccommodationProfileSkeleton;
