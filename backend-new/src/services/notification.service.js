/**
 * Notification Helper Service
 * Triggers push and email notifications for various events
 */
import { sequelize } from '../models/index.js';
import { v4 as uuidv4 } from 'uuid';
import * as expoPushService from './expo-push.service.js';
import * as socketService from './socket.service.js';
import logger from '../config/logger.js';

/**
 * Notification type mapping
 */
const NOTIFICATION_TYPE_MAP = {
  'order_new': 'order_created',
  'order_created': 'order_created',
  'order_updated': 'order_confirmed',
  'order_cancelled': 'order_cancelled',
  'payment_updated': 'payment_received',
  'payment_received': 'payment_received',
  'payment_failed': 'payment_failed',
  'refund_processed': 'refund_processed',
  'booking_created': 'booking_created',
  'booking_completed': 'booking_completed',
  'booking_confirmed': 'booking_confirmed',
  'booking_cancelled': 'booking_cancelled',
  'booking_reminder': 'booking_reminder',
  'booking_in_progress': 'booking_in_progress',
  'booking_no_show': 'booking_no_show',
};

/**
 * Send notification to a user
 * @param {string} recipientId - User ID
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} type - Notification type
 * @param {Object} metadata - Additional data
 */
export async function sendNotification(recipientId, title, message, type, metadata = {}) {
  try {
    logger.debug(`Sending notification to user ${recipientId}: ${title}`);

    // Determine related entity
    let relatedId = metadata.order_id || metadata.payment_id || metadata.booking_id;
    let relatedType = metadata.booking_id ? 'booking' : (metadata.order_id ? 'order' : 'payment');

    // Handle refund notifications
    if (!relatedId && metadata.refundForId) {
      relatedId = metadata.refundForId;
      relatedType = metadata.refundFor === 'booking' ? 'booking' : 'order';
    }

    if (!relatedId && metadata.refundId) {
      relatedId = metadata.refundId;
      relatedType = 'refund';
    }

    const notificationType = NOTIFICATION_TYPE_MAP[type] || 'order_created';

    // Insert notification
    await sequelize.query(
      `INSERT INTO notification (id, user_id, notification_type, related_id, related_type, title, message, metadata, is_read, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, NOW())`,
      {
        replacements: [
          uuidv4(),
          recipientId,
          notificationType,
          relatedId,
          relatedType,
          title,
          message,
          JSON.stringify(metadata),
        ],
      }
    );

    logger.debug(`Notification saved for user ${recipientId}`);

    // Emit via socket
    socketService.emitNotification(recipientId, { title, message, type: notificationType, metadata });

    // Send push notification
    await expoPushService.sendPushNotification(recipientId, title, message, metadata, notificationType);
  } catch (error) {
    logger.error('Failed to send notification:', error);
    // Don't throw - notifications should not break main flow
  }
}

/**
 * Notify business about new order
 * @param {Object} order - Order object
 */
export async function notifyBusinessNewOrder(order) {
  try {
    // Get business owner and staff
    const [businessUsers] = await sequelize.query(
      `SELECT DISTINCT u.id
       FROM user u
       LEFT JOIN business b ON b.owner_id = u.id
       LEFT JOIN staff s ON s.user_id = u.id
       WHERE b.id = ? OR s.business_id = ?`,
      { replacements: [order.business_id, order.business_id] }
    );

    const title = `New Order #${order.order_number}`;
    const message = `You have received a new order for ₱${order.total_amount}. Please review and accept.`;
    const metadata = {
      order_id: order.id,
      order_number: order.order_number,
      amount: order.total_amount,
      business_id: order.business_id,
    };

    for (const user of businessUsers) {
      await sendNotification(user.id, title, message, 'order_new', metadata);
    }
  } catch (error) {
    logger.error('Failed to notify business about new order:', error);
  }
}

/**
 * Notify tourist about order status change
 * @param {Object} order - Order object
 * @param {string} previousStatus - Previous status
 */
export async function notifyTouristOrderUpdated(order, previousStatus) {
  const statusMessages = {
    accepted: 'Your order has been accepted by the business.',
    preparing: 'Your order is now being prepared.',
    ready_for_pickup: 'Your order is ready for pickup!',
    picked_up: 'Order completed. Thank you!',
    cancelled_by_business: 'Your order has been cancelled by the business.',
    cancelled_by_user: 'Your order has been cancelled.',
    failed_payment: 'Payment failed for your order.',
  };

  const title = `Order #${order.order_number} ${order.status.replace(/_/g, ' ').toUpperCase()}`;
  const message = statusMessages[order.status] || `Order status: ${order.status}`;
  const metadata = {
    order_id: order.id,
    order_number: order.order_number,
    status: order.status,
    previous_status: previousStatus,
    business_id: order.business_id,
  };

  try {
    await sendNotification(order.user_id, title, message, 'order_updated', metadata);
  } catch (error) {
    logger.error('Failed to notify tourist about order update:', error);
  }
}

/**
 * Notify about payment status change
 * @param {Object} payment - Payment object
 * @param {Object} order - Related order/booking object
 */
export async function notifyPaymentUpdated(payment, order) {
  const statusMessages = {
    paid: 'Payment successful! Your order will be processed.',
    failed: 'Payment failed. Please try again.',
    refunded: 'Your payment has been refunded.',
  };

  const title = `Payment ${payment.status.toUpperCase()}`;
  const message = statusMessages[payment.status] || `Payment status: ${payment.status}`;
  const metadata = {
    payment_id: payment.id,
    order_id: order.id,
    order_number: order.order_number,
    amount: payment.amount,
    status: payment.status,
  };

  try {
    const notificationType = payment.status === 'paid' ? 'payment_received' :
                            payment.status === 'failed' ? 'payment_failed' :
                            'payment_updated';
    await sendNotification(order.user_id, title, message, notificationType, metadata);
  } catch (error) {
    logger.error('Failed to notify about payment update:', error);
  }
}

/**
 * Notify business about new booking
 * @param {Object} booking - Booking object
 */
export async function notifyBusinessNewBooking(booking) {
  try {
    const [businessUsers] = await sequelize.query(
      `SELECT DISTINCT u.id
       FROM user u
       LEFT JOIN business b ON b.owner_id = u.id
       LEFT JOIN staff s ON s.user_id = u.id
       WHERE b.id = ? OR s.business_id = ?`,
      { replacements: [booking.business_id, booking.business_id] }
    );

    const title = `New Booking #${booking.reference_number}`;
    const message = `You have received a new booking request.`;
    const metadata = {
      booking_id: booking.id,
      reference_number: booking.reference_number,
      business_id: booking.business_id,
    };

    for (const user of businessUsers) {
      await sendNotification(user.id, title, message, 'booking_created', metadata);
    }
  } catch (error) {
    logger.error('Failed to notify business about new booking:', error);
  }
}

/**
 * Notify tourist about booking status change
 * @param {Object} booking - Booking object
 * @param {string} previousStatus - Previous status
 */
export async function notifyTouristBookingUpdated(booking, previousStatus) {
  const statusMessages = {
    Confirmed: 'Your booking has been confirmed!',
    CheckedIn: 'You have been checked in.',
    CheckedOut: 'Thank you for your stay!',
    Cancelled: 'Your booking has been cancelled.',
    NoShow: 'You were marked as no-show.',
    Refunded: 'Your booking has been refunded.',
  };

  const title = `Booking #${booking.reference_number} ${booking.status}`;
  const message = statusMessages[booking.status] || `Booking status: ${booking.status}`;
  const metadata = {
    booking_id: booking.id,
    reference_number: booking.reference_number,
    status: booking.status,
    previous_status: previousStatus,
    business_id: booking.business_id,
  };

  try {
    await sendNotification(booking.user_id, title, message, `booking_${booking.status.toLowerCase()}`, metadata);
  } catch (error) {
    logger.error('Failed to notify tourist about booking update:', error);
  }
}

export default {
  sendNotification,
  notifyBusinessNewOrder,
  notifyTouristOrderUpdated,
  notifyPaymentUpdated,
  notifyBusinessNewBooking,
  notifyTouristBookingUpdated,
};
