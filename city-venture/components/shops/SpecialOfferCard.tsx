import { ShopColors } from '@/constants/ShopColors';
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

  const RADIUS = 16;
  const CARD_WIDTH = moderateScale(160, 0.55, width);
  const CARD_HEIGHT = moderateScale(220, 0.55, width);

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
        <View style={styles.overlay} />
        
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
    backgroundColor: ShopColors.cardBackground,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    marginRight: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: ShopColors.border,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  imageContainer: {
    flex: 3,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  discountBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: ShopColors.warning,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Poppins-Bold',
  },
  contentContainer: {
    flex: 2,
    padding: 10,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: ShopColors.textPrimary,
    lineHeight: 18,
  },
  actionText: {
    fontSize: 10,
    fontFamily: 'Poppins-Medium',
    color: ShopColors.accent,
  },
});

export default SpecialOfferCard;
