/**
 * Hook to derive business capabilities from business details
 */

import { useMemo } from 'react';
import { useBusiness } from '@/src/context/BusinessContext';
import type { BusinessCapabilities } from '../types';

/**
 * Derives business capabilities from the current business context
 * Capabilities determine which features/navigation items are available
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
    
    // Derive capabilities from business details
    // hasBooking can be boolean, string "true"/"false", or number 1/0
    // Using explicit type coercion to handle all possible backend response types
    const hasBookingValue = businessDetails.hasBooking;
    
    // Normalize the value to handle different data types from backend
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawValue = hasBookingValue as any;
    const isAccommodation = rawValue === true || 
                            rawValue === 1 || 
                            rawValue === '1' || 
                            rawValue === 'true';
    const isShop = !isAccommodation;
    
    // Debug logging
    console.log('[useBusinessCapabilities] businessDetails.hasBooking:', hasBookingValue, 'isAccommodation:', isAccommodation);
    
    return {
      // Shop capabilities
      canSell: isShop,
      
      // Accommodation capabilities
      canBook: isAccommodation,
      canViewTransactions: isAccommodation,
      
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
