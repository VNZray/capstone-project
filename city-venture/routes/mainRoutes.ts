/**
 * Type-safe route constants and navigation helpers for City-Venture mobile app.
 * This centralizes all route paths to avoid hardcoded strings and enable type safety.
 *
 * @module Routes
 * @description Scalable navigation architecture following modular monolithic patterns.
 *
 * Usage:
 * ```tsx
 * import { Routes } from '@/routes/mainRoutes';
 * import { usePreventDoubleNavigation } from '@/hooks/usePreventDoubleNavigation';
 *
 * const { push } = usePreventDoubleNavigation();
 * push(Routes.shop.cart); // Type-safe, debounced navigation
 * ```
 */
import { router } from 'expo-router';

// ============================================================================
// Type-Safe Route Constants
// ============================================================================

/**
 * All application routes organized by domain/feature.
 * Use these constants instead of hardcoded route strings.
 *
 * Architecture principles:
 * - Routes are organized by feature domain (auth, shop, accommodation, etc.)
 * - Dynamic routes use builder functions that return typed route objects
 * - All paths use 'as const' for strict type inference
 */
export const Routes = {
  // Root/Splash
  root: '/',

  // ============================================================================
  // Auth Domain - Unauthenticated user flows
  // ============================================================================
  auth: {
    login: '/(auth)/login',
    register: '/(auth)/register',
    forgotPassword: '/(auth)/forgot-password',
  },

  test: {
    test: '/(test)',
  },

  // ============================================================================
  // Tab Navigation - Main authenticated navigation structure
  // ============================================================================
  tabs: {
    home: '/(tabs)/(home)',
    maps: '/(tabs)/(maps)',
    favorites: '/(tabs)/(favorite)',
    profile: '/(tabs)/(profile)',
    notification: '/(tabs)/(home)/(notification)',
  },

  // ============================================================================
  // Accommodation Domain - Hotel/lodging features
  // ============================================================================
  accommodation: {
    index: '/(tabs)/(home)/(accommodation)',
    profile: (id: string) => ({
      pathname: '/(tabs)/(home)/(accommodation)/profile' as const,
      params: { id },
    }),
    room: {
      profile: (roomId: string) => ({
        pathname: '/(tabs)/(home)/(accommodation)/room/profile' as const,
        params: { roomId },
      }),
      // Booking flow routes
      booking: {
        index: '/(tabs)/(home)/(accommodation)/room/(booking)' as const,
        date: (params?: {
          bookingType?: string;
          initialStartDate?: string;
          initialEndDate?: string;
          initialStartTime?: string;
          initialEndTime?: string;
          availabilityData?: string;


        }) => ({
          pathname:
            '/(tabs)/(home)/(accommodation)/room/(booking)/BookingDate' as const,
          params: params || {},
        }),
        billing: (params?: {
          bookingData?: string;
          paymentData?: string;
        }) => ({
          pathname:
            '/(tabs)/(home)/(accommodation)/room/(booking)/Billing' as const,
          params: params || {},
        }),
        summary: (params?: {
          bookingData?: string;
          paymentData?: string;
        }) => ({
          pathname:
            '/(tabs)/(home)/(accommodation)/room/(booking)/Summary' as const,
          params: params || {},
        }),
      },
      // Payment result deep link handlers (for PayMongo redirects)
      paymentSuccess: (params?: {
        bookingId?: string;
        paymentSuccess?: string;
      }) => ({
        pathname:
          '/(tabs)/(home)/(accommodation)/room/booking-success' as const,
        params: params || {},
      }),
      paymentCancel: (params?: {
        bookingId?: string;
        reason?: string;
      }) => ({
        pathname:
          '/(tabs)/(home)/(accommodation)/room/booking-cancel' as const,
        params: params || {},
      }),
      // Aliases for booking-specific naming (same screens)
      bookingSuccess: (params?: {
        bookingId?: string;
        paymentSuccess?: string;
      }) => ({
        pathname:
          '/(tabs)/(home)/(accommodation)/room/booking-success' as const,
        params: params || {},
      }),
      bookingCancel: (params?: {
        bookingId?: string;
        reason?: string;
      }) => ({
        pathname:
          '/(tabs)/(home)/(accommodation)/room/booking-cancel' as const,
        params: params || {},
      }),
    },
  },

  // ============================================================================
  // Shop Domain - E-commerce/product features
  // ============================================================================
  shop: {
    index: '/(tabs)/(home)/(shop)',
    categories: '/(tabs)/(home)/(shop)/categories',
    cart: '/(checkout)/cart',
    productDetails: '/(tabs)/(home)/(shop)/product-details',
  },

  // ============================================================================
  // Tourist Spot Domain - Attractions/destinations
  // ============================================================================
  spot: {
    index: '/(tabs)/(home)/(spot)',
    profile: (id: string) => ({
      pathname: '/(tabs)/(home)/(spot)/[id]' as const,
      params: { id },
    }),
  },

  // ============================================================================
  // Event Domain - Activities/events features
  // ============================================================================
  event: {
    index: '/(tabs)/(home)/(event)',
    detail: (id: string) => ({
      pathname: '/(tabs)/(home)/(event)/[id]' as const,
      params: { id },
    }),
  },

  // ============================================================================
  // Profile Domain - User account/settings
  // ============================================================================
  profile: {
    index: '/(tabs)/(profile)',
    account: '/(tabs)/(profile)/(account)',
    security: '/(tabs)/(profile)/(security)',
    notifications: '/(tabs)/(profile)/(notifications)',
    transactions: '/(tabs)/(profile)/(transactions)',
    settings: '/(tabs)/(profile)/(settings)',
    rateApp: '/(tabs)/(profile)/(rate-app)',
    bookings: {
      index: '/(tabs)/(profile)/(bookings)',
      detail: (id: string) => ({
        pathname: '/(tabs)/(profile)/(bookings)/[id]' as const,
        params: { id },
      }),
    },
    orders: {
      index: '/(tabs)/(profile)/orders',
      detail: (orderId: string) => ({
        pathname: '/(tabs)/(profile)/orders/[orderId]' as const,
        params: { orderId },
      }),
    },
    reports: {
      index: '/(tabs)/(profile)/(reports)',
      submit: '/(tabs)/(profile)/(reports)/submit',
      myReports: '/(tabs)/(profile)/(reports)/my-reports',
    },
    terms: '/(tabs)/(profile)/(terms-and-conditions)',
    privacy: '/(tabs)/(profile)/(privacy-policy)',
  },

  // ============================================================================
  // Checkout Domain - Payment/order flow (separate from tabs)
  // ============================================================================
  checkout: {
    index: '/(checkout)/checkout',
    cart: '/(checkout)/cart',
    paymentProcessing: (params: {
      orderId: string;
      orderNumber?: string;
      arrivalCode?: string;
      paymentIntentId?: string;
      total?: string;
      checkoutUrl?: string;
      businessId?: string;
    }) => ({
      pathname: '/(checkout)/payment-processing' as const,
      params,
    }),
    paymentSuccess: (params?: { orderId?: string }) => ({
      pathname: '/(checkout)/payment-success' as const,
      params: params || {},
    }),
    paymentCancel: (params?: {
      orderId?: string;
      orderNumber?: string;
      reason?: string;
    }) => ({
      pathname: '/(checkout)/payment-cancel' as const,
      params: params || {},
    }),
    paymentFailed: (params?: {
      orderId?: string;
      orderNumber?: string;
      errorMessage?: string;
      error?: string;
    }) => ({
      pathname: '/(checkout)/payment-failed' as const,
      params: params || {},
    }),
    orderConfirmation: (params: {
      orderId: string;
      orderNumber?: string;
      arrivalCode?: string;
      total?: string;
      paymentMethod?: string;
      paymentSuccess?: string;
      paymentPending?: string;
      paymentCancelled?: string;
      businessId?: string;
    }) => ({
      pathname: '/(checkout)/order-confirmation' as const,
      params,
    }),
    orderGracePeriod: (params: {
      orderData: string;
      paymentMethodType: string;
      billingInfo: string;
      total: string;
    }) => ({
      pathname: '/(checkout)/order-grace-period' as const,
      params,
    }),
    cardPayment: (params: {
      orderId: string;
      orderNumber?: string;
      arrivalCode?: string;
      paymentIntentId?: string;
      clientKey?: string;
      amount?: string;
      total?: string;
      checkoutUrl?: string;
    }) => ({
      pathname: '/(checkout)/card-payment' as const,
      params,
    }),
  },

  // ============================================================================
  // Payment Deep Links - Root-level redirects for external payment providers
  // ============================================================================
  payment: {
    success: '/payment-success',
    cancel: '/payment-cancel',
  },

  // ============================================================================
  // Modal Domain - Cross-tab shared views with modal presentation
  // ============================================================================
  modals: {
    businessProfile: (id: string) => ({
      pathname: '/(modals)/business-profile/[id]' as const,
      params: { id },
    }),
    userProfile: (id: string) => ({
      pathname: '/(modals)/user-profile/[id]' as const,
      params: { id },
    }),
    productDetails: (id: string) => ({
      pathname: '/(modals)/product-details/[id]' as const,
      params: { id },
    }),
  },
} as const;

// ============================================================================
// Type Exports for Type Safety
// ============================================================================

/** Type for the Routes object */
export type AppRoutes = typeof Routes;

/** Extract route path type from Routes */
export type RoutePath = string;

/** Type for dynamic route params */
export type RouteParams = Record<string, string | undefined>;

/** Type for route with params */
export interface RouteWithParams {
  pathname: string;
  params?: RouteParams;
}

// ============================================================================
// Navigation Helper Functions
// ============================================================================

/**
 * @deprecated Use `usePreventDoubleNavigation` hook instead for safe navigation.
 * These helpers are kept for backward compatibility only.
 *
 * Migration guide:
 * ```tsx
 * // Before (legacy)
 * navigateToHome();
 *
 * // After (recommended)
 * const { replace } = usePreventDoubleNavigation();
 * replace(Routes.tabs.home);
 * ```
 */

/** @deprecated Use `usePreventDoubleNavigation().replace(Routes.root)` */
export const navigateToRoot = () => {
  console.warn(
    '[Navigation] navigateToRoot is deprecated. Use usePreventDoubleNavigation hook.'
  );
  router.replace(Routes.root);
};

/** @deprecated Use `usePreventDoubleNavigation().replace(Routes.auth.login)` */
export const navigateToLogin = () => {
  console.warn(
    '[Navigation] navigateToLogin is deprecated. Use usePreventDoubleNavigation hook.'
  );
  router.replace(Routes.auth.login);
};

/** @deprecated Use `usePreventDoubleNavigation().replace(Routes.auth.register)` */
export const navigateToRegister = () => {
  console.warn(
    '[Navigation] navigateToRegister is deprecated. Use usePreventDoubleNavigation hook.'
  );
  router.replace(Routes.auth.register);
};

/** @deprecated Use `usePreventDoubleNavigation().navigate(Routes.auth.forgotPassword)` */
export const navigateToForgotPassword = () => {
  console.warn(
    '[Navigation] navigateToForgotPassword is deprecated. Use usePreventDoubleNavigation hook.'
  );
  router.navigate(Routes.auth.forgotPassword);
};

/** @deprecated Use `usePreventDoubleNavigation().replace(Routes.tabs.home)` */
export const navigateToHome = () => {
  console.warn(
    '[Navigation] navigateToHome is deprecated. Use usePreventDoubleNavigation hook.'
  );
  router.replace(Routes.tabs.home);
};

/** @deprecated Use `usePreventDoubleNavigation().replace(Routes.tabs.maps)` */
export const navigateToMap = () => {
  console.warn(
    '[Navigation] navigateToMap is deprecated. Use usePreventDoubleNavigation hook.'
  );
  router.replace(Routes.tabs.maps);
};

/** @deprecated Use `usePreventDoubleNavigation().replace(Routes.tabs.profile)` */
export const navigateToProfile = () => {
  console.warn(
    '[Navigation] navigateToProfile is deprecated. Use usePreventDoubleNavigation hook.'
  );
  router.replace(Routes.tabs.profile);
};

/** @deprecated Use `usePreventDoubleNavigation().replace(Routes.tabs.favorites)` */
export const navigateToFavorites = () => {
  console.warn(
    '[Navigation] navigateToFavorites is deprecated. Use usePreventDoubleNavigation hook.'
  );
  router.replace(Routes.tabs.favorites);
};

// ============================================================================
// Route Utility Functions
// ============================================================================

/**
 * Check if a route path matches a given pattern.
 * Useful for conditional rendering based on current route.
 *
 * @param currentPath - The current route path
 * @param pattern - The pattern to match against (can include wildcards)
 * @returns boolean indicating if the path matches
 *
 * @example
 * ```tsx
 * const isCheckoutFlow = matchRoute(pathname, '/(checkout)/*');
 * const isShopSection = matchRoute(pathname, '/(tabs)/(home)/(shop)/*');
 * ```
 */
export function matchRoute(currentPath: string, pattern: string): boolean {
  const regex = new RegExp(
    '^' + pattern.replace(/\*/g, '.*').replace(/\[.*?\]/g, '[^/]+') + '$'
  );
  return regex.test(currentPath);
}

/**
 * Get the feature domain from a route path.
 * Useful for analytics and feature-based logic.
 *
 * @param pathname - The route pathname
 * @returns The feature domain name
 *
 * @example
 * ```tsx
 * const domain = getRouteDomain('/(tabs)/(home)/(shop)/cart');
 * // Returns: 'shop'
 * ```
 */
export function getRouteDomain(
  pathname: string
): 'auth' | 'shop' | 'accommodation' | 'spot' | 'event' | 'profile' | 'checkout' | 'modal' | 'unknown' {
  if (pathname.includes('/(auth)')) return 'auth';
  if (pathname.includes('/(checkout)')) return 'checkout';
  if (pathname.includes('/(shop)')) return 'shop';
  if (pathname.includes('/(accommodation)')) return 'accommodation';
  if (pathname.includes('/(spot)')) return 'spot';
  if (pathname.includes('/(event)')) return 'event';
  if (pathname.includes('/(profile)')) return 'profile';
  if (pathname.includes('/(modals)')) return 'modal';
  return 'unknown';
}