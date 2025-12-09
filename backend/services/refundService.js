/**
 * Refund Service
 * 
 * Handles refund and cancellation business logic for orders and bookings.
 * Integrates with PayMongo refund API for online payments.
 * 
 * Responsibilities:
 * - Validate refund eligibility
 * - Create and track refund requests
 * - Process PayMongo refunds
 * - Handle cancellations (for cash on pickup)
 * - Update order/booking status
 * - Emit real-time notifications
 * 
 * @see services/paymongoService.js
 * @see services/paymentFulfillmentService.js
 */

import db from '../db.js';
import { v4 as uuidv4 } from 'uuid';
import * as paymongoService from './paymongoService.js';
import * as socketService from './socketService.js';
import * as notificationHelper from './notificationHelper.js';
import * as auditService from './auditService.js';

// ============= Constants =============

export const REFUND_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
};

export const REFUND_FOR = {
  ORDER: 'order',
  BOOKING: 'booking'
};

export const REFUND_REASONS = {
  REQUESTED_BY_CUSTOMER: 'requested_by_customer',
  DUPLICATE: 'duplicate',
  FRAUDULENT: 'fraudulent',
  CHANGED_MIND: 'changed_mind',
  WRONG_ORDER: 'wrong_order',
  PRODUCT_UNAVAILABLE: 'product_unavailable',
  BUSINESS_ISSUE: 'business_issue',
  OTHERS: 'others'
};

// Map user-friendly reasons to PayMongo API reasons
const PAYMONGO_REASON_MAP = {
  'requested_by_customer': 'requested_by_customer',
  'duplicate': 'duplicate',
  'fraudulent': 'fraudulent',
  'changed_mind': 'requested_by_customer',
  'wrong_order': 'requested_by_customer',
  'product_unavailable': 'others',
  'business_issue': 'others',
  'others': 'others'
};

// ============= Eligibility Checking =============

/**
 * Check if an order is eligible for refund
 * 
 * Rules:
 * - Order must be in 'pending' status (not yet accepted)
 * - Payment must be 'paid' via PayMongo (not cash on pickup)
 * - No existing pending refund request
 * - User must own the order
 * 
 * @param {string} orderId - Order ID
 * @param {string} userId - User requesting the refund
 * @returns {Promise<Object>} Eligibility result with reason
 */
export async function checkOrderRefundEligibility(orderId, userId) {
  console.log(`[RefundService] Checking refund eligibility for order ${orderId}`);
  
  try {
    // Use stored procedure for eligibility check
    const [result] = await db.query(
      'CALL CheckRefundEligibility(?, ?, ?)',
      ['order', orderId, userId]
    );

    // Stored procedure returns result wrapped in array: [[{data}], metadata]
    // So result[0] is [{data}] and result[0][0] is the actual row
    const eligibilityRows = result[0];
    
    if (!eligibilityRows || eligibilityRows.length === 0) {
      return {
        eligible: false,
        reason: 'Order not found',
        canCancel: false
      };
    }

    const eligibility = eligibilityRows[0];
    
    // Check if it's a cash on pickup order (can cancel but not refund)
    const canCancel = eligibility.payment_method === 'cash_on_pickup' && 
                      eligibility.resource_status === 'pending';

    return {
      eligible: eligibility.eligible === 1,
      reason: eligibility.reason,
      paymentId: eligibility.payment_id,
      paymongoPaymentId: eligibility.paymongo_payment_id,
      amount: parseFloat(eligibility.amount || 0),
      paymentMethod: eligibility.payment_method,
      resourceStatus: eligibility.resource_status,
      canCancel,
      requiresCustomerService: eligibility.resource_status !== 'pending' && 
                               !['cancelled_by_user', 'cancelled_by_business', 'failed_payment'].includes(eligibility.resource_status)
    };
  } catch (error) {
    console.error(`[RefundService] Error checking eligibility:`, error);
    throw error;
  }
}

/**
 * Check if a booking is eligible for refund
 * 
 * @param {string} bookingId - Booking ID
 * @param {string} userId - User requesting the refund
 * @returns {Promise<Object>} Eligibility result with reason
 */
export async function checkBookingRefundEligibility(bookingId, userId) {
  console.log(`[RefundService] Checking refund eligibility for booking ${bookingId}`);
  
  try {
    const [result] = await db.query(
      'CALL CheckRefundEligibility(?, ?, ?)',
      ['booking', bookingId, userId]
    );

    // Stored procedure returns result wrapped in array: [[{data}], metadata]
    const eligibilityRows = result[0];
    
    if (!eligibilityRows || eligibilityRows.length === 0) {
      return {
        eligible: false,
        reason: 'Booking not found',
        canCancel: false
      };
    }

    const eligibility = eligibilityRows[0];

    return {
      eligible: eligibility.eligible === 1,
      reason: eligibility.reason,
      paymentId: eligibility.payment_id,
      paymongoPaymentId: eligibility.paymongo_payment_id,
      amount: parseFloat(eligibility.amount || 0),
      paymentMethod: eligibility.payment_method,
      resourceStatus: eligibility.resource_status,
      canCancel: false, // Bookings don't have cash on pickup
      requiresCustomerService: eligibility.resource_status !== 'Pending'
    };
  } catch (error) {
    console.error(`[RefundService] Error checking booking eligibility:`, error);
    throw error;
  }
}

// ============= Refund Request Creation =============

/**
 * Create a refund request for an order
 * 
 * @param {Object} params
 * @param {string} params.orderId - Order ID
 * @param {string} params.userId - User requesting the refund
 * @param {string} params.reason - Refund reason code
 * @param {string} params.notes - Optional user notes
 * @param {number} params.amount - Optional partial refund amount (defaults to full)
 * @returns {Promise<Object>} Refund request result
 */
export async function createOrderRefundRequest({
  orderId,
  userId,
  reason = REFUND_REASONS.REQUESTED_BY_CUSTOMER,
  notes = null,
  amount = null // null means full refund
}) {
  console.log(`[RefundService] Creating refund request for order ${orderId}`);

  // 1. Validate eligibility
  const eligibility = await checkOrderRefundEligibility(orderId, userId);
  
  if (!eligibility.eligible) {
    return {
      success: false,
      error: eligibility.reason,
      requiresCustomerService: eligibility.requiresCustomerService,
      canCancel: eligibility.canCancel
    };
  }

  // 2. Calculate refund amount
  const refundAmount = amount || eligibility.amount;
  if (refundAmount <= 0) {
    return {
      success: false,
      error: 'Invalid refund amount'
    };
  }

  // 3. Validate partial refund (if applicable)
  if (amount && amount > eligibility.amount) {
    return {
      success: false,
      error: `Refund amount cannot exceed original payment (₱${eligibility.amount.toFixed(2)})`
    };
  }

  // 4. Create refund record
  const refundId = uuidv4();
  
  try {
    const [result] = await db.query(
      'CALL CreateRefundRequest(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        refundId,
        REFUND_FOR.ORDER,
        orderId,
        eligibility.paymentId,
        userId,
        refundAmount,
        eligibility.amount,
        reason,
        notes,
        eligibility.paymongoPaymentId
      ]
    );

    const refund = result[0];

    // 5. Process PayMongo refund
    const paymongoResult = await processPayMongoRefund({
      refundId,
      paymongoPaymentId: eligibility.paymongoPaymentId,
      amount: refundAmount,
      reason,
      notes,
      metadata: {
        order_id: orderId,
        user_id: userId,
        refund_id: refundId
      }
    });

    // 6. Update order status
    if (paymongoResult.success) {
      await updateOrderForRefund(orderId, refundId, refundAmount);
    }

    // 7. Emit real-time notifications
    await emitRefundNotifications({
      refundFor: REFUND_FOR.ORDER,
      refundForId: orderId,
      refundId,
      status: paymongoResult.success ? REFUND_STATUS.PROCESSING : REFUND_STATUS.FAILED,
      amount: refundAmount,
      userId
    });

    return {
      success: true,
      refund: {
        id: refundId,
        status: paymongoResult.status,
        amount: refundAmount,
        paymongoRefundId: paymongoResult.paymongoRefundId,
        message: paymongoResult.success 
          ? 'Refund request submitted successfully. You will be notified when it is processed.'
          : 'Refund request created but PayMongo processing failed. Our team will handle this manually.'
      }
    };

  } catch (error) {
    console.error(`[RefundService] Error creating refund request:`, error);
    
    // Mark refund as failed if it was created
    try {
      await db.query(
        'CALL UpdateRefundStatus(?, ?, ?, ?, ?)',
        [refundId, REFUND_STATUS.FAILED, null, null, error.message]
      );
    } catch (updateError) {
      console.error(`[RefundService] Failed to update refund status:`, updateError);
    }

    throw error;
  }
}

/**
 * Create a refund request for a booking
 * 
 * @param {Object} params
 * @param {string} params.bookingId - Booking ID
 * @param {string} params.userId - User requesting the refund
 * @param {string} params.reason - Refund reason code
 * @param {string} params.notes - Optional user notes
 * @param {number} params.amount - Optional partial refund amount
 * @returns {Promise<Object>} Refund request result
 */
export async function createBookingRefundRequest({
  bookingId,
  userId,
  reason = REFUND_REASONS.REQUESTED_BY_CUSTOMER,
  notes = null,
  amount = null
}) {
  console.log(`[RefundService] Creating refund request for booking ${bookingId}`);

  // 1. Validate eligibility
  const eligibility = await checkBookingRefundEligibility(bookingId, userId);
  
  if (!eligibility.eligible) {
    return {
      success: false,
      error: eligibility.reason,
      requiresCustomerService: eligibility.requiresCustomerService
    };
  }

  // 2. Calculate refund amount
  const refundAmount = amount || eligibility.amount;
  if (refundAmount <= 0) {
    return {
      success: false,
      error: 'Invalid refund amount'
    };
  }

  // 3. Create refund record
  const refundId = uuidv4();
  
  try {
    const [result] = await db.query(
      'CALL CreateRefundRequest(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        refundId,
        REFUND_FOR.BOOKING,
        bookingId,
        eligibility.paymentId,
        userId,
        refundAmount,
        eligibility.amount,
        reason,
        notes,
        eligibility.paymongoPaymentId
      ]
    );

    // 4. Process PayMongo refund
    const paymongoResult = await processPayMongoRefund({
      refundId,
      paymongoPaymentId: eligibility.paymongoPaymentId,
      amount: refundAmount,
      reason,
      notes,
      metadata: {
        booking_id: bookingId,
        user_id: userId,
        refund_id: refundId
      }
    });

    // 5. Update booking status
    if (paymongoResult.success) {
      await updateBookingForRefund(bookingId, refundId, refundAmount);
    }

    // 6. Emit real-time notifications
    await emitRefundNotifications({
      refundFor: REFUND_FOR.BOOKING,
      refundForId: bookingId,
      refundId,
      status: paymongoResult.success ? REFUND_STATUS.PROCESSING : REFUND_STATUS.FAILED,
      amount: refundAmount,
      userId
    });

    return {
      success: true,
      refund: {
        id: refundId,
        status: paymongoResult.status,
        amount: refundAmount,
        paymongoRefundId: paymongoResult.paymongoRefundId,
        message: paymongoResult.success 
          ? 'Refund request submitted successfully.'
          : 'Refund request created but processing failed. Our team will handle this manually.'
      }
    };

  } catch (error) {
    console.error(`[RefundService] Error creating booking refund:`, error);
    throw error;
  }
}

// ============= Order Cancellation (Cash on Pickup) =============

/**
 * Cancel a cash on pickup order
 * No refund needed, just cancels the order and restores stock
 * 
 * @param {Object} params
 * @param {string} params.orderId - Order ID
 * @param {string} params.userId - User requesting cancellation
 * @param {string} params.reason - Cancellation reason
 * @param {string} params.notes - Optional notes
 * @returns {Promise<Object>} Cancellation result
 */
export async function cancelCashOnPickupOrder({
  orderId,
  userId,
  reason = 'changed_mind',
  notes = null
}) {
  console.log(`[RefundService] Cancelling cash on pickup order ${orderId}`);

  // 1. Verify order status and ownership
  const [orderRows] = await db.query(
    `SELECT o.*, p.payment_method, p.status as payment_status
     FROM \`order\` o
     LEFT JOIN payment p ON p.payment_for = 'order' AND p.payment_for_id = o.id
     WHERE o.id = ?`,
    [orderId]
  );

  if (!orderRows || orderRows.length === 0) {
    return {
      success: false,
      error: 'Order not found'
    };
  }

  const order = orderRows[0];

  // 2. Validate ownership
  if (order.user_id !== userId) {
    return {
      success: false,
      error: 'You can only cancel your own orders'
    };
  }

  // 3. Validate order status
  if (order.status !== 'pending') {
    return {
      success: false,
      error: 'Order has already been processed. Please contact customer service.',
      requiresCustomerService: true
    };
  }

  // 4. Validate payment method
  if (order.payment_method !== 'cash_on_pickup') {
    return {
      success: false,
      error: 'This order was paid online. Please request a refund instead.',
      shouldRefund: true
    };
  }

  // 5. Cancel the order
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    // Update order status
    await connection.query(
      `UPDATE \`order\`
       SET status = 'cancelled_by_user',
           cancelled_at = NOW(),
           cancelled_by = 'user',
           cancellation_reason = ?,
           updated_at = NOW()
       WHERE id = ?`,
      [notes || reason, orderId]
    );

    // Restore stock for order items
    const [orderItems] = await connection.query(
      `SELECT product_id, quantity FROM order_item WHERE order_id = ?`,
      [orderId]
    );

    for (const item of orderItems) {
      await connection.query(
        `UPDATE product SET stock = stock + ? WHERE id = ?`,
        [item.quantity, item.product_id]
      );
    }

    // Update payment status
    await connection.query(
      `UPDATE payment 
       SET status = 'failed',
           metadata = JSON_SET(COALESCE(metadata, '{}'), '$.cancelled_reason', ?),
           updated_at = NOW()
       WHERE payment_for = 'order' AND payment_for_id = ?`,
      [reason, orderId]
    );

    await connection.commit();

    // 6. Audit logging
    await auditService.logCancellation({
      orderId,
      previousStatus: order.status,
      cancelledBy: 'user',
      actor: { id: userId, role: 'Tourist' },
      reason: notes || reason
    });

    // 7. Emit real-time notifications
    try {
      await socketService.emitOrderUpdated({
        id: orderId,
        status: 'cancelled_by_user',
        user_id: userId,
        business_id: order.business_id
      }, order.status);

      await notificationHelper.createNotification({
        userId,
        type: 'order_cancelled',
        title: 'Order Cancelled',
        message: `Your order #${order.order_number} has been cancelled.`,
        data: { orderId, orderNumber: order.order_number }
      });
    } catch (notifError) {
      console.error(`[RefundService] Failed to send notifications:`, notifError);
    }

    return {
      success: true,
      message: 'Order cancelled successfully',
      order: {
        id: orderId,
        status: 'cancelled_by_user',
        orderNumber: order.order_number
      }
    };

  } catch (error) {
    await connection.rollback();
    console.error(`[RefundService] Error cancelling order:`, error);
    throw error;
  } finally {
    connection.release();
  }
}

// ============= PayMongo Integration =============

/**
 * Process refund through PayMongo API
 * 
 * @param {Object} params
 * @param {string} params.refundId - Our refund record ID
 * @param {string} params.paymongoPaymentId - PayMongo payment ID (pay_...)
 * @param {number} params.amount - Refund amount in PHP
 * @param {string} params.reason - Refund reason
 * @param {string} params.notes - Optional notes
 * @param {Object} params.metadata - Additional metadata
 * @returns {Promise<Object>} PayMongo refund result
 */
async function processPayMongoRefund({
  refundId,
  paymongoPaymentId,
  amount,
  reason,
  notes,
  metadata
}) {
  console.log(`[RefundService] Processing PayMongo refund for payment ${paymongoPaymentId}`);

  try {
    // Convert PHP to centavos
    const amountInCentavos = Math.round(amount * 100);
    
    // Map reason to PayMongo reason
    const paymongoReason = PAYMONGO_REASON_MAP[reason] || 'requested_by_customer';

    // Call PayMongo refund API
    const refundResponse = await paymongoService.createRefund({
      paymentId: paymongoPaymentId,
      amount: amountInCentavos,
      reason: paymongoReason,
      notes: notes || `Refund for ${metadata.order_id || metadata.booking_id || 'order'}`,
      metadata
    });

    const paymongoRefundId = refundResponse.id;
    const refundStatus = refundResponse.attributes.status;

    console.log(`[RefundService] PayMongo refund created: ${paymongoRefundId}, status: ${refundStatus}`);

    // Update refund record with PayMongo response
    await db.query(
      'CALL UpdateRefundStatus(?, ?, ?, ?, ?)',
      [
        refundId,
        refundStatus === 'succeeded' ? REFUND_STATUS.SUCCEEDED : REFUND_STATUS.PROCESSING,
        paymongoRefundId,
        JSON.stringify(refundResponse),
        null
      ]
    );

    return {
      success: true,
      status: refundStatus,
      paymongoRefundId,
      paymongoResponse: refundResponse
    };

  } catch (error) {
    console.error(`[RefundService] PayMongo refund failed:`, error);

    // Update refund record with error
    await db.query(
      'CALL IncrementRefundRetry(?, ?)',
      [refundId, error.message]
    );

    return {
      success: false,
      status: REFUND_STATUS.FAILED,
      error: error.message
    };
  }
}

// ============= Status Updates =============

/**
 * Update order when refund is initiated
 */
async function updateOrderForRefund(orderId, refundId, amount) {
  await db.query(
    `UPDATE \`order\`
     SET refund_id = ?,
         refund_requested_at = NOW(),
         refund_amount = ?,
         updated_at = NOW()
     WHERE id = ?`,
    [refundId, amount, orderId]
  );
}

/**
 * Update booking when refund is initiated
 */
async function updateBookingForRefund(bookingId, refundId, amount) {
  await db.query(
    `UPDATE booking
     SET booking_status = 'Cancelled',
         updated_at = NOW()
     WHERE id = ?`,
    [bookingId]
  );
}

/**
 * Handle refund webhook from PayMongo (refund.updated)
 * Called by PaymentFulfillmentService when a refund webhook is received
 * 
 * @param {Object} params
 * @param {string} params.refundId - PayMongo refund ID
 * @param {string} params.status - New refund status
 * @param {Object} params.eventData - Full webhook event data
 */
export async function handleRefundWebhook({ refundId, status, eventData }) {
  console.log(`[RefundService] Handling refund webhook for ${refundId}, status: ${status}`);

  // Find our refund record by PayMongo refund ID
  const [refundRows] = await db.query(
    `SELECT * FROM refund WHERE paymongo_refund_id = ?`,
    [refundId]
  );

  if (!refundRows || refundRows.length === 0) {
    console.warn(`[RefundService] No refund record found for PayMongo refund ${refundId}`);
    return;
  }

  const refund = refundRows[0];

  // Map PayMongo status to our status
  const newStatus = status === 'succeeded' ? REFUND_STATUS.SUCCEEDED : 
                    status === 'failed' ? REFUND_STATUS.FAILED : 
                    REFUND_STATUS.PROCESSING;

  // Update refund record
  await db.query(
    'CALL UpdateRefundStatus(?, ?, ?, ?, ?)',
    [refund.id, newStatus, refundId, JSON.stringify(eventData), null]
  );

  // If refund succeeded, update order/booking status
  if (newStatus === REFUND_STATUS.SUCCEEDED) {
    if (refund.refund_for === 'order') {
      await db.query(
        `UPDATE \`order\`
         SET status = 'cancelled_by_user',
             cancelled_at = NOW(),
             cancelled_by = 'user',
             cancellation_reason = 'Refund completed',
             updated_at = NOW()
         WHERE id = ?`,
        [refund.refund_for_id]
      );

      // Restore stock
      await restoreOrderStock(refund.refund_for_id);
    }

    // Update payment status
    await db.query(
      `UPDATE payment SET status = 'refunded', updated_at = NOW()
       WHERE id = ?`,
      [refund.payment_id]
    );
  }

  // Emit notifications
  await emitRefundNotifications({
    refundFor: refund.refund_for,
    refundForId: refund.refund_for_id,
    refundId: refund.id,
    status: newStatus,
    amount: refund.amount,
    userId: refund.requested_by
  });
}

/**
 * Restore stock for order items
 */
async function restoreOrderStock(orderId) {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const [orderItems] = await connection.query(
      `SELECT product_id, quantity FROM order_item WHERE order_id = ?`,
      [orderId]
    );

    for (const item of orderItems) {
      await connection.query(
        `UPDATE product SET stock = stock + ? WHERE id = ?`,
        [item.quantity, item.product_id]
      );
    }

    await connection.commit();
    console.log(`[RefundService] Stock restored for order ${orderId}`);
  } catch (error) {
    await connection.rollback();
    console.error(`[RefundService] Failed to restore stock:`, error);
  } finally {
    connection.release();
  }
}

// ============= Notifications =============

/**
 * Emit real-time refund notifications
 */
async function emitRefundNotifications({
  refundFor,
  refundForId,
  refundId,
  status,
  amount,
  userId
}) {
  try {
    // Emit to user
    socketService.emitPaymentUpdated({
      userId,
      type: 'refund_update',
      refundId,
      refundFor,
      refundForId,
      status,
      amount
    });

    // Create notification
    let message = '';
    switch (status) {
      case REFUND_STATUS.PROCESSING:
        message = `Your refund of ₱${amount.toFixed(2)} is being processed.`;
        break;
      case REFUND_STATUS.SUCCEEDED:
        message = `Your refund of ₱${amount.toFixed(2)} has been completed.`;
        break;
      case REFUND_STATUS.FAILED:
        message = `Your refund of ₱${amount.toFixed(2)} failed. Please contact support.`;
        break;
      default:
        message = `Your refund request has been updated.`;
    }

    await notificationHelper.createNotification({
      userId,
      type: 'refund_update',
      title: 'Refund Update',
      message,
      data: { refundId, refundFor, refundForId, status, amount }
    });

  } catch (error) {
    console.error(`[RefundService] Failed to emit notifications:`, error);
  }
}

// ============= Query Functions =============

/**
 * Get refund by ID
 */
export async function getRefundById(refundId) {
  const [result] = await db.query('CALL GetRefundById(?)', [refundId]);
  return result[0] || null;
}

/**
 * Get refunds for an order or booking
 */
export async function getRefundsByResourceId(refundFor, refundForId) {
  const [result] = await db.query('CALL GetRefundsByResourceId(?, ?)', [refundFor, refundForId]);
  return result || [];
}

/**
 * Get refunds requested by a user
 */
export async function getRefundsByUserId(userId, limit = 50, offset = 0) {
  const [result] = await db.query('CALL GetRefundsByUserId(?, ?, ?)', [userId, limit, offset]);
  return result || [];
}

/**
 * Get refund statistics for a business
 */
export async function getRefundStatsByBusinessId(businessId, startDate, endDate) {
  const [result] = await db.query('CALL GetRefundStatsByBusinessId(?, ?, ?)', [
    businessId,
    startDate,
    endDate
  ]);
  return result || [];
}

export default {
  // Eligibility
  checkOrderRefundEligibility,
  checkBookingRefundEligibility,
  
  // Refund creation
  createOrderRefundRequest,
  createBookingRefundRequest,
  
  // Cancellation
  cancelCashOnPickupOrder,
  
  // Webhook handling
  handleRefundWebhook,
  
  // Queries
  getRefundById,
  getRefundsByResourceId,
  getRefundsByUserId,
  getRefundStatsByBusinessId,
  
  // Constants
  REFUND_STATUS,
  REFUND_FOR,
  REFUND_REASONS
};
