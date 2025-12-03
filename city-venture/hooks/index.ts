/**
 * Hooks barrel export for City-Venture mobile app.
 * Import hooks from '@/hooks' for cleaner imports.
 *
 * @module Hooks
 *
 * @example
 * ```tsx
 * import {
 *   usePreventDoubleNavigation,
 *   useHideTabs,
 *   useProtectedRoute,
 *   useNavigationContext,
 * } from '@/hooks';
 * ```
 */

// Navigation hooks
export { usePreventDoubleNavigation } from './usePreventDoubleNavigation';
export { useHideTabs } from './useHideTabs';
export { useProtectedRoute } from './useProtectedRoute';

// Context hooks
export { useNavigationContext } from '@/context/NavigationContext';

// Auth hooks - note: useAuth is default export, useEnhancedAuth is named
export { default as useEnhancedAuth } from './useAuth';
export { useEnhancedAuth as useAuthHook } from './useAuth';

// Feature hooks
export { useCategoryAndType, useCategoriesAndTypesForBusinesses } from './use-category';
export { useColorScheme } from './use-color-scheme';
export { useUserBookings } from './use-user-bookings';
export { useOrderSocket } from './useOrderSocket';
