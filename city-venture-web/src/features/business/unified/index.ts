/**
 * Unified Business CMS Module
 * 
 * This module provides a capability-based business management system
 * that dynamically renders features based on business type and capabilities.
 * 
 * Usage:
 * - Import components from 'features/business/unified'
 * - Use UnifiedSidebar for navigation
 * - Use unified pages for capability-based routing
 * 
 * @example
 * import { UnifiedSidebar, Dashboard, useBusinessCapabilities } from '@/src/features/business/unified';
 */

// Components
export { UnifiedSidebar } from './components';

// Hooks
export {
  useBusinessCapabilities,
  useHasCapability,
  useHasAllCapabilities,
  useHasAnyCapability,
} from './hooks';

// Config
export { navigationConfig, getFilteredNavigation } from './config';

// Types
export type {
  BusinessCapabilities,
  NavItemConfig,
  RouteConfig,
  BusinessType,
} from './types';

export { getBusinessType, hasRequiredCapabilities } from './types';

// Pages
export {
  Dashboard,
  ShopDashboard,
  BusinessProfile,
  Reviews,
  Promotions,
  Subscription,
  ManageStaff,
  Settings,
  StaffRoles,
} from './pages';
