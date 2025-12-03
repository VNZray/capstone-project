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

export type ShopListCardProps = {
  image: string | ImageSourcePropType;
  name: string;
  category?: string;
  distance?: number;
  rating?: number;
  reviews?: number;
  location?: string;
  tags?: string[];
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  nameStyle?: StyleProp<TextStyle>;
};

const ShopListCard: React.FC<ShopListCardProps> = ({
  image,
  name,
  category,
  distance,
  rating = 4.2,
  reviews = 89,
  location,
  tags = [],
  onPress,
  style,
  nameStyle,
}) => {
  const { width } = useWindowDimensions();

  const RADIUS = 8;
  const IMAGE_SIZE = moderateScale(72, 0.55, width);

  const imageSource = typeof image === 'string' ? { uri: image } : image;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
        style,
      ]}
    >
      <Image
        source={imageSource}
        style={[
          styles.image,
          { width: IMAGE_SIZE, height: IMAGE_SIZE, borderRadius: RADIUS },
        ]}
        resizeMode="cover"
      />

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={[styles.name, nameStyle]} numberOfLines={1}>
            {name}
          </Text>
          {distance !== undefined && (
            <Text style={styles.distanceText}>{distance.toFixed(1)} km</Text>
          )}
        </View>

        <Text style={styles.category} numberOfLines={1}>
          {category}
        </Text>

        <View style={styles.footerRow}>
          <View style={styles.ratingRow}>
            <FontAwesome5 name="star" size={10} color="#FFD700" solid />
            <Text style={styles.ratingText}>
              {rating.toFixed(1)}{' '}
              <Text style={styles.reviewsText}>({reviews})</Text>
            </Text>
          </View>

          {location && (
            <View style={styles.locationContainer}>
              <Text style={styles.location} numberOfLines={1}>
                {location}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: ShopColors.surface,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: ShopColors.border,
  },
  pressed: {
    backgroundColor: ShopColors.background,
  },
  image: {
    marginRight: 16,
    backgroundColor: ShopColors.inputBackground,
    borderWidth: 1,
    borderColor: ShopColors.border,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: ShopColors.textPrimary,
    flex: 1,
    marginRight: 8,
    letterSpacing: -0.3,
  },
  distanceText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
  },
  category: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
    marginBottom: 6,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: ShopColors.textPrimary,
  },
  reviewsText: {
    color: ShopColors.textSecondary,
  },
  locationContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    marginLeft: 8,
  },
  location: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
    textAlign: 'right',
  },
});

export default ShopListCard;
