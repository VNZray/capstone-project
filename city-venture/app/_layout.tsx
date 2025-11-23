import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as Linking from 'expo-linking';
import { useEffect } from 'react';
import { Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { ThemeProvider as CustomThemeProvider } from '@/context/ThemeContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    'Poppins-Regular': require('@/assets/fonts/Poppins/Poppins-Regular.ttf'),
    'Poppins-Medium': require('@/assets/fonts/Poppins/Poppins-Medium.ttf'),
    'Poppins-SemiBold': require('@/assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    'Poppins-Bold': require('@/assets/fonts/Poppins/Poppins-Bold.ttf'),
    'Poppins-ExtraBold': require('@/assets/fonts/Poppins/Poppins-ExtraBold.ttf'),
    'Poppins-Black': require('@/assets/fonts/Poppins/Poppins-Black.ttf'),
  });

  // Handle deep links for payment redirects
  useEffect(() => {
    // Handle initial URL if app was opened via deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    // Listen for deep link events while app is running
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleDeepLink = (url: string) => {
    console.log('[Deep Link] Received:', url);
    
    try {
      const { path } = Linking.parse(url);

      // Handle payment success: cityventure://orders/{orderId}/payment-success
      if (path?.includes('payment-success')) {
        const orderIdMatch = path.match(/orders\/([^\/]+)\/payment-success/);
        const orderId = orderIdMatch?.[1];
        
        console.log('[Deep Link] Payment success for order:', orderId);
        
        // Show success message
        Alert.alert(
          'Payment Successful',
          'Your payment has been received. Please wait for the business to confirm your order.',
          [{ text: 'OK' }]
        );
        
        // Navigate to order details (implement navigation logic as needed)
        // router.push(`/(tabs)/(home)/orders/${orderId}`);
      }
      
      // Handle payment cancel: cityventure://orders/{orderId}/payment-cancel
      else if (path?.includes('payment-cancel')) {
        const orderIdMatch = path.match(/orders\/([^\/]+)\/payment-cancel/);
        const orderId = orderIdMatch?.[1];
        
        console.log('[Deep Link] Payment cancelled for order:', orderId);
        
        Alert.alert(
          'Payment Cancelled',
          'Your payment was cancelled. You can try again from your order details.',
          [{ text: 'OK' }]
        );
        
        // Navigate to order details
        // router.push(`/(tabs)/(home)/orders/${orderId}`);
      }
    } catch (error) {
      console.error('[Deep Link] Error parsing URL:', error);
    }
  };

  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CartProvider>
          <CustomThemeProvider>
            <ThemeProvider value={colorScheme === 'light' ? DefaultTheme : DarkTheme}>
              <Stack>
                <Stack.Screen name="(screens)" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="landing" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
              </Stack>
            </ThemeProvider>
          </CustomThemeProvider>
        </CartProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
