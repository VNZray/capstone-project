import React from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  View,
  useColorScheme,
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

  // Simple date parsing for the "MMM DD, TIME" format
  // Fallback values provided if format doesn't match
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
          transform: [{ scale: pressed ? 0.98 : 1 }],
          shadowColor: colors.shadow,
        },
      ]}
      onPress={() => onPress?.(event)}
    >
      {/* Image Container with Date Badge */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: event.image }} style={styles.image} />
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

      {/* Content */}
      <View style={styles.content}>
        <ThemedText type="sub-title-small" weight="bold" numberOfLines={2}>
          {event.name}
        </ThemedText>

        <View style={styles.metaContainer}>
          <View style={styles.metaRow}>
            <MaterialCommunityIcons
              name="clock-outline"
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

      {/* Action Icon */}
      <View style={styles.actionIcon}>
        <MaterialCommunityIcons
          name="arrow-right"
          size={20}
          color={colors.textSecondary}
        />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: StyleSheet.hairlineWidth,
    elevation: 2,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  imageContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 18,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  dateBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40,
  },
  dateMonth: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateDay: {
    fontSize: 16,
    lineHeight: 20,
  },
  content: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
    gap: 8,
  },
  metaContainer: {
    gap: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionIcon: {
    paddingLeft: 8,
    justifyContent: 'center',
  },
});

export default EventListCard;
