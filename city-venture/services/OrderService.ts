/**
 * Order Service
 * Handles order creation, retrieval, and cancellation
 * Integrates with PayMongo for online payments
 */

import apiClient from '@/services/apiClient';

export interface OrderItem {
  product_id: string;
  quantity: number;
  special_requests?: string;
}

export interface CreateOrderRequest {
  business_id: string;
  user_id: string;
  items: OrderItem[];
  discount_id?: string | null;
  pickup_datetime: string; // ISO 8601 format
  special_instructions?: string;
  payment_method: 'cash_on_pickup' | 'paymongo';
  payment_method_type?: 'gcash' | 'card' | 'paymaya' | 'grab_pay';
}

export interface PaymentAttachment {
  payment_id?: string;
  provider_reference?: string;
  checkout_url?: string;
  payment_intent_id?: string;
  payment_method_type?: string;
  error?: boolean;
  message?: string;
}

export interface OrderCreationResponse {
  order_id: string;
  order_number: string;
  arrival_code: string;
  status: string;
  payment_status: string;
  total_amount: number;
  payment?: PaymentAttachment;
}

export interface Order {
  id: string;
  order_number: string;
  business_id: string;
  user_id: string;
  status: string;
  payment_status: string;
  payment_method: string;
  payment_method_type?: string;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  pickup_datetime: string;
  special_instructions?: string;
  arrival_code: string;
  created_at: string;
  updated_at: string;
  items?: OrderItemDetail[];
}

export interface OrderItemDetail {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  special_requests?: string;
}

/**
 * Create a new order
 * @param orderData - Order creation payload
 * @returns Order response with order details and checkout URL (if PayMongo)
 */
export async function createOrder(orderData: CreateOrderRequest): Promise<OrderCreationResponse> {
  try {
    const response = await apiClient.post<OrderCreationResponse>(
      `/orders`,
      orderData
    );

    return response.data;
  } catch (error: any) {
    console.error('[OrderService] Create order failed:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Get order by ID
 * @param orderId - Order UUID
 * @returns Order details with items
 */
export async function getOrderById(orderId: string): Promise<Order> {
  try {
    const response = await apiClient.get<Order>(
      `/orders/${orderId}`
    );

    return response.data;
  } catch (error: any) {
    console.error('[OrderService] Get order failed:', error.response?.data || error.message);
    throw error;
  }
}/**
 * Get all orders for the current user
 * @param userId - User UUID
 * @returns Array of user's orders
 */
export async function getUserOrders(userId: string): Promise<Order[]> {
  try {
    const response = await apiClient.get<Order[]>(
      `/orders/user/${userId}`
    );

    return response.data;
  } catch (error: any) {
    console.error('[OrderService] Get user orders failed:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Cancel an order (within grace period or with business permission)
 * @param orderId - Order UUID
 * @returns Success response
 */
export async function cancelOrder(orderId: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      `/orders/${orderId}/cancel`,
      {}
    );

    return response.data;
  } catch (error: any) {
    console.error('[OrderService] Cancel order failed:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Check if order is within grace period for cancellation
 * @param createdAt - Order creation timestamp
 * @param graceSeconds - Grace period in seconds (default 10)
 * @returns True if within grace period
 */
export function isWithinGracePeriod(createdAt: string, graceSeconds: number = 10): boolean {
  const createdTime = new Date(createdAt).getTime();
  const currentTime = Date.now();
  const elapsedSeconds = (currentTime - createdTime) / 1000;
  
  return elapsedSeconds <= graceSeconds;
}

/**
 * Calculate remaining grace period time
 * @param createdAt - Order creation timestamp
 * @param graceSeconds - Grace period in seconds (default 10)
 * @returns Remaining seconds (0 if expired)
 */
export function getRemainingGraceTime(createdAt: string, graceSeconds: number = 10): number {
  const createdTime = new Date(createdAt).getTime();
  const currentTime = Date.now();
  const elapsedSeconds = (currentTime - createdTime) / 1000;
  const remaining = graceSeconds - elapsedSeconds;
  
  return Math.max(0, Math.floor(remaining));
}
