import { router } from 'expo-router';

export const navigateToShopHome = () => {
    router.navigate('/(tabs)/(home)/(shop)');
};

export const navigateToCart = () => {
    router.push('/(tabs)/(home)/(shop)/cart');
};

