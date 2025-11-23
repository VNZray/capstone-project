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

  const RADIUS = 16;
  const IMAGE_SIZE = moderateScale(100, 0.55, width);

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
      <Image source={imageSource} style={[styles.image, { width: IMAGE_SIZE, height: IMAGE_SIZE }]} resizeMode="cover" />

      <View style={styles.content}>
        <View>
          <View style={styles.headerRow}>
            <Text style={[styles.name, nameStyle]} numberOfLines={1}>
              {name}
            </Text>
            {distance !== undefined && (
              <View style={styles.distanceBadge}>
                <FontAwesome5 name="map-marker-alt" size={10} color={ShopColors.accent} />
                <Text style={styles.distanceText}>{distance.toFixed(1)} km</Text>
              </View>
            )}
          </View>

          <Text style={styles.category} numberOfLines={1}>
            {category}
          </Text>

          <View style={styles.ratingRow}>
            <FontAwesome5 name="star" size={12} color="#FFD700" solid />
            <Text style={styles.ratingText}>
              {rating.toFixed(1)} <Text style={styles.reviewsText}>({reviews})</Text>
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          {tags.slice(0, 2).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
          {location && (
            <Text style={styles.location} numberOfLines={1}>
              {location}
            </Text>
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
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: ShopColors.border,
  },
  pressed: {
    opacity: 0.9,
    backgroundColor: '#FAFAFA',
  },
  image: {
    borderRadius: 12,
    marginRight: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: ShopColors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0F7FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  distanceText: {
    fontSize: 10,
    fontFamily: 'Poppins-Medium',
    color: ShopColors.accent,
  },
  category: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 11,
    fontFamily: 'Poppins-SemiBold',
    color: ShopColors.textPrimary,
  },
  reviewsText: {
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  tag: {
    borderWidth: 1,
    borderColor: ShopColors.border,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 9,
    fontFamily: 'Poppins-Medium',
    color: ShopColors.textSecondary,
  },
  location: {
    flex: 1,
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
    color: ShopColors.textSecondary,
    textAlign: 'right',
  },
});

export default ShopListCard;
