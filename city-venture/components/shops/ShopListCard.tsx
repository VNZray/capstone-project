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

export type ShopListCardProps = {
  image: string | ImageSourcePropType;
  name: string;
  category?: string;
  distance?: number;
  rating?: number;
  reviews?: number;
  location?: string;
  elevation?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
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
  elevation = 1,
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
    badgeBg: isDark ? 'rgba(0, 119, 182, 0.15)' : 'rgba(0, 119, 182, 0.1)',
    border: isDark ? '#2A2F36' : '#E5E8EC',
  };
  const { width } = useWindowDimensions();
  const type = useTypography();

  const RADIUS = moderateScale(14, 0.55, width);
  const IMAGE_SIZE = moderateScale(100, 0.55, width);
  const GAP = moderateScale(12, 0.5, width);
  const PAD = moderateScale(12, 0.55, width);

  const imageSource = typeof image === 'string' ? { uri: image } : image;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.wrapper,
        getElevation(elevation),
        { borderRadius: RADIUS },
        pressed && { opacity: 0.85 },
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
            padding: PAD,
          },
        ]}
      >
        <View style={{ flexDirection: 'row', gap: GAP }}>
          {/* Image */}
          <Image
            source={imageSource}
            style={{
              width: IMAGE_SIZE,
              height: IMAGE_SIZE,
              borderRadius: moderateScale(10, 0.55, width),
            }}
            resizeMode="cover"
          />

          {/* Content */}
          <View style={{ flex: 1, justifyContent: 'space-between' }}>
            {/* Title and Category */}
            <View style={{ gap: 6 }}>
              <Text
                numberOfLines={2}
                style={[
                  {
                    color: palette.text,
                    fontSize: type.h4,
                    fontWeight: '700',
                  },
                  nameStyle,
                ]}
              >
                {name}
              </Text>

              {category && (
                <View
                  style={{
                    alignSelf: 'flex-start',
                    backgroundColor: palette.badgeBg,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 6,
                  }}
                >
                  <Text
                    style={{
                      color: palette.badge,
                      fontSize: moderateScale(11, 0.45, width),
                      fontWeight: '600',
                    }}
                  >
                    {category}
                  </Text>
                </View>
              )}
            </View>

            {/* Info Row */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              {distance != null && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <FontAwesome5
                    name="map-marker-alt"
                    size={moderateScale(12, 0.45, width)}
                    color={palette.sub}
                    solid
                  />
                  <Text
                    style={{
                      color: palette.sub,
                      fontSize: type.bodySmall,
                    }}
                  >
                    {distance.toFixed(1)} km
                  </Text>
                </View>
              )}

              {rating != null && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <FontAwesome5
                    name="star"
                    size={moderateScale(12, 0.45, width)}
                    color="#FFD700"
                    solid
                  />
                  <Text
                    style={{
                      color: palette.text,
                      fontSize: type.bodySmall,
                      fontWeight: '600',
                    }}
                  >
                    {rating.toFixed(1)}
                  </Text>
                  {reviews != null && (
                    <Text
                      style={{
                        color: palette.sub,
                        fontSize: type.bodySmall,
                      }}
                    >
                      ({reviews})
                    </Text>
                  )}
                </View>
              )}
            </View>

            {/* Location */}
            {location && (
              <Text
                numberOfLines={1}
                style={{
                  color: palette.sub,
                  fontSize: moderateScale(11, 0.45, width),
                  marginTop: 4,
                }}
              >
                📍 {location}
              </Text>
            )}
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
      shadowOpacity: 0.1,
      shadowRadius: 3,
      shadowOffset: { width: 0, height: 2 },
    },
    3: {
      shadowColor: '#000',
      shadowOpacity: 0.12,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 3 },
    },
    4: {
      shadowColor: '#000',
      shadowOpacity: 0.14,
      shadowRadius: 5,
      shadowOffset: { width: 0, height: 4 },
    },
    5: {
      shadowColor: '#000',
      shadowOpacity: 0.16,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 5 },
    },
    6: {
      shadowColor: '#000',
      shadowOpacity: 0.18,
      shadowRadius: 7,
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
  },
});

export default ShopListCard;
