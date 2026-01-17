import GridList from '@/components/GridList';
import Container from '@/components/Container';
import PageContainer from '@/components/PageContainer';
import SearchBar from '@/components/SearchBar';
import FeaturedTouristSpotCard from '@/components/tourist_spots/FeaturedTouristSpotCard';
import Chip from '@/components/Chip';
import TouristSpotCard from '@/components/tourist_spots/TouristSpotCard';
import { ThemedText } from '@/components/themed-text';
import { ShopColors } from '@/constants/color';
import { useTouristSpot } from '@/context/TouristSpotContext';
import { navigateToTouristSpotProfile } from '@/routes/touristSpotRoutes';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

const TouristSpotDirectory = () => {
  const router = useRouter();
  const {
    spots,
    categoriesAndTypes,
    loading,
    setSpotId,
    refreshSpots,
    refreshCategories,
  } = useTouristSpot();

  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<number | 'all'>('all');

  const lastScrollOffset = useRef(0);
  const atTopRef = useRef(true);
  const wasScrollingUpRef = useRef(false);

  // Defensive fallbacks
  const safeSpots = useMemo(() => (Array.isArray(spots) ? spots : []), [spots]);
  const categories = Array.isArray(categoriesAndTypes?.categories)
    ? categoriesAndTypes.categories.filter(Boolean)
    : [];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshSpots(), refreshCategories()]);
    setRefreshing(false);
  }, [refreshSpots, refreshCategories]);

  // Handle scroll events for pull-to-refresh
  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = e.nativeEvent.contentOffset.y;
      const prev = lastScrollOffset.current;
      wasScrollingUpRef.current = offsetY < prev;
      atTopRef.current = offsetY <= 0;
      lastScrollOffset.current = offsetY;
    },
    []
  );

  const handleScrollEndDrag = useCallback(() => {
    if (
      atTopRef.current &&
      wasScrollingUpRef.current &&
      !refreshing &&
      !loading
    ) {
      onRefresh();
    }
  }, [loading, onRefresh, refreshing]);

  // Filter spots based on search and category
  const filteredSpots = useMemo(() => {
    return safeSpots.filter((spot: any) => {
      // Category Filter
      if (activeCategory !== 'all') {
        const matchCategory = spot?.categories?.some(
          (c: any) => c?.id === activeCategory
        );
        if (!matchCategory) return false;
      }

      // Search Filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const name = (spot?.name || '').toLowerCase();
        const desc = (spot?.description || '').toLowerCase();
        if (!name.includes(q) && !desc.includes(q)) return false;
      }
      return true;
    });
  }, [safeSpots, activeCategory, search]);

  const featuredSpots = useMemo(
    () =>
      safeSpots.filter(
        (s) => Number(s?.is_featured) === 1 || (s as any)?.is_featured === true
      ),
    [safeSpots]
  );

  const getCategoryIcon = (name: string) => {
    const n = (name || '').toLowerCase();
    if (n.includes('church') || n.includes('cathedral')) return 'church';
    if (n.includes('history') || n.includes('museum') || n.includes('shrine'))
      return 'landmark';
    if (n.includes('nature') || n.includes('volcano') || n.includes('hill'))
      return 'mountain';
    if (n.includes('pilgrimage')) return 'praying-hands';
    return 'map-marker-alt';
  };

  const renderCategoriesSection = () => (
    <View style={styles.categorySection}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalListContent}
      >
        <Chip
          label="All"
          active={activeCategory === 'all'}
          onPress={() => setActiveCategory('all')}
          icon="th-large"
          style={{ marginRight: 8 }}
        />
        {categories.map((cat: any) => (
          <Chip
            key={cat.id}
            label={cat.title || 'Unknown'}
            active={activeCategory === cat.id}
            onPress={() => setActiveCategory(cat.id)}
            icon={getCategoryIcon(cat.title || '')}
            style={{ marginRight: 8 }}
          />
        ))}
      </ScrollView>
    </View>
  );

  const renderFeaturedSection = () => {
    if (featuredSpots.length === 0 || search.length > 0 || activeCategory !== 'all')
      return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText type="header-small" style={styles.sectionTitle}>
            Featured Locations
          </ThemedText>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalListContent}
        >
          {featuredSpots.map((spot: any) => {
             const img =
             spot?.images?.find(
               (i: any) => i?.is_primary === 1 || i?.is_primary === true
             ) || spot?.images?.[0];

            return (
              <View key={spot.id} style={{ marginRight: 12, width: 260 }}>
                <FeaturedTouristSpotCard
                  name={spot.name || 'Untitled'}
                  image={
                    img?.file_url ||
                    'https://via.placeholder.com/300x400?text=No+Image'
                  }
                  categories={
                    spot?.categories
                      ?.filter(Boolean)
                      ?.map((c: any) => c?.category) || []
                  }
                  onPress={() => {
                    if (spot.id != null) setSpotId(spot.id);
                    navigateToTouristSpotProfile();
                  }}
                  width={260}
                  height={180}
                />
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const renderListHeader = () => (
    <View style={styles.sectionHeader}>
      <ThemedText type="header-small" style={styles.sectionTitle}>
        {search || activeCategory !== 'all'
          ? `Found ${filteredSpots.length} Locations`
          : 'Discover More'}
      </ThemedText>
    </View>
  );

  const renderSpotItem = ({ item }: any) => {
    const spot = item;
    const primaryImage =
      spot?.images?.find(
        (img: any) => img?.is_primary === 1 || img?.is_primary === true
      ) || spot?.images?.[0];
    const location = [spot?.barangay_name, spot?.municipality_name]
      .filter(Boolean)
      .join(', ');

    return (
      <TouristSpotCard
        name={spot?.name || 'Untitled'}
        image={
          primaryImage?.file_url ||
          'https://via.placeholder.com/300x200?text=No+Image'
        }
        location={location}
        categories={
          spot?.categories?.filter(Boolean)?.map((c: any) => c?.category) || []
        }
        onPress={() => {
          if (spot?.id != null) setSpotId(spot.id);
          navigateToTouristSpotProfile();
        }}
        viewMode="card"
      />
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyStateContainer}>
      <FontAwesome5
        name="map-marked-alt"
        size={48}
        color={ShopColors.disabled}
      />
      <ThemedText
        type="title-medium"
        weight="bold"
        style={{ color: ShopColors.textPrimary, marginTop: 16 }}
      >
        No locations found
      </ThemedText>
      <ThemedText
        type="body-small"
        style={{ color: ShopColors.textSecondary, marginTop: 8 }}
      >
        Try adjusting your search or filters
      </ThemedText>
    </View>
  );

  if (loading && safeSpots.length === 0) {
    return (
      <PageContainer>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={ShopColors.accent} />
          <ThemedText
            type="body-medium"
            style={{ color: ShopColors.textSecondary, marginTop: 16 }}
          >
            Loading tourist spots...
          </ThemedText>
        </View>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      padding={0}
      gap={0}
      style={{ backgroundColor: ShopColors.background }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        scrollEventThrottle={32}
        onScroll={handleScroll}
        onScrollEndDrag={handleScrollEndDrag}
        stickyHeaderIndices={[1]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[ShopColors.accent]}
          />
        }
      >
        {/* Header Title */}
        <View style={{ marginTop: 8, paddingHorizontal: 16 }}>
          <ThemedText type="header-large" style={{ fontSize: 32 }}>
            Tourist Spots
          </ThemedText>
        </View>

        {/* Sticky Search Bar */}
        <View style={styles.searchSection}>
          <SearchBar
            value={search}
            onChangeText={setSearch}
            onSearch={() => {}}
            placeholder="Search spots, categories..."
            variant="plain"
            size="md"
            containerStyle={{
              flex: 1,
              backgroundColor: ShopColors.inputBackground,
              borderRadius: 12,
              borderWidth: 0,
            }}
            inputStyle={{ fontSize: 15 }}
            enableFiltering={true}
          />
        </View>

        {/* Content */}
        {renderCategoriesSection()}
        {renderFeaturedSection()}

        {renderListHeader()}

        <View style={{ paddingHorizontal: 16 }}>
          <GridList
            data={filteredSpots}
            renderItem={renderSpotItem}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: 'space-between', gap: 12 }}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={renderEmpty()}
          />
        </View>
      </ScrollView>
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 100,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: ShopColors.background,
    zIndex: 100,
  },
  section: {
    marginBottom: 32,
  },
  categorySection: {
    marginBottom: 24,
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    color: ShopColors.textPrimary,
    fontSize: 20,
    letterSpacing: -0.5,
  },
  horizontalListContent: {
    paddingHorizontal: 16,
    paddingRight: 8,
  },
  emptyStateContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TouristSpotDirectory;
