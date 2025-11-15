import { router } from 'expo-router';

export const navigateToEventHome = () => {
  router.navigate('/(tabs)/(home)/(event)');
};

export const navigateToEventDetails = (path = '/profile/profile') => {
  router.push(`/(tabs)/(home)/(event)${path}`);
};
