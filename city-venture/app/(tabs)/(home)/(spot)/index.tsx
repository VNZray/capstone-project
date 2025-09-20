import React, { useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import SearchBar from '@/components/SearchBar';
import TouristSpotCard from '@/components/TouristSpotCard';
import Chip from '@/components/Chip';
import { useTouristSpot } from '@/context/TouristSpotContext';

const TouristSpotScreen = () => {
  const { spots, categoriesAndTypes, loading } = useTouristSpot();
  const [query, setQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  const featured = useMemo(() => spots.filter(s => Number(s.is_featured) === 1 || s.is_featured === true), [spots]);

  const categories = categoriesAndTypes?.categories || [];

  const filteredSpots = useMemo(() => {
    return spots.filter(spot => {
      if (selectedCategoryId) {
        const matchCategory = spot.categories?.some(c => c.id === selectedCategoryId);
        if (!matchCategory) return false;
      }
      if (query.trim()) {
        const q = query.toLowerCase();
        if (!spot.name.toLowerCase().includes(q) && !spot.description.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [spots, selectedCategoryId, query]);

  const renderSpot = ({ item }: any) => {
    const primaryImage = item.images?.find((img: any) => img.is_primary === 1 || img.is_primary === true) || item.images?.[0];
    const location = [item.barangay_name, item.municipality_name].filter(Boolean).join(', ');
    return (
      <TouristSpotCard
        name={item.name}
        image={primaryImage?.file_url || 'https://via.placeholder.com/300x200?text=No+Image'}
        location={location}
        categories={item.categories?.map((c: any) => c.category)}
        onPress={() => { /* navigate to detail later */ }}
      />
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.screenTitle}>Tourist Spots</Text>
      <SearchBar
        value={query}
        onChangeText={setQuery}
        onSearch={() => { /* already filtered in realtime */ }}
        placeholder="Search"
        variant="icon-right"
        size="md"
        containerStyle={{ marginTop: 8 }}
      />

      {/* Featured Section */}
      {featured.length > 0 && (
        <View style={{ marginTop: 24 }}>
          <Text style={styles.sectionTitle}>Featured Locations</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }} contentContainerStyle={{ paddingRight: 8 }}>
            {featured.map(f => {
              const img = f.images?.find((i: any) => i.is_primary === 1 || i.is_primary === true) || f.images?.[0];
              const loc = [f.barangay_name, f.municipality_name].filter(Boolean).join(', ');
              return (
                <View key={f.id} style={{ marginRight: 12, width: 260 }}>
                  <TouristSpotCard
                    name={f.name}
                    image={img?.file_url || 'https://via.placeholder.com/300x200?text=No+Image'}
                    location={loc}
                    categories={f.categories?.map((c: any) => c.category)}
                    width={260}
                    onPress={() => {}}
                  />
                </View>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Categories Filter */}
      {categories.length > 0 && (
        <View style={{ marginTop: 24 }}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }} contentContainerStyle={{ paddingRight: 8 }}>
            <Chip
              label="All"
              variant={selectedCategoryId === null ? 'solid' : 'soft'}
              onPress={() => setSelectedCategoryId(null)}
              style={{ marginRight: 8 }}
            />
            {categories.map(cat => (
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
      <View style={{ marginTop: 28 }}>
        <Text style={styles.sectionTitle}>Discover More</Text>
        <FlatList
          data={filteredSpots}
          keyExtractor={(item) => item.id}
          numColumns={2}
          scrollEnabled={false}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          renderItem={renderSpot}
          style={{ marginTop: 16 }}
          ListEmptyComponent={!loading ? <Text style={styles.emptyText}>No tourist spots found.</Text> : null}
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
});