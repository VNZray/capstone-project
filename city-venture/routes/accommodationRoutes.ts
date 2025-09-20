import { router } from 'expo-router';


export const navigateToAccommodationHome = () => {
    router.navigate('/(tabs)/(home)/(accommodation)');
};

export const navigateToAccommodationProfile = () => {
    router.navigate('/(tabs)/(home)/(accommodation)/profile/profile');
};

export const navigateToRoomProfile = () => {
    router.navigate('/(tabs)/(home)/(accommodation)/room/profile');
};