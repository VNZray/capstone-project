import { colors } from '@/constants/color';
import { useTypography } from '@/constants/typography';
import { moderateScale } from '@/utils/responsive';
import React from 'react';
import {
  Image,
  ImageSourcePropType,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export type FeaturedShopCardProps = {
  image: string | ImageSourcePropType;
  name: string;
  category?: string;
  rating?: number;
  isFeatured?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

const FeaturedShopCard: React.FC<FeaturedShopCardProps> = ({
  image,
  name,
  category,
  rating,
  isFeatured = true,
  onPress,
  style,
}) => {
  const { width } = useWindowDimensions();
  const type = useTypography();

  const CARD_WIDTH = width * 0.85; // 85% of screen width
  const CARD_HEIGHT = moderateScale(200, 0.5, width);
  const RADIUS = moderateScale(20, 0.5, width);

  const imageSource = typeof image === 'string' ? { uri: image } : image;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.wrapper,
        {
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          borderRadius: RADIUS,
        },
        pressed && { opacity: 0.9 },
        style,
      ]}
    >
      <View style={[styles.container, { borderRadius: RADIUS }]}>
        {/* Background Image */}
        <Image
          source={imageSource}
          style={[StyleSheet.absoluteFill, { borderRadius: RADIUS }]}
          resizeMode="cover"
        />

        {/* Gradient Overlay */}
        <LinearGradient
          colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.7)']}
          style={[StyleSheet.absoluteFill, { borderRadius: RADIUS }]}
        />

        {/* Featured Badge */}
        {isFeatured && (
          <View style={styles.featuredBadge}>
            <Text style={[styles.featuredText, { fontSize: type.caption }]}>
              FEATURED
            </Text>
          </View>
        )}

        {/* Rating Badge */}
        {rating && (
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={[styles.ratingText, { fontSize: type.caption }]}>
              {rating.toFixed(1)}
            </Text>
          </View>
        )}

        {/* Content at Bottom */}
        <View style={styles.content}>
          <Text
            style={[styles.shopName, { fontSize: type.h3 }]}
            numberOfLines={1}
          >
            {name}
          </Text>
          {category && (
            <Text
              style={[styles.category, { fontSize: type.body }]}
              numberOfLines={1}
            >
              {category}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  container: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  featuredBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  featuredText: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  ratingBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  ratingText: {
    color: '#fff',
    fontWeight: '700',
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  shopName: {
    color: '#fff',
    fontWeight: '700',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  category: {
    color: '#fff',
    fontWeight: '500',
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});

export default FeaturedShopCard;
