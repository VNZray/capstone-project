
import db from "../db.js";

/**
 * Notification Helper Service
 * Triggers push notifications and email notifications for order events
 * Integrates with existing notification table and controller
 */

/**
 * Send notification to user(s)
 * @param {string} recipientId - User ID to receive notification
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} type - Notification type (order_new, order_updated, payment_updated, etc.)
 * @param {Object} metadata - Additional data (order_id, business_id, etc.)
 */
export async function sendNotification(recipientId, title, message, type, metadata = {}) {
  try {
    // Extract related_id and related_type from metadata or derive from type
    const relatedId = metadata.order_id || metadata.payment_id || metadata.booking_id;
    const relatedType = metadata.order_id ? 'order' : 'service_booking';
    
    // Map generic types to notification_type enum
    const notificationTypeMap = {
      'order_new': 'order_created',
      'order_created': 'order_created',
      'order_updated': 'order_confirmed',
      'order_cancelled': 'order_cancelled',
      'payment_updated': 'payment_received'
    };
    
    const notificationType = notificationTypeMap[type] || 'order_created';
    
    await db.query(
      `INSERT INTO notification (id, user_id, notification_type, related_id, related_type, title, message, metadata, is_read, created_at)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, 0, NOW())`,
      [recipientId, notificationType, relatedId, relatedType, title, message, JSON.stringify(metadata)]
    );
    
    console.log(`Notification sent to user ${recipientId}: ${title}`);
  } catch (error) {
    console.error('Failed to create notification:', error);
    // Don't throw - notifications should not break order flow
  }
}

/**
 * Notify business about new order
 * @param {Object} order - Order object
 */
export async function notifyBusinessNewOrder(order) {
  try {
    // Get business owner and staff
    const [businessUsers] = await db.query(
      `SELECT u.id, u.email, u.name 
       FROM business b
       JOIN user u ON u.id = b.owner_id
       WHERE b.id = ?
       UNION
       SELECT u.id, u.email, u.name
       FROM staff s
       JOIN user u ON u.id = s.user_id
       WHERE s.business_id = ? AND s.status = 'active'`,
      [order.business_id, order.business_id]
    );

    const title = `New Order #${order.order_number}`;
    const message = `You have received a new order for ₱${order.total_amount}. Please review and accept.`;
    const metadata = {
      order_id: order.id || order.order_id,
      order_number: order.order_number,
      amount: order.total_amount,
      business_id: order.business_id
    };

    for (const user of businessUsers) {
      await sendNotification(user.id, title, message, 'order_new', metadata);
      
      // TODO: Send email notification
      // await sendEmail(user.email, title, message, metadata);
      
      // TODO: Send push notification
      // await sendPushNotification(user.id, title, message, metadata);
    }
  } catch (error) {
    console.error('Failed to notify business about new order:', error);
  }
}

/**
 * Notify tourist about order status change
 * @param {Object} order - Order object
 * @param {string} previousStatus - Previous order status
 */
export async function notifyTouristOrderUpdated(order, previousStatus) {
  const statusMessages = {
    accepted: 'Your order has been accepted by the business.',
    preparing: 'Your order is now being prepared.',
    ready_for_pickup: 'Your order is ready for pickup! Please head to the store.',
    picked_up: 'Order completed. Thank you for your purchase!',
    cancelled_by_business: 'Your order has been cancelled by the business.',
    cancelled_by_user: 'Your order has been cancelled.',
    failed_payment: 'Payment failed for your order. Please try again.'
  };

  const title = `Order #${order.order_number} ${order.status.replace(/_/g, ' ').toUpperCase()}`;
  const message = statusMessages[order.status] || `Your order status has changed to ${order.status}.`;
  const metadata = {
    order_id: order.id || order.order_id,
    order_number: order.order_number,
    status: order.status,
    previous_status: previousStatus,
    business_id: order.business_id
  };

  try {
    await sendNotification(order.user_id, title, message, 'order_updated', metadata);
    
    // TODO: Send push notification to tourist mobile device
    // await sendPushNotification(order.user_id, title, message, metadata);
  } catch (error) {
    console.error('Failed to notify tourist about order update:', error);
  }
}

/**
 * Notify about payment status change
 * @param {Object} payment - Payment object
 * @param {Object} order - Related order object
 */
export async function notifyPaymentUpdated(payment, order) {
  const statusMessages = {
    paid: 'Payment successful! Your order will be processed.',
    failed: 'Payment failed. Please try again or choose a different payment method.',
    refunded: 'Your payment has been refunded.'
  };

  const title = `Payment ${payment.status.toUpperCase()}`;
  const message = statusMessages[payment.status] || `Payment status: ${payment.status}`;
  const metadata = {
    payment_id: payment.id || payment.payment_id,
    order_id: order.id || order.order_id,
    order_number: order.order_number,
    amount: payment.amount,
    status: payment.status
  };

  try {
    // Notify tourist
    await sendNotification(order.user_id, title, message, 'payment_updated', metadata);
    
    // TODO: Send push notification
    // await sendPushNotification(order.user_id, title, message, metadata);
  } catch (error) {
    console.error('Failed to notify about payment update:', error);
  }
}

/**
 * Trigger notifications for new order
 * Combines Socket.IO + DB notification + Push/Email
 * @param {Object} order - Order object
 */
export async function triggerNewOrderNotifications(order) {
  // Notify business
  await notifyBusinessNewOrder(order);
  
  // Notify tourist (confirmation)
  const title = `Order Placed #${order.order_number}`;
  const message = `Your order has been placed successfully. Total: ₱${order.total_amount}`;
  const metadata = {
    order_id: order.id || order.order_id,
    order_number: order.order_number,
    amount: order.total_amount,
    arrival_code: order.arrival_code
  };
  
  await sendNotification(order.user_id, title, message, 'order_created', metadata);
}

/**
 * Trigger notifications for order status update
 * @param {Object} order - Updated order object
 * @param {string} previousStatus - Previous status
 */
export async function triggerOrderUpdateNotifications(order, previousStatus) {
  await notifyTouristOrderUpdated(order, previousStatus);
  
  // Optionally notify business for certain transitions
  if (order.status === 'cancelled_by_user') {
    // Notify business that user cancelled
    const title = `Order Cancelled #${order.order_number}`;
    const message = `Customer cancelled order #${order.order_number}`;
    const metadata = { order_id: order.id, order_number: order.order_number };
    
    const [businessOwner] = await db.query(
      `SELECT owner_id FROM business WHERE id = ?`,
      [order.business_id]
    );
    
    if (businessOwner && businessOwner.length > 0) {
      await sendNotification(businessOwner[0].owner_id, title, message, 'order_cancelled', metadata);
    }
  }
}

/**
 * Trigger notifications for payment update
 * @param {Object} payment - Payment object
 * @param {Object} order - Order object
 */
export async function triggerPaymentUpdateNotifications(payment, order) {
  await notifyPaymentUpdated(payment, order);
}

export default {
  sendNotification,
  notifyBusinessNewOrder,
  notifyTouristOrderUpdated,
  notifyPaymentUpdated,
  triggerNewOrderNotifications,
  triggerOrderUpdateNotifications,
  triggerPaymentUpdateNotifications
};
