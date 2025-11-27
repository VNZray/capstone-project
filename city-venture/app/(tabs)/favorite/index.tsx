import React, { useState, useMemo } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/color';
import { MaterialCommunityIcons, Ionicons, Feather } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';

// --- Types ---

type Category = 'All' | 'Stay' | 'Dining' | 'Visit';

type FavoriteItem = {
  id: string;
  title: string;
  location: string;
  rating: number;
  reviews?: number;
  price?: string;
  category: Exclude<Category, 'All'>;
  image: string;
};

// --- Mock Data ---

const MOCK_FAVORITES: FavoriteItem[] = [
  {
    id: '1',
    title: 'Aman Tokyo',
    location: 'Otemachi Tower, Tokyo',
    rating: 4.9,
    price: '$1850',
    category: 'Stay',
    image:
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: '2',
    title: 'Hotel de Crillon',
    location: 'Place de la Concorde, Paris',
    rating: 4.8,
    price: '$2100',
    category: 'Stay',
    image:
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: '3',
    title: 'The Brando',
    location: 'Tetiaroa, French Polynesia',
    rating: 5.0,
    price: '$3500',
    category: 'Stay',
    image:
      'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?q=80&w=1974&auto=format&fit=crop',
  },
  {
    id: '4',
    title: "Claridge's",
    location: 'Mayfair, London',
    rating: 4.7,
    price: '$1200',
    category: 'Stay',
    image:
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1974&auto=format&fit=crop',
  },
  {
    id: '5',
    title: 'Le Bernardin',
    location: 'New York, USA',
    rating: 4.9,
    price: '$450',
    category: 'Dining',
    image:
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1974&auto=format&fit=crop',
  },
  {
    id: '6',
    title: 'Louvre Museum',
    location: 'Paris, France',
    rating: 4.8,
    price: '$20',
    category: 'Visit',
    image:
      'https://images.unsplash.com/photo-1499856871940-a09627c6dcf6?q=80&w=2020&auto=format&fit=crop',
  },
];

const CATEGORIES: Category[] = ['All', 'Stay', 'Dining', 'Visit'];

// --- Components ---

const GridCard = ({
  item,
  colors,
}: {
  item: FavoriteItem;
  colors: typeof Colors.light;
}) => {
  const handlePress = () => {
    router.push({
      pathname: '/(tabs)/(home)/(spot)',
      params: { spotId: item.id },
    });
  };

  return (
    <Pressable
      onPress={handlePress}
      style={[styles.gridCard, { backgroundColor: colors.surface }]}
    >
      {/* Image Container */}
      <View style={styles.gridImageContainer}>
        <Image source={{ uri: item.image }} style={styles.gridImage} />

        {/* Heart Icon */}
        <Pressable style={styles.heartButton}>
          <MaterialCommunityIcons name="heart" size={16} color="#D4AF37" />
        </Pressable>

        {/* Category Badge */}
        <View style={styles.categoryBadge}>
          <ThemedText
            type="label-extra-small"
            weight="bold"
            style={styles.categoryBadgeText}
          >
            {item.category.toUpperCase()}
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
}: {
  item: FavoriteItem;
  colors: typeof Colors.light;
}) => {
  const handlePress = () => {
    router.push({
      pathname: '/(tabs)/(home)/(spot)',
      params: { spotId: item.id },
    });
  };

  return (
    <Pressable
      onPress={handlePress}
      style={[styles.listCard, { backgroundColor: colors.surface }]}
    >
      {/* Image */}
      <View style={styles.listImageContainer}>
        <Image source={{ uri: item.image }} style={styles.listImage} />
        <Pressable style={styles.listHeartButton}>
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
            {item.category.toUpperCase()}
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

const Favorite = () => {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = useMemo(() => {
    return MOCK_FAVORITES.filter((item) => {
      const matchesCategory =
        activeCategory === 'All' || item.category === activeCategory;
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

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
              if (router.canGoBack()) {
                router.back();
              } else {
                router.push('/(tabs)/(home)');
              }
            }}
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
              {MOCK_FAVORITES.length} saved places
            </ThemedText>
          </View>
        </View>

        {/* View Toggle */}
        <View style={[styles.viewToggle, { backgroundColor: colors.surface }]}>
          <Pressable
            onPress={() => setViewMode('grid')}
            style={[
              styles.toggleButton,
              viewMode === 'grid' && { backgroundColor: colors.text },
            ]}
          >
            <MaterialCommunityIcons
              name="view-grid-outline"
              size={20}
              color={
                viewMode === 'grid' ? colors.background : colors.textSecondary
              }
            />
          </Pressable>
          <Pressable
            onPress={() => setViewMode('list')}
            style={[
              styles.toggleButton,
              viewMode === 'list' && { backgroundColor: colors.text },
            ]}
          >
            <MaterialCommunityIcons
              name="format-list-bulleted"
              size={20}
              color={
                viewMode === 'list' ? colors.background : colors.textSecondary
              }
            />
          </Pressable>
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
        renderItem={({ item }) =>
          viewMode === 'grid' ? (
            <GridCard item={item} colors={colors} />
          ) : (
            <ListCard item={item} colors={colors} />
          )
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <ThemedText
              type="body-medium"
              style={{ color: colors.textSecondary }}
            >
              No items found
            </ThemedText>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    paddingBottom: 20,
    gap: 16,
    flexGrow: 1, // Ensure scrollability
  },
  columnWrapper: {
    gap: 16,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 40,
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

export default Favorite;
