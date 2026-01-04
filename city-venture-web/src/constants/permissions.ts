/**
 * Permission Constants
 * 
 * Single source of truth for permission names used across the frontend.
 * These must match the permissions seeded in the backend.
 * 
 * @see backend/seeds/01_permissions.cjs
 */

// ============================================================
// DASHBOARD & REPORTING
// ============================================================
export const VIEW_DASHBOARD = 'view_dashboard';
export const VIEW_REPORTS = 'view_reports';
export const VIEW_ANALYTICS = 'view_analytics';

// ============================================================
// BUSINESS PROFILE
// ============================================================
export const VIEW_BUSINESS_PROFILE = 'view_business_profile';
export const MANAGE_BUSINESS_PROFILE = 'manage_business_profile';
export const MANAGE_BUSINESS_SETTINGS = 'manage_business_settings';

// ============================================================
// BOOKING & ACCOMMODATION
// ============================================================
export const VIEW_BOOKINGS = 'view_bookings';
export const MANAGE_BOOKINGS = 'manage_bookings';
export const MANAGE_ROOMS = 'manage_rooms';

// ============================================================
// SHOP & PRODUCTS
// ============================================================
export const VIEW_SHOP = 'view_shop';
export const MANAGE_SHOP = 'manage_shop';
export const MANAGE_DISCOUNTS = 'manage_discounts';

// ============================================================
// ORDERS
// ============================================================
export const VIEW_ORDERS = 'view_orders';
export const MANAGE_ORDERS = 'manage_orders';

// ============================================================
// TRANSACTIONS & PAYMENTS
// ============================================================
export const VIEW_TRANSACTIONS = 'view_transactions';
export const VIEW_PAYMENTS = 'view_payments';
export const MANAGE_PAYMENTS = 'manage_payments';
export const MANAGE_REFUNDS = 'manage_refunds';

// ============================================================
// PROMOTIONS
// ============================================================
export const VIEW_PROMOTIONS = 'view_promotions';
export const MANAGE_PROMOTIONS = 'manage_promotions';

// ============================================================
// REVIEWS
// ============================================================
export const VIEW_REVIEWS = 'view_reviews';
export const MANAGE_REVIEWS = 'manage_reviews';

// ============================================================
// STAFF MANAGEMENT
// ============================================================
export const VIEW_STAFF = 'view_staff';
export const ADD_STAFF = 'add_staff';
export const MANAGE_STAFF_ROLES = 'manage_staff_roles';

// ============================================================
// SERVICES & INQUIRIES
// ============================================================
export const VIEW_SERVICES = 'view_services';
export const MANAGE_SERVICES = 'manage_services';
export const MANAGE_SERVICE_INQUIRIES = 'manage_service_inquiries';

// ============================================================
// NOTIFICATIONS
// ============================================================
export const SEND_NOTIFICATIONS = 'send_notifications';

// ============================================================
// EVENTS
// ============================================================
export const VIEW_EVENTS = 'view_events';
export const MANAGE_EVENTS = 'manage_events';

// ============================================================
// SYSTEM ADMINISTRATION
// ============================================================
export const MANAGE_USERS = 'manage_users';
export const VIEW_ALL_PROFILES = 'view_all_profiles';
export const APPROVE_BUSINESS = 'approve_business';
export const APPROVE_EVENT = 'approve_event';
export const APPROVE_SHOP = 'approve_shop';

// ============================================================
// TOURIST SPOTS
// ============================================================
export const VIEW_TOURIST_SPOTS = 'view_tourist_spots';
export const MANAGE_TOURIST_SPOTS = 'manage_tourist_spots';
export const APPROVE_TOURIST_SPOT = 'approve_tourist_spot';

// ============================================================
// TOURISM STAFF
// ============================================================
export const MANAGE_TOURISM_STAFF = 'manage_tourism_staff';

// ============================================================
// SUBSCRIPTION
// ============================================================
export const MANAGE_SUBSCRIPTIONS = 'manage_subscriptions';

// ============================================================
// PERMISSION GROUPS (for UI organization)
// ============================================================

/**
 * Permissions for dashboard access
 */
export const DASHBOARD_PERMISSIONS = [
  VIEW_DASHBOARD,
  VIEW_REPORTS,
  VIEW_ANALYTICS,
] as const;

/**
 * Permissions for business profile management
 */
export const BUSINESS_PROFILE_PERMISSIONS = [
  VIEW_BUSINESS_PROFILE,
  MANAGE_BUSINESS_PROFILE,
  MANAGE_BUSINESS_SETTINGS,
] as const;

/**
 * Permissions for accommodation/booking management
 */
export const BOOKING_PERMISSIONS = [
  VIEW_BOOKINGS,
  MANAGE_BOOKINGS,
  MANAGE_ROOMS,
] as const;

/**
 * Permissions for shop/product management
 */
export const SHOP_PERMISSIONS = [
  VIEW_SHOP,
  MANAGE_SHOP,
  VIEW_ORDERS,
  MANAGE_ORDERS,
  MANAGE_DISCOUNTS,
] as const;

/**
 * Permissions for financial operations
 */
export const FINANCIAL_PERMISSIONS = [
  VIEW_TRANSACTIONS,
  VIEW_PAYMENTS,
  MANAGE_PAYMENTS,
  MANAGE_REFUNDS,
] as const;

/**
 * Permissions for staff management
 */
export const STAFF_PERMISSIONS = [
  VIEW_STAFF,
  ADD_STAFF,
  MANAGE_STAFF_ROLES,
] as const;

/**
 * All business-scope permissions
 */
export const ALL_BUSINESS_PERMISSIONS = [
  ...DASHBOARD_PERMISSIONS,
  ...BUSINESS_PROFILE_PERMISSIONS,
  ...BOOKING_PERMISSIONS,
  ...SHOP_PERMISSIONS,
  ...FINANCIAL_PERMISSIONS,
  VIEW_PROMOTIONS,
  MANAGE_PROMOTIONS,
  VIEW_REVIEWS,
  MANAGE_REVIEWS,
  ...STAFF_PERMISSIONS,
  VIEW_SERVICES,
  MANAGE_SERVICE_INQUIRIES,
  SEND_NOTIFICATIONS,
  VIEW_EVENTS,
  MANAGE_EVENTS,
  MANAGE_SUBSCRIPTIONS,
] as const;

/**
 * System-level permissions (Admin/Tourism Officer)
 */
export const SYSTEM_PERMISSIONS = [
  MANAGE_USERS,
  VIEW_ALL_PROFILES,
  APPROVE_BUSINESS,
  APPROVE_EVENT,
  APPROVE_SHOP,
  VIEW_TOURIST_SPOTS,
  MANAGE_TOURIST_SPOTS,
  APPROVE_TOURIST_SPOT,
  MANAGE_TOURISM_STAFF,
  MANAGE_SERVICES,
] as const;

// ============================================================
// TYPE DEFINITIONS
// ============================================================

export type Permission = 
  | typeof VIEW_DASHBOARD
  | typeof VIEW_REPORTS
  | typeof VIEW_ANALYTICS
  | typeof VIEW_BUSINESS_PROFILE
  | typeof MANAGE_BUSINESS_PROFILE
  | typeof MANAGE_BUSINESS_SETTINGS
  | typeof VIEW_BOOKINGS
  | typeof MANAGE_BOOKINGS
  | typeof MANAGE_ROOMS
  | typeof VIEW_SHOP
  | typeof MANAGE_SHOP
  | typeof MANAGE_DISCOUNTS
  | typeof VIEW_ORDERS
  | typeof MANAGE_ORDERS
  | typeof VIEW_TRANSACTIONS
  | typeof VIEW_PAYMENTS
  | typeof MANAGE_PAYMENTS
  | typeof MANAGE_REFUNDS
  | typeof VIEW_PROMOTIONS
  | typeof MANAGE_PROMOTIONS
  | typeof VIEW_REVIEWS
  | typeof MANAGE_REVIEWS
  | typeof VIEW_STAFF
  | typeof ADD_STAFF
  | typeof MANAGE_STAFF_ROLES
  | typeof VIEW_SERVICES
  | typeof MANAGE_SERVICES
  | typeof MANAGE_SERVICE_INQUIRIES
  | typeof SEND_NOTIFICATIONS
  | typeof VIEW_EVENTS
  | typeof MANAGE_EVENTS
  | typeof MANAGE_USERS
  | typeof VIEW_ALL_PROFILES
  | typeof APPROVE_BUSINESS
  | typeof APPROVE_EVENT
  | typeof APPROVE_SHOP
  | typeof VIEW_TOURIST_SPOTS
  | typeof MANAGE_TOURIST_SPOTS
  | typeof APPROVE_TOURIST_SPOT
  | typeof MANAGE_TOURISM_STAFF
  | typeof MANAGE_SUBSCRIPTIONS;
