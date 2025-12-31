/**
 * Payment Fulfillment Service
 * Handles payment completion and order/booking fulfillment
 */
import { sequelize, Order, Booking, Payment, OrderItem } from '../models/index.js';
import * as orderTransitionService from './order-transition.service.js';
import * as auditService from './audit.service.js';
import * as notificationService from './notification.service.js';
import * as socketService from './socket.service.js';
import logger from '../config/logger.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Fulfill a payment - mark as paid and update related order/booking
 * @param {string} paymentId - Payment ID
 * @param {Object} paymentData - Payment data from PayMongo
 * @returns {Promise<Object>} Fulfillment result
 */
export async function fulfillPayment(paymentId, paymentData = {}) {
  const transaction = await sequelize.transaction();

  try {
    const payment = await Payment.findByPk(paymentId, {
      transaction,
      lock: true,
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    // Check if already fulfilled
    if (payment.status === 'paid') {
      logger.warn(`Payment ${paymentId} already fulfilled, skipping`);
      await transaction.commit();
      return { success: true, alreadyFulfilled: true };
    }

    // Update payment status
    await payment.update({
      status: 'paid',
      paid_at: new Date(),
      paymongo_payment_id: paymentData.paymongo_payment_id || payment.paymongo_payment_id,
      payment_method: paymentData.payment_method || payment.payment_method,
    }, { transaction });

    let result = { success: true, paymentId };

    // Handle order fulfillment
    if (payment.order_id) {
      result = await fulfillOrderPayment(payment, transaction);
    }

    // Handle booking fulfillment
    if (payment.booking_id) {
      result = await fulfillBookingPayment(payment, transaction);
    }

    await transaction.commit();

    logger.info(`Payment ${paymentId} fulfilled successfully`);
    return result;
  } catch (error) {
    await transaction.rollback();
    logger.error(`Payment fulfillment failed for ${paymentId}:`, error);
    throw error;
  }
}

/**
 * Fulfill order payment
 * @param {Object} payment - Payment object
 * @param {Transaction} transaction - Sequelize transaction
 * @returns {Promise<Object>} Result
 */
async function fulfillOrderPayment(payment, transaction) {
  const order = await Order.findByPk(payment.order_id, {
    transaction,
    lock: true,
  });

  if (!order) {
    throw new Error('Order not found');
  }

  // Update order status
  await order.update({
    status: 'accepted',
    payment_status: 'paid',
  }, { transaction });

  // Log audit event
  await auditService.logOrderEvent({
    orderId: order.id,
    eventType: auditService.EVENT_TYPES.PAYMENT_UPDATED,
    oldValue: 'pending_payment',
    newValue: 'paid',
    actor: { role: 'system' },
    metadata: { paymentId: payment.id },
  });

  // Emit socket event
  socketService.emitNewOrder(order);

  // Notify business
  await notificationService.notifyBusinessNewOrder(order);

  // Notify customer
  await notificationService.sendNotification(
    order.user_id,
    'Payment Successful',
    `Your payment of ₱${payment.amount / 100} for Order #${order.order_number} was successful.`,
    'payment_received',
    { orderId: order.id, orderNumber: order.order_number, amount: payment.amount }
  );

  return {
    success: true,
    type: 'order',
    orderId: order.id,
    orderNumber: order.order_number,
    paymentId: payment.id,
  };
}

/**
 * Fulfill booking payment
 * @param {Object} payment - Payment object
 * @param {Transaction} transaction - Sequelize transaction
 * @returns {Promise<Object>} Result
 */
async function fulfillBookingPayment(payment, transaction) {
  const booking = await Booking.findByPk(payment.booking_id, {
    transaction,
    lock: true,
  });

  if (!booking) {
    throw new Error('Booking not found');
  }

  // Update booking status
  await booking.update({
    status: 'Confirmed',
    payment_status: 'Paid',
  }, { transaction });

  // Log audit event
  await auditService.logBookingEvent({
    bookingId: booking.id,
    eventType: 'payment_confirmed',
    newValue: 'Confirmed',
    actor: { role: 'system' },
    metadata: { paymentId: payment.id },
  });

  // Emit socket event
  socketService.emitBookingStatusUpdate(booking, 'Pending');

  // Notify business
  await notificationService.notifyBusinessNewBooking(booking);

  // Notify customer
  await notificationService.sendNotification(
    booking.user_id,
    'Booking Confirmed',
    `Your booking #${booking.reference_number} has been confirmed.`,
    'booking_confirmed',
    { bookingId: booking.id, referenceNumber: booking.reference_number }
  );

  return {
    success: true,
    type: 'booking',
    bookingId: booking.id,
    referenceNumber: booking.reference_number,
    paymentId: payment.id,
  };
}

/**
 * Handle failed payment
 * @param {string} paymentId - Payment ID
 * @param {Object} failureData - Failure details
 * @returns {Promise<Object>} Result
 */
export async function handlePaymentFailure(paymentId, failureData = {}) {
  const transaction = await sequelize.transaction();

  try {
    const payment = await Payment.findByPk(paymentId, {
      transaction,
      lock: true,
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    // Update payment status
    await payment.update({
      status: 'failed',
      failure_reason: failureData.reason || 'Payment failed',
    }, { transaction });

    // Handle order failure
    if (payment.order_id) {
      const order = await Order.findByPk(payment.order_id, { transaction });
      if (order) {
        await order.update({ status: 'failed_payment' }, { transaction });

        // Restore stock
        await restoreOrderStock(order.id, transaction);

        await auditService.logOrderEvent({
          orderId: order.id,
          eventType: auditService.EVENT_TYPES.PAYMENT_UPDATED,
          newValue: 'failed',
          actor: { role: 'system' },
          metadata: { paymentId: payment.id, reason: failureData.reason },
        });

        await notificationService.sendNotification(
          order.user_id,
          'Payment Failed',
          `Your payment for Order #${order.order_number} failed. Please try again.`,
          'payment_failed',
          { orderId: order.id, orderNumber: order.order_number }
        );
      }
    }

    // Handle booking failure
    if (payment.booking_id) {
      const booking = await Booking.findByPk(payment.booking_id, { transaction });
      if (booking) {
        await booking.update({
          status: 'Cancelled',
          payment_status: 'Failed',
          cancellation_reason: 'Payment failed',
        }, { transaction });

        await notificationService.sendNotification(
          booking.user_id,
          'Booking Payment Failed',
          `Your payment for Booking #${booking.reference_number} failed.`,
          'payment_failed',
          { bookingId: booking.id, referenceNumber: booking.reference_number }
        );
      }
    }

    await transaction.commit();

    logger.info(`Payment ${paymentId} marked as failed`);
    return { success: true, paymentId, status: 'failed' };
  } catch (error) {
    await transaction.rollback();
    logger.error(`Failed to handle payment failure for ${paymentId}:`, error);
    throw error;
  }
}

/**
 * Restore stock for failed/cancelled order
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

  logger.debug(`Restored stock for order ${orderId}`);
}

/**
 * Process a source payment (for e-wallet flows)
 * @param {string} sourceId - PayMongo source ID
 * @param {Object} sourceData - Source data
 * @returns {Promise<Object>} Result
 */
export async function processSourcePayment(sourceId, sourceData) {
  const transaction = await sequelize.transaction();

  try {
    // Find payment by source ID
    const payment = await Payment.findOne({
      where: { paymongo_source_id: sourceId },
      transaction,
      lock: true,
    });

    if (!payment) {
      logger.warn(`No payment found for source ${sourceId}`);
      await transaction.commit();
      return { success: false, reason: 'payment_not_found' };
    }

    if (sourceData.status === 'chargeable') {
      // Source is chargeable, update payment
      await payment.update({
        status: 'chargeable',
      }, { transaction });

      await transaction.commit();

      logger.info(`Source ${sourceId} is chargeable, awaiting payment creation`);
      return { success: true, status: 'chargeable', paymentId: payment.id };
    }

    if (sourceData.status === 'paid') {
      await transaction.commit();
      return await fulfillPayment(payment.id, {
        paymongo_payment_id: sourceData.payment_id,
        payment_method: sourceData.type,
      });
    }

    if (['cancelled', 'expired', 'failed'].includes(sourceData.status)) {
      await transaction.commit();
      return await handlePaymentFailure(payment.id, {
        reason: `Source ${sourceData.status}`,
      });
    }

    await transaction.commit();
    return { success: true, status: sourceData.status };
  } catch (error) {
    await transaction.rollback();
    logger.error(`Failed to process source payment ${sourceId}:`, error);
    throw error;
  }
}

export default {
  fulfillPayment,
  handlePaymentFailure,
  processSourcePayment,
};
