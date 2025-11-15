import React from 'react';
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import type { HighlightedTouristSpot } from '@/services/HomeContentService';

type Props = {
  spot: HighlightedTouristSpot;
  onPress?: (spot: HighlightedTouristSpot) => void;
};

const TouristSpotCard: React.FC<Props> = ({ spot, onPress }) => (
  <Pressable style={styles.card} onPress={() => onPress?.(spot)}>
    <ImageBackground
      source={{ uri: spot.image }}
      style={StyleSheet.absoluteFill}
      imageStyle={styles.image}
    >
      <LinearGradient
        colors={['transparent', 'rgba(4,4,10,0.9)']}
        style={StyleSheet.absoluteFill}
      />
    </ImageBackground>
    <View style={styles.content}>
      <ThemedText type="card-title-small" weight="bold" lightColor="#FFF">
        {spot.name}
      </ThemedText>
      <View style={styles.metaRow}>
        {spot.barangay ? (
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="map-marker" size={14} color="#FFC9B5" />
            <ThemedText type="label-small" lightColor="#FFE1D6">
              {spot.barangay}
            </ThemedText>
          </View>
        ) : null}
        {typeof spot.rating === 'number' ? (
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="star" size={14} color="#FFD166" />
            <ThemedText type="label-small" lightColor="#FFE6A7">
              {spot.rating.toFixed(1)} ({spot.reviews ?? 0})
            </ThemedText>
          </View>
        ) : null}
      </View>
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  card: {
    width: 300,
    height: 210,
    borderRadius: 20,
    marginRight: 16,
    overflow: 'hidden',
    backgroundColor: '#1d1c2b',
  },
  image: {
    borderRadius: 20,
  },
  content: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    gap: 6,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});

export default TouristSpotCard;
