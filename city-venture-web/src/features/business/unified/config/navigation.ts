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
 */
export const navigationConfig: NavItemConfig[] = [
  // ============================================
  // SHARED FEATURES - All business types
  // ============================================
  
  // Dashboard - visible to all business roles
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/business/dashboard',
    icon: LayoutDashboard,
    requiredRoles: ['Business Owner', 'Manager', 'Room Manager', 'Receptionist', 'Sales Associate'],
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
    requiredRoles: ['Business Owner', 'Manager', 'Receptionist'],
  },
  
  // Bookings - Accommodation only
  {
    id: 'bookings',
    label: 'Bookings',
    path: '/business/bookings',
    icon: CalendarCheck,
    requiredCapabilities: ['canBook'],
    requiredRoles: ['Business Owner', 'Manager', 'Receptionist'],
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
    requiredRoles: ['Business Owner', 'Manager'],
  },
  
  // Manage Promotions - All businesses (no capability requirement)
  {
    id: 'promotions',
    label: 'Manage Promotions',
    path: '/business/promotions',
    icon: Megaphone,
    requiredRoles: ['Business Owner', 'Manager', 'Sales Associate'],
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
    requiredRoles: ['Business Owner', 'Manager', 'Room Manager', 'Receptionist'],
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
    requiredRoles: ['Business Owner', 'Manager', 'Sales Associate'],
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
    requiredRoles: ['Business Owner', 'Manager'],
  },
  
  // Subscription - All businesses (no capability requirement)
  {
    id: 'subscription',
    label: 'Subscription',
    path: '/business/subscription',
    icon: CreditCard,
    requiredRoles: ['Business Owner'],
  },
  
  // Manage Staff - All businesses (no capability requirement)
  {
    id: 'manage-staff',
    label: 'Manage Staff',
    path: '/business/manage-staff',
    icon: Users,
    requiredRoles: ['Business Owner'],
  },
  
  // Staff Roles - All businesses (no capability requirement)
  {
    id: 'staff-roles',
    label: 'Staff Roles',
    path: '/business/staff-roles',
    icon: Users,
    requiredRoles: ['Business Owner'],
  },
  
  // Settings - All businesses
  {
    id: 'settings',
    label: 'Settings',
    path: '/business/settings',
    icon: Settings,
    requiredRoles: ['Business Owner'],
  },
];

/**
 * Get filtered navigation items based on capabilities and roles
 */
export function getFilteredNavigation(
  capabilities: import('../types').BusinessCapabilities,
  _userRoles: string[],
  hasRole: (...roles: string[]) => boolean,
  _canAny?: (...permissions: string[]) => boolean
): NavItemConfig[] {
  return navigationConfig.filter(item => {
    // Check capability requirements
    if (item.requiredCapabilities) {
      const hasCapabilities = item.requiredCapabilities.every(cap => capabilities[cap]);
      if (!hasCapabilities) return false;
    }
    
    // Check role requirements
    if (item.requiredRoles) {
      const hasRequiredRole = hasRole(...item.requiredRoles);
      if (!hasRequiredRole) return false;
    }
    
    return true;
  });
}
