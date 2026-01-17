import { Stack } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/color';
import { AppHeader } from '@/components/header/AppHeader';

/**
 * Orders Layout - Stack navigator for orders list and detail views.
 * Provides consistent navigation within the orders section.
 */
export default function OrdersLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme as keyof typeof Colors];

  return (
    <Stack
      screenOptions={{
        animation: 'slide_from_right',
        headerStyle: { backgroundColor: theme.background },
        headerTintColor: theme.text,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="[orderId]"
        options={{
          headerShown: false,
          animation: 'slide_from_right',
          title: 'Order Details',
        }}
      />
    </Stack>
  );
}
