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

export type FeaturedTouristSpotCardProps = {
  image: string | ImageSourcePropType;
  name: string;
  categories?: string[];
  onPress?: () => void;
  width?: number;
  height?: number;
};

const FeaturedTouristSpotCard: React.FC<FeaturedTouristSpotCardProps> = ({
  image,
  name,
  categories,
  onPress,
  width = 260,
  height = 140,
}) => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const overlayBg = useMemo(
    () => (isDark ? 'rgba(0,0,0,0.20)' : 'rgba(0,0,0,0.15)'),
    [isDark]
  );
  const source = typeof image === 'string' ? { uri: image } : image;
  return (
    <Pressable style={[styles.container, { width, height }]} onPress={onPress}>
      <Image source={source} style={styles.image} resizeMode="cover" />
      <View style={[styles.overlay, { backgroundColor: overlayBg }]}>
        <ThemedText
          type="card-title-extra-small"
          weight="bold"
          numberOfLines={1}
          style={[styles.title]}
        >
          {name}
        </ThemedText>
      </View>
    </Pressable>
  );
};

export default FeaturedTouristSpotCard;

const styles = StyleSheet.create({
  container: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#cdd3dd',
  },
  image: { width: '100%', height: '100%' },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  title: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  }
});
