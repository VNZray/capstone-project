// navigate to login register function
import { router } from 'expo-router';


export const navigateToRoot = () => {
    router.replace('/');
};

// navigate to login
export const navigateToLogin = () => {
    router.replace('/Login');
};

// navigate to register
export const navigateToRegister = () => {
    router.replace('/Register');
};

// navigate to forgot password
export const navigateToForgotPassword = () => {
    router.navigate('/ForgotPassword');
};

// navigate to home
export const navigateToHome = () => {
    // Use replace to prevent back-navigation to Login on iOS (swipe back)
    router.replace('/(tabs)/(home)');
};

export const navigateToMap = () => {
    // maps lives directly under (tabs)/maps
    router.navigate('/(tabs)/maps');
};

export const navigateToProfile = () => {
    // profile is its own tab group
    router.navigate('/(tabs)/(profile)');
};

export const navigateToFavorites = () => {
    // favorite lives directly under (tabs)/favorite
    router.navigate('/(tabs)/favorite');
};