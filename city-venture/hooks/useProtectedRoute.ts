import { useEffect } from 'react';
import { useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export function useProtectedRoute() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    // Wait for navigation to be ready and auth to load
    if (!navigationState?.key || loading) return;

    const firstSegment = segments[0] as string;
    
    // Auth group - for unauthenticated users
    const inAuthGroup = firstSegment === '(auth)';
    
    // Protected routes - require authentication
    const inProtectedRoute =
      firstSegment === '(tabs)' ||
      firstSegment === '(checkout)' ||
      firstSegment === '(modals)';

    if (!user && inProtectedRoute) {
      // Redirect unauthenticated users to login
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      // Redirect authenticated users to home
      router.replace('/(tabs)/(home)');
    }
  }, [user, loading, segments, navigationState?.key, router]);

  return { isReady: !!navigationState?.key && !loading };
}
