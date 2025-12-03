import { useCallback, useRef } from 'react';
import { useRouter } from 'expo-router';
import { useNavigationContext } from '@/context/NavigationContext';

interface NavigationOptions {
  debounceMs?: number;
}

type RouterMethod = 'push' | 'replace' | 'navigate' | 'dismissTo';

export function usePreventDoubleNavigation(options: NavigationOptions = {}) {
  const { debounceMs = 300 } = options;
  const router = useRouter();
  const { isNavigating, setIsNavigating, canNavigate } = useNavigationContext();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const createSafeNavigation = useCallback(
    <T extends RouterMethod>(method: T) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (...args: any[]) => {
        if (!canNavigate()) {
          console.log('[Navigation] Blocked duplicate navigation attempt');
          return;
        }

        setIsNavigating(true);

        // Clear any existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        // Execute navigation
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (router[method] as any)(...args);

        // Reset navigating state after debounce period
        timeoutRef.current = setTimeout(() => {
          setIsNavigating(false);
        }, debounceMs);
      };
    },
    [router, canNavigate, setIsNavigating, debounceMs]
  );

  return {
    push: createSafeNavigation('push'),
    replace: createSafeNavigation('replace'),
    navigate: createSafeNavigation('navigate'),
    dismissTo: createSafeNavigation('dismissTo'),
    back: router.back,
    canGoBack: router.canGoBack,
    isNavigating,
  };
}
