import { Stack } from 'expo-router';
import { Colors } from '@/constants/color';
import { AppHeader } from '@/components/header/AppHeader';

export default function ReviewsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          header() {
            return (
              <AppHeader backButton title="My Reviews" background="primary" />
            );
          },
        }}
      />
    </Stack>
  );
}
