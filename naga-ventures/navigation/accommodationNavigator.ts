import { router } from 'expo-router';

/**
 * Centralized navigation service for Shop Module
 * This service provides consistent navigation methods and makes route changes easier to manage
 */
export const AccommodationNavigaator = {
  
  navigateToAccommodationDirectory: () => {
    router.push('/(tabs)/(home)/(accommodation)');
  },

  navigateToAccommodationProfile: (id: string) => {
    router.push(`/(tabs)/(home)/(accommodation)/profile/${id}`);
  },
} as const;
