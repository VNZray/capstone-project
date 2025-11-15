import FeaturedShopCard from '@/components/shops/FeaturedShopCard';
import ShopListCard from '@/components/shops/ShopListCard';
import ShopCategoryChip from '@/components/shops/ShopCategoryChip';
import SpecialOfferCard from '@/components/shops/SpecialOfferCard';
import SearchBar from '@/components/SearchBar';
import PageContainer from '@/components/PageContainer';
import Container from '@/components/Container';
import { ThemedText } from '@/components/themed-text';
import { background, colors } from '@/constants/color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { FontAwesome5 } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import {
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ScrollView,
  StyleSheet,
  View,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { fetchAllBusinessDetails } from '@/services/BusinessService';
import type { Business } from '@/types/Business';

// Category mapping similar to Accommodation
const SHOP_CATEGORIES: Record<string, { label: string; icon: string }> = {
  restaurant: { label: 'Restaurants', icon: 'utensils' },
  cafe: { label: 'Cafés', icon: 'coffee' },
  shopping: { label: 'Shopping', icon: 'shopping-bag' },
  grocery: { label: 'Groceries', icon: 'shopping-basket' },
  pharmacy: { label: 'Pharmacy', icon: 'pills' },
  salon: { label: 'Salons', icon: 'cut' },
  hotel: { label: 'Hotels', icon: 'hotel' },
  entertainment: { label: 'Entertainment', icon: 'gamepad' },
  all: { label: 'All Shops', icon: 'th-large' },
};

const SPECIAL_OFFERS_PLACEHOLDERS = [
  require('@/assets/images/placeholder.png'),
  require('@/assets/images/placeholder.png'),
  require('@/assets/images/placeholder.png'),
];

const ShopDirectory = () => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const bg = colorScheme === 'dark' ? background.dark : background.light;
  const isDark = colorScheme === 'dark';

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const palette = {
    bg,
    card: isDark ? '#1C2833' : '#FFFFFF',
    text: isDark ? '#ECEDEE' : '#0D1B2A',
    subText: isDark ? '#9BA1A6' : '#6B7280',
    border: isDark ? '#2A2F36' : '#E5E8EC',
  };

  const lastScrollOffset = useRef(0);
  const atTopRef = useRef(true);
  const wasScrollingUpRef = useRef(false);

  // Fetch businesses on mount
  const loadBusinesses = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchAllBusinessDetails();
      const activeBusinesses = data.filter(
        (b) => b.status === 'Approved' || b.status === 'Active'
      );
      setBusinesses(activeBusinesses);
    } catch (err: any) {
      console.error('❌ Error loading businesses:', err);
      setError(err.message || 'Failed to load businesses');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadBusinesses();
  }, [loadBusinesses]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadBusinesses();
  }, [loadBusinesses]);

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

  // Filter businesses based on search
  const filteredShops = useMemo(() => {
    if (!Array.isArray(businesses)) return [];
    let filtered = businesses;

    // Filter by search term
    if (search.trim()) {
      const term = search.toLowerCase();
      filtered = filtered.filter((b) =>
        b.business_name?.toLowerCase().includes(term) ||
        b.description?.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [businesses, search]);

  // Get featured shops (first 3)
  const featuredShops = useMemo(() => filteredShops.slice(0, 3), [filteredShops]);

  // Get shops for discover more section (remaining)
  const discoverMoreShops = useMemo(
    () => filteredShops.slice(3),
    [filteredShops]
  );

  const handleShopPress = (business: Business) => {
    router.push(
      `/(tabs)/(home)/(shop)/business-details?businessId=${business.id}`
    );
  };

  const handleCategoryChange = (categoryKey: string) => {
    setActiveCategory(categoryKey);
    // In a real app, you'd filter by category here
  };

  const renderFeaturedSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <ThemedText type="title-small" weight="bold" style={{ color: palette.text }}>
          Featured Shops
        </ThemedText>
        <ThemedText
          type="body-small"
          style={{ color: colors.secondary, fontWeight: '600' }}
          onPress={() => {}} // "View All" action
        >
          View All →
        </ThemedText>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12, paddingHorizontal: 0 }}
        scrollEventThrottle={16}
      >
        {featuredShops.length > 0 ? (
          featuredShops.map((shop) => (
            <FeaturedShopCard
              key={shop.id}
              image={shop.business_image || require('@/assets/images/placeholder.png')}
              name={shop.business_name}
              category={shop.description}
              rating={4.5}
              reviews={120}
              featured
              onPress={() => handleShopPress(shop)}
            />
          ))
        ) : (
          <View style={styles.emptyPlaceholder}>
            <ThemedText type="body-small" style={{ color: palette.subText }}>
              No featured shops available
            </ThemedText>
          </View>
        )}
      </ScrollView>
    </View>
  );

  const renderSpecialOffersSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <ThemedText type="title-small" weight="bold" style={{ color: palette.text }}>
          Special Offers
        </ThemedText>
        <ThemedText
          type="body-small"
          style={{ color: colors.secondary, fontWeight: '600' }}
        >
          View All →
        </ThemedText>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 10, paddingHorizontal: 0 }}
        scrollEventThrottle={16}
      >
        {SPECIAL_OFFERS_PLACEHOLDERS.map((image, idx) => (
          <SpecialOfferCard
            key={idx}
            image={image}
            onPress={() => {
              // Handle offer tap
            }}
          />
        ))}
      </ScrollView>
    </View>
  );

  const renderCategoriesSection = () => (
    <View style={styles.section}>
      <ThemedText type="title-small" weight="bold" style={{ color: palette.text, marginBottom: 12 }}>
        Shop Categories
      </ThemedText>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingHorizontal: 0 }}
        scrollEventThrottle={16}
      >
        {Object.entries(SHOP_CATEGORIES).map(([key, { label, icon }]) => (
          <ShopCategoryChip
            key={key}
            label={label}
            icon={icon}
            active={activeCategory === key}
            onPress={() => handleCategoryChange(key)}
          />
        ))}
      </ScrollView>
    </View>
  );

  const renderDiscoverMoreItem = ({ item }: { item: Business }) => (
    <ShopListCard
      image={item.business_image || require('@/assets/images/placeholder.png')}
      name={item.business_name}
      category={item.description}
      distance={Math.random() * 10 + 0.5} // Placeholder distance
      rating={4.2 + Math.random() * 0.8}
      reviews={50 + Math.floor(Math.random() * 150)}
      location={item.address}
      onPress={() => handleShopPress(item)}
    />
  );

  const renderListHeader = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <ThemedText type="title-small" weight="bold" style={{ color: palette.text }}>
          Discover More
        </ThemedText>
        {discoverMoreShops.length > 0 && (
          <ThemedText type="body-small" style={{ color: palette.subText }}>
            {discoverMoreShops.length} shops
          </ThemedText>
        )}
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyStateContainer}>
      <FontAwesome5 name="store" size={48} color={colors.secondary} />
      <ThemedText
        type="title-medium"
        weight="bold"
        align="center"
        style={{ color: palette.text, marginTop: 16 }}
      >
        No Shops Found
      </ThemedText>
      <ThemedText
        type="body-small"
        align="center"
        style={{ color: palette.subText, marginTop: 8 }}
      >
        Try adjusting your search or check back later for new shops.
      </ThemedText>
    </View>
  );

  if (loading) {
    return (
      <PageContainer>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <ThemedText
            type="body-medium"
            style={{ color: palette.text, marginTop: 16 }}
          >
            Loading shops...
          </ThemedText>
        </View>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <View style={styles.loadingContainer}>
          <FontAwesome5 name="exclamation-circle" size={48} color={colors.error} />
          <ThemedText
            type="title-medium"
            weight="bold"
            style={{ color: colors.error, marginTop: 16 }}
          >
            Error
          </ThemedText>
          <ThemedText
            type="body-small"
            style={{ color: palette.subText, marginTop: 8 }}
          >
            {error}
          </ThemedText>
        </View>
      </PageContainer>
    );
  }

  return (
    <PageContainer padding={0} gap={0} style={{ backgroundColor: bg }}>
      {/* Main Scrollable Content (SearchBar moved into header to avoid overlap) */}
      <FlatList
        data={discoverMoreShops}
        renderItem={renderDiscoverMoreItem}
        keyExtractor={(item) => item.id || ''}
        ListHeaderComponent={
          <>
            <Container gap={0} paddingHorizontal={16} paddingTop={12} paddingBottom={8} backgroundColor="transparent">
              <SearchBar
                shape="square"
                containerStyle={{ flex: 1 }}
                value={search}
                onChangeText={(text) => setSearch(text)}
                onSearch={() => {}}
                placeholder="Search shops or location..."
              />
            </Container>
            {renderFeaturedSection()}
            {renderSpecialOffersSection()}
            {renderCategoriesSection()}
            {renderListHeader()}
          </>
        }
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        scrollEventThrottle={32}
        onScroll={handleScroll}
        onScrollEndDrag={handleScrollEndDrag}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Loading indicator for more items */}
      {false && (
        <View style={styles.loadMoreContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      )}
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 100,
    gap: 0,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyPlaceholder: {
    paddingHorizontal: 16,
    paddingVertical: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadMoreContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});

export default ShopDirectory;
