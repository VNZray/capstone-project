import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors } from '@/constants/color';
import ShopCard from '@/components/ShopCard';
import PageContainer from '@/components/PageContainer';
import SearchBar from '@/components/SearchBar';
import FeaturedShopCard from '@/components/shops/FeaturedShopCard';
import SpecialOfferCard from '@/components/shops/SpecialOfferCard';
import CategoryChip from '@/components/shops/CategoryChip';
import SectionHeader from '@/components/shops/SectionHeader';
import { fetchAllBusinessDetails } from '@/services/BusinessService';
import type { Business } from '@/types/Business';
import { ThemedText } from '@/components/themed-text';

const SHOP_CATEGORIES = [
  { id: '1', icon: 'fast-food', iconFamily: 'Ionicons', label: 'Food & Beverage' },
  { id: '2', icon: 'heart-pulse', iconFamily: 'MaterialCommunityIcons', label: 'Health & Beauty' },
  { id: '3', icon: 'laptop', iconFamily: 'Ionicons', label: 'Technology & Services' },
  { id: '4', icon: 'cart', iconFamily: 'Ionicons', label: 'Shopping & Retail' },
  { id: '5', icon: 'briefcase', iconFamily: 'Ionicons', label: 'Professional Services' },
  { id: '6', icon: 'hammer', iconFamily: 'Ionicons', label: 'Construction & Repair' },
] as const;

const PLACEHOLDER_OFFERS = [
  { id: '1', title: 'Summer Sale', discount: '50% OFF' },
  { id: '2', title: 'New Customer Special', discount: '30% OFF' },
  { id: '3', title: 'Limited Time Offer', discount: '25% OFF' },
];

const Shop = () => {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const palette = {
    bg: isDark ? '#0D1B2A' : '#F8F9FA',
    card: isDark ? '#1C2833' : '#FFFFFF',
    text: isDark ? '#ECEDEE' : '#0D1B2A',
    subText: isDark ? '#9BA1A6' : '#6B7280',
    border: isDark ? '#2A2F36' : '#E5E8EC',
  };

  const loadBusinesses = async () => {
    try {
      setError(null);
      const data = await fetchAllBusinessDetails();
      
      // Filter only active/approved businesses
      const activeBusinesses = data.filter(b => 
        b.status === 'Approved' || b.status === 'Active'
      );
      setBusinesses(activeBusinesses);
    } catch (err: any) {
      console.error('❌ Error loading businesses:', err);
      setError(err.message || 'Failed to load businesses');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadBusinesses();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadBusinesses();
  };

  const handleBusinessPress = (business: Business) => {
    router.push(`/(tabs)/(home)/(shop)/business-details?businessId=${business.id}`);
  };

  const handleSearch = () => {
    console.log('🔍 Searching for:', searchQuery);
    // Implement search functionality
  };

  const handleCategoryPress = (categoryId: string) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
    console.log('📂 Category selected:', categoryId);
  };

  // Get featured businesses (top 5 with highest ratings or random)
  const featuredBusinesses = businesses.slice(0, 5);
  
  // Get all businesses for "Discover More" section
  const discoverMoreBusinesses = businesses;

  if (loading) {
    return (
      <PageContainer>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <ThemedText type="body-medium" style={{ marginTop: 16 }}>
            Loading shops...
          </ThemedText>
        </View>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <View style={styles.centerContainer}>
          <ThemedText type="title-medium" style={{ color: colors.error, marginBottom: 8 }}>
            Error
          </ThemedText>
          <ThemedText type="body-medium" style={{ color: palette.subText }}>
            {error}
          </ThemedText>
        </View>
      </PageContainer>
    );
  }

  return (
    <PageContainer padding={0}>
      <FlatList
        data={discoverMoreBusinesses}
        keyExtractor={(item) => item.id || ''}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <>
            {/* Search Bar Section */}
            <View style={styles.searchSection}>
              <SearchBar
                placeholder="Search shops..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSearch={handleSearch}
                variant="icon-right"
                size="md"
                shape="rounded"
              />
            </View>

            {/* Featured Shops Section */}
            {featuredBusinesses.length > 0 && (
              <View style={styles.section}>
                <SectionHeader
                  title="Featured Shops"
                  showViewAll
                  onViewAllPress={() => console.log('View all featured')}
                />
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.featuredContainer}
                >
                  {featuredBusinesses.map((business, index) => (
                    <FeaturedShopCard
                      key={business.id || index}
                      image={business.business_image || require('@/assets/images/placeholder.png')}
                      name={business.business_name}
                      category={business.description || ''}
                      rating={4.5}
                      isFeatured={true}
                      onPress={() => handleBusinessPress(business)}
                    />
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Special Offers Section */}
            <View style={styles.section}>
              <SectionHeader
                title="Special Offers"
                showViewAll
                onViewAllPress={() => console.log('View all offers')}
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.offersContainer}
              >
                {PLACEHOLDER_OFFERS.map((offer) => (
                  <SpecialOfferCard
                    key={offer.id}
                    image={require('@/assets/images/placeholder.png')}
                    title={offer.title}
                    discount={offer.discount}
                    onPress={() => console.log('Offer pressed:', offer.title)}
                  />
                ))}
              </ScrollView>
            </View>

            {/* Shop Categories Section */}
            <View style={styles.section}>
              <SectionHeader
                title="Shop Categories"
                showViewAll
                onViewAllPress={() => console.log('View all categories')}
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesContainer}
              >
                {SHOP_CATEGORIES.map((category) => (
                  <CategoryChip
                    key={category.id}
                    icon={category.icon}
                    iconFamily={category.iconFamily as any}
                    label={category.label}
                    isSelected={selectedCategory === category.id}
                    onPress={() => handleCategoryPress(category.id)}
                  />
                ))}
              </ScrollView>
            </View>

            {/* Discover More Header */}
            <SectionHeader title="Discover More" />
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.shopCardWrapper}>
            <ShopCard
              image={item.business_image || require('@/assets/images/placeholder.png')}
              name={item.business_name}
              category={item.description || 'No description'}
              elevation={2}
              onPress={() => handleBusinessPress(item)}
            />
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <ThemedText type="title-medium" style={{ color: palette.subText }}>
              No shops available
            </ThemedText>
            <ThemedText type="body-medium" style={{ color: palette.subText, marginTop: 8 }}>
              Check back later for new shops and services
            </ThemedText>
          </View>
        }
      />
    </PageContainer>
  );
};

export default Shop;

const styles = StyleSheet.create({
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  section: {
    marginVertical: 12,
  },
  featuredContainer: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  offersContainer: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  shopCardWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
});