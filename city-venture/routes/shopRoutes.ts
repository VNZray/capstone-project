import { router } from 'expo-router';

export const navigateToShopHome = () => {
    router.navigate('/(tabs)/(home)/(shop)');
};

export const navigateToCart = () => {
    router.push('/(tabs)/(home)/(shop)/cart');
};

export const navigateToBusinessProfile = (businessId: string) => {
    router.push({
        pathname: '/(tabs)/(home)/(shop)/business-profile',
        params: { businessId },
    });
};

export const navigateToProductDetails = (productId: string) => {
    router.push({
        pathname: '/(tabs)/(home)/(shop)/product-details',
        params: { productId },
    });
};

