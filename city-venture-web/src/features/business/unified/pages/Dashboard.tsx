/**
 * Unified Dashboard Page
 * Dynamically renders the appropriate dashboard based on business capabilities
 */

import React from 'react';
import { useBusiness } from '@/src/context/BusinessContext';
import { useBusinessCapabilities } from '../hooks/useBusinessCapabilities';
import PageContainer from '@/src/components/PageContainer';
import Loading from '@/src/components/ui/Loading';
import NoDataFound from '@/src/components/NoDataFound';

// Import the actual dashboard implementations
import AccommodationDashboard from '../../has-booking/dashboard/Dashboard';
import ShopDashboard from './ShopDashboard';

/**
 * Unified Dashboard - Routes to the correct dashboard based on business type
 */
const Dashboard: React.FC = () => {
  const { businessDetails, loading } = useBusiness();
  const capabilities = useBusinessCapabilities();

  if (loading) {
    return (
      <PageContainer>
        <Loading showProgress title="Loading Dashboard..." variant="default" />
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

  // Route to appropriate dashboard based on capabilities
  if (capabilities.canBook) {
    // Accommodation dashboard
    return <AccommodationDashboard />;
  }
  
  if (capabilities.canSell) {
    // Shop dashboard
    return <ShopDashboard />;
  }

  // Fallback - shouldn't happen but handle gracefully
  return (
    <PageContainer>
      <NoDataFound
        icon="database"
        title="Dashboard Not Available"
        message="Your business type is not yet supported."
      />
    </PageContainer>
  );
};

export default Dashboard;
