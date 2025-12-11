import { AppHeader } from '@/components/header/AppHeader';
import { Stack } from 'expo-router';

const ProfileLayout = () => {
  return (
    <Stack
      initialRouteName="index"
      screenOptions={{
        headerBackTitle: 'Back',
        headerShown: true,
        headerTitle: 'Profile',
      }}
    >
      {/* Ensure the Profile tab defaults to this screen */}
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          animation: 'default',
          headerTitleAlign: 'center',
          headerTitle: 'Favorites',
          headerBackTitle: 'Back',
          header() {
            return (
              <AppHeader backButton title="Favorites" background="primary" />
            );
          },
        }}
      />
    </Stack>
  );
};

export default ProfileLayout;
