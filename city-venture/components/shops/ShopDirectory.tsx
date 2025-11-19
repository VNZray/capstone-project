import Container from '@/components/Container';
import PageContainer from '@/components/PageContainer';
import SearchBar from '@/components/SearchBar';
import FeaturedShopCard from '@/components/shops/FeaturedShopCard';
import ShopCategoryTile from '@/components/shops/ShopCategoryTile';
import ShopListCard from '@/components/shops/ShopListCard';
import SpecialOfferCard from '@/components/shops/SpecialOfferCard';
import { ThemedText } from '@/components/themed-text';
import { SHOP_CATEGORIES } from '@/constants/ShopCategories';
import { ShopColors } from '@/constants/ShopColors';
import { fetchAllBusinessDetails } from '@/services/BusinessService';
import type { Business } from '@/types/Business';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

const SPECIAL_OFFERS_PLACEHOLDERS = [
  require('@/assets/images/placeholder.png'),
  require('@/assets/images/placeholder.png'),
  require('@/assets/images/placeholder.png'),
];

const ShopDirectory = () => {
  const router = useRouter();

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

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
      `/(tabs)/(home)/(shop)/business-profile?businessId=${business.id}`
    );
  };

  const handleCategoryChange = (categoryKey: string) => {
    setActiveCategory(categoryKey);
    // In a real app, you'd filter by category here
  };

  const renderFeaturedSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <ThemedText type="sub-title-extra-small" weight="bold" style={{ color: ShopColors.textPrimary }}>
          Featured Shops
        </ThemedText>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingRight: 8 }}
        snapToInterval={300} // Approximation
        decelerationRate="fast"
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
            <ThemedText type="body-small" style={{ color: ShopColors.textSecondary }}>
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
        <ThemedText type="sub-title-extra-small" weight="bold" style={{ color: ShopColors.textPrimary }}>
          Special Offers
        </ThemedText>
        <ThemedText
          type="body-extra-small"
          style={{ color: ShopColors.accent, fontWeight: '600' }}
        >
          View All →
        </ThemedText>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingRight: 8 }}
      >
        {SPECIAL_OFFERS_PLACEHOLDERS.map((image, idx) => (
          <SpecialOfferCard
            key={idx}
            image={image}
            discount={`${20 + idx * 10}% OFF`}
            title={idx % 2 === 0 ? 'Lunch Special' : 'Weekend Sale'}
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
      <View style={styles.sectionHeader}>
        <ThemedText type="sub-title-extra-small" weight="bold" style={{ color: ShopColors.textPrimary }}>
          Categories
        </ThemedText>
        <TouchableOpacity onPress={() => router.push('/(tabs)/(home)/(shop)/categories')}>
          <ThemedText
            type="body-extra-small"
            style={{ color: ShopColors.accent, fontWeight: '600' }}
          >
            View All →
          </ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.categoriesGrid}>
        {Object.entries(SHOP_CATEGORIES)
          .slice(0, 8)
          .map(([key, { label, icon }]) => (
            <View key={key} style={styles.categoryItemWrapper}>
              <ShopCategoryTile
                label={label}
                icon={icon}
                active={activeCategory === key}
                onPress={() => handleCategoryChange(key)}
              />
            </View>
          ))}
      </View>
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
      tags={['Open Now', 'Popular']}
      onPress={() => handleShopPress(item)}
    />
  );

  const renderListHeader = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <ThemedText type="sub-title-extra-small" weight="bold" style={{ color: ShopColors.textPrimary }}>
          Discover More
        </ThemedText>
        {discoverMoreShops.length > 0 && (
          <ThemedText type="body-extra-small" style={{ color: ShopColors.textSecondary }}>
            {discoverMoreShops.length} shops found
          </ThemedText>
        )}
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyStateContainer}>
      <FontAwesome5 name="store" size={48} color={ShopColors.disabled} />
      <ThemedText
        type="title-medium"
        weight="bold"
        align="center"
        style={{ color: ShopColors.textPrimary, marginTop: 16 }}
      >
        No Shops Found
      </ThemedText>
      <ThemedText
        type="body-small"
        align="center"
        style={{ color: ShopColors.textSecondary, marginTop: 8 }}
      >
        Try adjusting your search or check back later.
      </ThemedText>
    </View>
  );

  if (loading) {
    return (
      <PageContainer>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={ShopColors.accent} />
          <ThemedText
            type="body-medium"
            style={{ color: ShopColors.textSecondary, marginTop: 16 }}
          >
            Finding the best spots...
          </ThemedText>
        </View>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <View style={styles.loadingContainer}>
          <FontAwesome5 name="exclamation-circle" size={48} color={ShopColors.error} />
          <ThemedText
            type="title-medium"
            weight="bold"
            style={{ color: ShopColors.error, marginTop: 16 }}
          >
            Something went wrong
          </ThemedText>
          <ThemedText
            type="body-small"
            style={{ color: ShopColors.textSecondary, marginTop: 8 }}
          >
            {error}
          </ThemedText>
        </View>
      </PageContainer>
    );
  }

  return (
    <PageContainer padding={0} gap={0} style={{ backgroundColor: ShopColors.background }}>
      <FlatList
        data={discoverMoreShops}
        renderItem={renderDiscoverMoreItem}
        keyExtractor={(item) => item.id || ''}
        ListHeaderComponent={
          <>
            <Container gap={0} paddingHorizontal={16} paddingTop={16} paddingBottom={8} backgroundColor="transparent">
              <SearchBar
                shape="round"
                containerStyle={{ 
                  flex: 1, 
                  backgroundColor: '#FFFFFF', 
                  borderWidth: 1, 
                  borderColor: ShopColors.border,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                  elevation: 2
                }}
                value={search}
                onChangeText={(text) => setSearch(text)}
                onSearch={() => {}}
                placeholder="Search shops, categories..."
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[ShopColors.accent]} />
        }
        showsVerticalScrollIndicator={false}
      />
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 100,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between', 
  },
  categoryItemWrapper: {
    marginBottom: 12,
  },
  emptyPlaceholder: {
    paddingHorizontal: 16,
    paddingVertical: 32,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
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

export default ShopDirectory;
