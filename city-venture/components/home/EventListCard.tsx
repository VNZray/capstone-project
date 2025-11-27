import React from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  View,
  useColorScheme,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/color';
import type { HomeEvent } from '@/services/HomeContentService';

type Props = {
  event: HomeEvent;
  onPress?: (event: HomeEvent) => void;
};

const EventListCard: React.FC<Props> = ({ event, onPress }) => {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  // Date parsing
  const dateParts = event.date.split(' ');
  const month = dateParts[0] || 'NOV';
  const day = dateParts[1]?.replace(',', '') || '01';
  const time = event.date.includes(',')
    ? event.date.split(', ')[1]
    : event.date;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.995 : 1 }],
        },
      ]}
      onPress={() => onPress?.(event)}
    >
      {/* Image Section */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: event.image }} style={styles.image} />
        {/* Minimalist Date Badge */}
        <View style={styles.dateBadge}>
          <ThemedText
            type="label-small"
            weight="bold"
            style={styles.dateMonth}
            lightColor="#000"
            darkColor="#000"
          >
            {month}
          </ThemedText>
          <ThemedText
            type="sub-title-small"
            weight="bold"
            style={styles.dateDay}
            lightColor="#000"
            darkColor="#000"
          >
            {day}
          </ThemedText>
        </View>
      </View>

      {/* Content Section */}
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <ThemedText
            type="sub-title-medium"
            weight="semi-bold"
            numberOfLines={2}
            style={styles.title}
          >
            {event.name}
          </ThemedText>
        </View>

        <View style={styles.metaContainer}>
          <View style={styles.metaRow}>
            <MaterialCommunityIcons
              name="clock-time-four-outline"
              size={14}
              color={colors.textSecondary}
            />
            <ThemedText
              type="label-small"
              lightColor={colors.textSecondary}
              darkColor={colors.textSecondary}
            >
              {time}
            </ThemedText>
          </View>

          <View style={styles.metaRow}>
            <MaterialCommunityIcons
              name="map-marker-outline"
              size={14}
              color={colors.textSecondary}
            />
            <ThemedText
              type="label-small"
              lightColor={colors.textSecondary}
              darkColor={colors.textSecondary}
              numberOfLines={1}
              style={{ flex: 1 }}
            >
              {event.location}
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Chevron */}
      <View style={styles.actionIcon}>
        <MaterialCommunityIcons
          name="chevron-right"
          size={20}
          color={colors.iconSecondary}
        />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 16,
    borderWidth: 1,
    // Minimalist shadow for depth without clutter
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  imageContainer: {
    width: 88,
    height: 88,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#f0f0f0',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  dateBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 36,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dateMonth: {
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: -2,
  },
  dateDay: {
    fontSize: 15,
    lineHeight: 18,
  },
  content: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'space-between',
    height: 80, // Match image height roughly for vertical rhythm
    paddingVertical: 2,
  },
  headerRow: {
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    lineHeight: 20,
  },
  metaContainer: {
    gap: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionIcon: {
    paddingLeft: 8,
    paddingRight: 4,
  },
});

export default EventListCard;
