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
import { Stack } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import {
  GridCard,
  ListCard,
  FavoriteHeader,
  SearchBar,
  CategoryFilter,
  EmptyState,
} from './components';
import { useFavorites } from './hooks/useFavorites';
import { CATEGORIES, type Category } from './types';

// --- Main Screen ---

const MyFavorite = () => {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const { user } = useAuth();
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

      <FavoriteHeader favoritesCount={favorites.length} colors={colors} />

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
