import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Pressable,
  Dimensions,
  Animated,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/color';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import placeholder from '@/assets/images/placeholder.png';
import type { FavoriteItem } from '../types';

interface GridCardProps {
  item: FavoriteItem;
  colors: typeof Colors.light;
  onRemove: (favoriteId: string) => void;
}

export const GridCard: React.FC<GridCardProps> = ({
  item,
  colors,
  onRemove,
}) => {
  // Animation values
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entry animation
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePress = () => {
    // Navigate based on category type and favoriteType
    if (item.favoriteType === 'accommodation') {
      router.push({
        pathname: '/(tabs)/(home)/(accommodation)/profile/profile',
        params: { id: item.itemId },
      });
    } else if (item.favoriteType === 'room') {
      router.push({
        pathname: '/(tabs)/(home)/(accommodation)/room/profile',
        params: { id: item.itemId },
      });
    } else if (item.favoriteType === 'tourist_spot') {
      router.push({
        pathname: '/(tabs)/(home)/(spot)/profile/profile',
        params: { id: item.itemId },
      });
    } else if (item.favoriteType === 'shop') {
      router.push({
        pathname: '/(modals)/business-profile/[id]',
        params: { id: item.itemId },
      });
    } else if (item.favoriteType === 'event') {
      router.push({
        pathname: '/(tabs)/(home)/(event)/[id]',
        params: { id: item.itemId },
      });
    }
  };

  const handleRemove = () => {
    // Exit animation before removal
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onRemove(item.favoriteId);
    });
  };

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
        opacity: fadeAnim,
      }}
    >
      <Pressable
        onPress={handlePress}
        style={[styles.gridCard, { backgroundColor: colors.surface }]}
      >
        {/* Image Container */}
        <View style={styles.gridImageContainer}>
          <Image
            source={item.image ? { uri: item.image } : placeholder}
            style={styles.gridImage}
          />

          {/* Heart Icon */}
          <Pressable style={styles.heartButton} onPress={handleRemove}>
            <MaterialCommunityIcons name="heart" size={16} color="#D4AF37" />
          </Pressable>

          {/* Category Badge */}
          <View style={styles.categoryBadge}>
            <ThemedText
              type="label-extra-small"
              weight="bold"
              style={styles.categoryBadgeText}
            >
              {item.category}
            </ThemedText>
          </View>
        </View>

        {/* Content */}
        <View style={styles.gridContent}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 4,
            }}
          >
            <ThemedText
              type="card-title-medium"
              weight="bold"
              numberOfLines={1}
              style={{ flex: 1, marginRight: 8 }}
            >
              {item.title}
            </ThemedText>
            {item.price && (
              <ThemedText
                type="label-small"
                weight="bold"
                style={{ color: colors.primary }}
              >
                {item.price}
              </ThemedText>
            )}
          </View>

          <View style={styles.ratingRow}>
            <MaterialCommunityIcons name="star" size={14} color="#D4AF37" />
            <ThemedText
              type="label-small"
              weight="semi-bold"
              style={{ marginLeft: 4 }}
            >
              {item.rating}
            </ThemedText>
            <ThemedText
              type="label-small"
              style={{ color: colors.textSecondary, marginLeft: 4 }}
              numberOfLines={1}
            >
              • {item.location}
            </ThemedText>
          </View>

          {/* Actions */}
          <View style={styles.actionRow}>
            <Pressable
              onPress={handlePress}
              style={[
                styles.visitButton,
                { backgroundColor: colors.background },
              ]}
            >
              <ThemedText type="label-small" weight="semi-bold">
                Visit
              </ThemedText>
              <MaterialCommunityIcons
                name="arrow-right"
                size={14}
                color={colors.text}
              />
            </Pressable>
            <Pressable
              style={[
                styles.iconButton,
                { backgroundColor: colors.background },
              ]}
            >
              <Feather name="send" size={14} color={colors.text} />
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  gridCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    width: (Dimensions.get('window').width - 40 - 16) / 2,
  },
  gridImageContainer: {
    height: 180,
    width: '100%',
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heartButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: '#0F2043',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  categoryBadgeText: {
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  gridContent: {
    padding: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  visitButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  iconButton: {
    width: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
});
