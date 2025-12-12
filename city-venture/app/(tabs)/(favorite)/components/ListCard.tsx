import React from 'react';
import { View, StyleSheet, Image, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/color';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import placeholder from '@/assets/images/placeholder.png';
import type { FavoriteItem } from '../types';

interface ListCardProps {
  item: FavoriteItem;
  colors: typeof Colors.light;
  onRemove: (favoriteId: string) => void;
}

export const ListCard: React.FC<ListCardProps> = ({
  item,
  colors,
  onRemove,
}) => {
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
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      style={[styles.listCard, { backgroundColor: colors.surface }]}
    >
      {/* Image */}
      <View style={styles.listImageContainer}>
        <Image
          source={item.image ? { uri: item.image } : placeholder}
          style={styles.listImage}
        />
        <Pressable
          style={styles.listHeartButton}
          onPress={() => onRemove(item.favoriteId)}
        >
          <MaterialCommunityIcons name="heart" size={14} color="#D4AF37" />
        </Pressable>
      </View>

      {/* Content */}
      <View style={styles.listCardContent}>
        <View style={styles.listHeader}>
          <ThemedText
            type="label-extra-small"
            weight="bold"
            style={{ color: '#D4AF37', letterSpacing: 1 }}
          >
            {item.category}
          </ThemedText>
          {item.price && (
            <ThemedText type="label-small" weight="bold">
              {item.price}
            </ThemedText>
          )}
        </View>

        <ThemedText
          type="card-title-medium"
          weight="bold"
          style={{ marginTop: 4 }}
        >
          {item.title}
        </ThemedText>

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

        <View style={[styles.actionRow, { marginTop: 'auto' }]}>
          <Pressable
            onPress={handlePress}
            style={[
              styles.visitButton,
              { backgroundColor: colors.background, flex: 1 },
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
            style={[styles.iconButton, { backgroundColor: colors.background }]}
          >
            <Feather name="send" size={14} color={colors.text} />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  listCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 16,
    gap: 12,
    height: 140,
  },
  listImageContainer: {
    width: 116,
    height: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  listImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  listHeartButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listCardContent: {
    flex: 1,
    paddingVertical: 4,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
