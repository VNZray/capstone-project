/**
 * Routes barrel export for City-Venture mobile app.
 * Import route utilities from '@/routes' for cleaner imports.
 *
 * @module Routes
 *
 * @example
 * ```tsx
 * import { Routes, matchRoute, getRouteDomain } from '@/routes';
 *
 * // Use type-safe routes
 * const { push } = usePreventDoubleNavigation();
 * push(Routes.shop.cart);
 *
 * // Check current route domain
 * const domain = getRouteDomain(pathname);
 * ```
 */

// Main routes export
export {
  Routes,
  matchRoute,
  getRouteDomain,
  type AppRoutes,
  type RoutePath,
  type RouteParams,
  type RouteWithParams,
} from './mainRoutes';

// Legacy exports (deprecated)
export {
  navigateToRoot,
  navigateToLogin,
  navigateToRegister,
  navigateToForgotPassword,
  navigateToHome,
  navigateToMap,
  navigateToProfile,
  navigateToFavorites,
} from './mainRoutes';

// Domain-specific route files
export * from './accommodationRoutes';
export * from './eventRoutes';
export * from './shopRoutes';
export * from './touristSpotRoutes';
