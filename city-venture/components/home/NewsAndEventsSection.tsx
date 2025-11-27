import React from 'react';
import {
  View,
  StyleSheet,
  useColorScheme,
  Pressable,
  ScrollView,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/color';
import NewsCard from './NewsCard';
import EventCompactCard from './EventCompactCard';
import type { HomeEvent, NewsArticle } from '@/services/HomeContentService';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Props = {
  newsData: NewsArticle[];
  eventsData: HomeEvent[];
  loading: boolean;
  error?: string;
  onPressArticle: (article: NewsArticle) => void;
  onPressEvent: (event: HomeEvent) => void;
  onPressViewAllEvents: () => void;
};

const NewsAndEventsSection: React.FC<Props> = ({
  newsData,
  eventsData,
  loading,
  error,
  onPressArticle,
  onPressEvent,
  onPressViewAllEvents,
}) => {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  // We only show the first news item as the "Hero"
  const featuredNews = newsData.length > 0 ? newsData[0] : null;
  const secondNews = newsData.length > 1 ? newsData[1] : null;

  if (loading) {
    return <LoadingState colors={colors} />;
  }

  if (error) {
    return null; // Or a retry component
  }

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <ThemedText type="sub-title-small" weight="bold">
          News & Events
        </ThemedText>
        <Pressable
          onPress={onPressViewAllEvents}
          style={({ pressed }) => ({
            opacity: pressed ? 0.7 : 1,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
          })}
        >
          <ThemedText type="label-small" style={{ color: colors.tint }}>
            View All
          </ThemedText>
          <MaterialCommunityIcons
            name="arrow-right"
            size={16}
            color={colors.accent}
          />
        </Pressable>
      </View>

      {/* 1. Events Horizontal Reel (Now First) */}
      {eventsData.length > 0 && (
        <View style={styles.eventsSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.eventsScrollContent}
            decelerationRate="fast"
            snapToInterval={172} // Card width (160) + margin (12)
          >
            {eventsData.map((event) => (
              <EventCompactCard
                key={event.id}
                event={event}
                onPress={onPressEvent}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* 2. Hero News Card */}
      {featuredNews && (
        <View style={styles.heroContainer}>
          <NewsCard
            article={featuredNews}
            onPress={onPressArticle}
            variant="featured"
          />
        </View>
      )}

      {/* 3. Medium (Compact) News Card */}
      {secondNews && (
        <View style={styles.mediumNewsContainer}>
          <NewsCard
            article={secondNews}
            onPress={onPressArticle}
            variant="compact"
          />
        </View>
      )}
    </View>
  );
};

const LoadingState = ({ colors }: { colors: typeof Colors.light }) => (
  <View style={styles.container}>
    <View
      style={[styles.skeletonHero, { backgroundColor: colors.surfaceOverlay }]}
    />
    <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
      <View
        style={[
          styles.skeletonCard,
          { backgroundColor: colors.surfaceOverlay },
        ]}
      />
      <View
        style={[
          styles.skeletonCard,
          { backgroundColor: colors.surfaceOverlay },
        ]}
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroContainer: {
    marginBottom: 16,
    marginTop: 24,
  },
  mediumNewsContainer: {
    marginBottom: 8,
  },
  eventsSection: {
    gap: 12,
    marginHorizontal: -20, // Break out of parent padding
  },
  eventsScrollContent: {
    paddingHorizontal: 20, // Restore visual padding
  },
  skeletonHero: {
    height: 280,
    borderRadius: 24,
    width: '100%',
  },
  skeletonCard: {
    height: 160,
    width: 160,
    borderRadius: 16,
  },
});

export default NewsAndEventsSection;
