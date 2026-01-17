import { ShopColors } from '@/constants/color';
import { moderateScale } from '@/utils/responsive';
import { FontAwesome5 } from '@expo/vector-icons';
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

  const RADIUS = 8;
  const CARD_WIDTH = width * 0.75;
  const IMAGE_HEIGHT = moderateScale(180, 0.55, width);

  const imageSource = typeof image === 'string' ? { uri: image } : image;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        { width: CARD_WIDTH },
        pressed && styles.pressed,
        style,
      ]}
    >
      <View
        style={[
          styles.imageContainer,
          { height: IMAGE_HEIGHT, borderRadius: RADIUS },
        ]}
      >
        <Image source={imageSource} style={styles.image} resizeMode="cover" />
        {featured && (
          <View style={styles.badgeContainer}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Featured</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={[styles.name, nameStyle]} numberOfLines={1}>
            {name}
          </Text>
          <View style={styles.ratingRow}>
            <FontAwesome5 name="star" size={12} color="#FFD700" solid />
            <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
          </View>
        </View>

        {category && (
          <Text style={styles.category} numberOfLines={1}>
            {category}
          </Text>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 16,
    backgroundColor: 'transparent',
  },
  pressed: {
    opacity: 0.95,
  },
  imageContainer: {
    width: '100%',
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: ShopColors.inputBackground,
    borderWidth: 1,
    borderColor: ShopColors.border,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badgeContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 10,
  },
  badge: {
    backgroundColor: ShopColors.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  badgeText: {
    color: ShopColors.textPrimary,
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
  },
  contentContainer: {
    paddingHorizontal: 0,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    color: ShopColors.textPrimary,
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    flex: 1,
    marginRight: 8,
    letterSpacing: -0.3,
  },
  category: {
    color: ShopColors.textSecondary,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    color: ShopColors.textPrimary,
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
  },
});

export default FeaturedShopCard;
