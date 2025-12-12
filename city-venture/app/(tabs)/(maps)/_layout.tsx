import { AppHeader } from '@/components/header/AppHeader';
import { Stack } from 'expo-router';

const MapsLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: 'Back',
        headerShown: true,
        headerTitle: 'Maps',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          animation: 'default',
          headerTitleAlign: 'center',
          headerTitle: 'Maps',
          headerBackTitle: 'Back',
          header() {
            return (
              <AppHeader
                backButton
                title="Interactive Map"
                background="light"
              />
            );
          },
        }}
      />
    </Stack>
  );
};

export default MapsLayout;
