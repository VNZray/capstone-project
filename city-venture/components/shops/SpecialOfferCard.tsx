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

export type SpecialOfferCardProps = {
  image: string | ImageSourcePropType;
  title?: string;
  discount?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

const SpecialOfferCard: React.FC<SpecialOfferCardProps> = ({
  image,
  title,
  discount,
  onPress,
  style,
}) => {
  const { width } = useWindowDimensions();
  const type = useTypography();

  const CARD_WIDTH = moderateScale(160, 0.5, width);
  const CARD_HEIGHT = moderateScale(220, 0.5, width);
  const RADIUS = moderateScale(16, 0.5, width);

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
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={[StyleSheet.absoluteFill, { borderRadius: RADIUS }]}
        />

        {/* Discount Badge */}
        {discount && (
          <View style={styles.discountBadge}>
            <Text style={[styles.discountText, { fontSize: type.caption }]}>
              {discount}
            </Text>
          </View>
        )}

        {/* Content at Bottom */}
        {title && (
          <View style={styles.content}>
            <Text
              style={[styles.offerTitle, { fontSize: type.body }]}
              numberOfLines={2}
            >
              {title}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  container: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  discountBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: colors.error,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  discountText: {
    color: '#fff',
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  offerTitle: {
    color: '#fff',
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});

export default SpecialOfferCard;
