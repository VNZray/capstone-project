/**
 * Socket Service
 * Real-time communication via Socket.IO
 */
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import logger from '../config/logger.js';
import { Staff, Business, User, UserRole } from '../models/index.js';

let io = null;

/**
 * Verify if a user has access to a business
 * @param {string} userId - User ID
 * @param {string} businessId - Business ID
 * @returns {Promise<boolean>}
 */
async function verifyBusinessAccess(userId, businessId) {
  try {
    // Check if user is the business owner
    const business = await Business.findOne({
      where: { id: businessId },
      include: [{
        model: User,
        as: 'owner',
        where: { id: userId },
        required: false,
      }],
    });

    if (business?.owner) return true;

    // Check if user is staff at the business
    const staff = await Staff.findOne({
      where: { business_id: businessId, user_id: userId, status: 'active' },
    });

    if (staff) return true;

    // Check if user is Admin
    const user = await User.findByPk(userId, {
      include: [{
        model: UserRole,
        as: 'role',
        where: { role_name: 'Admin' },
        required: false,
      }],
    });

    if (user?.role) return true;

    return false;
  } catch (error) {
    logger.error('Error verifying business access:', error);
    return false;
  }
}

/**
 * Initialize Socket.IO server
 * @param {Object} httpServer - HTTP server instance
 * @returns {Server} Socket.IO server instance
 */
export function initializeSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: config.cors.origin,
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // JWT Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token ||
                  socket.handshake.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, config.jwt.accessSecret, {
        algorithms: [config.jwt.algorithm],
      });
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      socket.businessId = decoded.business_id;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    logger.debug(`Socket connected: ${socket.id} (User: ${socket.userId}, Role: ${socket.userRole})`);

    // Join user-specific room
    socket.join(`user:${socket.userId}`);

    // Join business room if owner/staff
    if (['Business Owner', 'Manager', 'Staff'].includes(socket.userRole) && socket.businessId) {
      socket.join(`business:${socket.businessId}`);
    }

    // Handle business room join
    socket.on('join:business', async (data) => {
      const { businessId } = data;
      if (!businessId) return;

      const hasAccess = await verifyBusinessAccess(socket.userId, businessId);
      if (!hasAccess) {
        socket.emit('error', {
          message: 'Access denied',
          code: 'BUSINESS_ACCESS_DENIED',
        });
        return;
      }

      socket.join(`business:${businessId}`);
      logger.debug(`Socket ${socket.id} joined business room: ${businessId}`);
    });

    socket.on('leave:business', (data) => {
      const { businessId } = data;
      if (businessId) {
        socket.leave(`business:${businessId}`);
        logger.debug(`Socket ${socket.id} left business room: ${businessId}`);
      }
    });

    // Handle user room join
    socket.on('join:user', (data) => {
      const { userId } = data;
      if (!userId) return;

      // Users can only join their own room
      if (userId !== socket.userId) {
        socket.emit('error', {
          message: 'Access denied',
          code: 'USER_ROOM_ACCESS_DENIED',
        });
        return;
      }

      socket.join(`user:${userId}`);
    });

    socket.on('disconnect', () => {
      logger.debug(`Socket disconnected: ${socket.id}`);
    });
  });

  logger.info('Socket.IO initialized');
  return io;
}

/**
 * Get Socket.IO instance
 * @returns {Server|null}
 */
export function getIO() {
  return io;
}

/**
 * Emit event to a specific user
 * @param {string} userId - User ID
 * @param {string} event - Event name
 * @param {Object} data - Event data
 */
export function emitToUser(userId, event, data) {
  if (!io) {
    logger.warn('Socket.IO not initialized');
    return;
  }
  io.to(`user:${userId}`).emit(event, data);
}

/**
 * Emit event to a business room
 * @param {string} businessId - Business ID
 * @param {string} event - Event name
 * @param {Object} data - Event data
 */
export function emitToBusiness(businessId, event, data) {
  if (!io) {
    logger.warn('Socket.IO not initialized');
    return;
  }
  io.to(`business:${businessId}`).emit(event, data);
}

/**
 * Emit new order notification
 * @param {Object} order - Order object
 */
export function emitNewOrder(order) {
  emitToBusiness(order.business_id, 'order:new', {
    orderId: order.id,
    orderNumber: order.order_number,
    totalAmount: order.total_amount,
    status: order.status,
  });
}

/**
 * Emit order status update
 * @param {Object} order - Order object
 * @param {string} previousStatus - Previous status
 */
export function emitOrderStatusUpdate(order, previousStatus) {
  // Notify business
  emitToBusiness(order.business_id, 'order:updated', {
    orderId: order.id,
    orderNumber: order.order_number,
    status: order.status,
    previousStatus,
  });

  // Notify customer
  emitToUser(order.user_id, 'order:updated', {
    orderId: order.id,
    orderNumber: order.order_number,
    status: order.status,
    previousStatus,
  });
}

/**
 * Emit booking status update
 * @param {Object} booking - Booking object
 * @param {string} previousStatus - Previous status
 */
export function emitBookingStatusUpdate(booking, previousStatus) {
  // Notify business
  emitToBusiness(booking.business_id, 'booking:updated', {
    bookingId: booking.id,
    referenceNumber: booking.reference_number,
    status: booking.status,
    previousStatus,
  });

  // Notify customer
  emitToUser(booking.user_id, 'booking:updated', {
    bookingId: booking.id,
    referenceNumber: booking.reference_number,
    status: booking.status,
    previousStatus,
  });
}

/**
 * Emit new notification
 * @param {string} userId - User ID
 * @param {Object} notification - Notification data
 */
export function emitNotification(userId, notification) {
  emitToUser(userId, 'notification:new', notification);
}

export default {
  initializeSocket,
  getIO,
  emitToUser,
  emitToBusiness,
  emitNewOrder,
  emitOrderStatusUpdate,
  emitBookingStatusUpdate,
  emitNotification,
};
