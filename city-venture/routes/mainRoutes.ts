// navigate to login register function
import { router } from 'expo-router';


export const navigateToRoot = () => {
    router.replace('./app/index');
}

// navigate to login
export const navigateToLogin = () => {
    router.navigate('/Login');
}

// navigate to register
export const navigateToRegister = () => {
    router.navigate('/Register');
}

// navigate to forgot password
export const navigateToForgotPassword = () => {
    router.navigate('/ForgotPassword');
}

// navigate to home
export const navigateToHome = () => {
    router.push('/(tabs)/(home)');
}

export const navigateToMap = () => {
    router.navigate('/(tabs)/(home)/maps');
}

export const navigateToProfile = () => {
    router.navigate('/(tabs)/(home)/profile');
}

export const navigateToFavorites = () => {
    router.navigate('/(tabs)/(home)/favorite');
}