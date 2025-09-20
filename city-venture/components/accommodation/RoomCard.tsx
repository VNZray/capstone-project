import { card, colors as themeColors } from '@/constants/color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { FontAwesome5 } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  Image,
  ImageSourcePropType,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import Chip from '../Chip';

export type RoomCardVariant = 'solid' | 'outlined' | 'soft';
export type RoomCardSize = 'small' | 'medium' | 'large';
export type RoomCardView = 'card' | 'list' | string;

export interface RoomCardProps {
  image?: string | ImageSourcePropType;
  title: string;            // Room number / name
  subtitle?: string;        // Room type
  capacity?: number | string; // Guests capacity
  price?: string | number;  // Display price (already formatted or raw)
  rating?: number;          // 0-5
  comments?: number;        // number of reviews
  status?: 'Available' | 'Booked' | 'Maintenance';
  favorite?: boolean;
  addToFavorite?: (next: boolean) => void;
  onClick?: () => void;
  variant?: RoomCardVariant;
  size?: RoomCardSize;
  view?: RoomCardView;
  elevation?: 1 | 2 | 3 | 4 | 5 | 6;
  color?: keyof typeof themeColors; // accent color key
  padding?: number | string;
  margin?: number | string;
  radius?: number;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
  priceStyle?: StyleProp<TextStyle>;
  footerStyle?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

type SizeConfig = {
  imageHeight: number;
  imageWidthList: number;
  title: TextStyle;
  subtitle: TextStyle;
  price: TextStyle;
  rating: TextStyle;
  comments: TextStyle;
  icon: number;
  gap: number;
  padding: number;
};

const SIZE_MAP: Record<RoomCardSize, SizeConfig> = {
  small: {
    imageHeight: 120,
    imageWidthList: 90,
    title: { fontSize: 14, fontWeight: '700' },
    subtitle: { fontSize: 11 },
    price: { fontSize: 13, fontWeight: '700' },
    rating: { fontSize: 12, fontWeight: '600' },
    comments: { fontSize: 11 },
    icon: 12,
    gap: 6,
    padding: 10,
  },
  medium: {
    imageHeight: 160,
    imageWidthList: 110,
    title: { fontSize: 16, fontWeight: '700' },
    subtitle: { fontSize: 12.5 },
    price: { fontSize: 15, fontWeight: '700' },
    rating: { fontSize: 13.5, fontWeight: '600' },
    comments: { fontSize: 12 },
    icon: 14,
    gap: 8,
    padding: 12,
  },
  large: {
    imageHeight: 200,
    imageWidthList: 135,
    title: { fontSize: 18, fontWeight: '700' },
    subtitle: { fontSize: 14 },
    price: { fontSize: 17, fontWeight: '700' },
    rating: { fontSize: 14, fontWeight: '600' },
    comments: { fontSize: 13 },
    icon: 16,
    gap: 10,
    padding: 14,
  },
};

function getElevation(level: 1 | 2 | 3 | 4 | 5 | 6 | undefined): ViewStyle | undefined {
  if (!level) return undefined;
  const iosShadow: Record<number, ViewStyle> = {
    1: { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
    2: { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } },
    3: { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
    4: { shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
    5: { shadowColor: '#000', shadowOpacity: 0.14, shadowRadius: 16, shadowOffset: { width: 0, height: 8 } },
    6: { shadowColor: '#000', shadowOpacity: 0.16, shadowRadius: 20, shadowOffset: { width: 0, height: 10 } },
  };
  const androidElevation: Record<number, ViewStyle> = {
    1: { elevation: 1 },
    2: { elevation: 2 },
    3: { elevation: 3 },
    4: { elevation: 4 },
    5: { elevation: 5 },
    6: { elevation: 6 },
  };
  return Platform.select<ViewStyle>({ ios: iosShadow[level], android: androidElevation[level], default: androidElevation[level] });
}

export const RoomCard: React.FC<RoomCardProps> = ({
  image,
  title,
  subtitle,
  capacity,
  price,
  rating = 0,
  comments = 0,
  status,
  favorite,
  addToFavorite,
  onClick,
  variant = 'solid',
  size = 'medium',
  view = 'card',
  elevation = 2,
  color = 'primary',
  padding,
  margin,
  radius,
  style,
  titleStyle,
  subtitleStyle,
  priceStyle,
  footerStyle,
  disabled,
}) => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const [fav, setFav] = useState(!!favorite);
  const sz = SIZE_MAP[size];

  const baseAccent = themeColors[color] || themeColors.primary;
  const surface = isDark ? card.dark : card.light;
  const textColor = isDark ? '#ECEDEE' : '#0D1B2A';
  const subTextColor = isDark ? '#9BA1A6' : '#6B7280';

  const variantStyles = useMemo(() => {
    if (variant === 'solid') {
      return {
        containerBg: surface,
        borderWidth: 1,
        borderColor: isDark ? '#262B3A' : '#E3E7EF',
        accentBg: baseAccent,
      };
    }
    if (variant === 'outlined') {
      return {
        containerBg: 'transparent',
        borderWidth: 1,
        borderColor: baseAccent,
        accentBg: baseAccent,
      };
    }
    // soft
    return {
      containerBg: isDark ? '#1C2234' : '#F3F6FB',
      borderWidth: 1,
      borderColor: isDark ? '#283044' : '#E0E6F0',
      accentBg: baseAccent,
    };
  }, [variant, isDark, baseAccent, surface]);

  const imgSource = image
    ? typeof image === 'string'
      ? { uri: image }
      : image
    : require('@/assets/images/gcash.png');

  const onToggleFavorite = () => {
    const next = !fav;
    setFav(next);
    addToFavorite?.(next);
  };

  const priceDisplay = useMemo(() => {
    if (price == null) return undefined;
    const format = (n: number) =>
      '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (typeof price === 'number') return format(price);
    const raw = price.trim();
    // Extract numeric part (allow digits & single decimal point)
    const numeric = raw.replace(/[^0-9.]/g, '');
    if (!numeric) return raw; // fallback if no numbers
    const num = Number(numeric);
    if (isNaN(num)) return raw; // can't parse, return original
    return format(num);
  }, [price]);

  const Wrapper: React.ElementType = onClick ? Pressable : View;

  return (
    <Wrapper
      onPress={disabled ? undefined : onClick}
      // Put elevation & background on wrapper (Android needs bg on elevated view)
      style={({ pressed }: any) => [
        styles.shadowWrapper,
        {
          backgroundColor: variantStyles.containerBg, // ensures shadow/elevation visible
          borderRadius: radius ?? 8,
        },
        getElevation(elevation),
        margin != null && typeof margin !== 'object' ? { margin } : undefined,
        pressed && onClick && Platform.OS !== 'web' && { transform: [{ scale: 0.98 }] },
        style,
      ]}
      disabled={disabled}
    >
      <View
        style={[
          styles.container,
          {
            // background moved to wrapper so iOS shadow not clipped & Android elevation works
            backgroundColor: 'transparent',
            borderWidth: variantStyles.borderWidth,
            borderColor: variantStyles.borderColor,
            borderRadius: radius ?? 8,
            padding: typeof padding === 'number' ? padding : sz.padding,
          },
          view === 'list' && styles.listContainer,
        ]}
      >
        {/* Image Section */}
        <View
          style={[
            view === 'card' ? styles.imageCardWrap : styles.imageListWrap,
            view === 'card' && { height: sz.imageHeight },
            view === 'list' && { width: sz.imageWidthList, height: sz.imageWidthList },
          ]}
        >
          <Image
            source={imgSource}
            style={styles.image}
            resizeMode="cover"
          />
          <Pressable
            onPress={onToggleFavorite}
            style={styles.favBtn}
            accessibilityLabel={fav ? 'Remove from favorites' : 'Add to favorites'}
          >
            <FontAwesome5
              name={fav ? 'heart' : 'heart'}
              solid={fav}
              size={16}
              color={fav ? '#ff5d73' : '#ffffffcc'}
            />
          </Pressable>
          {!!status && (
            <View style={styles.statusChipWrap}>
              <Chip
                label={status}
                size="small"
                variant="soft"
                color={status === 'Available' ? 'success' : status === 'Booked' ? 'warning' : 'error'}
                elevation={0 as any}
              />
            </View>
          )}
        </View>

        {/* Body */}
        <View style={[styles.body, view === 'list' && { flex: 1, paddingLeft: sz.gap }]}>  
          {view === 'card' ? (
            <View style={styles.columnsWrap}>
              <View style={[styles.colLeft, { gap: 4 }]}>  
                <Text style={[{ color: textColor }, sz.title, titleStyle]} numberOfLines={2}>
                  {title}
                </Text>
                {!!subtitle && (
                  <Text
                    style={[{ color: subTextColor }, sz.subtitle, subtitleStyle]}
                    numberOfLines={2}
                  >
                    {subtitle}
                  </Text>
                )}
                {capacity != null && (
                  <View style={[styles.inline, { marginTop: 2, gap: 4 }]}>
                    <FontAwesome5 name="users" size={sz.icon} color={subTextColor} />
                    <Text style={{ color: subTextColor, fontSize: sz.subtitle.fontSize }}>
                      {capacity} pax
                    </Text>
                  </View>
                )}
              </View>
              <View style={[styles.colRight, { alignItems: 'flex-end', gap: 4 }]}>                
                {priceDisplay && (
                  <Text
                    style={[{ color: baseAccent }, sz.price, priceStyle]}
                    numberOfLines={1}
                  >
                    {priceDisplay}
                  </Text>
                )}
                <View style={[styles.inline, { marginTop: 2 }]}>
                  <FontAwesome5 name="star" size={sz.icon} color="#FFC107" />
                  <Text style={[{ color: textColor, marginLeft: 4 }, sz.rating]}>{rating.toFixed(1)}</Text>
                  <Text style={[{ color: subTextColor, marginLeft: 6 }, sz.comments]}>({comments})</Text>
                </View>
              </View>
            </View>
          ) : (
            // list layout keeps original stacking
            <View>
              <Text style={[{ color: textColor }, sz.title, titleStyle]} numberOfLines={2}>
                {title}
              </Text>
              {!!subtitle && (
                <Text
                  style={[{ color: subTextColor, marginTop: 2 }, sz.subtitle, subtitleStyle]}
                  numberOfLines={2}
                >
                  {subtitle}
                </Text>
              )}
              {capacity != null && (
                <View style={[styles.inline, { marginTop: 6, gap: 4 }]}>
                  <FontAwesome5 name="users" size={sz.icon} color={subTextColor} />
                  <Text style={{ color: subTextColor, fontSize: sz.subtitle.fontSize }}>
                    {capacity} pax{String(capacity) === '1' ? '' : 's'}
                  </Text>
                </View>
              )}
              {priceDisplay && (
                <Text
                  style={[{ color: baseAccent, marginTop: 6 }, sz.price, priceStyle]}
                  numberOfLines={1}
                >
                  {priceDisplay}
                </Text>
              )}
              <View style={[styles.inline, { marginTop: 8 }]}>
                <FontAwesome5 name="star" size={sz.icon} color="#FFC107" />
                <Text style={[{ color: textColor, marginLeft: 4 }, sz.rating]}>{rating.toFixed(1)}</Text>
                <Text style={[{ color: subTextColor, marginLeft: 6 }, sz.comments]}>({comments})</Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </Wrapper>
  );
};

export default RoomCard;

const styles = StyleSheet.create({
  shadowWrapper: {
    borderRadius: 8,
  },
  container: {
    overflow: 'hidden',
    padding: 0,
  },
  listContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  imageCardWrap: {
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#e5e7eb',
  },
  imageListWrap: {
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#e5e7eb',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  favBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.25)',
    padding: 6,
    borderRadius: 20,
  },
  statusChipWrap: {
    position: 'absolute',
    left: 8,
    top: 8,
  },
  body: {
    paddingTop: 10,
  },
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  columnsWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  colLeft: {
    flex: 1,
    minWidth: 0,
  },
  colRight: {
    justifyContent: 'flex-start',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
