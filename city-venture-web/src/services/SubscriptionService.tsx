import apiClient from "./apiClient";

export interface SubscriptionPlan {
  name: string;
  price: number;
  booking_system: boolean;
  promotion_tools: boolean;
  visibility_boost: boolean;
  publication: boolean;
  duration_days: number | null;
  description: string;
}

export interface Subscription {
  id: string;
  business_id: string;
  plan_name: string;
  booking_system: boolean;
  promotion_tools: boolean;
  visibility_boost: boolean;
  publication: boolean;
  price: number;
  start_date: string;
  end_date: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface BookingAccessResponse {
  success: boolean;
  has_access: boolean;
  message?: string;
  subscription?: {
    booking_system: boolean;
    end_date: string | null;
    status: string;
  };
}

/**
 * Get all available subscription plans
 */
export async function getSubscriptionPlans(): Promise<{
  success: boolean;
  plans: SubscriptionPlan[];
}> {
  const response = await apiClient.get("/subscriptions/plans");
  return response.data;
}

/**
 * Get active subscription for a business
 */
export async function getBusinessSubscription(business_id: string): Promise<{
  success: boolean;
  subscription?: Subscription;
  message?: string;
}> {
  try {
    const response = await apiClient.get(
      `/subscriptions/business/${business_id}`
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return {
        success: false,
        message: "No active subscription found",
      };
    }
    throw error;
  }
}

/**
 * Check if business has access to booking system
 */
export async function checkBookingAccess(
  business_id: string
): Promise<BookingAccessResponse> {
  const response = await apiClient.get(
    `/subscriptions/business/${business_id}/booking-access`
  );
  return response.data;
}

/**
 * Get subscription history for a business
 */
export async function getSubscriptionHistory(business_id: string): Promise<{
  success: boolean;
  subscriptions: Subscription[];
}> {
  const response = await apiClient.get(
    `/subscriptions/business/${business_id}/history`
  );
  return response.data;
}

/**
 * Create or upgrade subscription
 */
export async function createSubscription(
  business_id: string,
  plan_name: "Free" | "Basic" | "Premium"
): Promise<{
  success: boolean;
  message: string;
  subscription: Subscription;
}> {
  const response = await apiClient.post("/subscriptions/subscribe", {
    business_id,
    plan_name,
  });
  return response.data;
}

/**
 * Cancel active subscription
 */
export async function cancelSubscription(business_id: string): Promise<{
  success: boolean;
  message: string;
}> {
  const response = await apiClient.delete(
    `/subscriptions/business/${business_id}/cancel`
  );
  return response.data;
}

/**
 * Check if subscription feature is enabled
 */
export function hasFeature(
  subscription: Subscription | undefined,
  feature: keyof Pick<
    Subscription,
    "booking_system" | "promotion_tools" | "visibility_boost" | "publication"
  >
): boolean {
  if (!subscription) return false;
  if (subscription.status !== "active") return false;
  if (subscription.end_date && new Date(subscription.end_date) < new Date()) {
    return false;
  }
  return subscription[feature] === true;
}

/**
 * Get days remaining in subscription
 */
export function getDaysRemaining(subscription: Subscription): number | null {
  if (!subscription.end_date) return null; // Unlimited (Free plan)

  const endDate = new Date(subscription.end_date);
  const now = new Date();
  const diff = endDate.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  return days > 0 ? days : 0;
}

/**
 * Check if subscription is expiring soon (within 7 days)
 */
export function isExpiringSoon(subscription: Subscription): boolean {
  const daysRemaining = getDaysRemaining(subscription);
  if (daysRemaining === null) return false; // Unlimited
  return daysRemaining <= 7 && daysRemaining > 0;
}

/**
 * Check if subscription has expired
 */
export function isExpired(subscription: Subscription): boolean {
  if (!subscription.end_date) return false; // Unlimited
  return new Date(subscription.end_date) < new Date();
}

/**
 * Format subscription plan name for display
 */
export function formatPlanName(planName: string): string {
  const planMap: Record<string, string> = {
    Free: "Free Plan",
    Basic: "Basic Plan",
    Premium: "Premium Plan",
  };
  return planMap[planName] || planName;
}

/**
 * Get plan badge color based on plan name
 */
export function getPlanBadgeColor(
  planName: string
): "neutral" | "primary" | "success" | "warning" {
  const colorMap: Record<
    string,
    "neutral" | "primary" | "success" | "warning"
  > = {
    Free: "neutral",
    Basic: "primary",
    Premium: "success",
  };
  return colorMap[planName] || "neutral";
}
