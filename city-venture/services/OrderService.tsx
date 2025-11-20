// See spec.md §7 - API / Backend Endpoints

import apiClient from '@/services/apiClient';
import type { 
  Order, 
  CreateOrderPayload, 
  CreateOrderResponse 
} from '@/types/Order';

/**
 * Create a new order (Tourist only)
 * POST /api/orders
 * See spec.md §7 - Orders endpoints
 */
export const createOrder = async (
  payload: CreateOrderPayload
): Promise<CreateOrderResponse> => {
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
};

/**
 * Get orders for a specific user (Tourist)
 * GET /api/orders/user/:userId
 * See spec.md §7 - Orders endpoints
 */
export const getUserOrders = async (userId: string): Promise<Order[]> => {
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
      total_amount: typeof order.total_amount === 'number' ? order.total_amount : parseFloat(order.total_amount) || 0,
      subtotal: typeof order.subtotal === 'number' ? order.subtotal : parseFloat(order.subtotal) || 0,
      discount_amount: typeof order.discount_amount === 'number' ? order.discount_amount : parseFloat(order.discount_amount) || 0,
      tax_amount: typeof order.tax_amount === 'number' ? order.tax_amount : parseFloat(order.tax_amount) || 0,
    }));
  } catch (error) {
    console.error('[OrderService] getUserOrders error:', error);
    throw error;
  }
};

/**
 * Get single order by ID
 * GET /api/orders/:id
 * Accessible by owner (tourist or business) and admin
 */
export const getOrderById = async (orderId: string): Promise<Order> => {
  try {
    const { data } = await apiClient.get<Order>(
      `/orders/${orderId}`
    );
    return data;
  } catch (error) {
    console.error('[OrderService] getOrderById error:', error);
    throw error;
  }
};

/**
 * Cancel an order (Tourist within grace period & PENDING)
 * POST /api/orders/:id/cancel
 * See spec.md §5 - Grace window (10s default)
 */
export const cancelOrder = async (orderId: string): Promise<void> => {
  try {
    await apiClient.post(`/orders/${orderId}/cancel`);
  } catch (error) {
    console.error('[OrderService] cancelOrder error:', error);
    throw error;
  }
};
