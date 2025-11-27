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

const CARD_WIDTH = 160;

const EventCompactCard: React.FC<Props> = ({ event, onPress }) => {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  // Date parsing
  const dateParts = event.date.split(' ');
  const month = dateParts[0] || 'NOV';
  const day = dateParts[1]?.replace(',', '') || '01';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
      onPress={() => onPress?.(event)}
    >
      {/* Image Section */}
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

      {/* Content Section */}
      <View style={styles.content}>
        <ThemedText
          type="label-medium"
          weight="semi-bold"
          numberOfLines={2}
          style={styles.title}
        >
          {event.name}
        </ThemedText>

        <View style={styles.metaRow}>
          <MaterialCommunityIcons
            name="map-marker-outline"
            size={12}
            color={colors.textSecondary}
          />
          <ThemedText
            type="label-small"
            lightColor={colors.textSecondary}
            darkColor={colors.textSecondary}
            numberOfLines={1}
            style={styles.location}
          >
            {event.location}
          </ThemedText>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    marginRight: 12,
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
    height: 100,
    width: '100%',
    backgroundColor: '#f0f0f0',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  dateBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
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
    fontSize: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: -2,
  },
  dateDay: {
    fontSize: 14,
    lineHeight: 18,
  },
  content: {
    padding: 10,
    gap: 6,
  },
  title: {
    fontSize: 13,
    lineHeight: 18,
    height: 36, // Fixed height for 2 lines
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: 11,
    flex: 1,
  },
});

export default EventCompactCard;
