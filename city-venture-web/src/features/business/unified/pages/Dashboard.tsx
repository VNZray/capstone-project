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
 * 
 * Business capability combinations:
 * - hasBooking: true, hasStore: false  → Accommodation Dashboard
 * - hasBooking: false, hasStore: true  → Shop Dashboard
 * - hasBooking: true, hasStore: true   → Hybrid (shows Accommodation for now)
 * - hasBooking: false, hasStore: false → Fallback
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

  // Hybrid business - has both booking and store capabilities
  // For now, prioritize Accommodation dashboard (can add tabbed view later)
  if (capabilities.canBook && capabilities.canSell) {
    return <AccommodationDashboard />;
  }

  // Accommodation-only dashboard
  if (capabilities.canBook) {
    return <AccommodationDashboard />;
  }
  
  // Shop-only dashboard
  if (capabilities.canSell) {
    return <ShopDashboard />;
  }

  // Fallback - business with neither capability
  return (
    <PageContainer>
      <NoDataFound
        icon="database"
        title="Dashboard Not Available"
        message="Your business type is not yet supported. Please contact support."
      />
    </PageContainer>
  );
};

export default Dashboard;
