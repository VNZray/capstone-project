/**
 * Refund Service (Mobile App)
 *
 * Service for handling refund and cancellation requests from the mobile app.
 * Uses apiClient for automatic JWT token handling and refresh.
 *
 * @see backend/services/refundService.js
 * @see backend/controller/refund/refundController.js
 */

import apiClient from '@/services/api/apiClient';

// ============= Types =============

export interface RefundEligibility {
  orderId: string;
  eligible: boolean;
  canCancel: boolean;
  reason: string;
  paymentMethod: string | null;
  amount: number;
  requiresCustomerService: boolean;
  actions: RefundAction[];
}

export interface RefundAction {
  action: 'refund' | 'cancel' | 'customer_service';
  label: string;
  description: string;
  endpoint: string | null;
}

export interface RefundRequest {
  refundId: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled';
  amount: number;
  paymongoRefundId?: string;
  message: string;
}

export interface RefundRecord {
  id: string;
  refund_for: 'order' | 'booking';
  refund_for_id: string;
  payment_id: string;
  requested_by: string;
  amount: number;
  original_amount: number;
  currency: string;
  reason: RefundReason;
  notes: string | null;
  admin_notes: string | null;
  status: RefundStatus;
  paymongo_refund_id: string | null;
  paymongo_payment_id: string | null;
  error_message: string | null;
  retry_count: number;
  requested_at: string;
  processed_at: string | null;
  completed_at: string | null;
  updated_at: string;
  // Joined fields
  payment_amount?: number;
  payment_method?: string;
  payment_status?: string;
  resource_reference?: string;
  business_name?: string;
}

export type RefundStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled';

export type RefundReason =
  | 'requested_by_customer'
  | 'duplicate'
  | 'fraudulent'
  | 'changed_mind'
  | 'wrong_order'
  | 'product_unavailable'
  | 'business_issue'
  | 'others';

export interface RefundRequestPayload {
  reason?: RefundReason;
  notes?: string;
  amount?: number; // For partial refunds
}

export interface CancellationResult {
  success: boolean;
  message: string;
  order?: {
    id: string;
    status: string;
    orderNumber: string;
  };
}

// ============= Order Refund Functions =============

/**
 * Check if an order is eligible for refund or cancellation
 * GET /api/orders/:orderId/refund-eligibility
 * @param orderId - Order UUID
 * @returns Eligibility result with available actions
 */
export async function checkOrderRefundEligibility(orderId: string): Promise<RefundEligibility> {
  try {
    const { data } = await apiClient.get<{ success: boolean; data: RefundEligibility }>(
      `/orders/${orderId}/refund-eligibility`
    );
    return data.data;
  } catch (error: any) {
    console.error('[RefundService] checkOrderRefundEligibility error:', error);
    throw error;
  }
}

/**
 * Request a refund for a paid order
 * POST /api/orders/:orderId/refund
 * @param orderId - Order UUID
 * @param payload - Refund request details
 * @returns Refund request result
 */
export async function requestOrderRefund(
  orderId: string,
  payload: RefundRequestPayload = {}
): Promise<RefundRequest> {
  try {
    const { data } = await apiClient.post<{ success: boolean; message: string; data: RefundRequest }>(
      `/orders/${orderId}/refund`,
      payload
    );
    return {
      ...data.data,
      message: data.message
    };
  } catch (error: any) {
    console.error('[RefundService] requestOrderRefund error:', error);

    // Extract error message from response
    const errorMessage = error.response?.data?.message || 'Failed to request refund';
    const requiresCustomerService = error.response?.data?.requiresCustomerService;

    throw {
      ...error,
      message: errorMessage,
      requiresCustomerService
    };
  }
}

/**
 * Cancel a cash on pickup order
 * POST /api/orders/:orderId/cancel-request
 * @param orderId - Order UUID
 * @param reason - Cancellation reason
 * @param notes - Optional notes
 * @returns Cancellation result
 */
export async function cancelCashOnPickupOrder(
  orderId: string,
  reason: string = 'changed_mind',
  notes?: string
): Promise<CancellationResult> {
  try {
    const { data } = await apiClient.post<{ success: boolean; message: string; data: any }>(
      `/orders/${orderId}/cancel-request`,
      { reason, notes }
    );
    return {
      success: data.success,
      message: data.message,
      order: data.data
    };
  } catch (error: any) {
    console.error('[RefundService] cancelCashOnPickupOrder error:', error);

    const errorMessage = error.response?.data?.message || 'Failed to cancel order';
    const requiresCustomerService = error.response?.data?.requiresCustomerService;
    const shouldRefund = error.response?.data?.shouldRefund;

    throw {
      ...error,
      message: errorMessage,
      requiresCustomerService,
      shouldRefund
    };
  }
}

/**
 * Get refund status for an order
 * GET /api/orders/:orderId/refund-status
 * @param orderId - Order UUID
 * @returns Array of refund records for the order
 */
export async function getOrderRefundStatus(orderId: string): Promise<RefundRecord[]> {
  try {
    const { data } = await apiClient.get<{ success: boolean; data: RefundRecord[] }>(
      `/orders/${orderId}/refund-status`
    );
    return data.data || [];
  } catch (error: any) {
    // Return empty array if no refunds found or permission denied
    // 404 = no refunds exist, 403 = user doesn't have permission (different role)
    if (error.response?.status === 404 || error.response?.status === 403) {
      return [];
    }
    console.error('[RefundService] getOrderRefundStatus error:', error);
    throw error;
  }
}

// ============= User Refund History =============

/**
 * Get user's refund history
 * GET /api/refunds/my
 * @param limit - Number of records to fetch
 * @param offset - Pagination offset
 * @returns Array of user's refund records
 */
export async function getMyRefunds(
  limit: number = 50,
  offset: number = 0
): Promise<RefundRecord[]> {
  try {
    const { data } = await apiClient.get<{ success: boolean; data: RefundRecord[] }>(
      `/refunds/my`,
      { params: { limit, offset } }
    );
    return data.data || [];
  } catch (error: any) {
    console.error('[RefundService] getMyRefunds error:', error);
    throw error;
  }
}

/**
 * Get refund by ID
 * GET /api/refunds/:refundId
 * @param refundId - Refund UUID
 * @returns Refund record details
 */
export async function getRefundById(refundId: string): Promise<RefundRecord> {
  try {
    const { data } = await apiClient.get<{ success: boolean; data: RefundRecord }>(
      `/refunds/${refundId}`
    );
    return data.data;
  } catch (error: any) {
    console.error('[RefundService] getRefundById error:', error);
    throw error;
  }
}

// ============= Booking Refund Functions =============

/**
 * Check if a booking is eligible for refund
 * GET /api/bookings/:bookingId/refund-eligibility
 * @param bookingId - Booking UUID
 * @returns Eligibility result
 */
export async function checkBookingRefundEligibility(bookingId: string): Promise<RefundEligibility> {
  try {
    const { data } = await apiClient.get<{ success: boolean; data: RefundEligibility }>(
      `/refunds/bookings/${bookingId}/eligibility`
    );
    return data.data;
  } catch (error: any) {
    console.error('[RefundService] checkBookingRefundEligibility error:', error);
    throw error;
  }
}

/**
 * Request a refund for a booking
 * POST /api/bookings/:bookingId/refund
 * @param bookingId - Booking UUID
 * @param payload - Refund request details
 * @returns Refund request result
 */
export async function requestBookingRefund(
  bookingId: string,
  payload: RefundRequestPayload = {}
): Promise<RefundRequest> {
  try {
    const { data } = await apiClient.post<{ success: boolean; message: string; data: RefundRequest }>(
      `/refunds/bookings/${bookingId}/refund`,
      payload
    );
    return {
      ...data.data,
      message: data.message
    };
  } catch (error: any) {
    console.error('[RefundService] requestBookingRefund error:', error);

    const errorMessage = error.response?.data?.message || 'Failed to request booking refund';
    throw {
      ...error,
      message: errorMessage,
      requiresCustomerService: error.response?.data?.requiresCustomerService
    };
  }
}

// ============= Helper Functions =============

/**
 * Get human-readable label for refund reason
 */
export function getRefundReasonLabel(reason: RefundReason): string {
  const labels: Record<RefundReason, string> = {
    requested_by_customer: 'Requested by me',
    duplicate: 'Duplicate order',
    fraudulent: 'Fraudulent transaction',
    changed_mind: 'Changed my mind',
    wrong_order: 'Wrong order',
    product_unavailable: 'Product unavailable',
    business_issue: 'Issue with business',
    others: 'Other reason'
  };
  return labels[reason] || reason;
}

/**
 * Get human-readable label for refund status
 */
export function getRefundStatusLabel(status: RefundStatus): string {
  const labels: Record<RefundStatus, string> = {
    pending: 'Pending',
    processing: 'Processing',
    succeeded: 'Completed',
    failed: 'Failed',
    cancelled: 'Cancelled'
  };
  return labels[status] || status;
}

/**
 * Get color for refund status
 */
export function getRefundStatusColor(status: RefundStatus): string {
  const colors: Record<RefundStatus, string> = {
    pending: '#FFA000', // Orange/Warning
    processing: '#2196F3', // Blue/Info
    succeeded: '#4CAF50', // Green/Success
    failed: '#F44336', // Red/Error
    cancelled: '#9E9E9E' // Gray
  };
  return colors[status] || '#9E9E9E';
}

/**
 * Get available refund reasons for user selection
 */
export function getAvailableRefundReasons(): { value: RefundReason; label: string }[] {
  return [
    { value: 'changed_mind', label: 'Changed my mind' },
    { value: 'wrong_order', label: 'Wrong order placed' },
    { value: 'duplicate', label: 'Duplicate order' },
    { value: 'product_unavailable', label: 'Product not available' },
    { value: 'business_issue', label: 'Issue with business/shop' },
    { value: 'others', label: 'Other reason' }
  ];
}

export default {
  // Order refunds
  checkOrderRefundEligibility,
  requestOrderRefund,
  cancelCashOnPickupOrder,
  getOrderRefundStatus,

  // Booking refunds
  checkBookingRefundEligibility,
  requestBookingRefund,

  // User history
  getMyRefunds,
  getRefundById,

  // Helpers
  getRefundReasonLabel,
  getRefundStatusLabel,
  getRefundStatusColor,
  getAvailableRefundReasons
};
