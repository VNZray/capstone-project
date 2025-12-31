/**
 * Refund Service
 * Handles refund eligibility checking and processing
 */
import { sequelize, Order, Booking, Payment, Refund } from '../models/index.js';
import * as paymongoService from './paymongo.service.js';
import * as auditService from './audit.service.js';
import * as notificationService from './notification.service.js';
import logger from '../config/logger.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Refund eligibility window in hours
 */
const REFUND_WINDOW_HOURS = 24;

/**
 * Refundable order statuses
 */
const REFUNDABLE_ORDER_STATUSES = [
  'pending_payment',
  'accepted',
  'preparing',
  'cancelled_by_user',
  'cancelled_by_business',
];

/**
 * Refundable booking statuses
 */
const REFUNDABLE_BOOKING_STATUSES = [
  'Pending',
  'Confirmed',
  'Cancelled',
];

/**
 * Check if an order is eligible for refund
 * @param {string} orderId - Order ID
 * @returns {Promise<Object>} Eligibility result
 */
export async function checkOrderRefundEligibility(orderId) {
  try {
    const order = await Order.findByPk(orderId, {
      include: [{
        model: Payment,
        as: 'payment',
        where: { status: 'paid' },
        required: false,
      }],
    });

    if (!order) {
      return { eligible: false, reason: 'Order not found' };
    }

    // Check if order has a successful payment
    if (!order.payment) {
      return { eligible: false, reason: 'No successful payment found for this order' };
    }

    // Check status
    if (!REFUNDABLE_ORDER_STATUSES.includes(order.status)) {
      return {
        eligible: false,
        reason: `Order status "${order.status}" is not eligible for refund`,
      };
    }

    // Check if already refunded
    const existingRefund = await Refund.findOne({
      where: { payment_id: order.payment.id, status: ['pending', 'processing', 'completed'] },
    });

    if (existingRefund) {
      return {
        eligible: false,
        reason: 'A refund has already been initiated for this order',
        refundId: existingRefund.id,
      };
    }

    // Check refund window
    const paymentDate = new Date(order.payment.paid_at || order.payment.created_at);
    const hoursSincePayment = (Date.now() - paymentDate.getTime()) / (1000 * 60 * 60);

    if (hoursSincePayment > REFUND_WINDOW_HOURS) {
      return {
        eligible: false,
        reason: `Refund window of ${REFUND_WINDOW_HOURS} hours has passed`,
        hoursSincePayment: Math.floor(hoursSincePayment),
      };
    }

    return {
      eligible: true,
      refundableAmount: order.payment.amount,
      paymentId: order.payment.id,
      paymentMethod: order.payment.payment_method,
      paymongoPaymentId: order.payment.paymongo_payment_id,
    };
  } catch (error) {
    logger.error(`Error checking order refund eligibility:`, error);
    throw error;
  }
}

/**
 * Check if a booking is eligible for refund
 * @param {string} bookingId - Booking ID
 * @returns {Promise<Object>} Eligibility result
 */
export async function checkBookingRefundEligibility(bookingId) {
  try {
    const booking = await Booking.findByPk(bookingId, {
      include: [{
        model: Payment,
        as: 'payment',
        where: { status: 'paid' },
        required: false,
      }],
    });

    if (!booking) {
      return { eligible: false, reason: 'Booking not found' };
    }

    if (!booking.payment) {
      return { eligible: false, reason: 'No successful payment found for this booking' };
    }

    if (!REFUNDABLE_BOOKING_STATUSES.includes(booking.status)) {
      return {
        eligible: false,
        reason: `Booking status "${booking.status}" is not eligible for refund`,
      };
    }

    // Check if already refunded
    const existingRefund = await Refund.findOne({
      where: { payment_id: booking.payment.id, status: ['pending', 'processing', 'completed'] },
    });

    if (existingRefund) {
      return {
        eligible: false,
        reason: 'A refund has already been initiated for this booking',
        refundId: existingRefund.id,
      };
    }

    // For bookings, check days until check-in for refund amount
    const checkInDate = new Date(booking.check_in_date);
    const daysUntilCheckIn = Math.ceil((checkInDate - Date.now()) / (1000 * 60 * 60 * 24));

    let refundPercentage = 100;
    let refundReason = 'Full refund';

    if (daysUntilCheckIn < 1) {
      refundPercentage = 0;
      refundReason = 'No refund within 24 hours of check-in';
    } else if (daysUntilCheckIn < 3) {
      refundPercentage = 50;
      refundReason = '50% refund within 3 days of check-in';
    } else if (daysUntilCheckIn < 7) {
      refundPercentage = 75;
      refundReason = '75% refund within 7 days of check-in';
    }

    const refundableAmount = Math.floor(booking.payment.amount * (refundPercentage / 100));

    return {
      eligible: refundPercentage > 0,
      refundableAmount,
      refundPercentage,
      refundReason,
      paymentId: booking.payment.id,
      paymentMethod: booking.payment.payment_method,
      paymongoPaymentId: booking.payment.paymongo_payment_id,
      daysUntilCheckIn,
    };
  } catch (error) {
    logger.error(`Error checking booking refund eligibility:`, error);
    throw error;
  }
}

/**
 * Process a refund for an order
 * @param {string} orderId - Order ID
 * @param {Object} options - Refund options
 * @param {Object} options.actor - User initiating refund
 * @param {string} options.reason - Refund reason
 * @returns {Promise<Object>} Refund result
 */
export async function processOrderRefund(orderId, options = {}) {
  const { actor, reason = 'Customer requested refund' } = options;
  const transaction = await sequelize.transaction();

  try {
    // Check eligibility
    const eligibility = await checkOrderRefundEligibility(orderId);

    if (!eligibility.eligible) {
      throw new Error(eligibility.reason);
    }

    // Create refund record
    const refund = await Refund.create({
      id: uuidv4(),
      payment_id: eligibility.paymentId,
      order_id: orderId,
      amount: eligibility.refundableAmount,
      reason,
      status: 'processing',
      initiated_by: actor?.id || null,
    }, { transaction });

    // Process with PayMongo if applicable
    if (eligibility.paymongoPaymentId) {
      try {
        const paymongoRefund = await paymongoService.createRefund(
          eligibility.paymongoPaymentId,
          eligibility.refundableAmount,
          'requested_by_customer',
          reason
        );

        await refund.update({
          paymongo_refund_id: paymongoRefund.id,
          status: paymongoRefund.attributes.status === 'succeeded' ? 'completed' : 'processing',
        }, { transaction });
      } catch (paymongoError) {
        logger.error('PayMongo refund failed:', paymongoError);
        await refund.update({
          status: 'failed',
          failure_reason: paymongoError.message,
        }, { transaction });
        throw paymongoError;
      }
    } else {
      // Manual refund (e.g., cash payment)
      await refund.update({ status: 'completed' }, { transaction });
    }

    // Update payment status
    await sequelize.query(
      `UPDATE payment SET status = 'refunded', refund_id = ? WHERE id = ?`,
      { replacements: [refund.id, eligibility.paymentId], transaction }
    );

    await transaction.commit();

    // Log audit event
    await auditService.logOrderEvent({
      orderId,
      eventType: auditService.EVENT_TYPES.REFUNDED,
      newValue: 'refunded',
      actor,
      metadata: {
        refundId: refund.id,
        amount: eligibility.refundableAmount,
        reason,
      },
    });

    // Get order for notification
    const order = await Order.findByPk(orderId);
    await notificationService.sendNotification(
      order.user_id,
      'Refund Processed',
      `Your refund of ₱${eligibility.refundableAmount / 100} has been processed.`,
      'refund_processed',
      { refundId: refund.id, orderId, amount: eligibility.refundableAmount }
    );

    logger.info(`Refund processed for order ${orderId}: ₱${eligibility.refundableAmount / 100}`);

    return {
      success: true,
      refundId: refund.id,
      amount: eligibility.refundableAmount,
      status: refund.status,
    };
  } catch (error) {
    await transaction.rollback();
    logger.error(`Refund processing failed for order ${orderId}:`, error);
    throw error;
  }
}

/**
 * Process a refund for a booking
 * @param {string} bookingId - Booking ID
 * @param {Object} options - Refund options
 * @returns {Promise<Object>} Refund result
 */
export async function processBookingRefund(bookingId, options = {}) {
  const { actor, reason = 'Customer requested refund' } = options;
  const transaction = await sequelize.transaction();

  try {
    const eligibility = await checkBookingRefundEligibility(bookingId);

    if (!eligibility.eligible) {
      throw new Error(eligibility.reason);
    }

    const refund = await Refund.create({
      id: uuidv4(),
      payment_id: eligibility.paymentId,
      booking_id: bookingId,
      amount: eligibility.refundableAmount,
      reason: `${reason} (${eligibility.refundReason})`,
      status: 'processing',
      initiated_by: actor?.id || null,
    }, { transaction });

    // Process with PayMongo if applicable
    if (eligibility.paymongoPaymentId) {
      try {
        const paymongoRefund = await paymongoService.createRefund(
          eligibility.paymongoPaymentId,
          eligibility.refundableAmount,
          'requested_by_customer',
          reason
        );

        await refund.update({
          paymongo_refund_id: paymongoRefund.id,
          status: paymongoRefund.attributes.status === 'succeeded' ? 'completed' : 'processing',
        }, { transaction });
      } catch (paymongoError) {
        logger.error('PayMongo refund failed:', paymongoError);
        await refund.update({
          status: 'failed',
          failure_reason: paymongoError.message,
        }, { transaction });
        throw paymongoError;
      }
    } else {
      await refund.update({ status: 'completed' }, { transaction });
    }

    await sequelize.query(
      `UPDATE payment SET status = 'refunded', refund_id = ? WHERE id = ?`,
      { replacements: [refund.id, eligibility.paymentId], transaction }
    );

    await transaction.commit();

    const booking = await Booking.findByPk(bookingId);
    await notificationService.sendNotification(
      booking.user_id,
      'Booking Refund Processed',
      `Your refund of ₱${eligibility.refundableAmount / 100} (${eligibility.refundPercentage}%) has been processed.`,
      'refund_processed',
      { refundId: refund.id, bookingId, amount: eligibility.refundableAmount }
    );

    logger.info(`Refund processed for booking ${bookingId}: ₱${eligibility.refundableAmount / 100}`);

    return {
      success: true,
      refundId: refund.id,
      amount: eligibility.refundableAmount,
      refundPercentage: eligibility.refundPercentage,
      status: refund.status,
    };
  } catch (error) {
    await transaction.rollback();
    logger.error(`Refund processing failed for booking ${bookingId}:`, error);
    throw error;
  }
}

export default {
  checkOrderRefundEligibility,
  checkBookingRefundEligibility,
  processOrderRefund,
  processBookingRefund,
};
