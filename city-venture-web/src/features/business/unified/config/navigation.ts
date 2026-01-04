/**
 * Unified Navigation Configuration
 * Capability-based sidebar navigation items
 */

import {
  LayoutDashboard,
  Store,
  Receipt,
  CalendarCheck,
  BedDouble,
  Megaphone,
  Star,
  CreditCard,
  Settings,
  Users,
  ShoppingBag,
  Package,
  Tag,
  ShoppingCart,
  Percent,
  Settings as SettingsIcon,
} from 'lucide-react';
import type { NavItemConfig } from '../types';

/**
 * Main navigation items for the unified business sidebar
 *
 * CONDITIONAL FEATURES (capability-based):
 * - Transactions, Bookings, Rooms: Accommodation only (canBook)
 * - Store section: Shop only (canSell)
 *
 * SHARED FEATURES (all business types):
 * - Dashboard, Business Profile, Promotions, Reviews, Subscription, Staff, Settings
 * 
 * PERMISSION-BASED ACCESS:
 * - Navigation items use requiredPermissions for fine-grained RBAC
 * - Custom roles with proper permissions will see the correct nav items
 */
export const navigationConfig: NavItemConfig[] = [
  // ============================================
  // SHARED FEATURES - All business types
  // ============================================

  // Dashboard - visible to users with view_analytics or view_reports permission
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/business/dashboard',
    icon: LayoutDashboard,
    requiredPermissions: ['view_analytics', 'view_reports', 'view_financial_reports'],
  },

  // ============================================
  // ACCOMMODATION ONLY - Requires canBook
  // ============================================

  // Transactions - Accommodation only
  {
    id: 'transactions',
    label: 'Transactions',
    path: '/business/transactions',
    icon: Receipt,
    requiredCapabilities: ['canBook'],
    requiredPermissions: ['view_bookings', 'view_payments'],
  },

  // Bookings - Accommodation only
  {
    id: 'bookings',
    label: 'Bookings',
    path: '/business/bookings',
    icon: CalendarCheck,
    requiredCapabilities: ['canBook'],
    requiredPermissions: ['view_bookings', 'create_bookings', 'update_bookings'],
  },

  // ============================================
  // SHARED FEATURES - All business types
  // ============================================

  // Business Profile - All businesses
  {
    id: 'business-profile',
    label: 'Business Profile',
    path: '/business/business-profile',
    icon: Store,
    requiredPermissions: ['view_business_profile', 'manage_business_profile'],
  },

  // Manage Promotions - All businesses (no capability requirement)
  {
    id: 'promotions',
    label: 'Manage Promotions',
    path: '/business/promotions',
    icon: Megaphone,
    requiredPermissions: ['manage_promotions', 'view_products'],
  },

  // ============================================
  // ACCOMMODATION ONLY - Requires canBook
  // ============================================

  // Manage Rooms - Accommodation only
  {
    id: 'rooms',
    label: 'Manage Rooms',
    path: '/business/rooms',
    icon: BedDouble,
    requiredCapabilities: ['canBook'],
    requiredPermissions: ['manage_rooms', 'view_bookings'],
  },

  // ============================================
  // SHOP ONLY - Requires canSell
  // ============================================

  // Store Section - Shop only (expandable)
  {
    id: 'store',
    label: 'Store',
    path: '/business/store',
    icon: ShoppingBag,
    requiredCapabilities: ['canSell'],
    requiredPermissions: ['view_products', 'view_orders'],
    isSection: true,
    children: [
      {
        id: 'store-products',
        label: 'Products',
        path: '/business/store/products',
        icon: Package,
      },
      {
        id: 'store-categories',
        label: 'Categories',
        path: '/business/store/categories',
        icon: Tag,
      },
      {
        id: 'store-services',
        label: 'Services',
        path: '/business/store/services',
        icon: SettingsIcon,
      },
      {
        id: 'store-orders',
        label: 'Orders',
        path: '/business/store/orders',
        icon: ShoppingCart,
      },
      {
        id: 'store-discount',
        label: 'Discount',
        path: '/business/store/discount',
        icon: Percent,
      },
      {
        id: 'store-settings',
        label: 'Settings',
        path: '/business/store/settings',
        icon: SettingsIcon,
      },
    ],
  },

  // ============================================
  // SHARED FEATURES - All business types
  // ============================================

  // Reviews - All businesses (no capability requirement)
  {
    id: 'reviews',
    label: 'Reviews & Ratings',
    path: '/business/reviews',
    icon: Star,
    requiredPermissions: ['manage_customer_reviews', 'view_customers'],
  },

  // Subscription - All businesses (no capability requirement)
  {
    id: 'subscription',
    label: 'Subscription',
    path: '/business/subscription',
    icon: CreditCard,
    requiredPermissions: ['manage_business_settings', 'view_payments'],
  },

  // ============================================
  // STAFF MANAGEMENT SECTION - All businesses
  // ============================================

  // Staffs Section - All businesses (expandable)
  {
    id: 'staffs',
    label: 'Staffs',
    path: '/business/manage-staff',
    icon: Users,
    requiredPermissions: ['view_staff', 'create_staff', 'manage_staff_roles'],
    isSection: true,
    children: [
      {
        id: 'manage-staff',
        label: 'Manage Staff',
        path: '/business/manage-staff',
        icon: Users,
      },
      {
        id: 'staff-roles',
        label: 'Manage Roles',
        path: '/business/staff-roles',
        icon: Users,
      },
    ],
  },

  // Settings - All businesses
  {
    id: 'settings',
    label: 'Settings',
    path: '/business/settings',
    icon: Settings,
    requiredPermissions: ['manage_business_settings'],
  },
];

/**
 * Get filtered navigation items based on capabilities and permissions
 * 
 * RBAC Flow:
 * 1. Check capability requirements (business type features)
 * 2. Check permission requirements (user has at least one required permission)
 * 3. Fallback to role check for legacy support
 */
export function getFilteredNavigation(
  capabilities: import('../types').BusinessCapabilities,
  _userRoles: string[],
  hasRole: (...roles: string[]) => boolean,
  canAny?: (...permissions: string[]) => boolean
): NavItemConfig[] {
  return navigationConfig.filter(item => {
    // Check capability requirements (business type features)
    if (item.requiredCapabilities) {
      const hasCapabilities = item.requiredCapabilities.every(cap => capabilities[cap]);
      if (!hasCapabilities) return false;
    }

    // Check permission requirements (user must have at least one)
    if (item.requiredPermissions && item.requiredPermissions.length > 0) {
      // Use canAny to check if user has any of the required permissions
      if (canAny) {
        const hasPermission = canAny(...item.requiredPermissions);
        if (!hasPermission) return false;
      }
    }

    // Legacy: Check role requirements (fallback for items without requiredPermissions)
    if (item.requiredRoles && !item.requiredPermissions) {
      const hasRequiredRole = hasRole(...item.requiredRoles);
      if (!hasRequiredRole) return false;
    }

    return true;
  });
}
