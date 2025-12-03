import { ShopColors } from '@/constants/color';
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

export type SpecialOfferCardProps = {
  image: string | ImageSourcePropType;
  discount?: string;
  title?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

const SpecialOfferCard: React.FC<SpecialOfferCardProps> = ({
  image,
  discount = '20% OFF',
  title = 'Limited Time Offer',
  onPress,
  style,
}) => {
  const { width } = useWindowDimensions();

  const RADIUS = 8;
  const CARD_WIDTH = moderateScale(160, 0.55, width);
  const CARD_HEIGHT = moderateScale(200, 0.55, width);

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
      <View style={styles.imageContainer}>
        <Image source={imageSource} style={styles.image} resizeMode="cover" />
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{discount}</Text>
        </View>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.actionText}>Claim Offer →</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: ShopColors.surface,
    marginRight: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: ShopColors.border,
  },
  pressed: {
    opacity: 0.9,
  },
  imageContainer: {
    flex: 3,
    position: 'relative',
    backgroundColor: ShopColors.inputBackground,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: ShopColors.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: 'Poppins-Bold',
  },
  contentContainer: {
    flex: 2,
    padding: 12,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: ShopColors.textPrimary,
    lineHeight: 20,
  },
  actionText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: ShopColors.accent,
  },
});

export default SpecialOfferCard;
