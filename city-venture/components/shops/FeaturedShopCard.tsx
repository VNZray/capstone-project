import { ShopColors } from '@/constants/ShopColors';
import { moderateScale } from '@/utils/responsive';
import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  Image,
  ImageSourcePropType,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
  useWindowDimensions,
} from 'react-native';

export type FeaturedShopCardProps = {
  image: string | ImageSourcePropType;
  name: string;
  category?: string;
  rating?: number;
  reviews?: number;
  featured?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  nameStyle?: StyleProp<TextStyle>;
};

const FeaturedShopCard: React.FC<FeaturedShopCardProps> = ({
  image,
  name,
  category,
  rating = 4.5,
  reviews = 120,
  featured = true,
  onPress,
  style,
  nameStyle,
}) => {
  const { width } = useWindowDimensions();

  const RADIUS = 20;
  const CARD_HEIGHT = moderateScale(240, 0.55, width);
  const CARD_WIDTH = width * 0.85;

  const imageSource = typeof image === 'string' ? { uri: image } : image;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        {
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          borderRadius: RADIUS,
        },
        pressed && styles.pressed,
        style,
      ]}
    >
      <Image source={imageSource} style={styles.image} resizeMode="cover" />
      
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.gradientOverlay}
      />

      {featured && (
        <View style={styles.badgeContainer}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>FEATURED</Text>
          </View>
        </View>
      )}

      <View style={styles.contentContainer}>
        {category && (
          <Text style={styles.category} numberOfLines={1}>
            {category}
          </Text>
        )}
        
        <Text style={[styles.name, nameStyle]} numberOfLines={2}>
          {name}
        </Text>

        <View style={styles.ratingRow}>
          <FontAwesome5 name="star" size={12} color="#FFD700" solid />
          <Text style={styles.ratingText}>
            {rating.toFixed(1)} ({reviews})
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: ShopColors.cardBackground,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    marginRight: 16,
  },
  pressed: {
    opacity: 0.95,
    transform: [{ scale: 0.99 }],
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
  },
  badgeContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
  },
  badge: {
    backgroundColor: ShopColors.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontFamily: 'Poppins-Bold',
    letterSpacing: 0.5,
  },
  contentContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    zIndex: 10,
  },
  category: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 10,
    fontFamily: 'Poppins-Medium',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  name: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
  },
});

export default FeaturedShopCard;
