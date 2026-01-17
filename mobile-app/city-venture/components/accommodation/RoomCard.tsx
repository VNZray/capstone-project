import { card, colors as themeColors } from '@/constants/color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
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
import Container from '../Container';
import { ThemedText } from '../themed-text';
import Divider from '../Divider';
import { sub } from 'date-fns';

export type RoomCardVariant = 'solid' | 'outlined' | 'soft';
export type RoomCardSize = 'small' | 'medium' | 'large';
export type RoomCardView = 'card' | 'list' | string;

export interface RoomCardProps {
  image?: string | ImageSourcePropType;
  title: string; // Room number / name
  subtitle?: string; // Room type
  capacity?: number | string; // Guests capacity
  beds?: number; // Number of beds
  price?: string | number; // Display price (already formatted or raw)
  originalPrice?: string | number; // Original price before discount
  discountPercentage?: number; // Discount percentage if applicable
  rating?: number; // 0-5
  comments?: number; // number of reviews
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
  imageHeightList: number;
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
    imageHeight: 180,
    imageWidthList: 120,
    imageHeightList: 140,
    title: { fontSize: 15, fontWeight: '600' },
    subtitle: { fontSize: 11 },
    price: { fontSize: 16, fontWeight: '700' },
    rating: { fontSize: 12, fontWeight: '600' },
    comments: { fontSize: 11 },
    icon: 14,
    gap: 6,
    padding: 0,
  },
  medium: {
    imageHeight: 200,
    imageWidthList: 140,
    imageHeightList: 120,
    title: { fontSize: 17, fontWeight: '600' },
    subtitle: { fontSize: 12 },
    price: { fontSize: 24, fontWeight: '700' },
    rating: { fontSize: 13, fontWeight: '600' },
    comments: { fontSize: 11.5 },
    icon: 16,
    gap: 8,
    padding: 0,
  },
  large: {
    imageHeight: 220,
    imageWidthList: 160,
    imageHeightList: 180,
    title: { fontSize: 19, fontWeight: '600' },
    subtitle: { fontSize: 13 },
    price: { fontSize: 20, fontWeight: '700' },
    rating: { fontSize: 14, fontWeight: '600' },
    comments: { fontSize: 12.5 },
    icon: 18,
    gap: 10,
    padding: 0,
  },
};

function getElevation(
  level: 1 | 2 | 3 | 4 | 5 | 6 | undefined
): ViewStyle | undefined {
  if (!level) return undefined;
  const iosShadow: Record<number, ViewStyle> = {
    1: {
      shadowColor: '#000',
      shadowOpacity: 0.06,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
    },
    2: {
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 3 },
    },
    3: {
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
    },
    4: {
      shadowColor: '#000',
      shadowOpacity: 0.12,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
    },
    5: {
      shadowColor: '#000',
      shadowOpacity: 0.14,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
    },
    6: {
      shadowColor: '#000',
      shadowOpacity: 0.16,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 10 },
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
  });
}

export const RoomCard: React.FC<RoomCardProps> = ({
  image,
  title,
  subtitle,
  capacity,
  beds,
  price,
  originalPrice,
  discountPercentage,
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
  // Debug logging for discount props
  console.log('[RoomCard] Rendering card:', {
    title,
    price,
    originalPrice,
    discountPercentage,
    hasDiscount: !!(originalPrice && discountPercentage),
  });

  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const [fav, setFav] = useState(!!favorite);
  const sz = SIZE_MAP[size];

  const baseAccent = themeColors[color] || themeColors.primary;
  const surface = isDark ? card.dark : card.light;
  const textColor = isDark ? '#ECEDEE' : '#11181C';
  const subTextColor = isDark ? '#9BA1A6' : '#687076';
  const borderColor = isDark ? '#2A2F3A' : '#E4E7EB';

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
      '₱' +
      n.toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    if (typeof price === 'number') return format(price);
    const raw = price.trim();
    // Extract numeric part (allow digits & single decimal point)
    const numeric = raw.replace(/[^0-9.]/g, '');
    if (!numeric) return raw; // fallback if no numbers
    const num = Number(numeric);
    if (isNaN(num)) return raw; // can't parse, return original
    return format(num);
  }, [price]);

  const originalPriceDisplay = useMemo(() => {
    if (originalPrice == null) return undefined;
    const format = (n: number) =>
      '₱' +
      n.toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    if (typeof originalPrice === 'number') return format(originalPrice);
    const raw = String(originalPrice).trim();
    const numeric = raw.replace(/[^0-9.]/g, '');
    if (!numeric) return raw;
    const num = Number(numeric);
    if (isNaN(num)) return raw;
    return format(num);
  }, [originalPrice]);

  const hasDiscount = !!(originalPrice && discountPercentage);

  const Wrapper = onClick ? Pressable : View;

  // Card View - matches the image design
  if (view === 'card') {
    return (
      <Wrapper
        onPress={disabled ? undefined : onClick}
        style={({ pressed }: any) => [
          styles.cardContainer,
          {
            backgroundColor: surface,
            borderColor: borderColor,
            borderRadius: radius ?? 12,
          },
          getElevation(elevation),
          margin != null && typeof margin !== 'object' ? { margin } : undefined,
          pressed && onClick && Platform.OS !== 'web' && { opacity: 0.95 },
          style,
        ]}
        disabled={disabled}
      >
        {/* Image */}
        <View style={[styles.cardImageWrap, { height: sz.imageHeight }]}>
          <Image source={imgSource} style={styles.image} resizeMode="cover" />
          {/* Favorite Button */}
          <Pressable
            onPress={onToggleFavorite}
            style={styles.favBtnCard}
            accessibilityLabel={
              fav ? 'Remove from favorites' : 'Add to favorites'
            }
          >
            <Ionicons
              name={fav ? 'heart' : 'heart-outline'}
              size={22}
              color={fav ? '#FF385C' : '#FFFFFF'}
            />
          </Pressable>
          {/* Status Badge */}
          {!!status && (
            <View style={styles.statusBadgeCard}>
              <Chip
                label={status}
                size="small"
                variant="soft"
                color={
                  status === 'Available'
                    ? 'success'
                    : status === 'Booked'
                    ? 'warning'
                    : 'error'
                }
                elevation={0 as any}
              />
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.cardContent}>
          {/* Top Row: Room Number + Rating */}
          <View style={styles.cardTopRow}>
            <Text
              style={[
                { color: textColor, fontSize: 28, fontWeight: '700' },
                titleStyle,
              ]}
              numberOfLines={1}
            >
              {title}
            </Text>

            {/* Rating & Reviews - Top Right */}
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={18} color="#FFB800" />
              <ThemedText
                type="card-sub-title-small"
                weight="medium"
                style={[
                  {
                    color: textColor,
                    marginLeft: 4,
                  },
                ]}
              >
                {rating > 0 ? rating.toFixed(1) : '0.0'}
              </ThemedText>
              <ThemedText
                type="card-sub-title-small"
                weight="medium"
                style={[
                  {
                    color: subTextColor,
                    marginLeft: 4,
                  },
                ]}
              >
                ({comments || 0})
              </ThemedText>
            </View>
          </View>

          <Container
            backgroundColor="transparent"
            padding={0}
            direction="row"
            gap={8}
          >
            {/* Room Type */}
            {subtitle && (
              <View style={[styles.inline, { marginTop: 2 }]}>
                <Ionicons name="bed-outline" size={18} color={subTextColor} />
                <ThemedText
                  type="card-sub-title-small"
                  style={[
                    { color: subTextColor, marginLeft: 4 },
                    subtitleStyle,
                  ]}
                  numberOfLines={1}
                >
                  {subtitle}
                </ThemedText>
              </View>
            )}

            {/* Capacity */}
            {capacity != null && (
              <View style={[styles.inline, { marginTop: 4 }]}>
                <Ionicons
                  name="people-outline"
                  size={18}
                  color={subTextColor}
                />
                <ThemedText
                  type="card-sub-title-small"
                  style={[
                    { color: subTextColor, marginLeft: 4 },
                    subtitleStyle,
                  ]}
                  numberOfLines={1}
                >
                  {capacity}
                </ThemedText>
              </View>
            )}
          </Container>

          {/* Price */}
          <View style={{ marginTop: 12 }}>
            {hasDiscount ? (
              <View style={styles.priceWithDiscount}>
                <Text
                  style={[
                    {
                      color: subTextColor,
                      textDecorationLine: 'line-through',
                      fontSize: sz.price.fontSize! * 0.7,
                    },
                  ]}
                >
                  {originalPriceDisplay}
                </Text>
                <View style={styles.inline}>
                  <Text style={[{ color: baseAccent }, sz.price, priceStyle]}>
                    {priceDisplay}
                  </Text>
                  <View
                    style={[
                      styles.discountBadge,
                      { backgroundColor: baseAccent },
                    ]}
                  >
                    <Text style={styles.discountText}>
                      {discountPercentage}% OFF
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              priceDisplay && (
                <Text style={[{ color: baseAccent }, sz.price, priceStyle]}>
                  {priceDisplay}
                </Text>
              )
            )}
          </View>
        </View>
      </Wrapper>
    );
  }

  // List View - horizontal layout
  return (
    <Wrapper
      onPress={disabled ? undefined : onClick}
      style={({ pressed }: any) => [
        styles.listContainer,
        {
          backgroundColor: surface,
          borderColor: borderColor,
          borderRadius: radius ?? 12,
        },
        getElevation(elevation),
        margin != null && typeof margin !== 'object' ? { margin } : undefined,
        pressed && onClick && Platform.OS !== 'web' && { opacity: 0.95 },
        style,
      ]}
      disabled={disabled}
    >
      {/* Image */}
      <View
        style={[
          styles.listImageWrap,
          {
            width: sz.imageWidthList,
            height: sz.imageHeightList,
          },
        ]}
      >
        <Image source={imgSource} style={styles.image} resizeMode="cover" />
        {/* Favorite Button */}
        <Pressable
          onPress={onToggleFavorite}
          style={styles.favBtnList}
          accessibilityLabel={
            fav ? 'Remove from favorites' : 'Add to favorites'
          }
        >
          <Ionicons
            name={fav ? 'heart' : 'heart-outline'}
            size={18}
            color={fav ? '#FF385C' : '#FFFFFF'}
          />
        </Pressable>
        {/* Status Badge */}
        {!!status && (
          <View style={styles.statusBadgeList}>
            <Chip
              label={status}
              size="small"
              variant="soft"
              color={
                status === 'Available'
                  ? 'success'
                  : status === 'Booked'
                  ? 'warning'
                  : 'error'
              }
              elevation={0 as any}
            />
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.listContent}>
        {/* Room Number */}
        <Text
          style={[
            { color: textColor, fontSize: 20, fontWeight: '700' },
            titleStyle,
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>

        <Container
          backgroundColor="transparent"
          padding={0}
          direction="row"
          gap={8}
        >
          {/* Room Type */}
          {subtitle && (
            <View style={[styles.inline, { marginTop: 2 }]}>
              <Ionicons name="bed-outline" size={18} color={subTextColor} />
              <ThemedText
                type="card-sub-title-small"
                style={[{ color: subTextColor, marginLeft: 4 }, subtitleStyle]}
                numberOfLines={1}
              >
                {subtitle}
              </ThemedText>
            </View>
          )}

          {/* Capacity */}
          {capacity != null && (
            <View style={[styles.inline, { marginTop: 4 }]}>
              <Ionicons name="people-outline" size={18} color={subTextColor} />
              <ThemedText
                type="card-sub-title-small"
                style={[{ color: subTextColor, marginLeft: 4 }, subtitleStyle]}
                numberOfLines={1}
              >
                {capacity}
              </ThemedText>
            </View>
          )}
        </Container>

        {/* Rating & Reviews - always visible */}
        <View style={[styles.inline, { marginTop: 6 }]}>
          <Ionicons name="star" size={18} color="#FFB800" />
          <ThemedText
            type="card-sub-title-small"
            weight="medium"
            style={[
              {
                color: textColor,
                marginLeft: 4,
              },
            ]}
          >
            {rating > 0 ? rating.toFixed(1) : '0.0'}
          </ThemedText>
          <ThemedText
            type="card-sub-title-small"
            weight="medium"
            style={[{ color: subTextColor, marginLeft: 4 }]}
          >
            ({comments || 0})
          </ThemedText>
        </View>

        {/* Price */}
        <View style={{ marginTop: 'auto', paddingTop: 8 }}>
          {hasDiscount ? (
            <>
              <Text
                style={[
                  {
                    color: subTextColor,
                    textDecorationLine: 'line-through',
                    fontSize: 14,
                  },
                ]}
              >
                {originalPriceDisplay}
              </Text>
              <View style={[styles.inline, { marginTop: 2 }]}>
                <Text
                  style={[
                    { color: baseAccent, fontSize: 20, fontWeight: '700' },
                    priceStyle,
                  ]}
                >
                  {priceDisplay}
                </Text>
                <View
                  style={[
                    styles.discountBadge,
                    { backgroundColor: baseAccent, marginLeft: 6 },
                  ]}
                >
                  <Text style={styles.discountText}>
                    {discountPercentage}% OFF
                  </Text>
                </View>
              </View>
            </>
          ) : (
            priceDisplay && (
              <Text
                style={[
                  { color: baseAccent, fontSize: 20, fontWeight: '700' },
                  priceStyle,
                ]}
              >
                {priceDisplay}
              </Text>
            )
          )}
        </View>
      </View>
    </Wrapper>
  );
};

export default RoomCard;

const styles = StyleSheet.create({
  // Card View Styles
  cardContainer: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardImageWrap: {
    width: '100%',
    position: 'relative',
    backgroundColor: '#E5E7EB',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  favBtnCard: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 8,
    borderRadius: 24,
    zIndex: 10,
  },
  statusBadgeCard: {
    position: 'absolute',
    left: 12,
    top: 12,
    zIndex: 10,
  },
  cardContent: {
    padding: 16,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceWithDiscount: {
    gap: 4,
  },
  discountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 8,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // List View Styles
  listContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    overflow: 'hidden',
    padding: 10,
  },
  listImageWrap: {
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#E5E7EB',
  },
  favBtnList: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 6,
    borderRadius: 20,
    zIndex: 10,
  },
  statusBadgeList: {
    position: 'absolute',
    left: 8,
    top: 8,
    zIndex: 10,
  },
  listContent: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'space-between',
  },

  // Shared Styles
  image: {
    width: '100%',
    height: '100%',
  },
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Deprecated (kept for backward compatibility)
  shadowWrapper: {
    borderRadius: 8,
  },
  container: {
    overflow: 'hidden',
    padding: 0,
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
