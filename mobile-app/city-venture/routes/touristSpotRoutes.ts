/**
 * Tourist Spot domain navigation helpers.
 *
 * @deprecated These helpers are deprecated. Use `usePreventDoubleNavigation` hook
 * with `Routes` constants for safe, type-safe navigation.
 *
 * Migration:
 * ```tsx
 * // Before
 * navigateToTouristSpotHome();
 *
 * // After
 * const { navigate } = usePreventDoubleNavigation();
 * navigate(Routes.spot.index);
 * ```
 */
import { router } from 'expo-router';
import { Routes } from './mainRoutes';

/** @deprecated Use `usePreventDoubleNavigation().navigate(Routes.spot.index)` */
export const navigateToTouristSpotHome = () => {
  console.warn(
    '[Navigation] navigateToTouristSpotHome is deprecated. Use usePreventDoubleNavigation hook.'
  );
  router.navigate(Routes.spot.index);
};

/** @deprecated Use `usePreventDoubleNavigation().push(Routes.spot.profile(id))` */
export const navigateToTouristSpotProfile = (spotId?: string) => {
  console.warn(
    '[Navigation] navigateToTouristSpotProfile is deprecated. Use usePreventDoubleNavigation hook.'
  );
  if (spotId) {
    router.push(Routes.spot.profile(spotId));
  } else {
    router.push('/(tabs)/(home)/(spot)/profile/profile');
  }
};
