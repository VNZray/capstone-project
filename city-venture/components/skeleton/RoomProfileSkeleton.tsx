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

const RoomProfileSkeleton: React.FC = () => {
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

          {/* Price Section with Discount Badge */}
          <View style={styles.priceSection}>
            <View style={styles.priceRow}>
              <ShimmerBlock style={styles.price} />
              <ShimmerBlock style={styles.discountBadge} />
            </View>
            <ShimmerBlock style={styles.priceLabel} />
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
              <ShimmerBlock style={[styles.textLine, { width: '70%' }]} />
            </View>

            {/* Room Details */}
            <View style={styles.section}>
              <ShimmerBlock style={styles.sectionTitle} />
              <View style={styles.detailsGrid}>
                {[1, 2, 3, 4].map((i) => (
                  <View key={i} style={styles.detailItem}>
                    <ShimmerBlock style={styles.detailIcon} />
                    <ShimmerBlock style={styles.detailLabel} />
                    <ShimmerBlock style={styles.detailValue} />
                  </View>
                ))}
              </View>
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

            {/* Gallery Section */}
            <View style={styles.section}>
              <ShimmerBlock style={styles.sectionTitle} />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.gallery}
              >
                {[1, 2, 3, 4].map((i) => (
                  <ShimmerBlock key={i} style={styles.galleryImage} />
                ))}
              </ScrollView>
            </View>

            {/* Policies Section */}
            <View style={styles.section}>
              <ShimmerBlock style={styles.sectionTitle} />
              {[1, 2, 3].map((i) => (
                <View key={i} style={styles.policyItem}>
                  <ShimmerBlock style={styles.policyIcon} />
                  <ShimmerBlock style={styles.policyText} />
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom FAB Bar */}
      <View style={styles.fabBar}>
        <ShimmerBlock style={styles.favoriteButton} />
        <ShimmerBlock style={styles.bookButton} />
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
  heroImage: {
    width: width,
    height: height * 0.4,
    borderRadius: 0,
  },
  content: {
    padding: 16,
    paddingBottom: 140,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
    gap: 8,
  },
  title: {
    height: 28,
    width: '70%',
    borderRadius: 14,
  },
  subtitle: {
    height: 16,
    width: '40%',
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
  priceSection: {
    marginBottom: 24,
    gap: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  price: {
    height: 32,
    width: 120,
    borderRadius: 16,
  },
  discountBadge: {
    height: 24,
    width: 60,
    borderRadius: 12,
  },
  priceLabel: {
    height: 14,
    width: 80,
    borderRadius: 7,
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
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  detailItem: {
    width: '45%',
    gap: 8,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  detailLabel: {
    height: 12,
    width: '80%',
    borderRadius: 6,
  },
  detailValue: {
    height: 16,
    width: '60%',
    borderRadius: 8,
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
  gallery: {
    gap: 12,
  },
  galleryImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
  },
  policyItem: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  policyIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  policyText: {
    flex: 1,
    height: 16,
    borderRadius: 8,
  },
  fabBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 100,
    flexDirection: 'row',
    gap: 12,
  },
  favoriteButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  bookButton: {
    flex: 1,
    height: 56,
    borderRadius: 28,
  },
});

export default RoomProfileSkeleton;
