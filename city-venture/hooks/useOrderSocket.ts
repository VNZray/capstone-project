// See spec.md §8 - Real-time updates via Socket.IO (Phase 1: basic wiring)

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/context/AuthContext';
import { getAccessToken } from '@/services/apiClient';

/**
 * Hook for Socket.IO connection to receive real-time order updates
 * Phase 1: Basic connection and event logging
 * Phase 2+: State updates, notifications, UI refresh
 */
export const useOrderSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) {
      console.log('[useOrderSocket] No user, skipping socket connection');
      return;
    }

    // Get API URL from environment or default
    const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
    const socketUrl = apiUrl.replace('/api', ''); // Remove /api path for socket connection

    console.log('[useOrderSocket] Connecting to Socket.IO:', socketUrl);

    // SECURITY FIX: Use JWT token for socket authentication (not just userId)
    const token = getAccessToken();
    if (!token) {
      console.warn('[useOrderSocket] No access token available, socket connection may fail');
    }

    // Initialize socket connection with JWT token for authentication
    socketRef.current = io(socketUrl, {
      auth: {
        token: token, // JWT token for backend verification
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
      
      // Join user-specific room for order updates
      socket.emit('join:user', { userId: user.id });
      console.log('[useOrderSocket] 📥 Joined room: user:' + user.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('[useOrderSocket] ❌ Disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('[useOrderSocket] 🚫 Connection error:', error.message);
    });

    // Order event listeners (Phase 1: logging only)
    // See spec.md §8 for event payloads
    socket.on('order:new', (data) => {
      console.log('[useOrderSocket] 🆕 New order created:', data);
      // Phase 2+: Update local state, show notification, refresh list
    });

    socket.on('order:updated', (data) => {
      console.log('[useOrderSocket] 🔄 Order updated:', data);
      // Phase 2+: Update order detail view, show notification
    });

    socket.on('order:status', (data) => {
      console.log('[useOrderSocket] 📊 Order status changed:', data);
      // Phase 2+: Update UI, show status notification
    });

    socket.on('payment:updated', (data) => {
      console.log('[useOrderSocket] 💳 Payment updated:', data);
      // Phase 2+: Update payment status in UI
    });

    // Cleanup on unmount
    return () => {
      console.log('[useOrderSocket] 🧹 Cleaning up socket connection');
      
      if (socketRef.current) {
        socketRef.current.emit('leave:user', { userId: user.id });
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user?.id]);

  return socketRef;
};
