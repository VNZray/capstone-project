import { card, colors } from '@/constants/color';
import { useTypography } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { moderateScale } from '@/utils/responsive';
import React from 'react';
import { Image, ImageSourcePropType, Platform, Pressable, StyleProp, StyleSheet, Text, TextStyle, useWindowDimensions, View, ViewStyle } from 'react-native';

export interface SpotCardProps {
  image: string | ImageSourcePropType;
  name: string;
  location?: string;
  rating?: number;
  tags?: string[];
  elevation?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  nameStyle?: StyleProp<TextStyle>;
}

const SpotCard: React.FC<SpotCardProps> = ({
  image,
  name,
  location,
  rating,
  tags,
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
    accent: colors.info,
    border: isDark ? '#2A2F36' : '#E5E8EC',
  };
  const { width } = useWindowDimensions();
  const type = useTypography();

  const RADIUS = moderateScale(18, 0.55, width);
  const IMAGE_HEIGHT = moderateScale(160, 0.5, width);
  const PAD = moderateScale(14, 0.55, width);
  const TAG_GAP = moderateScale(6, 0.5, width);

  const imageSource = typeof image === 'string' ? { uri: image } : image;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.wrapper,
        getElevation(elevation),
        { borderRadius: RADIUS },
        pressed && { opacity: 0.87 },
        style,
      ]}
    >
      <View style={[styles.container, { backgroundColor: palette.bg, borderColor: palette.border, borderRadius: RADIUS }]}>        
        <Image
          source={imageSource}
          style={{ width: '100%', height: IMAGE_HEIGHT, borderTopLeftRadius: RADIUS, borderTopRightRadius: RADIUS }}
          resizeMode="cover"
        />
        <View style={{ padding: PAD, gap: moderateScale(8, 0.5, width) }}>
          <Text numberOfLines={2} style={[{ color: palette.text, fontSize: type.h4, fontWeight: '700' }, nameStyle]}>{name}</Text>
          {location && (
            <Text numberOfLines={1} style={{ color: palette.sub, fontSize: type.bodySmall }}>{location}</Text>
          )}
          {rating != null && (
            <Text style={{ color: palette.accent, fontSize: type.bodySmall, fontWeight: '600' }}>{rating.toFixed(1)} ★</Text>
          )}
          {!!tags?.length && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 2 }}>
              {tags.slice(0, 4).map((t, i) => (
                <View key={i} style={{ backgroundColor: palette.accent, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, marginRight: TAG_GAP, marginBottom: TAG_GAP }}>
                  <Text style={{ color: '#fff', fontSize: type.caption, fontWeight: '600' }}>{t}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
};

function getElevation(level: number): ViewStyle | undefined {
  if (!level) return undefined;
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
  wrapper: { overflow: 'visible' },
  container: { borderWidth: 1, overflow: 'hidden' },
});

export default SpotCard;
