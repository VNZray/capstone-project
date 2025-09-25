import { card, colors } from '@/constants/color';
import { useTypography } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { moderateScale } from '@/utils/responsive';
import React from 'react';
import { Image, ImageSourcePropType, Platform, Pressable, StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle, useWindowDimensions } from 'react-native';

export type EventCardProps = {
  image: string | ImageSourcePropType;
  title: string;
  date?: string;
  venue?: string;
  category?: string;
  elevation?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
};

const EventCard: React.FC<EventCardProps> = ({
  image,
  title,
  date,
  venue,
  category,
  elevation = 1,
  onPress,
  style,
  titleStyle,
}) => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const palette = {
    bg: isDark ? card.dark : card.light,
    text: isDark ? '#ECEDEE' : '#0D1B2A',
    sub: isDark ? '#9BA1A6' : '#6B7280',
    badge: colors.primary,
    border: isDark ? '#2A2F36' : '#E5E8EC',
  };
  const { width } = useWindowDimensions();
  const type = useTypography();

  const IMAGE_HEIGHT = moderateScale(140, 0.55, width); // adaptive hero image height
  const RADIUS = moderateScale(14, 0.55, width);
  const PADDING = moderateScale(12, 0.55, width);

  const imageSource = typeof image === 'string' ? { uri: image } : image;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.wrapper,
        getElevation(elevation),
        { borderRadius: RADIUS },
        pressed && { opacity: 0.85 },
        style,
      ]}
      accessibilityRole="button"
    >
      <View style={[styles.container, { backgroundColor: palette.bg, borderColor: palette.border, borderRadius: RADIUS }]}>
        <Image
          source={imageSource}
            style={{ width: '100%', height: IMAGE_HEIGHT, borderTopLeftRadius: RADIUS, borderTopRightRadius: RADIUS }}
          resizeMode="cover"
        />
        <View style={{ padding: PADDING, gap: moderateScale(6, 0.55, width) }}>
          <Text
            numberOfLines={2}
            style={[{
              color: palette.text,
              fontSize: type.h4,
              fontWeight: '700',
            }, titleStyle]}
          >
            {title}
          </Text>
          {!!date && (
            <Text style={{ color: palette.sub, fontSize: type.bodySmall }}>{date}</Text>
          )}
          {!!venue && (
            <Text style={{ color: palette.sub, fontSize: type.bodySmall }} numberOfLines={1}>{venue}</Text>
          )}
          {!!category && (
            <View style={{ alignSelf: 'flex-start', backgroundColor: palette.badge, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 }}>
              <Text style={{ color: '#fff', fontSize: type.caption, fontWeight: '600' }}>{category}</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
};

function getElevation(level: number): ViewStyle | undefined {
  if (!level) return undefined;
  if (level > 6) level = 6;
  if (level < 0) level = 0;
  if (Platform.OS === 'android') return { elevation: level } as ViewStyle;
  const map: Record<number, ViewStyle> = {
    1: { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 2, shadowOffset: { width: 0, height: 1 } },
    2: { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 3, shadowOffset: { width: 0, height: 2 } },
    3: { shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 4, shadowOffset: { width: 0, height: 3 } },
    4: { shadowColor: '#000', shadowOpacity: 0.14, shadowRadius: 5, shadowOffset: { width: 0, height: 4 } },
    5: { shadowColor: '#000', shadowOpacity: 0.16, shadowRadius: 6, shadowOffset: { width: 0, height: 5 } },
    6: { shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 7, shadowOffset: { width: 0, height: 6 } },
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
  },
});

export default EventCard;
