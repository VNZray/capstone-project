import { Stack } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/color';

/**
 * Checkout Layout - Stack navigator for checkout and payment flows.
 * Separated from tabs to provide a focused checkout experience.
 * Tab bar is automatically hidden when navigating to this group.
 */
export default function CheckoutLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme as keyof typeof Colors];

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        animation: 'slide_from_right',
        headerStyle: { backgroundColor: theme.background },
        headerTintColor: theme.text,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="cart"
        options={{
          title: 'Cart',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="checkout"
        options={{
          title: 'Checkout',
          headerBackTitle: 'Cart',
        }}
      />
      <Stack.Screen
        name="payment-processing"
        options={{
          title: 'Processing Payment',
          headerShown: false,
          gestureEnabled: false, // Prevent back gesture during payment
        }}
      />
      <Stack.Screen
        name="payment-success"
        options={{
          title: 'Payment Success',
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="payment-failed"
        options={{
          title: 'Payment Failed',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="payment-cancel"
        options={{
          title: 'Payment Cancelled',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="order-confirmation"
        options={{
          title: 'Order Confirmed',
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="order-grace-period"
        options={{
          title: 'Confirm Order',
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="card-payment"
        options={{
          title: 'Card Payment',
          headerShown: false,
          gestureEnabled: false,
        }}
      />
    </Stack>
  );
}
