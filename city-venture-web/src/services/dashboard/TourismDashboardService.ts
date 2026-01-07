import axios from "axios";
import type { BusinessRegistration } from "@/src/features/admin/dashboard/components/NewRegistrationsTable";
import type { SubscriptionPayment } from "@/src/features/admin/dashboard/components/SubscriptionPaymentsTable";

const API_BASE_URL = 'http://localhost:3000/api';

export interface TourismDashboardData {
  businesses: any[];
  registrations: BusinessRegistration[];
  payments: SubscriptionPayment[];
  tourists: any[];
  touristSpots: any[];
  bookings: any[];
}

export interface BusinessStats {
  total: number;
  accommodations: number;
  shops: number;
  active: number;
  pending: number;
  freeSubscriptions: number;
  premiumSubscriptions: number;
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

// ===== FETCHING FUNCTIONS =====

/**
 * Fetch all tourist spots
 */
export const fetchAllTouristSpots = async (): Promise<any[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/tourist-spots`);
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error("Failed to fetch tourist spots:", error);
    return [];
  }
};

/**
 * Fetch all businesses
 */
export const fetchAllBusinesses = async (): Promise<any[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/business`);
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error("Failed to fetch businesses:", error);
    return [];
  }
};

/**
 * Fetch all accommodations (hasBooking === true)
 */
export const fetchAllAccommodations = async (): Promise<any[]> => {
  try {
    const businesses = await fetchAllBusinesses();
    return businesses.filter((b) => b.hasBooking === true || b.hasBooking === 1);
  } catch (error) {
    console.error("Failed to fetch accommodations:", error);
    return [];
  }
};

/**
 * Fetch all shops (hasBooking === false or not set)
 */
export const fetchAllShops = async (): Promise<any[]> => {
  try {
    const businesses = await fetchAllBusinesses();
    return businesses.filter((b) => !b.hasBooking || b.hasBooking === false || b.hasBooking === 0);
  } catch (error) {
    console.error("Failed to fetch shops:", error);
    return [];
  }
};

/**
 * Fetch all bookings from all businesses
 */
export const fetchAllBookings = async (): Promise<any[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/booking`);
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error("Failed to fetch bookings:", error);
    return [];
  }
};

/**
 * Get tourist demographics from all business bookings
 * Aggregates local_counts, domestic_counts, foreign_counts, overseas_counts
 */
export const fetchTouristDemographics = async (): Promise<TouristStats> => {
  try {
    const bookings = await fetchAllBookings();
    
    const stats: TouristStats = {
      total: 0,
      local: 0,
      domestic: 0,
      foreign: 0,
      overseas: 0,
    };

    bookings.forEach((booking) => {
      const local = Number(booking.local_counts) || 0;
      const domestic = Number(booking.domestic_counts) || 0;
      const foreign = Number(booking.foreign_counts) || 0;
      const overseas = Number(booking.overseas_counts) || 0;

      stats.local += local;
      stats.domestic += domestic;
      stats.foreign += foreign;
      stats.overseas += overseas;
      stats.total += local + domestic + foreign + overseas;
    });

    return stats;
  } catch (error) {
    console.error("Failed to fetch tourist demographics:", error);
    return {
      total: 0,
      local: 0,
      domestic: 0,
      foreign: 0,
      overseas: 0,
    };
  }
};

// ===== DASHBOARD DATA AGGREGATION =====

/**
 * Fetch all dashboard data
 */
export const fetchTourismDashboardData = async (): Promise<TourismDashboardData> => {
  try {
    // Fetch all data in parallel
    const [touristSpots, businesses, bookings] = await Promise.all([
      fetchAllTouristSpots(),
      fetchAllBusinesses(),
      fetchAllBookings(),
    ]);

    // Mock tourists data - TODO: Replace with actual API call when available
    const tourists: any[] = [];

    // Generate registrations from businesses
    const registrations: BusinessRegistration[] = businesses.slice(0, 10).map((business: any, index) => ({
      id: business.id || `business-${index}`,
      businessName: business.business_name || `Business ${index + 1}`,
      businessType: business.hasBooking ? "accommodation" : "shop",
      ownerName: `${business.owner_first_name || ""} ${business.owner_last_name || ""}`.trim() || "Business Owner",
      email: business.email || `owner${index}@example.com`,
      registeredAt: business.created_at || new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: business.status === "active" ? "approved" : Math.random() > 0.7 ? "pending" : "approved",
    }));

    // Generate payments based on business subscriptions
    const payments: SubscriptionPayment[] = businesses
      .filter((b: any) => b.subscription_plan) // Only businesses with subscriptions
      .slice(0, 8)
      .map((business: any, index) => ({
        id: `payment-${business.id || index}`,
        businessName: business.business_name || `Business ${index + 1}`,
        amount: business.subscription_plan === "premium" ? 999 : 0,
        paymentMethod: business.subscription_plan === "premium" ? ["Credit Card", "PayPal", "Bank Transfer"][Math.floor(Math.random() * 3)] : "Free",
        status: "completed",
        paidAt: business.subscription_start_date || business.created_at || new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        subscriptionPlan: business.subscription_plan === "premium" ? "Premium" : "Basic",
      }));

    return {
      businesses,
      registrations,
      payments,
      tourists,
      touristSpots,
      bookings,
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
      bookings: [],
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
    freeSubscriptions: 0,
    premiumSubscriptions: 0,
  };

  businesses.forEach((business) => {
    // Count by type (using hasBooking flag)
    if (business.hasBooking === true || business.hasBooking === 1) {
      stats.accommodations++;
    } else {
      stats.shops++;
    }

    // Count by status
    if (business.status === "active") {
      stats.active++;
    } else {
      stats.pending++;
    }

    // Count by subscription
    if (business.subscription_plan === "premium") {
      stats.premiumSubscriptions++;
    } else {
      stats.freeSubscriptions++;
    }
  });

  return stats;
};

// Calculate tourist statistics from bookings
export const calculateTouristStatsFromBookings = (
  bookings: any[],
  filter?: FilterPeriod
): TouristStats => {
  let filteredBookings = bookings;

  // Apply filter if provided
  if (filter && filter.period !== "all") {
    filteredBookings = bookings.filter((booking) => {
      const createdDate = new Date(booking.check_in_date || booking.created_at);
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
    total: 0,
    local: 0,
    domestic: 0,
    foreign: 0,
    overseas: 0,
  };

  filteredBookings.forEach((booking) => {
    const local = Number(booking.local_counts) || 0;
    const domestic = Number(booking.domestic_counts) || 0;
    const foreign = Number(booking.foreign_counts) || 0;
    const overseas = Number(booking.overseas_counts) || 0;

    stats.local += local;
    stats.domestic += domestic;
    stats.foreign += foreign;
    stats.overseas += overseas;
    stats.total += local + domestic + foreign + overseas;
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
