import React from 'react';
import { View, StyleSheet, useColorScheme, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/color';
import EventListCard from './EventListCard';
import { HomeEvent } from '@/services/HomeContentService';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type EventsSectionProps = {
  data: HomeEvent[];
  loading: boolean;
  error?: string;
  onPressEvent: (event: HomeEvent) => void;
  onPressViewAll: () => void;
};

const EventsSection: React.FC<EventsSectionProps> = ({
  data,
  loading,
  error,
  onPressEvent,
  onPressViewAll,
}) => {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  if (loading && data.length === 0) {
    return (
      <View style={styles.container}>
        <SectionHeader onPressViewAll={onPressViewAll} colors={colors} />
        <EventSkeleton colors={colors} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <SectionHeader onPressViewAll={onPressViewAll} colors={colors} />
        <ThemedText
          type="label-small"
          style={{ color: colors.error, marginTop: 8 }}
        >
          {error}
        </ThemedText>
      </View>
    );
  }

  if (data.length === 0) {
    return (
      <View style={styles.container}>
        <SectionHeader onPressViewAll={onPressViewAll} colors={colors} />
        <EmptyState colors={colors} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SectionHeader onPressViewAll={onPressViewAll} colors={colors} />
      <View style={styles.listContainer}>
        {data.map((event) => (
          <EventListCard key={event.id} event={event} onPress={onPressEvent} />
        ))}
      </View>
    </View>
  );
};

const SectionHeader = ({
  onPressViewAll,
  colors,
}: {
  onPressViewAll: () => void;
  colors: typeof Colors.light;
}) => (
  <View style={styles.header}>
    <ThemedText type="sub-title-small" weight="bold">
      Upcoming Events
    </ThemedText>
    <Pressable
      onPress={onPressViewAll}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
    >
      <ThemedText type="label-small" style={{ color: colors.tint }}>
        View All {'>'}
      </ThemedText>
    </Pressable>
  </View>
);

const EmptyState = ({ colors }: { colors: typeof Colors.light }) => (
  <View
    style={[
      styles.emptyState,
      {
        backgroundColor: colors.surfaceOverlay,
        borderColor: colors.border,
      },
    ]}
  >
    <MaterialCommunityIcons
      name="calendar-blank"
      size={24}
      color={colors.icon}
      style={{ marginBottom: 8 }}
    />
    <ThemedText type="label-small" style={{ color: colors.textSecondary }}>
      No upcoming events available.
    </ThemedText>
  </View>
);

const EventSkeleton = ({ colors }: { colors: typeof Colors.light }) => (
  <View style={styles.listContainer}>
    {[1, 2, 3].map((i) => (
      <View
        key={i}
        style={[
          styles.skeletonItem,
          { backgroundColor: colors.surfaceOverlay },
        ]}
      />
    ))}
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
    marginBottom: 12,
  },
  listContainer: {
    gap: 12,
  },
  emptyState: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderStyle: 'dashed',
  },
  skeletonItem: {
    height: 100,
    borderRadius: 16,
    width: '100%',
  },
});

export default EventsSection;
