/**
 * Order Service
 * Consolidated service for order creation, retrieval, and cancellation
 * Uses apiClient for automatic JWT token handling and refresh
 * Integrates with PayMongo for online payments
 */

import apiClient from '@/services/apiClient';
import type { 
  Order, 
  CreateOrderPayload, 
  CreateOrderResponse 
} from '@/types/Order';

/**
 * Create a new order (Tourist only)
 * POST /api/orders
 * @param payload - Order creation payload
 * @returns Order response with order details and checkout URL (if PayMongo)
 */
export async function createOrder(
  payload: CreateOrderPayload
): Promise<CreateOrderResponse> {
  try {
    const { data } = await apiClient.post<CreateOrderResponse>(
      `/orders`, 
      payload
    );
    return data;
  } catch (error) {
    console.error('[OrderService] createOrder error:', error);
    throw error;
  }
}

/**
 * Get single order by ID
 * GET /api/orders/:id
 * Accessible by owner (tourist or business) and admin
 * @param orderId - Order UUID
 * @returns Order details with items
 */
export async function getOrderById(orderId: string): Promise<Order> {
  try {
    const { data } = await apiClient.get<Order>(
      `/orders/${orderId}`
    );
    return data;
  } catch (error) {
    console.error('[OrderService] getOrderById error:', error);
    throw error;
  }
}/**
 * Get orders for a specific user (Tourist)
 * GET /api/orders/user/:userId
 * @param userId - User UUID
 * @returns Array of user's orders (normalized)
 */
export async function getUserOrders(userId: string): Promise<Order[]> {
  try {
    const { data } = await apiClient.get<Order[]>(
      `/orders/user/${userId}`
    );
    
    // Ensure data is an array and normalize any missing fields
    if (!Array.isArray(data)) {
      console.warn('[OrderService] getUserOrders returned non-array:', data);
      return [];
    }
    
    // Normalize each order to ensure required fields exist
    return data.map(order => ({
      ...order,
      status: order.status || 'PENDING',
      payment_status: order.payment_status || 'PENDING',
      payment_method: order.payment_method || 'cash_on_pickup',
      order_number: order.order_number || 'N/A',
      items: order.items || [],
      total_amount: typeof order.total_amount === 'number' ? order.total_amount : parseFloat(String(order.total_amount)) || 0,
      subtotal: typeof order.subtotal === 'number' ? order.subtotal : parseFloat(String(order.subtotal)) || 0,
      discount_amount: typeof order.discount_amount === 'number' ? order.discount_amount : parseFloat(String(order.discount_amount)) || 0,
      tax_amount: typeof order.tax_amount === 'number' ? order.tax_amount : parseFloat(String(order.tax_amount)) || 0,
    }));
  } catch (error) {
    console.error('[OrderService] getUserOrders error:', error);
    throw error;
  }
}

/**
 * Cancel an order (Tourist within grace period & PENDING)
 * POST /api/orders/:id/cancel
 * @param orderId - Order UUID
 * @param reason - Optional cancellation reason
 */
export async function cancelOrder(orderId: string, reason?: string): Promise<void> {
  try {
    // Always send a body object to ensure proper Content-Type: application/json
    // This prevents issues where req.body is undefined on the backend
    await apiClient.post(`/orders/${orderId}/cancel`, {
      cancellation_reason: reason || 'User cancelled order',
    });
  } catch (error) {
    console.error('[OrderService] cancelOrder error:', error);
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
