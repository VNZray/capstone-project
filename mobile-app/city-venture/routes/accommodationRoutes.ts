/**
 * Accommodation domain navigation helpers.
 *
 * @deprecated These helpers are deprecated. Use `usePreventDoubleNavigation` hook
 * with `Routes` constants for safe, type-safe navigation.
 *
 * Migration:
 * ```tsx
 * // Before
 * navigateToAccommodationHome();
 *
 * // After
 * const { navigate } = usePreventDoubleNavigation();
 * navigate(Routes.accommodation.index);
 * ```
 */
import { router } from 'expo-router';
import { Routes } from './mainRoutes';

/** @deprecated Use `usePreventDoubleNavigation().navigate(Routes.accommodation.index)` */
export const navigateToAccommodationHome = () => {
  console.warn(
    '[Navigation] navigateToAccommodationHome is deprecated. Use usePreventDoubleNavigation hook.'
  );
  router.navigate(Routes.accommodation.index);
};

/** @deprecated Use `usePreventDoubleNavigation().navigate(Routes.accommodation.profile(id))` */
export const navigateToAccommodationProfile = (id?: string) => {
  console.warn(
    '[Navigation] navigateToAccommodationProfile is deprecated. Use usePreventDoubleNavigation hook.'
  );
  if (id) {
    // Type assertion needed due to expo-router's strict typing
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    router.navigate(Routes.accommodation.profile(id) as any);
  } else {
    router.navigate('/(tabs)/(home)/(accommodation)/profile/profile');
  }
};

/** @deprecated Use `usePreventDoubleNavigation().navigate(Routes.accommodation.room.profile(id))` */
export const navigateToRoomProfile = (roomId?: string) => {
  console.warn(
    '[Navigation] navigateToRoomProfile is deprecated. Use usePreventDoubleNavigation hook.'
  );
  if (roomId) {
    router.navigate(Routes.accommodation.room.profile(roomId));
  } else {
    router.navigate('/(tabs)/(home)/(accommodation)/room/profile');
  }
};