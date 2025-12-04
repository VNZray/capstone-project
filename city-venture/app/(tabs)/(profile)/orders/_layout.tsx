import { Stack } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/color';

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
        headerShown: false,
        animation: 'slide_from_right',
        headerStyle: { backgroundColor: theme.background },
        headerTintColor: theme.text,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'My Orders',
        }}
      />
      <Stack.Screen
        name="[orderId]"
        options={{
          title: 'Order Details',
        }}
      />
    </Stack>
  );
}
