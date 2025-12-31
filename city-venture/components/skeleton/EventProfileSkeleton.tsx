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

const EventProfileSkeleton: React.FC = () => {
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
            <View style={styles.dateTimeRow}>
              <ShimmerBlock style={styles.dateBlock} />
              <ShimmerBlock style={styles.timeBlock} />
            </View>
            <ShimmerBlock style={styles.location} />
            <ShimmerBlock style={styles.category} />
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
              <ShimmerBlock style={[styles.textLine, { width: '75%' }]} />
            </View>

            {/* Details Section */}
            <View style={styles.section}>
              <ShimmerBlock style={styles.sectionTitle} />
              <View style={styles.detailsGrid}>
                {[1, 2, 3, 4].map((i) => (
                  <View key={i} style={styles.detailItem}>
                    <ShimmerBlock style={styles.detailIcon} />
                    <View style={styles.detailText}>
                      <ShimmerBlock style={styles.detailLabel} />
                      <ShimmerBlock style={styles.detailValue} />
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Organizer Section */}
            <View style={styles.section}>
              <ShimmerBlock style={styles.sectionTitle} />
              <View style={styles.organizerCard}>
                <ShimmerBlock style={styles.organizerAvatar} />
                <View style={styles.organizerInfo}>
                  <ShimmerBlock style={styles.organizerName} />
                  <ShimmerBlock style={styles.organizerContact} />
                </View>
              </View>
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
    height: 32,
    width: '85%',
    borderRadius: 6,
    marginBottom: 16,
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  dateBlock: {
    height: 20,
    width: 120,
    borderRadius: 4,
  },
  timeBlock: {
    height: 20,
    width: 100,
    borderRadius: 4,
  },
  location: {
    height: 18,
    width: '70%',
    borderRadius: 4,
    marginBottom: 12,
  },
  category: {
    height: 26,
    width: 90,
    borderRadius: 13,
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
  detailsGrid: {
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  detailText: {
    flex: 1,
    gap: 6,
  },
  detailLabel: {
    height: 14,
    width: 80,
    borderRadius: 4,
  },
  detailValue: {
    height: 18,
    width: '60%',
    borderRadius: 4,
  },
  organizerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  organizerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  organizerInfo: {
    flex: 1,
    gap: 8,
  },
  organizerName: {
    height: 20,
    width: '60%',
    borderRadius: 4,
  },
  organizerContact: {
    height: 16,
    width: '50%',
    borderRadius: 4,
  },
  map: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
});

export default EventProfileSkeleton;
