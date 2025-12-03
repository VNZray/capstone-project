import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  useColorScheme,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/color';
import { MaterialCommunityIcons, Ionicons, Feather } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import {
  getFavoritesByTouristId,
  deleteFavorite,
  type Favorite,
  type FavoriteType,
} from '@/services/FavoriteService';
import { fetchBusinessDetails } from '@/services/AccommodationService';
import { fetchRoomDetails } from '@/services/RoomService';
import { fetchTouristSpotById } from '@/services/TouristSpotService';
import type { BusinessDetails } from '@/types/Business';
import type { Room } from '@/types/Business';
import placeholder from '@/assets/images/placeholder.png';
import { usePreventDoubleNavigation } from '@/hooks/usePreventDoubleNavigation';
import { Routes } from '@/routes/mainRoutes';

// --- Types ---

type Category =
  | 'All'
  | 'Accommodation'
  | 'Room'
  | 'Shop'
  | 'Event'
  | 'Tourist Spot';

type FavoriteItem = {
  id: string;
  favoriteId: string; // The favorite record ID for deletion
  title: string;
  location: string;
  rating: number;
  reviews?: number;
  price?: string;
  category: Exclude<Category, 'All'>;
  image: string;
  favoriteType: FavoriteType;
  itemId: string; // The actual item ID (accommodation_id, room_id, etc.)
};

const CATEGORIES: Category[] = [
  'All',
  'Accommodation',
  'Shop',
  'Room',
  'Event',
  'Tourist Spot',
];

// --- Components ---

const GridCard = ({
  item,
  colors,
  onRemove,
}: {
  item: FavoriteItem;
  colors: typeof Colors.light;
  onRemove: (favoriteId: string) => void;
}) => {
  const { push, isNavigating } = usePreventDoubleNavigation();

  const handlePress = () => {
    // Navigate based on category type
    if (item.category === 'Accommodation') {
      push(Routes.accommodation.index);
    } else if (item.category === 'Tourist Spot') {
      push(Routes.spot.index);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={isNavigating}
      style={[styles.gridCard, { backgroundColor: colors.surface }]}
    >
      {/* Image Container */}
      <View style={styles.gridImageContainer}>
        <Image
          source={item.image ? { uri: item.image } : placeholder}
          style={styles.gridImage}
        />

        {/* Heart Icon */}
        <Pressable
          style={styles.heartButton}
          onPress={() => onRemove(item.favoriteId)}
        >
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
            style={[styles.visitButton, { backgroundColor: colors.background }]}
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

const ListCard = ({
  item,
  colors,
  onRemove,
}: {
  item: FavoriteItem;
  colors: typeof Colors.light;
  onRemove: (favoriteId: string) => void;
}) => {
  const { push, isNavigating } = usePreventDoubleNavigation();

  const handlePress = () => {
    // Navigate based on category type
    if (item.category === 'Accommodation') {
      push(Routes.accommodation.index);
    } else if (item.category === 'Tourist Spot') {
      push(Routes.spot.index);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={isNavigating}
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

// --- Main Screen ---

const MyFavorite = () => {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const { user } = useAuth();
  const { push, back, canGoBack, isNavigating } = usePreventDoubleNavigation();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Use custom hook for favorites data
  const { favorites, loading, refreshing, onRefresh, handleRemoveFavorite } =
    useFavorites(user?.id);

  const filteredData = useMemo(() => {
    return favorites.filter((item) => {
      const matchesCategory =
        activeCategory === 'All' || item.category === activeCategory;
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [favorites, activeCategory, searchQuery]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          {/* Back Button */}
          <Pressable
            onPress={() => {
              if (canGoBack()) {
                back();
              } else {
                push(Routes.tabs.home);
              }
            }}
            disabled={isNavigating}
            style={({ pressed }) => ({
              opacity: pressed ? 0.7 : 1,
              padding: 4,
            })}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={colors.text}
            />
          </Pressable>

          <View>
            <ThemedText
              type="title-medium"
              weight="bold"
              style={styles.headerTitle}
            >
              My Collection
            </ThemedText>
            <ThemedText
              type="label-medium"
              style={{ color: colors.textSecondary }}
            >
              {favorites.length} saved places
            </ThemedText>
          </View>
        </View>
      </View>

      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        colors={colors}
      />

      <CategoryFilter
        categories={CATEGORIES}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        colors={colors}
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <ThemedText
            type="body-medium"
            style={{ marginTop: 16, color: colors.textSecondary }}
          >
            Loading your favorites...
          </ThemedText>
        </View>
      ) : (
        <FlatList
          key={viewMode}
          data={filteredData}
          keyExtractor={(item) => item.id}
          numColumns={viewMode === 'grid' ? 2 : 1}
          columnWrapperStyle={
            viewMode === 'grid' ? styles.columnWrapper : undefined
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          renderItem={({ item }) =>
            viewMode === 'grid' ? (
              <GridCard
                item={item}
                colors={colors}
                onRemove={handleRemoveFavorite}
              />
            ) : (
              <ListCard
                item={item}
                colors={colors}
                onRemove={handleRemoveFavorite}
              />
            )
          }
          ListEmptyComponent={<EmptyState colors={colors} />}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    gap: 16,
    flexGrow: 1,
  },
  columnWrapper: {
    gap: 16,
  },
});

export default MyFavorite;
