import { router } from 'expo-router';

/**
 * Centralized navigation service for Shop Module
 * This service provides consistent navigation methods and makes route changes easier to manage
 */
export const ShopNavigator = {
  /**
   * Navigate to a specific shop's detail page
   */
  goToShopDetails: (shopId: string) => {
    router.push(`/TouristApp/(tabs)/(home)/(shops)/(details)/${shopId}`);
  },

  /**
   * Navigate to the Featured Shops screen
   */
  goToFeaturedShops: () => {
    router.push('/TouristApp/(tabs)/(home)/(shops)/FeaturedShops');
  },

  /**
   * Navigate to the Recommended Shops screen
   */
  goToRecommendedShops: () => {
    router.push('/TouristApp/(tabs)/(home)/(shops)/RecommendedShops');
  },

  /**
   * Navigate to a specific category page
   */
  goToCategory: (categoryId: string) => {
    router.push(`/TouristApp/(tabs)/(home)/(shops)/(categories)/${categoryId}`);
  },

  /**
   * Navigate to the All Categories screen
   */
  goToAllCategories: () => {
    router.push('/TouristApp/(tabs)/(home)/(shops)/AllCategories');
  },
  /**
   * Navigate to a main category page
   */
  goToMainCategory: (categoryId: string) => {
    router.push(`/TouristApp/(tabs)/(home)/(shops)/(categories)/${categoryId}`);
  },

  /**
   * Navigate to a subcategory page
   */
  goToSubcategory: (subcategoryId: string) => {
    router.push(
      `/TouristApp/(tabs)/(home)/(shops)/(subcategory)/${subcategoryId}`
    );
  },

  /**
   * Navigate to search results with a query
   */
  goToSearchResults: (query: string) => {
    router.push(
      `/TouristApp/(tabs)/(home)/(shops)/search?q=${encodeURIComponent(query)}`
    );
  },

  /**
   * Navigate to all special offers
   */
  goToAllSpecialOffers: () => {
    router.push('/TouristApp/(tabs)/(home)/(shops)/SpecialOffers');
  },

  /**
   * Navigate back to the main shops page
   */
  goToShopsHome: () => {
    router.push('/TouristApp/(tabs)/(home)/(shops)/');
  },

  /**
   * Navigate to a special offer (if the target path is provided)
   */
  /**
   * Navigate to a specific special offer's details page
   */
  goToSpecialOfferDetails: (offerId: string) => {
    router.push(`/TouristApp/(tabs)/(home)/(shops)/offer/${offerId}`);
  },
} as const;
