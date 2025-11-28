
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import db from '../db.js';

let io = null;

/**
 * Verify if a user has access to a business
 * @param {string} userId - User ID
 * @param {string} businessId - Business ID to check access for
 * @returns {Promise<boolean>} True if user has access
 */
async function verifyBusinessAccess(userId, businessId) {
  try {
    // Check if user is the business owner
    const [ownerRows] = await db.query(
      `SELECT b.id FROM business b
       JOIN owner o ON o.id = b.owner_id
       WHERE b.id = ? AND o.user_id = ?`,
      [businessId, userId]
    );
    if (ownerRows && ownerRows.length > 0) return true;

    // Check if user is staff at the business
    const [staffRows] = await db.query(
      `SELECT id FROM staff WHERE business_id = ? AND user_id = ?`,
      [businessId, userId]
    );
    if (staffRows && staffRows.length > 0) return true;

    // Check if user is Admin
    const [adminRows] = await db.query(
      `SELECT u.id FROM user u
       JOIN user_role ur ON ur.id = u.user_role_id
       WHERE u.id = ? AND ur.role_name = 'Admin'`,
      [userId]
    );
    if (adminRows && adminRows.length > 0) return true;

    return false;
  } catch (error) {
    console.error('[Socket] Error verifying business access:', error);
    return false;
  }
}

/**
 * Initialize Socket.IO server
 * @param {Object} httpServer - HTTP server instance
 */
export function initializeSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN?.split(',') || [
        'http://localhost:5173',
        'http://localhost:8081',
        'http://10.242.184.237:5173',
        'http://10.242.184.237:8081'
      ],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  // JWT Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      // SECURITY: Explicitly pin algorithm to prevent algorithm confusion attacks
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET, {
        algorithms: ['HS256'],
      });
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      socket.businessId = decoded.business_id; // For owners/staff
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id} (User: ${socket.userId}, Role: ${socket.userRole})`);

    // Join user-specific room
    socket.join(`user:${socket.userId}`);
    console.log(`User ${socket.userId} joined room: user:${socket.userId}`);

    // Join business room if Business Owner/staff
    if (['Business Owner', 'Staff'].includes(socket.userRole) && socket.businessId) {
      socket.join(`business:${socket.businessId}`);
      console.log(`User ${socket.userId} joined business room: business:${socket.businessId}`);
    }

    // Handle business room join/leave (for web CMS)
    // SECURITY: Verify user has access to the business before joining
    socket.on('join:business', async (data) => {
      const { businessId } = data;
      if (!businessId) return;

      // Verify access before allowing join
      const hasAccess = await verifyBusinessAccess(socket.userId, businessId);
      if (!hasAccess) {
        socket.emit('error', { 
          message: 'Access denied: You do not have permission to access this business',
          code: 'BUSINESS_ACCESS_DENIED'
        });
        console.warn(`[Socket] Access denied: User ${socket.userId} tried to join business:${businessId}`);
        return;
      }

      socket.join(`business:${businessId}`);
      console.log(`Socket ${socket.id} joined business room: business:${businessId}`);
    });

    socket.on('leave:business', (data) => {
      const { businessId } = data;
      if (businessId) {
        socket.leave(`business:${businessId}`);
        console.log(`Socket ${socket.id} left business room: business:${businessId}`);
      }
    });

    // Handle user room join/leave (for mobile)
    // SECURITY: Users can only join their own room
    socket.on('join:user', (data) => {
      const { userId } = data;
      if (!userId) return;
      
      // Verify user is joining their own room
      if (userId !== socket.userId) {
        socket.emit('error', {
          message: 'Access denied: You can only join your own user room',
          code: 'USER_ROOM_ACCESS_DENIED'
        });
        console.warn(`[Socket] Access denied: User ${socket.userId} tried to join user:${userId}`);
        return;
      }
      
      socket.join(`user:${userId}`);
      console.log(`Socket ${socket.id} joined user room: user:${userId}`);
    });

    socket.on('leave:user', (data) => {
      const { userId } = data;
      if (userId) {
        socket.leave(`user:${userId}`);
        console.log(`Socket ${socket.id} left user room: user:${userId}`);
      }
    });

    // Handle custom room subscriptions
    socket.on('order:subscribe', (data) => {
      const { orderId } = data;
      
      // Validate user can subscribe to this order
      // In production, query DB to verify ownership
      socket.join(`order:${orderId}`);
      console.log(`User ${socket.userId} subscribed to order:${orderId}`);
    });

    socket.on('order:unsubscribe', (data) => {
      const { orderId } = data;
      socket.leave(`order:${orderId}`);
      console.log(`User ${socket.userId} unsubscribed from order:${orderId}`);
    });

    // Disconnect handler
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  console.log('✅ Socket.IO initialized with JWT authentication');
  return io;
}

/**
 * Get Socket.IO instance
 * @returns {Object} Socket.IO instance
 */
export function getIO() {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call initializeSocket() first.');
  }
  return io;
}

/**
 * Emit event to user room
 * @param {string} userId - User ID
 * @param {string} event - Event name
 * @param {Object} data - Event data
 */
export function emitToUser(userId, event, data) {
  if (!io) {
    console.warn('Socket.IO not initialized, skipping emit');
    return;
  }
  
  io.to(`user:${userId}`).emit(event, data);
  console.log(`Emitted ${event} to user:${userId}`);
}

/**
 * Emit event to business room
 * @param {string} businessId - Business ID
 * @param {string} event - Event name
 * @param {Object} data - Event data
 */
export function emitToBusiness(businessId, event, data) {
  if (!io) {
    console.warn('Socket.IO not initialized, skipping emit');
    return;
  }
  
  io.to(`business:${businessId}`).emit(event, data);
  console.log(`Emitted ${event} to business:${businessId}`);
}

/**
 * Emit event to specific order room
 * @param {string} orderId - Order ID
 * @param {string} event - Event name
 * @param {Object} data - Event data
 */
export function emitToOrder(orderId, event, data) {
  if (!io) {
    console.warn('Socket.IO not initialized, skipping emit');
    return;
  }
  
  io.to(`order:${orderId}`).emit(event, data);
  console.log(`Emitted ${event} to order:${orderId}`);
}

/**
 * Emit new order event to business and user
 * @param {Object} order - Order object with business_id, user_id, order data
 */
export function emitNewOrder(order) {
  // Send complete order data for display in UI
  const eventData = {
    id: order.id || order.order_id,
    order_number: order.order_number,
    business_id: order.business_id,
    user_id: order.user_id,
    user_email: order.user_email,
    status: order.status,
    payment_status: order.payment_status,
    payment_method: order.payment_method,
    subtotal: order.subtotal,
    discount_amount: order.discount_amount || 0,
    tax_amount: order.tax_amount || 0,
    total_amount: order.total_amount,
    pickup_datetime: order.pickup_datetime,
    special_instructions: order.special_instructions,
    arrival_code: order.arrival_code,
    discount_name: order.discount_name,
    item_count: order.item_count || (order.items ? order.items.length : 0),
    created_at: order.created_at || new Date(),
    updated_at: order.updated_at || new Date(),
  };

  // Emit to business (for owner/staff)
  emitToBusiness(order.business_id, 'order:new', eventData);
  
  // Emit to user (tourist who placed order)
  emitToUser(order.user_id, 'order:created', eventData);
}

/**
 * Emit order status update event
 * @param {Object} order - Updated order object
 * @param {string} previousStatus - Previous status for context
 */
export function emitOrderUpdated(order, previousStatus = null) {
  // Send complete order data for display in UI
  const eventData = {
    id: order.id || order.order_id,
    order_number: order.order_number,
    business_id: order.business_id,
    user_id: order.user_id,
    user_email: order.user_email,
    status: order.status,
    previous_status: previousStatus,
    payment_status: order.payment_status,
    payment_method: order.payment_method,
    subtotal: order.subtotal,
    discount_amount: order.discount_amount || 0,
    tax_amount: order.tax_amount || 0,
    total_amount: order.total_amount,
    pickup_datetime: order.pickup_datetime,
    special_instructions: order.special_instructions,
    arrival_code: order.arrival_code,
    discount_name: order.discount_name,
    item_count: order.item_count || (order.items ? order.items.length : 0),
    ready_at: order.ready_at,
    picked_up_at: order.picked_up_at,
    updated_at: order.updated_at || new Date(),
  };

  // Emit to business
  emitToBusiness(order.business_id, 'order:updated', eventData);
  
  // Emit to user
  emitToUser(order.user_id, 'order:updated', eventData);
  
  // Emit to order-specific room if anyone subscribed
  emitToOrder(order.id || order.order_id, 'order:updated', eventData);
}

/**
 * Emit payment status update event
 * @param {Object} payment - Payment object
 * @param {Object} order - Related order object
 */
export function emitPaymentUpdated(payment, order = null) {
  const eventData = {
    payment_id: payment.id || payment.payment_id,
    order_id: payment.payment_for_id,
    status: payment.status,
    payment_method: payment.payment_method,
    amount: payment.amount,
    updated_at: payment.updated_at || new Date(),
    timestamp: new Date()
  };

  if (order) {
    // Emit to business
    emitToBusiness(order.business_id, 'payment:updated', eventData);
    
    // Emit to user
    emitToUser(order.user_id, 'payment:updated', eventData);
  } else if (payment.payer_id) {
    // Fallback: emit to payer only
    emitToUser(payment.payer_id, 'payment:updated', eventData);
  }
}

export default {
  initializeSocket,
  getIO,
  emitToUser,
  emitToBusiness,
  emitToOrder,
  emitNewOrder,
  emitOrderUpdated,
  emitPaymentUpdated
};
