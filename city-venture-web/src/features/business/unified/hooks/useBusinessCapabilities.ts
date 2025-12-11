/**
 * Hook to derive business capabilities from business details
 */

import { useMemo } from 'react';
import { useBusiness } from '@/src/context/BusinessContext';
import type { BusinessCapabilities } from '../types';

/**
 * Normalize a boolean-like value from backend
 * Handles boolean, string "true"/"false", number 1/0
 */
function normalizeBooleanValue(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    return value === '1' || value.toLowerCase() === 'true';
  }
  return false;
}

/**
 * Derives business capabilities from the current business context
 * Capabilities determine which features/navigation items are available
 * 
 * Business capability combinations:
 * - hasBooking: true, hasStore: false  → Accommodation only (canBook)
 * - hasBooking: false, hasStore: true  → Shop only (canSell)
 * - hasBooking: true, hasStore: true   → Both capabilities
 * - hasBooking: false, hasStore: false → Neither (edge case, minimal features)
 */
export function useBusinessCapabilities(): BusinessCapabilities {
  const { businessDetails } = useBusiness();
  
  return useMemo(() => {
    if (!businessDetails) {
      // Default capabilities when no business is selected
      return {
        canSell: false,
        canBook: false,
        canPromote: false,
        canViewAnalytics: true,
        canManageStaff: true,
        canManageReviews: true,
        hasSubscription: true,
        canViewTransactions: false,
      };
    }
    
    // Normalize boolean values from backend
    const hasBooking = normalizeBooleanValue(businessDetails.hasBooking);
    const hasStore = normalizeBooleanValue(businessDetails.hasStore);
    
    // Debug logging
    console.log('[useBusinessCapabilities] hasBooking:', hasBooking, 'hasStore:', hasStore);
    
    return {
      // Store capabilities (based on hasStore flag)
      canSell: hasStore,
      
      // Booking capabilities (based on hasBooking flag)
      canBook: hasBooking,
      canViewTransactions: hasBooking,
      
      // Common capabilities (all businesses)
      canPromote: true,
      canViewAnalytics: true,
      canManageStaff: true,
      canManageReviews: true,
      hasSubscription: true,
    };
  }, [businessDetails]);
}

/**
 * Check if current business has a specific capability
 */
export function useHasCapability(capability: keyof BusinessCapabilities): boolean {
  const capabilities = useBusinessCapabilities();
  return capabilities[capability];
}

/**
 * Check if current business has all specified capabilities
 */
export function useHasAllCapabilities(...requiredCapabilities: (keyof BusinessCapabilities)[]): boolean {
  const capabilities = useBusinessCapabilities();
  return requiredCapabilities.every(cap => capabilities[cap]);
}

/**
 * Check if current business has any of the specified capabilities
 */
export function useHasAnyCapability(...requiredCapabilities: (keyof BusinessCapabilities)[]): boolean {
  const capabilities = useBusinessCapabilities();
  return requiredCapabilities.some(cap => capabilities[cap]);
}

export default useBusinessCapabilities;
