/**
 * Event domain navigation helpers.
 *
 * @deprecated These helpers are deprecated. Use `usePreventDoubleNavigation` hook
 * with `Routes` constants for safe, type-safe navigation.
 *
 * Migration:
 * ```tsx
 * // Before
 * navigateToEventHome();
 *
 * // After
 * const { navigate } = usePreventDoubleNavigation();
 * navigate(Routes.event.index);
 * ```
 */
import { router } from 'expo-router';
import { Routes } from './mainRoutes';

/** @deprecated Use `usePreventDoubleNavigation().navigate(Routes.event.index)` */
export const navigateToEventHome = () => {
  console.warn(
    '[Navigation] navigateToEventHome is deprecated. Use usePreventDoubleNavigation hook.'
  );
  // Type assertion needed due to expo-router's strict typing
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  router.navigate(Routes.event.index as any);
};

/** @deprecated Use `usePreventDoubleNavigation().push(Routes.event.detail(id))` */
export const navigateToEventDetails = (eventId?: string) => {
  console.warn(
    '[Navigation] navigateToEventDetails is deprecated. Use usePreventDoubleNavigation hook.'
  );
  if (eventId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    router.push(Routes.event.detail(eventId) as any);
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    router.push('/(tabs)/(home)/(event)/profile/profile' as any);
  }
};
