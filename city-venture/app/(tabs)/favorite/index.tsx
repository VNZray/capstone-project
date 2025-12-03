import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  Pressable,
  TextInput,
  Dimensions,
  ScrollView,
  useColorScheme,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Alert,
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
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Map favorite type to category
  const mapFavoriteTypeToCategory = (
    type: FavoriteType
  ): Exclude<Category, 'All'> => {
    const mapping: Record<FavoriteType, Exclude<Category, 'All'>> = {
      accommodation: 'Accommodation',
      room: 'Room',
      shop: 'Shop',
      event: 'Event',
      tourist_spot: 'Tourist Spot',
    };
    return mapping[type];
  };

  // Fetch favorites and their details
  const fetchFavorites = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const favoritesData = await getFavoritesByTouristId(user.id);
      console.log(
        'Raw favorites data:',
        JSON.stringify(favoritesData, null, 2)
      );

      // Fetch details for each favorite
      const favoritesWithDetails = await Promise.all(
        favoritesData.map(async (fav: Favorite) => {
          try {
            let itemData: any = null;
            let title = 'Unknown';
            let location = 'Location not available';
            let image = '';
            let price = undefined;

            console.log(
              `Fetching details for favorite ${fav.id}, type: ${fav.favorite_type}, item_id: ${fav.my_favorite_id}`
            );

            if (fav.favorite_type === 'accommodation') {
              itemData = await fetchBusinessDetails(fav.my_favorite_id);
              console.log('Accommodation data:', itemData);
              title = itemData.business_name || 'Accommodation';
              location = `${itemData.barangay_name || ''}, ${
                itemData.municipality_name || ''
              }`;
              image = itemData.business_image || '';
              price = itemData.min_price ? `₱${itemData.min_price}` : undefined;
            } else if (fav.favorite_type === 'room') {
              itemData = await fetchRoomDetails(fav.my_favorite_id);
              console.log('Room data:', itemData);
              title =
                itemData.room_type || `Room ${itemData.room_number || ''}`;
              location = `${
                itemData.room_number ? 'Room ' + itemData.room_number : ''
              } • ${itemData.floor || ''}sqm`;
              image = itemData.room_image || '';

              // Format room price
              const rawPrice = itemData.room_price as any;
              if (rawPrice != null) {
                if (typeof rawPrice === 'number') {
                  price =
                    '₱' +
                    rawPrice.toLocaleString('en-PH', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    });
                } else {
                  const numeric = String(rawPrice).replace(/[^0-9.]/g, '');
                  const num = Number(numeric);
                  if (!isNaN(num)) {
                    price =
                      '₱' +
                      num.toLocaleString('en-PH', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      });
                  }
                }
              }
            } else if (fav.favorite_type === 'tourist_spot') {
              itemData = await fetchTouristSpotById(fav.my_favorite_id);
              title = itemData.name || 'Tourist Spot';
              location = `${itemData.barangay_name || ''}, ${
                itemData.municipality_name || ''
              }`;
              image = itemData.spot_image || '';
            }

            return {
              id: fav.id,
              favoriteId: fav.id,
              itemId: fav.my_favorite_id,
              title,
              location,
              rating: 0, // TODO: Fetch ratings
              reviews: 0,
              price,
              category: mapFavoriteTypeToCategory(fav.favorite_type),
              image,
              favoriteType: fav.favorite_type,
            } as FavoriteItem;
          } catch (error) {
            console.error(
              `Failed to fetch details for favorite ${fav.id}:`,
              error
            );
            return null;
          }
        })
      );

      setFavorites(
        favoritesWithDetails.filter(
          (item): item is FavoriteItem => item !== null
        )
      );
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
      Alert.alert('Error', 'Failed to load favorites. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchFavorites();
  }, [fetchFavorites]);

  const handleRemoveFavorite = useCallback(async (favoriteId: string) => {
    Alert.alert(
      'Remove Favorite',
      'Are you sure you want to remove this from your favorites?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteFavorite(favoriteId);
              setFavorites((prev) =>
                prev.filter((item) => item.favoriteId !== favoriteId)
              );
            } catch (error) {
              console.error('Failed to remove favorite:', error);
              Alert.alert(
                'Error',
                'Failed to remove favorite. Please try again.'
              );
            }
          },
        },
      ]
    );
  }, []);

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

      {/* Search & Filter */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: colors.surface }]}>
          <Ionicons
            name="search-outline"
            size={20}
            color={colors.textSecondary}
          />
          <TextInput
            placeholder="Search your collection..."
            placeholderTextColor={colors.textSecondary}
            style={[styles.searchInput, { color: colors.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <Pressable
          style={[styles.filterButton, { backgroundColor: colors.surface }]}
        >
          <Ionicons name="filter-outline" size={20} color={colors.text} />
        </Pressable>
      </View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContent}
        >
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat}
              onPress={() => setActiveCategory(cat)}
              style={[
                styles.categoryPill,
                activeCategory === cat
                  ? { backgroundColor: '#0F2043', borderColor: '#0F2043' }
                  : {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
              ]}
            >
              <ThemedText
                type="label-medium"
                weight="semi-bold"
                style={{
                  color:
                    activeCategory === cat ? '#FFFFFF' : colors.textSecondary,
                }}
              >
                {cat}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
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
          key={viewMode} // Force re-render when switching modes
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
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons
                name="heart-outline"
                size={64}
                color={colors.textSecondary}
              />
              <ThemedText
                type="card-title-medium"
                weight="semi-bold"
                style={{ marginTop: 16, color: colors.text }}
              >
                No Favorites Yet
              </ThemedText>
              <ThemedText
                type="body-medium"
                style={{
                  marginTop: 8,
                  color: colors.textSecondary,
                  textAlign: 'center',
                }}
              >
                Start adding places to your favorites to see them here!
              </ThemedText>
            </View>
          }
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
  },
  viewToggle: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  toggleButton: {
    padding: 8,
    borderRadius: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 48,
    borderRadius: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesContainer: {
    marginBottom: 16,
    height: 40, // Fixed height to prevent layout shifts
  },
  categoriesContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    gap: 16,
    flexGrow: 1, // Ensure scrollability
  },
  columnWrapper: {
    gap: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 80,
  },

  // Grid Card Styles
  gridCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    // Use width instead of maxWidth to force it to fill the available space
    // Calculation: (Screen Width - PaddingHorizontal*2 - Gap) / 2
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

  // List Card Styles
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
});

export default MyFavorite;
