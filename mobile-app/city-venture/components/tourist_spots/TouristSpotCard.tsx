import React, { useMemo } from 'react';
import {
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { card } from '@/constants/color';

export type TouristSpotCardViewMode = 'card' | 'list';
export type TouristSpotCardProps = {
  image: string | ImageSourcePropType;
  name: string;
  location?: string;
  categories?: string[];
  onPress?: () => void;
  width?: number | string;
  viewMode?: TouristSpotCardViewMode;
};

const TouristSpotCard: React.FC<TouristSpotCardProps> = ({
  image,
  name,
  location,
  categories,
  onPress,
  width = '48%',
  viewMode = 'card',
}) => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const palette = useMemo(
    () => ({
      bg: isDark ? card.dark : card.light,
      text: isDark ? '#ECEDEE' : '#0D1B2A',
      subText: isDark ? '#9BA1A6' : '#6B7280',
      border: isDark ? '#2A2F36' : '#E8EBF0',
    }),
    [isDark]
  );

  const source = typeof image === 'string' ? { uri: image } : image;
  if (viewMode === 'list') {
    return (
      <Pressable
        style={[
          styles.listContainer,
          { backgroundColor: palette.bg, borderColor: palette.border },
        ]}
        onPress={onPress}
      >
        <View style={styles.listImageWrap}>
          <Image source={source} style={styles.listImage} resizeMode="cover" />
        </View>
        <View style={styles.listBody}>
          <ThemedText
            type="card-title-small"
            weight="bold"
            numberOfLines={1}
            style={[styles.listTitle, { color: palette.text }]}
          >
            {name}
          </ThemedText>
          {!!location && (
            <ThemedText
              type="card-sub-title-small"
              numberOfLines={1}
              style={[styles.listLocation, { color: palette.subText }]}
            >
              {location}
            </ThemedText>
          )}
          {!!categories?.length && (
            <ThemedText
              type="label-small"
              numberOfLines={1}
              style={[styles.listCategories, { color: palette.subText }]}
            >
              {categories.slice(0, 2).join(', ')}
              {categories.length > 2 ? '…' : ''}
            </ThemedText>
          )}
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      style={[
        styles.container,
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
          width: width as any,
        },
      ]}
      onPress={onPress}
    >
      <View style={styles.imageWrap}>
        <Image source={source} style={styles.image} resizeMode="cover" />
      </View>
      <View style={styles.body}>
        <ThemedText
          type="card-title-small"
          weight="bold"
          numberOfLines={2}
          style={[styles.title, { color: palette.text }]}
        >
          {name}
        </ThemedText>
        {!!location && (
          <ThemedText
            type="card-sub-title-small"
            numberOfLines={1}
            style={[styles.location, { color: palette.subText }]}
          >
            {location}
          </ThemedText>
        )}
        {!!categories?.length && (
          <ThemedText
            type="label-small"
            numberOfLines={1}
            style={[styles.categories, { color: palette.subText }]}
          >
            {categories.slice(0, 2).join(', ')}
            {categories.length > 2 ? '…' : ''}
          </ThemedText>
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
    marginBottom: 6,
  },
  listContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 8,
    marginBottom: 12,
    gap: 8,
  },
  imageWrap: { width: '100%', aspectRatio: 1.1, backgroundColor: '#ccd2dd' },
  image: { width: '100%', height: '100%' },
  listImageWrap: {
    width: 84,
    height: 84,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#ccd2dd',
  },
  listImage: { width: '100%', height: '100%' },
  body: { paddingHorizontal: 10, paddingVertical: 8 },
  listBody: { flex: 1, justifyContent: 'center' },
  title: { fontSize: 14, fontWeight: '800' },
  location: { fontSize: 11, marginTop: 2 },
  categories: { fontSize: 10, marginTop: 4 },
  listTitle: { fontSize: 14, fontWeight: '800' },
  listLocation: { fontSize: 11, marginTop: 2 },
  listCategories: { fontSize: 10, marginTop: 4 },
});
