import { router } from 'expo-router';

export const navigateToTouristSpotHome = () => {
  router.navigate('/(tabs)/(home)/(spot)');
};

export const navigateToTouristSpotProfile = () => {
  router.push('/(tabs)/(home)/(spot)/profile/profile');
};
