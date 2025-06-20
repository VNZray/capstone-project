import { ShopColors } from '@/constants/ShopColors';
import { useToggleFavorite } from '@/hooks/useShops';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { ShopCardProps } from './types';

const ShopCard: React.FC<ShopCardProps> = ({
  shop,
  onPress,
  showRating = true,
  showCategory = false, // Removed category display
  width = 180,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const toggleFavoriteMutation = useToggleFavorite();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const favoriteScaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    // Add a subtle scale animation on press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onPress(shop.id);
  };
  const handleFavoritePress = () => {
    // Add heart animation
    Animated.sequence([
      Animated.timing(favoriteScaleAnim, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(favoriteScaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    toggleFavoriteMutation.mutate(shop.id);
  };
  const styles = StyleSheet.create({
    container: {
      // Remove transform from here - will be applied directly to Animated.View
    },
    card: {
      backgroundColor: ShopColors.cardBackground,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: ShopColors.border,
      width: width,
      height: 220, // Fixed height for consistent layout
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 5,
      overflow: 'hidden',
      marginBottom: 8,
    },
    imageContainer: {
      position: 'relative',
      height: 120,
      backgroundColor: ShopColors.background,
    },
    image: {
      width: '100%',
      height: '100%',
    },
    imageOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '40%',
      justifyContent: 'flex-end',
      padding: 8,
    },
    ratingBadge: {
      position: 'absolute',
      top: 8,
      right: 8,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 16,
      backdropFilter: 'blur(10px)',
    },
    ratingBadgeText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '700',
      marginLeft: 4,
      fontFamily: 'Poppins-Bold',
    },
    favoriteButton: {
      position: 'absolute',
      top: 8,
      left: 8,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      borderRadius: 18,
      padding: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    shopInfo: {
      padding: 14,
      flex: 1, // Take remaining space after image
      justifyContent: 'space-between', // Distribute content evenly
    },
    name: {
      fontSize: 15,
      fontFamily: 'Poppins-Bold',
      color: ShopColors.textPrimary,
      lineHeight: 20,
      marginBottom: 6,
      minHeight: 40, // Fixed height to accommodate 2 lines
    },
    loadingContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: ShopColors.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorContainer: {
      backgroundColor: ShopColors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    priceRange: {
      fontSize: 12,
      fontFamily: 'Poppins-SemiBold',
      color: ShopColors.accent,
      marginTop: 4,
    },
  });
  return (
    <Animated.View
      style={[styles.container, { transform: [{ scale: scaleAnim }] }]}
    >
      <TouchableOpacity
        style={styles.card}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: shop.image }}
            style={styles.image}
            contentFit="cover"
            transition={300}
            placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**-oJ-pM|' }}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
          {/* Loading/Error states */}
          {!imageLoaded && !imageError && (
            <View style={[styles.imageContainer, styles.loadingContainer]}>
              <Ionicons
                name="image-outline"
                size={24}
                color={ShopColors.textSecondary}
              />
            </View>
          )}
          {imageError && (
            <View style={[styles.imageContainer, styles.errorContainer]}>
              <Ionicons
                name="image-outline"
                size={24}
                color={ShopColors.textSecondary}
              />
            </View>
          )}
          {/* Gradient overlay for better text readability */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.1)']}
            style={styles.imageOverlay}
          />
          {/* Favorite Button */}
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={handleFavoritePress}
            disabled={toggleFavoriteMutation.isPending}
          >
            <Animated.View
              style={{ transform: [{ scale: favoriteScaleAnim }] }}
            >
              <Ionicons
                name={shop.isFavorited ? 'heart' : 'heart-outline'}
                size={20}
                color={shop.isFavorited ? ShopColors.error : '#FFFFFF'}
              />
            </Animated.View>
          </TouchableOpacity>
          {/* Rating Badge */}
          {showRating && shop.rating !== undefined && shop.rating !== null && (
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={12} color="#FFD700" />
              <Text style={styles.ratingBadgeText}>
                {shop.rating.toFixed(1)}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.shopInfo}>
          <Text style={styles.name} numberOfLines={2}>
            {shop.name || 'Unknown Shop'}
          </Text>

          {shop.priceRange && (
            <Text style={styles.priceRange} numberOfLines={1}>
              {shop.priceRange}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default React.memo(ShopCard);
