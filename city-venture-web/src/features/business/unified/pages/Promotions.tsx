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

  // Route to appropriate promotions page based on capabilities
  if (capabilities.canBook) {
    return <AccommodationPromotions />;
  }
  
  if (capabilities.canSell) {
    return <ShopPromotions />;
  }

  // Fallback
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
