/**
 * Shop domain navigation helpers.
 *
 * @deprecated These helpers are deprecated. Use `usePreventDoubleNavigation` hook
 * with `Routes` constants for safe, type-safe navigation.
 *
 * Migration:
 * ```tsx
 * // Before
 * navigateToCart();
 *
 * // After
 * const { push } = usePreventDoubleNavigation();
 * push(Routes.shop.cart());
 * ```
 */
import { router } from 'expo-router';
import { Routes } from './mainRoutes';

/** @deprecated Use `usePreventDoubleNavigation().navigate(Routes.shop.index)` */
export const navigateToShopHome = () => {
  console.warn(
    '[Navigation] navigateToShopHome is deprecated. Use usePreventDoubleNavigation hook.'
  );
  router.navigate(Routes.shop.index);
};

/** @deprecated Use `usePreventDoubleNavigation().push(Routes.shop.cart())` */
export const navigateToCart = () => {
  console.warn(
    '[Navigation] navigateToCart is deprecated. Use usePreventDoubleNavigation hook.'
  );
  router.push(Routes.shop.cart());
};

/** @deprecated Use `usePreventDoubleNavigation().push(Routes.modals.businessProfile(id))` */
export const navigateToBusinessProfile = (businessId: string) => {
  console.warn(
    '[Navigation] navigateToBusinessProfile is deprecated. Use usePreventDoubleNavigation hook.'
  );
  router.push(Routes.modals.businessProfile(businessId));
};

/** @deprecated Use `usePreventDoubleNavigation().push(Routes.modals.productDetails(id))` */
export const navigateToProductDetails = (productId: string) => {
  console.warn(
    '[Navigation] navigateToProductDetails is deprecated. Use usePreventDoubleNavigation hook.'
  );
  router.push(Routes.modals.productDetails(productId));
};

