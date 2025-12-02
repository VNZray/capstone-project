import { ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { NavigationProvider } from '@/context/NavigationContext';
import { NavigationTheme } from '@/constants/color';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';

/**
 * RootLayoutNav - Navigation structure with centralized auth protection
 * Uses useProtectedRoute hook to handle auth-based redirects
 */
function RootLayoutNav() {
  // Centralized auth protection - handles redirects between auth and protected routes
  useProtectedRoute();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Auth screens - unauthenticated users */}
      <Stack.Screen name="(auth)" />

      {/* Main tabs - authenticated users */}
      <Stack.Screen name="(tabs)" />

      {/* Checkout flow - authenticated, hides tabs */}
      <Stack.Screen name="(checkout)" />

      {/* Modal screens - cross-tab shared views */}
      <Stack.Screen
        name="(modals)"
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />

      {/* Welcome/splash redirect screen */}
      <Stack.Screen name="index" />

      {/* Catch unmatched routes */}
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    'Poppins-Regular': require('@/assets/fonts/Poppins/Poppins-Regular.ttf'),
    'Poppins-Medium': require('@/assets/fonts/Poppins/Poppins-Medium.ttf'),
    'Poppins-SemiBold': require('@/assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    'Poppins-Bold': require('@/assets/fonts/Poppins/Poppins-Bold.ttf'),
    'Poppins-ExtraBold': require('@/assets/fonts/Poppins/Poppins-ExtraBold.ttf'),
    'Poppins-Black': require('@/assets/fonts/Poppins/Poppins-Black.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationProvider>
          <CartProvider>
            <ThemeProvider value={NavigationTheme}>
              <RootLayoutNav />
            </ThemeProvider>
          </CartProvider>
        </NavigationProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
