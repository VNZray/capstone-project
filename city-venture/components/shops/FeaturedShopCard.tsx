import { card, colors } from '@/constants/color';
import { useTypography } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { moderateScale } from '@/utils/responsive';
import { FontAwesome5 } from '@expo/vector-icons';
import React from 'react';
import {
  Image,
  ImageSourcePropType,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';

export type FeaturedShopCardProps = {
  image: string | ImageSourcePropType;
  name: string;
  category?: string;
  rating?: number;
  reviews?: number;
  featured?: boolean;
  elevation?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
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
  elevation = 2,
  onPress,
  style,
  nameStyle,
}) => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const palette = {
    bg: isDark ? card.dark : card.light,
    text: isDark ? '#ECEDEE' : '#0D1B2A',
    sub: isDark ? '#9BA1A6' : '#6B7280',
    badge: colors.secondary,
    border: isDark ? '#2A2F36' : '#E5E8EC',
    overlay: isDark ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.4)',
  };
  const { width } = useWindowDimensions();
  const type = useTypography();

  const RADIUS = moderateScale(16, 0.55, width);
  const CARD_HEIGHT = moderateScale(200, 0.55, width);
  const CARD_WIDTH = moderateScale(280, 0.55, width);

  const imageSource = typeof image === 'string' ? { uri: image } : image;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.wrapper,
        getElevation(elevation),
        { borderRadius: RADIUS },
        pressed && { opacity: 0.88 },
        style,
      ]}
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: palette.bg,
            borderColor: palette.border,
            borderRadius: RADIUS,
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
          },
        ]}
      >
        {/* Background Image */}
        <Image
          source={imageSource}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: RADIUS,
            position: 'absolute',
          }}
          resizeMode="cover"
        />

        {/* Dark Overlay */}
        <View
          style={[
            styles.overlay,
            {
              backgroundColor: palette.overlay,
              borderRadius: RADIUS,
            },
          ]}
        />

        {/* Featured Badge */}
        {featured && (
          <View style={styles.badgeContainer}>
            <View
              style={[
                styles.badge,
                { backgroundColor: colors.secondary },
              ]}
            >
              <Text
                style={{
                  color: '#fff',
                  fontSize: moderateScale(11, 0.45, width),
                  fontWeight: '700',
                }}
              >
                FEATURED
              </Text>
            </View>
          </View>
        )}

        {/* Content - Bottom Positioned */}
        <View style={styles.contentContainer}>
          <Text
            numberOfLines={2}
            style={[
              {
                color: '#fff',
                fontSize: type.h4,
                fontWeight: '700',
                marginBottom: 4,
              },
              nameStyle,
            ]}
          >
            {name}
          </Text>

          {category && (
            <Text
              numberOfLines={1}
              style={{
                color: 'rgba(255, 255, 255, 0.85)',
                fontSize: moderateScale(13, 0.45, width),
                fontWeight: '500',
                marginBottom: 8,
              }}
            >
              {category}
            </Text>
          )}

          {/* Rating */}
          <View style={styles.ratingContainer}>
            <FontAwesome5
              name="star"
              size={moderateScale(12, 0.45, width)}
              color="#FFD700"
              solid
            />
            <Text
              style={{
                color: '#fff',
                fontSize: moderateScale(12, 0.45, width),
                fontWeight: '600',
                marginLeft: 4,
              }}
            >
              {rating.toFixed(1)} ({reviews})
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

function getElevation(level: number): ViewStyle | undefined {
  if (!level) return undefined;
  if (Platform.OS === 'android') return { elevation: level } as ViewStyle;
  const map: Record<number, ViewStyle> = {
    1: {
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 2,
      shadowOffset: { width: 0, height: 1 },
    },
    2: {
      shadowColor: '#000',
      shadowOpacity: 0.12,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
    },
    3: {
      shadowColor: '#000',
      shadowOpacity: 0.15,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 3 },
    },
    4: {
      shadowColor: '#000',
      shadowOpacity: 0.18,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
    },
    5: {
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 5 },
    },
    6: {
      shadowColor: '#000',
      shadowOpacity: 0.22,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
    },
  };
  return map[level];
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'visible',
  },
  container: {
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  badgeContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 10,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  contentContainer: {
    padding: 16,
    zIndex: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default FeaturedShopCard;
