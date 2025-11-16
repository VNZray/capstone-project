// See spec.md §7 - API / Backend Endpoints

import axios from 'axios';
import api from '@/services/api';
import { getToken } from '@/utils/secureStorage';
import type { 
  Order, 
  CreateOrderPayload, 
  CreateOrderResponse 
} from '@/types/Order';

/**
 * Helper function to get authorized axios instance
 */
const getAuthAxios = async () => {
  const token = await getToken();
  return axios.create({
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
};

/**
 * Create a new order (Tourist only)
 * POST /api/orders
 * See spec.md §7 - Orders endpoints
 */
export const createOrder = async (
  payload: CreateOrderPayload
): Promise<CreateOrderResponse> => {
  try {
    const authAxios = await getAuthAxios();
    const { data } = await authAxios.post<CreateOrderResponse>(
      `${api}/orders`, 
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
    const authAxios = await getAuthAxios();
    const { data } = await authAxios.get<Order[]>(
      `${api}/orders/user/${userId}`
    );
    return data;
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
    const authAxios = await getAuthAxios();
    const { data } = await authAxios.get<Order>(
      `${api}/orders/${orderId}`
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
    const authAxios = await getAuthAxios();
    await authAxios.post(`${api}/orders/${orderId}/cancel`);
  } catch (error) {
    console.error('[OrderService] cancelOrder error:', error);
    throw error;
  }
};
