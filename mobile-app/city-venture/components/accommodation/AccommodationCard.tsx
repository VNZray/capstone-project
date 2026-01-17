import { card } from '@/constants/color';
import { useColorScheme } from '@/hooks/use-color-scheme';
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
  subTitle?: string; // Location/Category combined
  pricing?: string | number;
  ratings?: number; // 0-5
  noOfComments?: number;
  elevation?: 1 | 2 | 3 | 4 | 5 | 6;
  size?: AccommodationCardSize;
  view?: AccommodationCardView;
  favorite?: boolean;
  badge?: string;
  tags?: string[];
  isOpen?: boolean;
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
  badge,
  tags = [],
  isOpen = true,
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
      bg: isDark ? card.dark : '#FFFFFF',
      text: isDark ? '#ECEDEE' : '#1A1A1A', // Shopify dark gray
      subText: isDark ? '#9BA1A6' : '#616161', // Shopify soft gray
      border: isDark ? '#2A2F36' : '#E8EBF0',
      accent: isDark ? '#60A5FA' : '#2563EB',
      shadow: '#000',
      success: '#008a05',
    }),
    [isDark]
  );

  const { width: windowWidth } = useWindowDimensions();
  const sizes = getSizes(windowWidth);
  const sizing = sizes[size] ?? sizes.medium;

  const onToggleFavorite = () => {
    const next = !favorite;
    setFavorite(next);
    addToFavorite?.(next);
  };

  const priceText = pricing != null ? String(pricing) : undefined;
  const imageSource = typeof image === 'string' ? { uri: image } : image;

  const content = (
    <View style={[styles.content, view === 'list' && styles.row]}>
      {/* Image Section */}
      <View
        style={[view === 'list' ? styles.listImageWrap : styles.cardImageWrap]}
      >
        <Image
          source={imageSource}
          style={view === 'list' ? sizing.listImage : sizing.cardImage}
          resizeMode="cover"
        />

        {/* Badge (Guest Favorite) */}
        {view === 'card' && badge && (
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}

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
              size={20}
              color={favorite ? '#ff6b81' : '#000'}
            />
          </Pressable>
        )}
      </View>

      {/* Body Section */}
      <View
        style={[styles.body, view === 'list' && { flex: 1, paddingLeft: 12 }]}
      >
        {/* Title and Price Row */}
        <View style={styles.titleRow}>
          <Text
            numberOfLines={1}
            style={[{ color: palette.text }, sizing.title, titleStyle]}
          >
            {title}
          </Text>
          {!!priceText && (
            <Text
              style={[{ color: palette.text, fontWeight: '600' }, sizing.price]}
            >
              {priceText}
            </Text>
          )}
        </View>

        {/* Rating and Subtitle Row */}
        <View style={styles.metaRow}>
          <Ionicons name="star" size={14} color="#FFB007" />
          <Text
            style={[
              styles.metaText,
              { color: palette.text, fontWeight: '600' },
            ]}
          >
            {ratings.toFixed(1)}
          </Text>
          <Text style={[styles.metaText, { color: palette.subText }]}>
            ({noOfComments})
          </Text>
          {!!subTitle && (
            <>
              <Text style={[styles.dot, { color: palette.subText }]}>•</Text>
              <Text
                numberOfLines={1}
                style={[styles.metaText, { color: palette.subText, flex: 1 }]}
              >
                {subTitle}
              </Text>
            </>
          )}
        </View>

        {/* Status and Tags Row */}
        <View style={styles.tagsRow}>
          {isOpen && (
            <Text style={[styles.statusText, { color: palette.success }]}>
              Open Now
            </Text>
          )}
          {tags.map((tag, index) => (
            <React.Fragment key={index}>
              {(isOpen || index > 0) && (
                <Text style={[styles.dot, { color: palette.subText }]}>•</Text>
              )}
              <Text style={[styles.tagText, { color: palette.subText }]}>
                {tag}
              </Text>
            </React.Fragment>
          ))}
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
        styles.containerWrapper,
        pressed && Platform.OS !== 'web' && { opacity: 0.9 },
        style,
      ]}
    >
      <View
        style={[
          styles.container,
          view === 'list' ? styles.listContainer : styles.cardContainer,
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
  containerWrapper: {
    marginBottom: 8,
  },
  container: {
    backgroundColor: 'transparent',
  },
  cardContainer: {
    paddingBottom: 10,
  },
  listContainer: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#eee',
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
    aspectRatio: 4 / 3,
    position: 'relative',
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  listImageWrap: {
    width: 84,
    height: 84,
    borderRadius: 12,
    overflow: 'hidden',
  },
  body: {
    paddingTop: 12,
    paddingHorizontal: 4,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  metaText: {
    fontSize: 14,
    marginLeft: 4,
  },
  dot: {
    marginHorizontal: 4,
    fontSize: 12,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  tagText: {
    fontSize: 13,
  },
  favBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 50,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  favBtnList: {
    position: 'absolute',
    top: 24,
    right: 8,
  },
  badgeContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1A1A1A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

type SizeConfig = {
  container: ViewStyle;
  cardImage: ImageStyle;
  listImage: ImageStyle;
  title: TextStyle;
  price: TextStyle;
  favIconSize: number;
  favBtn: ViewStyle;
};

function getSizes(width: number): Record<AccommodationCardSize, SizeConfig> {
  return {
    small: {
      container: {},
      cardImage: { width: '100%', height: '100%' },
      listImage: { width: 72, height: 72 },
      title: { fontSize: 14, fontWeight: '600' },
      price: { fontSize: 14 },
      favIconSize: 20,
      favBtn: { padding: 6 },
    },
    medium: {
      container: {},
      cardImage: { width: '100%', height: '100%' },
      listImage: { width: 84, height: 84 },
      title: { fontSize: 18, fontWeight: '600' },
      price: { fontSize: 16 },
      favIconSize: 20,
      favBtn: { padding: 8 },
    },
    large: {
      container: {},
      cardImage: { width: '100%', height: '100%' },
      listImage: { width: 96, height: 96 },
      title: { fontSize: 20, fontWeight: '600' },
      price: { fontSize: 18 },
      favIconSize: 24,
      favBtn: { padding: 10 },
    },
  };
}
