// See spec.md §8 - Real-time updates via Socket.IO for Order Detail Screen

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/context/AuthContext';
import { getAccessToken } from '@/services/api/apiClient';

interface OrderUpdatePayload {
  id: string;
  status: string;
  user_id?: string;
  business_id?: string;
  [key: string]: unknown;
}

interface PaymentUpdatePayload {
  payment_id?: string;
  order_id?: string;
  status?: string;
  type?: string;
  refundId?: string;
  refundFor?: string;
  refundForId?: string;
  amount?: number;
  [key: string]: unknown;
}

interface UseOrderDetailSocketOptions {
  orderId: string | undefined;
  onOrderUpdated?: (data: OrderUpdatePayload) => void;
  onPaymentUpdated?: (data: PaymentUpdatePayload) => void;
  onRefresh?: () => void;
}

/**
 * Hook for Socket.IO connection to receive real-time updates for a specific order
 * This hook is designed for the Order Detail screen and handles:
 * - Order status changes
 * - Payment updates (including refunds)
 * - Auto-refresh when relevant events occur
 */
export const useOrderDetailSocket = ({
  orderId,
  onOrderUpdated,
  onPaymentUpdated,
  onRefresh,
}: UseOrderDetailSocketOptions) => {
  const socketRef = useRef<Socket | null>(null);
  const { user } = useAuth();
  const callbacksRef = useRef({ onOrderUpdated, onPaymentUpdated, onRefresh });

  // Update callbacks ref to avoid re-connecting socket when callbacks change
  useEffect(() => {
    callbacksRef.current = { onOrderUpdated, onPaymentUpdated, onRefresh };
  }, [onOrderUpdated, onPaymentUpdated, onRefresh]);

  useEffect(() => {
    if (!user?.id || !orderId) {
      console.log('[useOrderDetailSocket] Missing user or orderId, skipping socket');
      return;
    }

    const token = getAccessToken();
    if (!token) {
      console.log('[useOrderDetailSocket] No token available');
      return;
    }

    // Disconnect existing socket before creating a new one
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    // Get API URL from environment or default
    const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
    const socketUrl = apiUrl.replace('/api', '');

    console.log('[useOrderDetailSocket] Connecting for order:', orderId);

    socketRef.current = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('[useOrderDetailSocket] ✅ Connected! Socket ID:', socket.id);

      // Join user room and order-specific room
      socket.emit('join:user', { userId: user.id });
      socket.emit('join:order', { orderId });

      console.log(`[useOrderDetailSocket] 📥 Joined rooms: user:${user.id}, order:${orderId}`);
    });

    socket.on('disconnect', (reason) => {
      console.log('[useOrderDetailSocket] ❌ Disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('[useOrderDetailSocket] 🚫 Connection error:', error.message);
    });

    // Order updated event - check if it's for this order
    socket.on('order:updated', (data: OrderUpdatePayload) => {
      console.log('[useOrderDetailSocket] 🔄 Order updated:', data);

      // Only process updates for this specific order
      if (data.id === orderId) {
        console.log('[useOrderDetailSocket] ✅ Update matches current order, triggering callbacks');

        if (callbacksRef.current.onOrderUpdated) {
          callbacksRef.current.onOrderUpdated(data);
        }

        // Trigger refresh to get full updated order data
        if (callbacksRef.current.onRefresh) {
          callbacksRef.current.onRefresh();
        }
      }
    });

    // Order status change event
    socket.on('order:status', (data: OrderUpdatePayload) => {
      console.log('[useOrderDetailSocket] 📊 Order status changed:', data);

      if (data.id === orderId) {
        console.log('[useOrderDetailSocket] ✅ Status change matches current order');

        if (callbacksRef.current.onOrderUpdated) {
          callbacksRef.current.onOrderUpdated(data);
        }

        if (callbacksRef.current.onRefresh) {
          callbacksRef.current.onRefresh();
        }
      }
    });

    // Payment updated event - check if it's for this order
    socket.on('payment:updated', (data: PaymentUpdatePayload) => {
      console.log('[useOrderDetailSocket] 💳 Payment updated:', data);

      // Check if payment update is for this order
      const isForThisOrder = data.order_id === orderId ||
        data.refundForId === orderId ||
        (data.type === 'refund_update' && data.refundFor === 'order' && data.refundForId === orderId);

      if (isForThisOrder) {
        console.log('[useOrderDetailSocket] ✅ Payment update matches current order');

        if (callbacksRef.current.onPaymentUpdated) {
          callbacksRef.current.onPaymentUpdated(data);
        }

        // Refresh order to get updated payment/refund status
        if (callbacksRef.current.onRefresh) {
          callbacksRef.current.onRefresh();
        }
      }
    });

    // Cleanup on unmount or when dependencies change
    return () => {
      console.log('[useOrderDetailSocket] 🧹 Cleaning up socket connection');

      if (socketRef.current) {
        socketRef.current.emit('leave:user', { userId: user.id });
        socketRef.current.emit('leave:order', { orderId });
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user?.id, orderId]);

  return socketRef;
};

export default useOrderDetailSocket;
