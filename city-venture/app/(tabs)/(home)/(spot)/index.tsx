import React, { useMemo, useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  View,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/context/ThemeContext';
import SearchBar from '@/components/SearchBar';
import TouristSpotCard from '@/components/tourist_spots/TouristSpotCard';
import FeaturedTouristSpotCard from '@/components/tourist_spots/FeaturedTouristSpotCard';
import Chip from '@/components/Chip';
import { useTouristSpot } from '@/context/TouristSpotContext';
import { navigateToTouristSpotProfile } from '@/routes/touristSpotRoutes';
import Button from '@/components/Button';
import PageContainer from '@/components/PageContainer';
import Loading from '@/components/Loading';

const TouristSpotScreen = () => {
  const { spots, categoriesAndTypes, loading, setSpotId } = useTouristSpot();
  const { colors } = useTheme();
  // Defensive fallbacks to avoid runtime errors while data is loading
  const safeSpots = Array.isArray(spots) ? spots : [];
  const categories = Array.isArray(categoriesAndTypes?.categories)
    ? categoriesAndTypes.categories.filter(Boolean)
    : [];
  const [query, setQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  
  const getCategoryIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('church') || n.includes('cathedral')) return 'church';
    if (n.includes('history') || n.includes('museum') || n.includes('shrine')) return 'landmark';
    if (n.includes('nature') || n.includes('volcano') || n.includes('hill')) return 'mountain';
    if (n.includes('pilgrimage')) return 'praying-hands';
    return 'map-marker-alt';
  };

  // Small helper to lowercase strings safely
  const toLowerSafe = (v: unknown) => (typeof v === 'string' ? v.toLowerCase() : '');

  const featured = useMemo(
    () =>
      safeSpots.filter(
        (s) => Number(s?.is_featured) === 1 || (s as any)?.is_featured === true
      ),
    [safeSpots]
  );

  const filteredSpots = useMemo(() => {
    return safeSpots.filter((spot: any) => {
      if (selectedCategoryId) {
        const matchCategory = spot?.categories?.some(
          (c: any) => c?.id === selectedCategoryId
        );
        if (!matchCategory) return false;
      }
      if (query.trim()) {
        const q = query.toLowerCase();
        const name = toLowerSafe(spot?.name);
        const desc = toLowerSafe(spot?.description);
        if (
          !name.includes(q) &&
          !desc.includes(q)
        )
          return false;
      }
      return true;
    });
  }, [safeSpots, selectedCategoryId, query]);

  const renderSpot = ({ item }: any) => {
    const primaryImage =
      item?.images?.find(
        (img: any) => img?.is_primary === 1 || img?.is_primary === true
      ) || item?.images?.[0];
    const location = [item?.barangay_name, item?.municipality_name]
      .filter(Boolean)
      .join(', ');
    return (
      <TouristSpotCard
        name={item?.name || 'Untitled'}
        image={
          primaryImage?.file_url ||
          'https://via.placeholder.com/300x200?text=No+Image'
        }
        location={location}
        categories={item?.categories?.filter(Boolean)?.map((c: any) => c?.category) || []}
        onPress={() => {
          if (item?.id != null) setSpotId(item.id);
          navigateToTouristSpotProfile();
        }}
        viewMode="card"
      />
    );
  };

  return (
    <>
      {loading && safeSpots.length === 0 ? (
        <View style={styles.center}> 
          <Loading />
        </View>
      ) : (
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={styles.content}
        stickyHeaderIndices={[1]}
      >
        <View style={{ marginTop: 8, marginBottom: 16 }}>
          <ThemedText type="header-large" style={{ fontSize: 32 }}>Tourist Spots</ThemedText>
        </View>

        <View style={[styles.SearchContainer, { backgroundColor: colors.background }]}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            onSearch={() => {}}
            placeholder="Explore new adventures..."
            variant="plain"
            size="md"
            containerStyle={{ flex: 1, backgroundColor: colors.inputBackground, borderRadius: 12, borderWidth: 0 }}
            inputStyle={{ fontSize: 15 }}
            rightIcon={<Ionicons name="options-outline" size={20} color={colors.active} />}
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
                  f?.images?.find(
                    (i: any) => i?.is_primary === 1 || i?.is_primary === true
                  ) || f?.images?.[0];
                return (
                  <View key={String((f as any)?.id)} style={{ marginRight: 12, width: 260 }}>
                    <FeaturedTouristSpotCard
                      name={(f as any)?.name || 'Untitled'}
                      image={
                        img?.file_url ||
                        'https://via.placeholder.com/300x400?text=No+Image'
                      }
                      categories={f?.categories?.filter(Boolean)?.map((c: any) => c?.category) || []}
                      onPress={() => {
                        if ((f as any)?.id != null) setSpotId((f as any).id);
                        navigateToTouristSpotProfile();
                      }}
                      width={220}
                      height={320}
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
              {categories.map((cat: any) => (
                <Chip
                  key={String(cat?.id)}
                  label={cat?.category || 'Unknown'}
                  variant={selectedCategoryId === cat?.id ? 'solid' : 'soft'}
                  onPress={() => setSelectedCategoryId(cat?.id ?? null)}
                  style={{ marginRight: 8 }}
                  startIconName={getCategoryIcon(cat?.category || '')}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Discover More / Grid */}
        <View style={{ marginTop: 12 }}>
          <FlatList
            data={filteredSpots}
            key={'card'}
            keyExtractor={(item, index) => String(item?.id ?? index)}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            renderItem={renderSpot}
            style={{ marginTop: 8 }}
            ListEmptyComponent={
              !loading ? (
                <ThemedText
                  type="body-small"
                  align="center"
                  style={styles.emptyText}
                >
                  No tourist spots found.
                </ThemedText>
              ) : null
            }
          />
        </View>
      </ScrollView>
      )}
    </>
  );
};

export default TouristSpotScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom:100, paddingHorizontal: 16 },
  screenTitle: { marginTop: 8, fontSize: 22, fontWeight: '800' },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  emptyText: { marginTop: 16, textAlign: 'center', fontSize: 13, opacity: 0.7 },
  SearchContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingBottom: 8,
    gap: 8,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 40 },
});
