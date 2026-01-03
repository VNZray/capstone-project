import { useEffect } from 'react';
import { useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

/**
 * useProtectedRoute - Navigation guard for authentication
 *
 * GUEST MODE ENABLED:
 * - Users can browse most of the app without authentication
 * - Only checkout flow requires authentication
 * - Individual screens/actions handle their own auth checks using useRequireAuth
 */
export function useProtectedRoute() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    // Wait for navigation to be ready and auth to load
    if (!navigationState?.key || loading) return;

    const firstSegment = segments[0] as string;

    // Auth group - for login/register screens
    const inAuthGroup = firstSegment === '(auth)';

    // Checkout flow - ALWAYS requires authentication
    const inCheckoutFlow = firstSegment === '(checkout)';

    // If user is trying to access checkout without auth, redirect to login
    if (!user && inCheckoutFlow) {
      router.replace('/(auth)/login');
    }
    // If user is logged in and on auth screens, redirect to home
    else if (user && inAuthGroup) {
      router.replace('/(tabs)/(home)');
    }

    // All other routes (tabs, modals, home, etc.) are accessible to guests
    // Individual screens will handle auth checks for protected actions
  }, [user, loading, segments, navigationState?.key, router]);

  return { isReady: !!navigationState?.key && !loading };
}
