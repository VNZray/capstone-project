// See spec.md §5 - Order State Machine & §6 - Data Model
// Note: Mobile app uses UPPERCASE status values for consistency
// Backend normalizes status to UPPERCASE for /api/orders/user/:userId endpoint

/**
 * Order statuses in UPPERCASE format (mobile convention)
 * Maps to lowercase database values:
 * - PENDING -> pending
 * - ACCEPTED -> accepted
 * - PREPARING -> preparing
 * - READY_FOR_PICKUP -> ready_for_pickup
 * - PICKED_UP -> picked_up
 * - CANCELLED_BY_USER -> cancelled_by_user
 * - CANCELLED_BY_BUSINESS -> cancelled_by_business
 * - FAILED_PAYMENT -> failed_payment
 */
export type OrderStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'PICKED_UP'
  | 'CANCELLED_BY_USER'
  | 'CANCELLED_BY_BUSINESS'
  | 'FAILED_PAYMENT';

/**
 * Payment statuses in UPPERCASE format (mobile convention)
 * Maps to lowercase database values:
 * - PENDING/UNPAID -> unpaid/pending
 * - PAID -> paid
 * - FAILED -> failed
 * - REFUNDED -> refunded
 */
export type PaymentStatus = 'PENDING' | 'UNPAID' | 'PAID' | 'REFUNDED' | 'FAILED';

export type PaymentMethod = 'cash_on_pickup' | 'paymongo';

export interface Order {
  id: string;
  order_number: string;
  business_id: string;
  user_id: string;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  discount_id?: string | null;
  pickup_datetime: string;
  special_instructions?: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  payment_method_type?: 'gcash' | 'card' | 'paymaya' | 'grab_pay' | 'qrph';
  status: OrderStatus;
  arrival_code: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  business_name?: string; // Joined from backend
  user_name?: string; // Joined from backend
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  special_requests?: string;
  product_name?: string; // Joined from backend
  product_image_url?: string; // Joined from backend
}

// See spec.md §7 - API / Backend Endpoints (Create Order Request)
export interface CreateOrderPayload {
  business_id: string;
  user_id: string;
  items: {
    product_id: string;
    quantity: number;
    special_requests?: string;
  }[];
  discount_id?: string | null;
  pickup_datetime: string; // ISO 8601
  special_instructions?: string;
  payment_method: PaymentMethod;
  payment_method_type?: 'gcash' | 'card' | 'paymaya' | 'grab_pay' | 'qrph';
  /**
   * When true, skips checkout session creation for PayMongo payments.
   * Use this when implementing Payment Intent workflow instead of hosted checkout.
   */
  skip_checkout_session?: boolean;
}

// Response from POST /api/orders (spec.md §7)
export interface CreateOrderResponse {
  order_id: string;
  order_number: string;
  arrival_code: string;
  status: string;
  payment_status: string;
  total_amount: number;
  checkout_url?: string; // PayMongo checkout URL (when payment_method=paymongo)
}
