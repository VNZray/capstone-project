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
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.65;
const CARD_HEIGHT = CARD_WIDTH * 1.3; // Adjusted aspect ratio
const SPACING = 16;

type TouristSpot = {
  id: string;
  name: string;
  image: string;
  rating: number;
  location: string;
  category: string;
  price?: string;
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
    price: 'Free',
  },
  {
    id: '2',
    name: 'Yosemite National Park',
    image:
      'https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?q=80&w=2000&auto=format&fit=crop',
    rating: 4.9,
    location: 'California',
    category: 'Nature',
    price: '$35/vehicle',
  },
  {
    id: '3',
    name: 'Grand Canyon',
    image:
      'https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?q=80&w=2000&auto=format&fit=crop',
    rating: 4.9,
    location: 'Arizona',
    category: 'Nature',
    price: '$30/entry',
  },
  {
    id: '4',
    name: 'Statue of Liberty',
    image:
      'https://images.unsplash.com/photo-1605130284535-11dd9eedc58a?q=80&w=2000&auto=format&fit=crop',
    rating: 4.7,
    location: 'New York, NY',
    category: 'Landmark',
    price: '$25/tour',
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
        <ThemedText type="sub-title-small" weight="bold">
          Featured Tourist Spots
        </ThemedText>
        <Pressable
          onPress={() => router.push('/(tabs)/(home)/(spot)')}
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        >
          <ThemedText type="label-small" style={{ color: colors.tint }}>
            View All {'>'}
          </ThemedText>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + SPACING}
        pagingEnabled={false}
      >
        {MOCK_SPOTS.map((spot) => (
          <SpotCard
            key={spot.id}
            spot={spot}
            onPress={() => handlePress(spot.id)}
            colors={colors}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const SpotCard = ({
  spot,
  onPress,
  colors,
}: {
  spot: TouristSpot;
  onPress: () => void;
  colors: typeof Colors.light;
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[
          styles.card,
          animatedStyle,
          {
            backgroundColor: colors.surface,
            shadowColor: colors.shadow,
          },
        ]}
      >
        <Image source={{ uri: spot.image }} style={styles.image} />

        {/* Gradient Overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.8)']}
          style={styles.gradient}
        />

        {/* Bottom Content */}
        <View style={styles.content}>
          <ThemedText
            type="sub-title-medium"
            weight="bold"
            style={styles.title}
            numberOfLines={2}
          >
            {spot.name}
          </ThemedText>

          <View style={styles.detailsRow}>
            <View style={styles.locationContainer}>
              <MaterialCommunityIcons
                name="map-marker"
                size={14}
                color="rgba(255,255,255,0.9)"
              />
              <ThemedText
                type="label-small"
                style={styles.locationText}
                numberOfLines={1}
              >
                {spot.location}
              </ThemedText>
            </View>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  scrollView: {
    marginHorizontal: -20, // Break out of parent padding
  },
  scrollContent: {
    paddingHorizontal: 20, // Add padding back to align first item
    gap: SPACING,
    paddingBottom: 20,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 20,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    lineHeight: 24,
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    marginRight: 8,
  },
  locationText: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 12,
  },
});

export default FeaturedTouristSpotsSection;
