import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  Dimensions,
  useColorScheme,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/color';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.7;
const SPACING = 20;

type TouristSpot = {
  id: string;
  name: string;
  image: string;
  rating: number;
  location: string;
  category: string;
};

const MOCK_SPOTS: TouristSpot[] = [
  {
    id: '1',
    name: 'Golden Gate Bridge',
    image:
      'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?q=80&w=2000&auto=format&fit=crop',
    rating: 4.8,
    location: 'San Francisco, CA',
    category: 'Landmark',
  },
  {
    id: '2',
    name: 'Yosemite National Park',
    image:
      'https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?q=80&w=2000&auto=format&fit=crop',
    rating: 4.9,
    location: 'California',
    category: 'Nature',
  },
  {
    id: '3',
    name: 'Grand Canyon',
    image:
      'https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?q=80&w=2000&auto=format&fit=crop',
    rating: 4.9,
    location: 'Arizona',
    category: 'Nature',
  },
  {
    id: '4',
    name: 'Statue of Liberty',
    image:
      'https://images.unsplash.com/photo-1605130284535-11dd9eedc58a?q=80&w=2000&auto=format&fit=crop',
    rating: 4.7,
    location: 'New York, NY',
    category: 'Landmark',
  },
];

const FeaturedTouristSpotsSection = () => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const handlePress = (id: string) => {
    router.push({
      pathname: '/(tabs)/(home)/(spot)',
      params: { spotId: id },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="sub-title-medium" weight="bold">
          Featured Tourist Spots
        </ThemedText>
        <Pressable onPress={() => router.push('/(tabs)/(home)/(spot)')}>
          <ThemedText type="body-small" style={{ color: colors.primary }}>
            View All
          </ThemedText>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + SPACING}
      >
        {MOCK_SPOTS.map((spot) => (
          <Pressable
            key={spot.id}
            style={[
              styles.card,
              { backgroundColor: colors.surface, shadowColor: colors.shadow },
            ]}
            onPress={() => handlePress(spot.id)}
          >
            <View style={styles.imageContainer}>
              <Image source={{ uri: spot.image }} style={styles.image} />
              <View style={styles.badge}>
                <ThemedText type="label-small" style={styles.badgeText}>
                  {spot.category}
                </ThemedText>
              </View>
            </View>
            <View style={styles.content}>
              <View style={styles.row}>
                <ThemedText
                  type="body-medium"
                  weight="semi-bold"
                  numberOfLines={1}
                  style={styles.title}
                >
                  {spot.name}
                </ThemedText>
                <View style={styles.rating}>
                  <MaterialCommunityIcons
                    name="star"
                    size={14}
                    color="#FFD700"
                  />
                  <ThemedText type="label-small" weight="medium">
                    {spot.rating}
                  </ThemedText>
                </View>
              </View>
              <View style={styles.locationRow}>
                <MaterialCommunityIcons
                  name="map-marker-outline"
                  size={14}
                  color={colors.textSecondary}
                />
                <ThemedText
                  type="label-small"
                  style={{ color: colors.textSecondary }}
                  numberOfLines={1}
                >
                  {spot.location}
                </ThemedText>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 24,
    marginHorizontal: -20, // Break out of parent padding
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: SPACING,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 16,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  imageContainer: {
    height: 200,
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  content: {
    padding: 16,
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    marginRight: 8,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
});

export default FeaturedTouristSpotsSection;
