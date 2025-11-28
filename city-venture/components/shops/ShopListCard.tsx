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

  const RADIUS = 12;
  const IMAGE_SIZE = moderateScale(80, 0.55, width);

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
      <Image source={imageSource} style={[styles.image, { width: IMAGE_SIZE, height: IMAGE_SIZE, borderRadius: RADIUS }]} resizeMode="cover" />

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
              {rating.toFixed(1)} <Text style={styles.reviewsText}>({reviews})</Text>
            </Text>
          </View>
          
          {location && (
            <View style={styles.locationContainer}>
              <FontAwesome5 name="map-marker-alt" size={10} color={ShopColors.textSecondary} />
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
    backgroundColor: ShopColors.cardBackground,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    // Soft shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  pressed: {
    opacity: 0.7,
  },
  image: {
    marginRight: 16,
    backgroundColor: '#f0f0f0',
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
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    color: ShopColors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  distanceText: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: ShopColors.textSecondary,
  },
  category: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
    marginBottom: 8,
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
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ratingText: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: ShopColors.textPrimary,
  },
  reviewsText: {
    color: ShopColors.textSecondary,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    justifyContent: 'flex-end',
    marginLeft: 8,
  },
  location: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
  },
});

export default ShopListCard;
