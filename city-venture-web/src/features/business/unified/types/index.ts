/**
 * Unified Business CMS Types
 * Capability-based system for dynamic feature rendering
 */

import type { LucideIcon } from 'lucide-react';

/**
 * Business capabilities - determines which features are available
 * Derived from business type, subscription, and enabled features
 */
export interface BusinessCapabilities {
  /** Has products/services for sale (Shop functionality) */
  canSell: boolean;
  /** Has booking functionality (Accommodation functionality) */
  canBook: boolean;
  /** Can create and manage promotions */
  canPromote: boolean;
  /** Has analytics/dashboard access */
  canViewAnalytics: boolean;
  /** Can manage staff */
  canManageStaff: boolean;
  /** Can manage reviews */
  canManageReviews: boolean;
  /** Has subscription management */
  hasSubscription: boolean;
  /** Has transaction management */
  canViewTransactions: boolean;
}

/**
 * Navigation item for the sidebar
 */
export interface NavItemConfig {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
  /** Required capabilities to show this nav item */
  requiredCapabilities?: (keyof BusinessCapabilities)[];
  /** Required roles to show this nav item (legacy - prefer requiredPermissions) */
  requiredRoles?: string[];
  /** Required permissions to show this nav item (at least one must match) */
  requiredPermissions?: string[];
  /** Child navigation items (for expandable sections) */
  children?: NavItemConfig[];
  /** Whether this is a section header (expandable) */
  isSection?: boolean;
}

/**
 * Route configuration for protected routes
 */
export interface RouteConfig {
  path: string;
  /** Required capabilities to access this route */
  requiredCapabilities?: (keyof BusinessCapabilities)[];
  /** Required roles to access this route */
  requiredRoles?: string[];
}

/**
 * Business type enum for clarity
 */
export type BusinessType = 'accommodation' | 'shop' | 'hybrid';

/**
 * Derive business type from capabilities
 */
export function getBusinessType(capabilities: BusinessCapabilities): BusinessType {
  const hasBooking = capabilities.canBook;
  const hasSelling = capabilities.canSell;
  
  if (hasBooking && hasSelling) return 'hybrid';
  if (hasBooking) return 'accommodation';
  return 'shop';
}

/**
 * Check if user has required capabilities
 */
export function hasRequiredCapabilities(
  capabilities: BusinessCapabilities,
  required?: (keyof BusinessCapabilities)[]
): boolean {
  if (!required || required.length === 0) return true;
  return required.every(cap => capabilities[cap]);
}
