import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import type { HomeEvent } from '@/services/HomeContentService';

type Props = {
  event: HomeEvent;
  onPress?: (event: HomeEvent) => void;
};

const EventListCard: React.FC<Props> = ({ event, onPress }) => (
  <Pressable style={styles.card} onPress={() => onPress?.(event)}>
    <Image source={{ uri: event.image }} style={styles.thumbnail} />
    <View style={styles.info}>
      <ThemedText
        type="body-medium"
        weight="bold"
        lightColor="#fff"
        numberOfLines={2}
      >
        {event.name}
      </ThemedText>
      <View style={styles.metaRow}>
        <MaterialCommunityIcons name="calendar" size={14} color="#FFD9B0" />
        <ThemedText type="label-small" lightColor="#FFE8D3">
          {event.date}
        </ThemedText>
      </View>
      <View style={styles.metaRow}>
        <MaterialCommunityIcons name="map-marker" size={14} color="#C1F5FF" />
        <ThemedText type="label-small" lightColor="#DDF8FF">
          {event.location}
        </ThemedText>
      </View>
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#1A1A2B',
    marginBottom: 12,
    gap: 12,
    alignItems: 'center',
  },
  thumbnail: {
    width: 84,
    height: 84,
    borderRadius: 12,
    backgroundColor: '#2B2A3D',
  },
  info: {
    flex: 1,
    gap: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});

export default EventListCard;
