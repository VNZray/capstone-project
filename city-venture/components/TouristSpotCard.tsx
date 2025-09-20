import React, { useMemo } from 'react';
import { Image, ImageSourcePropType, Pressable, StyleSheet, Text, View } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { card } from '@/constants/color';

export type TouristSpotCardProps = {
  image: string | ImageSourcePropType;
  name: string;
  location?: string;
  categories?: string[];
  onPress?: () => void;
  width?: number | string;
};

const TouristSpotCard: React.FC<TouristSpotCardProps> = ({ image, name, location, categories, onPress, width = '48%' }) => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const palette = useMemo(() => ({
    bg: isDark ? card.dark : card.light,
    text: isDark ? '#ECEDEE' : '#0D1B2A',
    subText: isDark ? '#9BA1A6' : '#6B7280',
    border: isDark ? '#2A2F36' : '#E8EBF0',
  }), [isDark]);

  const source = typeof image === 'string' ? { uri: image } : image;
  return (
    <Pressable style={[styles.container, { backgroundColor: palette.bg, borderColor: palette.border, width: width as any }]} onPress={onPress}>
      <View style={styles.imageWrap}>
        <Image source={source} style={styles.image} resizeMode="cover" />
      </View>
      <View style={styles.body}>
        <Text numberOfLines={2} style={[styles.title, { color: palette.text }]}>{name}</Text>
        {!!location && <Text numberOfLines={1} style={[styles.location, { color: palette.subText }]}>{location}</Text>}
        {!!categories?.length && (
          <Text numberOfLines={1} style={[styles.categories, { color: palette.subText }]}>
            {categories.slice(0,2).join(', ')}{categories.length>2?'…':''}
          </Text>
        )}
      </View>
    </Pressable>
  );
};

export default TouristSpotCard;

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
  },
  imageWrap: { width: '100%', aspectRatio: 1.1, backgroundColor: '#ccd2dd' },
  image: { width: '100%', height: '100%' },
  body: { paddingHorizontal: 10, paddingVertical: 8 },
  title: { fontSize: 14, fontWeight: '800' },
  location: { fontSize: 11, marginTop: 2 },
  categories: { fontSize: 10, marginTop: 4 },
});
