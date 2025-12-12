/**
 * Unified Promotions Page
 * Dynamically renders the appropriate promotions management based on business capabilities
 */

import React from 'react';
import { useBusiness } from '@/src/context/BusinessContext';
import { useBusinessCapabilities } from '../hooks/useBusinessCapabilities';
import PageContainer from '@/src/components/PageContainer';
import Loading from '@/src/components/ui/Loading';
import NoDataFound from '@/src/components/NoDataFound';

// Import the actual promotion implementations
import AccommodationPromotions from '../../has-booking/promotion/ManagePromotion';
import ShopPromotions from '../../has-store/promotion/ManagePromotion';

/**
 * Unified Promotions - Routes to the correct promotion management based on business type
 * 
 * Business capability combinations:
 * - hasBooking: true, hasStore: false  → Accommodation Promotions
 * - hasBooking: false, hasStore: true  → Shop Promotions
 * - hasBooking: true, hasStore: true   → Hybrid (shows both or primary)
 * - hasBooking: false, hasStore: false → Fallback
 */
const Promotions: React.FC = () => {
  const { businessDetails, loading } = useBusiness();
  const capabilities = useBusinessCapabilities();

  if (loading) {
    return (
      <PageContainer>
        <Loading showProgress title="Loading Promotions..." variant="default" />
      </PageContainer>
    );
  }

  if (!businessDetails) {
    return (
      <PageContainer>
        <NoDataFound
          icon="database"
          title="No Business Found"
          message="Please set up your business profile first."
        />
      </PageContainer>
    );
  }

  // Hybrid business - has both booking and store capabilities
  // For now, prioritize Accommodation promotions (can add tabbed view later)
  if (capabilities.canBook && capabilities.canSell) {
    return <AccommodationPromotions />;
  }

  // Accommodation-only promotions
  if (capabilities.canBook) {
    return <AccommodationPromotions />;
  }
  
  // Shop-only promotions
  if (capabilities.canSell) {
    return <ShopPromotions />;
  }

  // Fallback - business with neither capability
  return (
    <PageContainer>
      <NoDataFound
        icon="inbox"
        title="Promotions Not Available"
        message="Your business type does not support promotions."
      />
    </PageContainer>
  );
};

export default Promotions;
