import { useEffect } from 'react';
import { useNavigationContext } from '@/context/NavigationContext';

/**
 * Hook to hide tab bar on mount and restore on unmount.
 * Use this in screens that need full-screen focus (checkout, booking, etc.)
 */
export function useHideTabs() {
  const { setTabsVisible } = useNavigationContext();

  useEffect(() => {
    setTabsVisible(false);
    return () => setTabsVisible(true);
  }, [setTabsVisible]);
}
