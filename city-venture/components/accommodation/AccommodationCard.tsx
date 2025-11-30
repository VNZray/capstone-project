import { card } from '@/constants/color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { moderateScale } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  ImageSourcePropType,
  ImageStyle,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
  useWindowDimensions,
} from 'react-native';

export type AccommodationCardSize = 'small' | 'medium' | 'large';
export type AccommodationCardView = 'card' | 'list' | string;

export type AccommodationCardProps = {
  image: string | ImageSourcePropType;
  title: string;
  subTitle?: string;
  pricing?: string | number;
  ratings?: number; // 0-5
  noOfComments?: number;
  elevation?: 1 | 2 | 3 | 4 | 5 | 6;
  size?: AccommodationCardSize;
  view?: AccommodationCardView;
  favorite?: boolean;
  onClick?: () => void;
  addToFavorite?: (next: boolean) => void;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  subTitleStyle?: StyleProp<TextStyle>;
  parentKey?: string | number;
};

const AccommodationCard: React.FC<AccommodationCardProps> = ({
  image,
  title,
  subTitle,
  pricing,
  ratings = 0,
  noOfComments = 0,
  elevation = 2,
  size = 'medium',
  view = 'card',
  favorite: favoriteProp,
  onClick,
  addToFavorite,
  style,
  titleStyle,
  subTitleStyle,
}) => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const [favorite, setFavorite] = useState(!!favoriteProp);

  useEffect(() => {
    setFavorite(!!favoriteProp);
  }, [favoriteProp]);

  const palette = useMemo(
    () => ({
      bg: isDark ? card.dark : card.light,
      text: isDark ? '#ECEDEE' : '#0D1B2A',
      subText: isDark ? '#9BA1A6' : '#6B7280',
      border: isDark ? '#2A2F36' : '#E8EBF0',
      accent: isDark ? '#60A5FA' : '#2563EB',
      shadow: '#000',
    }),
    [isDark]
  );

  const { width: windowWidth } = useWindowDimensions();
  const sizes = getSizes(windowWidth);
  // Select concrete sizing config for current size prop (fallback to medium if undefined)
  const sizing = sizes[size] ?? sizes.medium;
  const elevationStyle = getElevation(elevation);

  const onToggleFavorite = () => {
    const next = !favorite;
    setFavorite(next);
    addToFavorite?.(next);
  };

  const priceText = pricing != null ? String(pricing) : undefined;
  const imageSource = typeof image === 'string' ? { uri: image } : image;

  const content = (
    <View style={[styles.content, view === 'list' && styles.row]}>
      {/* Image */}
      <View
        style={[view === 'list' ? styles.listImageWrap : styles.cardImageWrap]}
      >
        <Image
          source={imageSource}
          style={view === 'list' ? sizing.listImage : sizing.cardImage}
          resizeMode="cover"
        />
        {/* Favorite button overlay for card view */}
        {view === 'card' && (
          <Pressable
            onPress={onToggleFavorite}
            accessibilityRole="button"
            accessibilityLabel={
              favorite ? 'Remove from favorites' : 'Add to favorites'
            }
            style={[styles.favBtn, sizing.favBtn]}
          >
            <Ionicons
              name={favorite ? 'heart' : 'heart-outline'}
              size={sizing.favIconSize}
              color={favorite ? '#ff6b81' : '#ffffffcc'}
            />
          </Pressable>
        )}
      </View>

      {/* Body */}
      <View
        style={[styles.body, view === 'list' && { flex: 1, paddingLeft: 12 }]}
      >
        <Text
          numberOfLines={2}
          style={[{ color: palette.text }, sizing.title, titleStyle]}
        >
          {title}
        </Text>
        {!!subTitle && (
          <Text
            numberOfLines={2}
            style={[
              { color: palette.subText, flex: 1 },
              sizing.subTitle,
              subTitleStyle,
            ]}
          >
            {subTitle}
          </Text>
        )}
        {!!priceText && (
          <Text style={[{ color: '#FF914D', fontWeight: '700' }, sizing.price]}>
            {priceText}
          </Text>
        )}

        {/* Footer rating row */}
        <View style={[styles.footerRow]}>
          <Ionicons name="star" size={sizing.icon} color="#FFC107" />
          <Text style={[{ color: palette.text, marginLeft: 6 }, sizing.rating]}>
            {(ratings ?? 0).toFixed(1)}
          </Text>
          <Text
            style={[{ color: palette.subText, marginLeft: 4 }, sizing.reviews]}
          >
            ({noOfComments})
          </Text>
        </View>
      </View>

      {/* Favorite button for list view top-right */}
      {view === 'list' && (
        <Pressable
          onPress={onToggleFavorite}
          accessibilityRole="button"
          accessibilityLabel={
            favorite ? 'Remove from favorites' : 'Add to favorites'
          }
          style={[styles.favBtnList]}
        >
          <Ionicons
            name={favorite ? 'heart' : 'heart-outline'}
            size={sizing.favIconSize}
            color={favorite ? '#ff6b81' : palette.subText}
          />
        </Pressable>
      )}
    </View>
  );

  return (
    <Pressable
      onPress={onClick}
      style={({ pressed }) => [
        styles.shadowWrapper,
        elevationStyle,
        // dynamic radius for outer shadow wrapper
        { borderRadius: (sizing.container as any).borderRadius ?? 16 },
        pressed && Platform.OS !== 'web' && { transform: [{ scale: 0.98 }] },
        style,
      ]}
    >
      <View
        style={[
          styles.container,
          sizing.container,
          view === 'list' ? styles.listContainer : styles.cardContainer,
          { backgroundColor: palette.bg, borderColor: palette.border },
        ]}
      >
        {content}
      </View>
    </Pressable>
  );
};

export default AccommodationCard;

// Styles and helpers
const styles = StyleSheet.create({
  shadowWrapper: {
    // wrapper just for shadow; no overflow so iOS shadow is visible
  },
  container: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden', // keep clipping for rounded images/content
  },
  cardContainer: {
    paddingBottom: 10,
  },
  listContainer: {
    padding: 10,
  },
  content: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardImageWrap: {
    width: '100%',
    aspectRatio: 16 / 9,
    position: 'relative',
  },
  listImageWrap: {
    width: 84,
    height: 84,
    borderRadius: 12,
    overflow: 'hidden',
  },
  body: {
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  footerRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  favBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 24,
    padding: 6,
  },
  favBtnList: {
    position: 'absolute',
    top: 24,
    right: 8,
  },
});

type SizeConfig = {
  container: ViewStyle;
  cardImage: ImageStyle;
  listImage: ImageStyle;
  title: TextStyle;
  subTitle: TextStyle;
  price: TextStyle;
  rating: TextStyle;
  reviews: TextStyle;
  icon: number;
  favIconSize: number;
  favBtn: ViewStyle;
};

function getSizes(width: number): Record<AccommodationCardSize, SizeConfig> {
  return {
    small: {
      container: { borderRadius: moderateScale(12, 0.5, width) },
      cardImage: { width: '100%', height: '100%' },
      listImage: {
        width: moderateScale(72, 0.55, width),
        height: moderateScale(72, 0.55, width),
        borderRadius: moderateScale(10, 0.5, width),
      },
      title: { fontSize: moderateScale(14, 0.45, width), fontWeight: '800' },
      subTitle: { fontSize: moderateScale(11, 0.45, width) },
      price: { fontSize: moderateScale(12, 0.45, width) },
      rating: { fontSize: moderateScale(12, 0.45, width), fontWeight: '700' },
      reviews: { fontSize: moderateScale(11, 0.45, width) },
      icon: moderateScale(14, 0.5, width),
      favIconSize: moderateScale(18, 0.5, width),
      favBtn: { padding: moderateScale(6, 0.5, width) },
    },
    medium: {
      container: { borderRadius: moderateScale(16, 0.5, width) },
      cardImage: { width: '100%', height: '100%' },
      listImage: {
        width: moderateScale(84, 0.55, width),
        height: moderateScale(84, 0.55, width),
        borderRadius: moderateScale(12, 0.5, width),
      },
      title: { fontSize: moderateScale(16, 0.45, width), fontWeight: '800' },
      subTitle: { fontSize: moderateScale(12.5, 0.45, width) },
      price: { fontSize: moderateScale(13.5, 0.45, width) },
      rating: { fontSize: moderateScale(13.5, 0.45, width), fontWeight: '700' },
      reviews: { fontSize: moderateScale(12, 0.45, width) },
      icon: moderateScale(14, 0.5, width),
      favIconSize: moderateScale(32, 0.5, width),
      favBtn: { padding: moderateScale(8, 0.5, width) },
    },
    large: {
      container: { borderRadius: moderateScale(18, 0.5, width) },
      cardImage: { width: '100%', height: '100%' },
      listImage: {
        width: moderateScale(96, 0.55, width),
        height: moderateScale(96, 0.55, width),
        borderRadius: moderateScale(14, 0.5, width),
      },
      title: { fontSize: moderateScale(18, 0.45, width), fontWeight: '800' },
      subTitle: { fontSize: moderateScale(13.5, 0.45, width) },
      price: { fontSize: moderateScale(14, 0.45, width) },
      rating: { fontSize: moderateScale(14, 0.45, width), fontWeight: '700' },
      reviews: { fontSize: moderateScale(12.5, 0.45, width) },
      icon: moderateScale(14, 0.5, width),
      favIconSize: moderateScale(24, 0.5, width),
      favBtn: { padding: moderateScale(10, 0.5, width) },
    },
  };
}

function getElevation(level: 1 | 2 | 3 | 4 | 5 | 6): ViewStyle {
  const iosShadow: Record<number, ViewStyle> = {
    1: {
      shadowColor: '#000',
      shadowOpacity: 0.06,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
    },
    2: {
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
    },
    3: {
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 6 },
    },
    4: {
      shadowColor: '#000',
      shadowOpacity: 0.12,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 8 },
    },
    5: {
      shadowColor: '#000',
      shadowOpacity: 0.14,
      shadowRadius: 22,
      shadowOffset: { width: 0, height: 10 },
    },
    6: {
      shadowColor: '#000',
      shadowOpacity: 0.16,
      shadowRadius: 26,
      shadowOffset: { width: 0, height: 12 },
    },
  };
  const androidElevation: Record<number, ViewStyle> = {
    1: { elevation: 1 },
    2: { elevation: 2 },
    3: { elevation: 3 },
    4: { elevation: 4 },
    5: { elevation: 5 },
    6: { elevation: 6 },
  };
  return Platform.select<ViewStyle>({
    ios: iosShadow[level],
    android: androidElevation[level],
    default: androidElevation[level],
  })!;
}
