// navigate to login register function
import { router } from 'expo-router';

// navigate to login
export const navigateToLogin = () => {
    router.navigate('/(screens)/LoginPage');
}

// navigate to register
export const navigateToRegister = () => {
    router.navigate('/(screens)/RegistrationPage');
}