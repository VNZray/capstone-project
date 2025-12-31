/**
 * Abandoned Order Cleanup Service
 * Cleans up orders/bookings that were abandoned before payment
 */
import { sequelize, Order, Booking, Payment, OrderItem } from '../models/index.js';
import { Op } from 'sequelize';
import * as auditService from './audit.service.js';
import * as socketService from './socket.service.js';
import logger from '../config/logger.js';

let cleanupInterval = null;

/**
 * Abandoned order timeout in minutes
 */
const ORDER_TIMEOUT_MINUTES = 30;

/**
 * Abandoned booking timeout in minutes
 */
const BOOKING_TIMEOUT_MINUTES = 60;

/**
 * Clean up abandoned orders
 * @returns {Promise<Object>} Cleanup results
 */
export async function cleanupAbandonedOrders() {
  const cutoffTime = new Date(Date.now() - ORDER_TIMEOUT_MINUTES * 60 * 1000);

  const transaction = await sequelize.transaction();

  try {
    // Find abandoned orders (pending_payment and older than cutoff)
    const abandonedOrders = await Order.findAll({
      where: {
        status: 'pending_payment',
        created_at: { [Op.lt]: cutoffTime },
      },
      include: [{
        model: Payment,
        as: 'payment',
        where: {
          status: { [Op.in]: ['pending', 'awaiting_action'] },
        },
        required: false,
      }],
      transaction,
    });

    let cleanedCount = 0;

    for (const order of abandonedOrders) {
      try {
        // Restore stock
        await restoreOrderStock(order.id, transaction);

        // Update order status
        await order.update({
          status: 'cancelled_by_user',
          cancellation_reason: 'Payment timeout - order abandoned',
        }, { transaction });

        // Update payment if exists
        if (order.payment) {
          await order.payment.update({
            status: 'expired',
          }, { transaction });
        }

        // Log audit event
        await auditService.logOrderEvent({
          orderId: order.id,
          eventType: 'cancelled',
          oldValue: 'pending_payment',
          newValue: 'cancelled_by_user',
          actor: { role: 'system' },
          metadata: { reason: 'payment_timeout' },
        });

        cleanedCount++;

        logger.debug(`Cleaned up abandoned order ${order.id}`);
      } catch (orderError) {
        logger.error(`Failed to cleanup order ${order.id}:`, orderError);
      }
    }

    await transaction.commit();

    if (cleanedCount > 0) {
      logger.info(`Cleaned up ${cleanedCount} abandoned orders`);
    }

    return { orders: cleanedCount };
  } catch (error) {
    await transaction.rollback();
    logger.error('Failed to cleanup abandoned orders:', error);
    return { orders: 0, error: error.message };
  }
}

/**
 * Clean up abandoned bookings
 * @returns {Promise<Object>} Cleanup results
 */
export async function cleanupAbandonedBookings() {
  const cutoffTime = new Date(Date.now() - BOOKING_TIMEOUT_MINUTES * 60 * 1000);

  const transaction = await sequelize.transaction();

  try {
    // Find abandoned bookings
    const abandonedBookings = await Booking.findAll({
      where: {
        status: 'Pending',
        payment_status: { [Op.in]: ['Pending', 'Unpaid'] },
        created_at: { [Op.lt]: cutoffTime },
      },
      include: [{
        model: Payment,
        as: 'payment',
        where: {
          status: { [Op.in]: ['pending', 'awaiting_action'] },
        },
        required: false,
      }],
      transaction,
    });

    let cleanedCount = 0;

    for (const booking of abandonedBookings) {
      try {
        // Release room inventory
        await releaseRoomInventory(booking, transaction);

        // Update booking status
        await booking.update({
          status: 'Cancelled',
          payment_status: 'Cancelled',
          cancellation_reason: 'Payment timeout - booking abandoned',
        }, { transaction });

        // Update payment if exists
        if (booking.payment) {
          await booking.payment.update({
            status: 'expired',
          }, { transaction });
        }

        // Log audit event
        await auditService.logBookingEvent({
          bookingId: booking.id,
          eventType: 'cancelled',
          oldValue: 'Pending',
          newValue: 'Cancelled',
          actor: { role: 'system' },
          metadata: { reason: 'payment_timeout' },
        });

        cleanedCount++;

        logger.debug(`Cleaned up abandoned booking ${booking.id}`);
      } catch (bookingError) {
        logger.error(`Failed to cleanup booking ${booking.id}:`, bookingError);
      }
    }

    await transaction.commit();

    if (cleanedCount > 0) {
      logger.info(`Cleaned up ${cleanedCount} abandoned bookings`);
    }

    return { bookings: cleanedCount };
  } catch (error) {
    await transaction.rollback();
    logger.error('Failed to cleanup abandoned bookings:', error);
    return { bookings: 0, error: error.message };
  }
}

/**
 * Restore stock for an order
 * @param {string} orderId - Order ID
 * @param {Transaction} transaction - Sequelize transaction
 */
async function restoreOrderStock(orderId, transaction) {
  const items = await OrderItem.findAll({
    where: { order_id: orderId },
    transaction,
  });

  for (const item of items) {
    await sequelize.query(
      `UPDATE product SET stock_quantity = stock_quantity + ? WHERE id = ?`,
      { replacements: [item.quantity, item.product_id], transaction }
    );
  }
}

/**
 * Release room inventory for a booking
 * @param {Object} booking - Booking object
 * @param {Transaction} transaction - Sequelize transaction
 */
async function releaseRoomInventory(booking, transaction) {
  // Update room availability back
  // This depends on your room inventory management logic
  if (booking.room_id) {
    await sequelize.query(
      `UPDATE room_availability
       SET available_quantity = available_quantity + 1
       WHERE room_id = ? AND date BETWEEN ? AND ?`,
      {
        replacements: [
          booking.room_id,
          booking.check_in_date,
          booking.check_out_date,
        ],
        transaction,
      }
    );
  }
}

/**
 * Run full cleanup
 * @returns {Promise<Object>} Cleanup results
 */
export async function runCleanup() {
  const orderResults = await cleanupAbandonedOrders();
  const bookingResults = await cleanupAbandonedBookings();

  return {
    orders: orderResults.orders,
    bookings: bookingResults.bookings,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Start cleanup scheduler
 * @param {number} intervalMinutes - Interval in minutes
 */
export function startCleanupScheduler(intervalMinutes = 5) {
  if (cleanupInterval) {
    logger.warn('Abandoned order cleanup scheduler already running');
    return;
  }

  const intervalMs = intervalMinutes * 60 * 1000;

  // Run immediately
  runCleanup();

  // Schedule periodic cleanup
  cleanupInterval = setInterval(runCleanup, intervalMs);

  logger.info(`Abandoned order cleanup scheduler started (interval: ${intervalMinutes} minutes)`);
}

/**
 * Stop cleanup scheduler
 */
export function stopCleanupScheduler() {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
    logger.info('Abandoned order cleanup scheduler stopped');
  }
}

/**
 * Get cleanup statistics
 * @returns {Promise<Object>}
 */
export async function getCleanupStats() {
  try {
    const orderCutoff = new Date(Date.now() - ORDER_TIMEOUT_MINUTES * 60 * 1000);
    const bookingCutoff = new Date(Date.now() - BOOKING_TIMEOUT_MINUTES * 60 * 1000);

    const [orderStats] = await sequelize.query(
      `SELECT COUNT(*) as pending_orders
       FROM \`order\`
       WHERE status = 'pending_payment' AND created_at < ?`,
      { replacements: [orderCutoff], type: sequelize.QueryTypes.SELECT }
    );

    const [bookingStats] = await sequelize.query(
      `SELECT COUNT(*) as pending_bookings
       FROM booking
       WHERE status = 'Pending' AND payment_status IN ('Pending', 'Unpaid') AND created_at < ?`,
      { replacements: [bookingCutoff], type: sequelize.QueryTypes.SELECT }
    );

    return {
      pendingAbandonedOrders: orderStats?.pending_orders || 0,
      pendingAbandonedBookings: bookingStats?.pending_bookings || 0,
      orderTimeoutMinutes: ORDER_TIMEOUT_MINUTES,
      bookingTimeoutMinutes: BOOKING_TIMEOUT_MINUTES,
    };
  } catch (error) {
    logger.error('Failed to get cleanup stats:', error);
    return {
      pendingAbandonedOrders: 0,
      pendingAbandonedBookings: 0,
    };
  }
}

export default {
  cleanupAbandonedOrders,
  cleanupAbandonedBookings,
  runCleanup,
  startCleanupScheduler,
  stopCleanupScheduler,
  getCleanupStats,
};
