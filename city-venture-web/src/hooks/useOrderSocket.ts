import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/src/context/AuthContext';
import { getAccessToken } from '@/src/services/apiClient';
import type { Order } from '@/src/types/Order';

interface OrderSocketCallbacks {
  onNewOrder?: (order: Order) => void;
  onOrderUpdated?: (order: Order) => void;
  onOrderStatusChanged?: (data: { orderId: string; status: string; previousStatus: string }) => void;
}

/**
 * Hook for Socket.IO connection to receive real-time order updates for business owners
 * Connects to business-specific room to receive order notifications
 */
export const useOrderSocket = (businessId: string | null, callbacks: OrderSocketCallbacks = {}) => {
  const socketRef = useRef<Socket | null>(null);
  const { user } = useAuth();

  const { onNewOrder, onOrderUpdated, onOrderStatusChanged } = callbacks;

  // Memoize callbacks to prevent reconnection on every render
  const handleNewOrder = useCallback((data: Order) => {
    console.log('[useOrderSocket] 🆕 New order received:', data);
    onNewOrder?.(data);
  }, [onNewOrder]);

  const handleOrderUpdated = useCallback((data: Order) => {
    console.log('[useOrderSocket] 🔄 Order updated:', data);
    onOrderUpdated?.(data);
  }, [onOrderUpdated]);

  const handleOrderStatus = useCallback((data: { orderId: string; status: string; previousStatus: string }) => {
    console.log('[useOrderSocket] 📊 Order status changed:', data);
    onOrderStatusChanged?.(data);
  }, [onOrderStatusChanged]);

  useEffect(() => {
    if (!user?.id || !businessId) {
      console.log('[useOrderSocket] No user or businessId, skipping socket connection');
      return;
    }

    // Get API URL from environment
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const socketUrl = apiUrl.replace('/api', ''); // Remove /api path for socket connection

    console.log('[useOrderSocket] Connecting to Socket.IO:', socketUrl);
    console.log('[useOrderSocket] Business ID:', businessId);

    // Get access token from the new auth system (in-memory token)
    const token = getAccessToken();
    
    if (!token) {
      console.warn('[useOrderSocket] No access token available, socket may fail to authenticate');
    }

    // Initialize socket connection
    socketRef.current = io(socketUrl, {
      auth: {
        token: token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    const socket = socketRef.current;

    // Connection event handlers
    socket.on('connect', () => {
      console.log('[useOrderSocket] ✅ Connected! Socket ID:', socket.id);
      
      // Join business-specific room for order updates
      socket.emit('join:business', { businessId });
      console.log('[useOrderSocket] 📥 Joined room: business:' + businessId);
    });

    socket.on('disconnect', (reason) => {
      console.log('[useOrderSocket] ❌ Disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('[useOrderSocket] 🚫 Connection error:', error.message);
    });

    // Order event listeners
    socket.on('order:new', handleNewOrder);
    socket.on('order:updated', handleOrderUpdated);
    socket.on('order:status', handleOrderStatus);

    // Cleanup on unmount
    return () => {
      console.log('[useOrderSocket] 🧹 Cleaning up socket connection');
      
      if (socketRef.current) {
        socketRef.current.emit('leave:business', { businessId });
        socketRef.current.off('order:new', handleNewOrder);
        socketRef.current.off('order:updated', handleOrderUpdated);
        socketRef.current.off('order:status', handleOrderStatus);
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user?.id, businessId, handleNewOrder, handleOrderUpdated, handleOrderStatus]);

  return socketRef;
};
