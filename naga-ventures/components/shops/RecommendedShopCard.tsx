import { ShopColors } from '@/constants/ShopColors';
import { useToggleFavorite } from '@/hooks/useShops';
import type { ShopData } from '@/types/shop';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import {
  DimensionValue,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface RecommendedShopCardProps {
  shop: ShopData;
  onPress: (shopId: string) => void;
  width?: DimensionValue;
}

const RecommendedShopCard: React.FC<RecommendedShopCardProps> = ({
  shop,
  onPress,
  width: widthProp,
}) => {
  const defaultWidth = 260; // Reduced from 280 to match compact design
  const cardHeight = 200; // Reduced from 230

  const effectiveWidth = widthProp !== undefined ? widthProp : defaultWidth;

  const toggleFavoriteMutation = useToggleFavorite();

  const handleFavoritePress = () => {
    toggleFavoriteMutation.mutate(shop.id);
  };

  const formatReviewCount = (count: number | undefined) => {
    if (count === undefined) return '';
    if (count > 500) return '(500+)';
    return `(${count})`;
  };

  const styles = StyleSheet.create({
    card: {
      width: effectiveWidth,
      height: cardHeight,
      backgroundColor: ShopColors.cardBackground,
      borderRadius: 12, // Reduced from 16
      borderWidth: 1,
      borderColor: ShopColors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 }, // Reduced shadow
      shadowOpacity: 0.08, // Lighter shadow
      shadowRadius: 4,
      elevation: 2, // Reduced elevation
      marginBottom: 8, // Added margin to prevent shadow clipping
    },
    imageContainer: {
      width: '100%',
      height: cardHeight * 0.7,
      borderTopLeftRadius: 12, // Reduced from 16
      borderTopRightRadius: 12, // Reduced from 16
      overflow: 'hidden',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    floatingFavoriteButton: {
      position: 'absolute',
      top: 8, // Reduced from 10
      right: 8, // Reduced from 10
      zIndex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      borderRadius: 18, // Reduced from 20
      padding: 5, // Reduced from 6
    },
    contentWrapper: {
      flex: 1,
      paddingVertical: 8, // Reduced from 10
      paddingHorizontal: 12, // Reduced from 14
      justifyContent: 'flex-start',
    },
    topInfoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 2,
    },
    name: {
      fontSize: 15, // Reduced from 16
      fontFamily: 'Poppins-SemiBold',
      color: ShopColors.textPrimary,
      flexShrink: 1,
      marginRight: 8,
    },
    ratingReviewBlock: {
      flexDirection: 'row',
      alignItems: 'center',
      flexShrink: 0,
    },
    starIcon: {
      marginRight: 2, // Reduced from 3
      marginBottom: 2, // Reduced from 3.5
    },
    ratingText: {
      fontSize: 12, // Reduced from 13
      fontFamily: 'Poppins-SemiBold',
      color: ShopColors.textPrimary,
      marginRight: 3, // Reduced from 4
    },
    reviewCountText: {
      fontSize: 11, // Reduced from 12
      fontFamily: 'Poppins-Regular',
      color: ShopColors.textSecondary,
    },
    priceRange: {
      fontSize: 11, // Reduced from 12
      fontFamily: 'Poppins-Medium',
      color: ShopColors.textSecondary,
    },
  });

  return (
    <View style={styles.card}>
      <TouchableOpacity
        onPress={() => onPress(shop.id)}
        activeOpacity={0.85}
        style={{ flex: 1 }}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: shop.image }}
            style={styles.image}
            contentFit="cover"
            transition={300}
            placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**-oJ-pM|' }}
          />
        </View>
        <View style={styles.contentWrapper}>
          <View style={styles.topInfoRow}>
            <Text style={styles.name} numberOfLines={1}>
              {shop.name || 'Unknown Shop'}
            </Text>
            {shop.rating !== undefined && shop.rating !== null && (
              <View style={styles.ratingReviewBlock}>
                <Ionicons
                  name="star"
                  size={14} // Reduced from 15
                  color="#FFD700"
                  style={styles.starIcon}
                />
                <Text style={styles.ratingText}>{shop.rating.toFixed(1)}</Text>
                <Text style={styles.reviewCountText}>
                  {formatReviewCount(shop.ratingCount)}
                </Text>
              </View>
            )}
          </View>

          {shop.priceRange && (
            <Text style={styles.priceRange} numberOfLines={1}>
              {shop.priceRange}
            </Text>
          )}
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.floatingFavoriteButton}
        onPress={handleFavoritePress}
        disabled={toggleFavoriteMutation.isPending}
      >
        <Ionicons
          name={shop.isFavorited ? 'heart' : 'heart-outline'}
          size={20} // Reduced from 22
          color={shop.isFavorited ? ShopColors.error : '#FFFFFF'}
        />
      </TouchableOpacity>
    </View>
  );
};

export default React.memo(RecommendedShopCard);
