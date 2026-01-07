
import e from "express";
import db from "../db.js";
import { sendPushNotification } from "./expoPushService.js";

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
    console.log("[sendNotification] Called with:", { recipientId, title, type, metadata });

    // Extract related_id and related_type from metadata or derive from type
    // Support refund metadata: refundForId maps to order_id or booking_id
    let relatedId = metadata.order_id || metadata.payment_id || metadata.booking_id;
    let relatedType = metadata.booking_id ? 'service_booking' : (metadata.order_id ? 'order' : 'service_booking');

    // Handle refund notifications - use refundForId as the related resource
    if (!relatedId && metadata.refundForId) {
      relatedId = metadata.refundForId;
      relatedType = metadata.refundFor === 'booking' ? 'service_booking' : 'order';
    }

    // Fallback for refund notifications - use refundId if nothing else available
    if (!relatedId && metadata.refundId) {
      relatedId = metadata.refundId;
      relatedType = 'refund';
    }

    // Map generic types to notification_type enum
    const notificationTypeMap = {
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
      "booking_in_progress": "booking_in_progress",
      "booking_no_show": "booking_no_show"
    };

    const notificationType = notificationTypeMap[type] || 'order_created';

    console.log("[sendNotification] Inserting notification:", { recipientId, notificationType, relatedId, relatedType, title });

    await db.query(
      `INSERT INTO notification (id, user_id, notification_type, related_id, related_type, title, message, metadata, is_read, created_at)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, 0, NOW())`,
      [recipientId, notificationType, relatedId, relatedType, title, message, JSON.stringify(metadata)]
    );

    console.log(`[sendNotification] SUCCESS - Notification sent to user ${recipientId}: ${title}`);

    // Send push notification
    if (title === 'Booking Confirmed') {
        return; // Skip push for booking confirmed to avoid duplicates
    } else {
      await sendPushNotification(recipientId, title, message, metadata, notificationType);
    }
  } catch (error) {
    console.error('[sendNotification] FAILED - Error creating notification:', error);
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
      `SELECT u.id, u.email, u.email AS name
       FROM business b
       JOIN user u ON u.id = b.owner_id
       WHERE b.id = ?
       UNION
       SELECT u.id, u.email, u.email AS name
       FROM staff s
       JOIN user u ON u.id = s.user_id
       WHERE s.business_id = ?`,
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
    console.log('[notifyPaymentUpdated] Sending payment notification:', { user_id: order.user_id, status: payment.status, title });
    // Use appropriate notification type based on payment status
    const notificationType = payment.status === 'paid' ? 'payment_received' :
                            payment.status === 'failed' ? 'payment_failed' :
                            'payment_updated';
    await sendNotification(order.user_id, title, message, notificationType, metadata);

    console.log('[notifyPaymentUpdated] ✅ Payment notification sent successfully');
  } catch (error) {
    console.error('[notifyPaymentUpdated] Failed to notify about payment update:', error);
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

/**
 * Notify user about booking confirmation
 * @param {Object} booking - Booking object
 */
export async function notifyBookingConfirmed(booking) {
  try {
    console.log('[notifyBookingConfirmed] Sending booking confirmation:', { user_id: booking.user_id, booking_id: booking.id });
    const title = `Booking Confirmed`;
    const message = `Your booking at ${booking.business_name || 'the accommodation'} has been confirmed!`;
    const metadata = {
      booking_id: booking.id,
      business_id: booking.business_id,
      business_name: booking.business_name,
      check_in: booking.check_in_date,
      check_out: booking.check_out_date
    };

    await sendNotification(booking.user_id, title, message, 'booking_confirmed', metadata);

    console.log('[notifyBookingConfirmed] ✅ Booking confirmation sent successfully');
  } catch (error) {
    console.error('[notifyBookingConfirmed] Failed to notify about booking confirmation:', error);
  }
}

/**
 * Notify user about booking cancellation
 * @param {Object} booking - Booking object
 * @param {string} cancelledBy - Who cancelled (user or business)
 */
export async function notifyBookingCancelled(booking, cancelledBy = 'business') {
  try {
    console.log('[notifyBookingCancelled] Sending cancellation notification:', { user_id: booking.user_id, booking_id: booking.id, cancelledBy });
    const title = `Booking Cancelled`;
    const message = cancelledBy === 'user'
      ? 'Your booking has been cancelled successfully.'
      : `Your booking at ${booking.business_name || 'the accommodation'} has been cancelled by the property.`;
    const metadata = {
      booking_id: booking.id,
      business_id: booking.business_id,
      business_name: booking.business_name,
      cancelled_by: cancelledBy
    };

    await sendNotification(booking.user_id, title, message, 'booking_cancelled', metadata);

    console.log('[notifyBookingCancelled] ✅ Cancellation notification sent successfully');
  } catch (error) {
    console.error('[notifyBookingCancelled] Failed to notify about booking cancellation:', error);
  }
}

/**
 * Notify user about booking reminder (1 day before check-in)
 * @param {Object} booking - Booking object
 */
export async function notifyBookingReminder(booking) {
  try {
    const title = `Booking Reminder`;
    const message = `Your check-in at ${booking.business_name || 'the accommodation'} is tomorrow!`;
    const metadata = {
      booking_id: booking.id,
      business_id: booking.business_id,
      check_in: booking.check_in_date
    };

    await sendNotification(booking.user_id, title, message, 'booking_reminder', metadata);
  } catch (error) {
    console.error('Failed to send booking reminder:', error);
  }
}

/**
 * Notify user about refund processed
 * @param {Object} payment - Payment object
 * @param {Object} booking - Booking/Order object
 * @param {string} type - 'booking' or 'order'
 */
export async function notifyRefundProcessed(payment, booking, type = 'booking') {
  try {
    const title = `Refund Processed`;
    const message = `Your refund of ₱${payment.amount} has been processed successfully.`;
    const metadata = {
      payment_id: payment.id,
      amount: payment.amount,
      type: type,
      related_id: booking.id
    };

    await sendNotification(booking.user_id, title, message, 'refund_processed', metadata);

  } catch (error) {
    console.error('Failed to notify about refund:', error);
  }
}

/**
 * Notify business about new booking
 * @param {Object} booking - Booking object
 */
export async function notifyBusinessNewBooking(booking) {
  try {
    const [businessUsers] = await db.query(
      `SELECT u.id, u.email
       FROM business b
       JOIN user u ON u.id = b.owner_id
       WHERE b.id = ?
       UNION
       SELECT u.id, u.email
       FROM staff s
       JOIN user u ON u.id = s.user_id
       WHERE s.business_id = ?`,
      [booking.business_id, booking.business_id]
    );

    const title = `New Booking Request`;
    const message = `You have a new booking request for ${booking.room_number || 'a room'}.`;
    const metadata = {
      booking_id: booking.id,
      business_id: booking.business_id,
      check_in: booking.check_in_date,
      check_out: booking.check_out_date
    };

    for (const user of businessUsers) {
      await sendNotification(user.id, title, message, 'booking_created', metadata);

    }
  } catch (error) {
    console.error('Failed to notify business about new booking:', error);
  }
}

export default {
  sendNotification,
  notifyBusinessNewOrder,
  notifyTouristOrderUpdated,
  notifyPaymentUpdated,


};
