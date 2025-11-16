import { apiService } from "@/src/utils/api";
import type { BusinessRegistration } from "@/src/features/admin/dashboard/components/NewRegistrationsTable";
import type { SubscriptionPayment } from "@/src/features/admin/dashboard/components/SubscriptionPaymentsTable";

export interface TourismDashboardData {
  businesses: any[];
  registrations: BusinessRegistration[];
  payments: SubscriptionPayment[];
  tourists: any[];
  touristSpots: any[];
}

export interface BusinessStats {
  total: number;
  accommodations: number;
  shops: number;
  active: number;
  pending: number;
}

export interface TouristStats {
  total: number;
  local: number;
  domestic: number;
  foreign: number;
  overseas: number;
}

export interface FilterPeriod {
  period: "week" | "month" | "year" | "all";
  month?: number;
  year?: number;
}

// Fetch all dashboard data
export const fetchTourismDashboardData = async (): Promise<TourismDashboardData> => {
  try {
    // Fetch available data from API
    const [touristSpots] = await Promise.all([
      apiService.getTouristSpots(),
    ]);

    // Mock businesses data - TODO: Replace with actual API call when available
    const businesses: any[] = [];

    // Mock tourists data - TODO: Replace with actual API call when available
    const tourists: any[] = [];

    // Generate mock registrations from mock businesses
    const registrations: BusinessRegistration[] = businesses.slice(0, 10).map((business: any, index) => ({
      id: business.id || `business-${index}`,
      businessName: business.business_name || `Business ${index + 1}`,
      businessType: business.business_type === "accommodation" ? "accommodation" : "shop",
      ownerName: `${business.owner_first_name || ""} ${business.owner_last_name || ""}`.trim() || "Business Owner",
      email: business.email || `owner${index}@example.com`,
      registeredAt: business.created_at || new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: business.is_approved ? "approved" : Math.random() > 0.7 ? "pending" : "approved",
    }));

    // Generate mock payments
    const payments: SubscriptionPayment[] = businesses.slice(0, 8).map((business: any, index) => ({
      id: `payment-${business.id || index}`,
      businessName: business.business_name || `Business ${index + 1}`,
      amount: [499, 999, 1499][Math.floor(Math.random() * 3)],
      paymentMethod: ["Credit Card", "PayPal", "Bank Transfer"][Math.floor(Math.random() * 3)],
      status: Math.random() > 0.1 ? "completed" : Math.random() > 0.5 ? "pending" : "failed",
      paidAt: business.created_at || new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      subscriptionPlan: ["Basic", "Premium", "Enterprise"][Math.floor(Math.random() * 3)],
    }));

    return {
      businesses,
      registrations,
      payments,
      tourists,
      touristSpots,
    };
  } catch (error) {
    console.error("Failed to fetch tourism dashboard data:", error);
    // Return empty data instead of throwing
    return {
      businesses: [],
      registrations: [],
      payments: [],
      tourists: [],
      touristSpots: [],
    };
  }
};

// Calculate business statistics
export const calculateBusinessStats = (businesses: any[]): BusinessStats => {
  const stats: BusinessStats = {
    total: businesses.length,
    accommodations: 0,
    shops: 0,
    active: 0,
    pending: 0,
  };

  businesses.forEach((business) => {
    if (business.business_type === "accommodation") {
      stats.accommodations++;
    } else if (business.business_type === "shop") {
      stats.shops++;
    }

    if (business.is_approved) {
      stats.active++;
    } else {
      stats.pending++;
    }
  });

  return stats;
};

// Calculate tourist statistics
export const calculateTouristStats = (
  tourists: any[],
  filter?: FilterPeriod
): TouristStats => {
  let filteredTourists = tourists;

  // Apply filter if provided
  if (filter && filter.period !== "all") {
    filteredTourists = tourists.filter((tourist) => {
      const createdDate = new Date(tourist.created_at);
      const now = new Date();

      switch (filter.period) {
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return createdDate >= weekAgo;
        case "month":
          if (filter.month !== undefined && filter.year !== undefined) {
            return (
              createdDate.getMonth() === filter.month &&
              createdDate.getFullYear() === filter.year
            );
          }
          return false;
        case "year":
          if (filter.year !== undefined) {
            return createdDate.getFullYear() === filter.year;
          }
          return false;
        default:
          return true;
      }
    });
  }

  const stats: TouristStats = {
    total: filteredTourists.length,
    local: 0,
    domestic: 0,
    foreign: 0,
    overseas: 0,
  };

  filteredTourists.forEach((tourist) => {
    const type = tourist.tourist_type?.toLowerCase() || "";
    switch (type) {
      case "local":
        stats.local++;
        break;
      case "domestic":
        stats.domestic++;
        break;
      case "foreign":
        stats.foreign++;
        break;
      case "overseas":
        stats.overseas++;
        break;
    }
  });

  return stats;
};

// Get recent registrations
export const getRecentRegistrations = (
  registrations: BusinessRegistration[],
  limit: number = 10
): BusinessRegistration[] => {
  return registrations
    .sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime())
    .slice(0, limit);
};

// Get recent payments
export const getRecentPayments = (
  payments: SubscriptionPayment[],
  limit: number = 10
): SubscriptionPayment[] => {
  return payments
    .sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime())
    .slice(0, limit);
};

// Calculate revenue statistics
export const calculateRevenueStats = (payments: SubscriptionPayment[]) => {
  const completedPayments = payments.filter((p) => p.status === "completed");
  
  const totalRevenue = completedPayments.reduce((sum, p) => sum + p.amount, 0);
  
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const monthlyRevenue = completedPayments
    .filter((p) => {
      const date = new Date(p.paidAt);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    })
    .reduce((sum, p) => sum + p.amount, 0);
  
  const yearlyRevenue = completedPayments
    .filter((p) => {
      const date = new Date(p.paidAt);
      return date.getFullYear() === currentYear;
    })
    .reduce((sum, p) => sum + p.amount, 0);

  return {
    totalRevenue,
    monthlyRevenue,
    yearlyRevenue,
  };
};
