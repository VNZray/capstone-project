import { AppHeader } from '@/components/header/AppHeader';
import { Stack } from 'expo-router';

export default function EventLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Notifications',
          headerShown: false,
          animation: 'simple_push',
          header: () => <AppHeader title="Notifications" />,
        }}
      />
    </Stack>
  );
}
