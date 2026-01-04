/**
 * Unified Navigation Configuration
 * Capability-based sidebar navigation items
 * 
 * Uses permission constants from @/src/constants/permissions.ts
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
import * as P from '@/src/constants/permissions';

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

  // Dashboard - visible to users with dashboard/reporting permissions
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/business/dashboard',
    icon: LayoutDashboard,
    requiredPermissions: [P.VIEW_DASHBOARD, P.VIEW_REPORTS, P.VIEW_ANALYTICS],
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
    requiredPermissions: [P.VIEW_TRANSACTIONS, P.VIEW_PAYMENTS],
  },

  // Bookings - Accommodation only
  {
    id: 'bookings',
    label: 'Bookings',
    path: '/business/bookings',
    icon: CalendarCheck,
    requiredCapabilities: ['canBook'],
    requiredPermissions: [P.VIEW_BOOKINGS, P.MANAGE_BOOKINGS],
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
    requiredPermissions: [P.VIEW_BUSINESS_PROFILE, P.MANAGE_BUSINESS_PROFILE],
  },

  // Manage Promotions - All businesses (no capability requirement)
  {
    id: 'promotions',
    label: 'Manage Promotions',
    path: '/business/promotions',
    icon: Megaphone,
    requiredPermissions: [P.VIEW_PROMOTIONS, P.MANAGE_PROMOTIONS],
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
    requiredPermissions: [P.MANAGE_ROOMS, P.VIEW_BOOKINGS],
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
    requiredPermissions: [P.VIEW_SHOP, P.VIEW_ORDERS],
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
    requiredPermissions: [P.VIEW_REVIEWS, P.MANAGE_REVIEWS],
  },

  // Subscription - All businesses (no capability requirement)
  {
    id: 'subscription',
    label: 'Subscription',
    path: '/business/subscription',
    icon: CreditCard,
    requiredPermissions: [P.MANAGE_SUBSCRIPTIONS, P.VIEW_PAYMENTS],
  },

  // ============================================
  // STAFF MANAGEMENT - All businesses
  // ============================================

  // Manage Staff - Direct link (no dropdown)
  {
    id: 'manage-staff',
    label: 'Manage Staff',
    path: '/business/manage-staff',
    icon: Users,
    requiredPermissions: [P.VIEW_STAFF, P.ADD_STAFF, P.MANAGE_STAFF_ROLES],
  },

  // Settings - All businesses
  {
    id: 'settings',
    label: 'Settings',
    path: '/business/settings',
    icon: Settings,
    requiredPermissions: [P.MANAGE_BUSINESS_SETTINGS],
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
