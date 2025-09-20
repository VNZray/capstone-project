import React, { useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, View, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import SearchBar from '@/components/SearchBar';
import TouristSpotCard from '@/components/tourist_spots/TouristSpotCard';
import FeaturedTouristSpotCard from '@/components/tourist_spots/FeaturedTouristSpotCard';
import Chip from '@/components/Chip';
import { useTouristSpot } from '@/context/TouristSpotContext';
import { navigateToTouristSpotProfile } from '@/routes/touristSpotRoutes';
import Button from '@/components/Button';

const TouristSpotScreen = () => {
  const { spots, categoriesAndTypes, loading, setSpotId } = useTouristSpot();
  const [query, setQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');

  const featured = useMemo(
    () =>
      spots.filter(
        (s) => Number(s.is_featured) === 1 || s.is_featured === true
      ),
    [spots]
  );

  const categories = categoriesAndTypes?.categories || [];

  const filteredSpots = useMemo(() => {
    return spots.filter((spot) => {
      if (selectedCategoryId) {
        const matchCategory = spot.categories?.some(
          (c) => c.id === selectedCategoryId
        );
        if (!matchCategory) return false;
      }
      if (query.trim()) {
        const q = query.toLowerCase();
        if (
          !spot.name.toLowerCase().includes(q) &&
          !spot.description.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [spots, selectedCategoryId, query]);

  const renderSpot = ({ item }: any) => {
    const primaryImage =
      item.images?.find(
        (img: any) => img.is_primary === 1 || img.is_primary === true
      ) || item.images?.[0];
    const location = [item.barangay_name, item.municipality_name]
      .filter(Boolean)
      .join(', ');
    return (
      <TouristSpotCard
        name={item.name}
        image={
          primaryImage?.file_url ||
          'https://via.placeholder.com/300x200?text=No+Image'
        }
        location={location}
        categories={item.categories?.map((c: any) => c.category)}
        onPress={() => { setSpotId(item.id); navigateToTouristSpotProfile(); }}
        viewMode={viewMode}
      />
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.SearchContainer}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          onSearch={() => {}}
          placeholder="Search"
          variant="icon-right"
          size="md"
          containerStyle={{ flex: 1}}
        />
        <Button
          elevation={2}
          color="white"
          startIcon={viewMode === 'card' ? 'list' : 'th-large'}
          icon
          onPress={() => setViewMode(viewMode === 'card' ? 'list' : 'card')}
        />
      </View>

      {/* Featured Section */}
      {query.trim().length === 0 && featured.length > 0 && (
        <View style={{ marginTop: 12 }}>
          <ThemedText
            type="header-small"
            weight="bold"
            style={styles.sectionTitle}
          >
            Featured Locations
          </ThemedText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: 12 }}
            contentContainerStyle={{ paddingRight: 8 }}
          >
            {featured.map((f) => {
              const img =
                f.images?.find(
                  (i: any) => i.is_primary === 1 || i.is_primary === true
                ) || f.images?.[0];
              const loc = [f.barangay_name, f.municipality_name]
                .filter(Boolean)
                .join(', ');
              return (
                <View key={f.id} style={{ marginRight: 12, width: 260 }}>
                  <FeaturedTouristSpotCard
                    name={f.name}
                    image={img?.file_url || 'https://via.placeholder.com/300x200?text=No+Image'}
                    categories={f.categories?.map((c: any) => c.category)}
                    onPress={() => { setSpotId(f.id); navigateToTouristSpotProfile(); }}
                    width={260}
                    height={140}
                  />
                </View>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Categories Filter */}
      {categories.length > 0 && (
        <View style={{ marginTop: 12 }}>
          <ThemedText
            type="header-small"
            weight="bold"
            style={styles.sectionTitle}
          >
            Categories
          </ThemedText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: 12 }}
            contentContainerStyle={{ paddingRight: 8 }}
          >
            <Chip
              label="All"
              variant={selectedCategoryId === null ? 'solid' : 'soft'}
              onPress={() => setSelectedCategoryId(null)}
              style={{ marginRight: 8 }}
            />
            {categories.map((cat) => (
              <Chip
                key={cat.id}
                label={cat.category}
                variant={selectedCategoryId === cat.id ? 'solid' : 'soft'}
                onPress={() => setSelectedCategoryId(cat.id)}
                style={{ marginRight: 8 }}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Discover More / Grid */}
      <View style={{ marginTop: 12 }}>
        <FlatList
          data={filteredSpots}
          key={viewMode}
          keyExtractor={(item) => item.id}
          numColumns={viewMode === 'card' ? 2 : 1}
          scrollEnabled={false}
          columnWrapperStyle={viewMode === 'card' ? { justifyContent: 'space-between' } : undefined}
          renderItem={renderSpot}
          style={{ marginTop: 8 }}
          ListEmptyComponent={!loading ? (
            <ThemedText type="body-small" align="center" style={styles.emptyText}>No tourist spots found.</ThemedText>
          ) : null}
        />
      </View>
    </ScrollView>
  );
};

export default TouristSpotScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 48 },
  screenTitle: { marginTop: 8, fontSize: 22, fontWeight: '800' },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  emptyText: { marginTop: 16, textAlign: 'center', fontSize: 13, opacity: 0.7 },
  SearchContainer: {
    backgroundColor: 'transparent',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 8,
  },
});
