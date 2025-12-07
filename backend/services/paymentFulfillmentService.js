/**
 * Payment Fulfillment Service
 *
 * Single Source of Truth for handling payment completion events.
 * Consolidates all "Close the Deal" logic when money changes hands.
 *
 * Responsibilities:
 * - Handle payment.paid events
 * - Handle payment.failed events
 * - Handle refund.updated events
 * - Update payment records (single source of truth)
 * - Dispatch to OrderService/BookingService based on payment_for
 * - Trigger notifications and real-time socket events
 *
 * @see docs/ORDERING_SYSTEM_AUDIT.md
 * @see docs/PAYMENT_INTEGRATION_GUIDE.md
 */

import db from '../db.js';
import * as socketService from './socketService.js';
import * as notificationHelper from './notificationHelper.js';
import * as auditService from './auditService.js';
import * as paymongoService from './paymongoService.js';

// ============= Constants =============

/**
 * Payment status constants
 */
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

/**
 * Payment for types
 */
export const PAYMENT_FOR = {
  ORDER: 'order',
  BOOKING: 'booking',
};

// ============= Core Fulfillment Functions =============

/**
 * Handle payment.paid event from PayMongo webhook
 * This is the main entry point for successful payment fulfillment.
 *
 * @param {Object} params - Payment paid parameters
 * @param {string} params.paymentIntentId - PayMongo payment intent ID
 * @param {string} params.paymentId - PayMongo payment ID
 * @param {Object} params.eventData - Full PayMongo event data
 * @returns {Promise<Object>} Fulfillment result
 */
export async function handlePaymentPaid({
  paymentIntentId,
  paymentId,
  eventData,
}) {
  console.log(`[PaymentFulfillment] 💳 Processing payment.paid for intent: ${paymentIntentId}`);

  const attributes = eventData.attributes || {};
  const metadata = attributes.metadata || {};
  const paymentAmount = attributes.amount || 0;
  const paymentFee = attributes.fee || 0;
  const paymentNetAmount = attributes.net_amount || 0;

  // CRITICAL: Extract actual payment method from PayMongo event
  // This is the REAL method used (e.g., 'gcash'), not what we guessed during initiation
  // PayMongo stores method type in different locations depending on payment type:
  // - For e-wallets: attributes.source.type (e.g., 'gcash')
  // - Alternative: attributes.payment_method_type
  const actualPaymentMethodType = attributes.source?.type || attributes.payment_method_type;

  // Payment method ID is in source.id (e.g., 'src_...' for e-wallets, 'tok_...' for cards)
  const actualPaymentMethodId = attributes.source?.id || attributes.payment_method_id || paymentId;

  console.log(`[PaymentFulfillment] 💳 Actual payment method: ${actualPaymentMethodType} (${actualPaymentMethodId})`);
  console.log(`[PaymentFulfillment] 📝 Source data:`, JSON.stringify(attributes.source || {}, null, 2));

  // 1. Resolve reference from metadata or database lookup
  let referenceId = metadata.order_id || metadata.booking_id;
  let paymentFor = metadata.payment_for || (metadata.booking_id ? PAYMENT_FOR.BOOKING : PAYMENT_FOR.ORDER);

  // Fallback: Lookup via payment_intent_id if metadata is missing
  if (!referenceId && paymentIntentId) {
    console.log(`[PaymentFulfillment] ⚠️ No reference_id in metadata, looking up by payment_intent_id`);
    const lookupResult = await lookupPaymentByIntentId(paymentIntentId);
    if (lookupResult) {
      referenceId = lookupResult.payment_for_id;
      paymentFor = lookupResult.payment_for;
    }
  }

  if (!referenceId) {
    console.warn(`[PaymentFulfillment] ❌ Could not resolve reference for payment ${paymentId}`);
    return { success: false, reason: 'Could not resolve payment reference' };
  }

  // 2. Update payment record (Single Source of Truth)
  // CRITICAL: Save the ACTUAL payment method from PayMongo, not the initial guess
  await updatePaymentRecord({
    paymentFor,
    referenceId,
    status: PAYMENT_STATUS.PAID,
    paymongoPaymentId: paymentId,
    actualPaymentMethod: actualPaymentMethodType,
    actualPaymentMethodId: actualPaymentMethodId,
    metadata: {
      paymongo_payment_status: 'paid',
      paymongo_amount_centavos: paymentAmount,
      paymongo_fee: paymentFee,
      paymongo_net_amount: paymentNetAmount,
      payment_intent_id: paymentIntentId || '',
      webhook_processed_at: new Date().toISOString(),
    },
  });

  // 3. Dispatch to appropriate service based on payment_for
  if (paymentFor === PAYMENT_FOR.ORDER) {
    await markOrderAsPaid(referenceId);
  } else if (paymentFor === PAYMENT_FOR.BOOKING) {
    await confirmBooking(referenceId, paymentAmount);
  }

  // 4. Audit logging
  await auditService.logOrderEvent({
    orderId: referenceId,
    eventType: auditService.EVENT_TYPES.PAYMENT_UPDATED,
    oldValue: 'pending',
    newValue: 'paid',
    actor: { id: null, role: 'system' },
    metadata: {
      paymongo_payment_id: paymentId,
      payment_intent_id: paymentIntentId,
      amount_centavos: paymentAmount,
      webhook_event_type: 'payment.paid',
      payment_for: paymentFor,
    },
  });

  // 5. Emit real-time events
  if (paymentFor === PAYMENT_FOR.ORDER) {
    await emitPaymentEvents(referenceId, paymentId, PAYMENT_STATUS.PAID, paymentAmount);
    await emitNewOrderNotification(referenceId);
  }

  console.log(`[PaymentFulfillment] ✅ Payment fulfilled for ${paymentFor} ${referenceId}`);

  return {
    success: true,
    paymentFor,
    referenceId,
    status: PAYMENT_STATUS.PAID,
  };
}

/**
 * Handle payment.failed event from PayMongo webhook
 *
 * @param {Object} params - Payment failed parameters
 * @param {string} params.paymentIntentId - PayMongo payment intent ID
 * @param {string} params.paymentId - PayMongo payment ID
 * @param {Object} params.eventData - Full PayMongo event data
 * @returns {Promise<Object>} Fulfillment result
 */
export async function handlePaymentFailed({
  paymentIntentId,
  paymentId,
  eventData,
}) {
  console.log(`[PaymentFulfillment] 💔 Processing payment.failed for intent: ${paymentIntentId}`);

  const attributes = eventData.attributes || {};
  const metadata = attributes.metadata || {};
  const failedCode = attributes.failed_code || 'UNKNOWN';
  const failedMessage = attributes.failed_message || 'Payment failed';

  // 1. Resolve reference from metadata or database lookup
  let referenceId = metadata.order_id || metadata.booking_id;
  let paymentFor = metadata.payment_for || (metadata.booking_id ? PAYMENT_FOR.BOOKING : PAYMENT_FOR.ORDER);

  // Fallback: Lookup via payment_intent_id or payment_id
  if (!referenceId) {
    console.log(`[PaymentFulfillment] ⚠️ No reference_id in metadata, looking up by payment_intent_id/payment_id`);
    const lookupResult = await lookupPaymentByIntentId(paymentIntentId) ||
                         await lookupPaymentByPaymentId(paymentId);
    if (lookupResult) {
      referenceId = lookupResult.payment_for_id;
      paymentFor = lookupResult.payment_for;
    }
  }

  if (!referenceId) {
    // Still try to update any matching payment record
    await updatePaymentRecordByPaymentId({
      paymongoPaymentId: paymentId,
      paymentIntentId,
      status: PAYMENT_STATUS.FAILED,
      metadata: {
        failed_code: failedCode,
        failed_message: failedMessage,
      },
    });

    console.warn(`[PaymentFulfillment] ❌ Could not resolve reference for failed payment ${paymentId}`);
    return { success: false, reason: 'Could not resolve payment reference' };
  }

  // 2. Update payment record (Single Source of Truth)
  await updatePaymentRecord({
    paymentFor,
    referenceId,
    status: PAYMENT_STATUS.FAILED,
    paymongoPaymentId: paymentId,
    metadata: {
      failed_code: failedCode,
      failed_message: failedMessage,
      webhook_processed_at: new Date().toISOString(),
    },
  });

  // 3. Dispatch to appropriate service based on payment_for
  if (paymentFor === PAYMENT_FOR.ORDER) {
    await markOrderAsFailedPayment(referenceId);
  } else if (paymentFor === PAYMENT_FOR.BOOKING) {
    await markBookingAsFailedPayment(referenceId);
  }

  // 4. Audit logging
  try {
    await auditService.logOrderEvent({
      orderId: referenceId,
      eventType: auditService.EVENT_TYPES.PAYMENT_UPDATED,
      oldValue: 'pending',
      newValue: 'failed',
      actor: { id: null, role: 'system' },
      metadata: {
        paymongo_payment_id: paymentId,
        failed_code: failedCode,
        failed_message: failedMessage,
        webhook_event_type: 'payment.failed',
        payment_for: paymentFor,
      },
    });
  } catch (auditErr) {
    console.warn(`[PaymentFulfillment] ⚠️ Audit logging skipped: ${auditErr.message}`);
  }

  // 5. Emit real-time events
  if (paymentFor === PAYMENT_FOR.ORDER) {
    await emitPaymentEvents(referenceId, paymentId, PAYMENT_STATUS.FAILED, attributes.amount);
  }

  console.log(`[PaymentFulfillment] 💔 Payment failed for ${paymentFor} ${referenceId}`);

  return {
    success: true,
    paymentFor,
    referenceId,
    status: PAYMENT_STATUS.FAILED,
    failedCode,
    failedMessage,
  };
}

/**
 * Handle refund.updated event from PayMongo webhook
 *
 * @param {Object} params - Refund parameters
 * @param {string} params.refundId - PayMongo refund ID
 * @param {Object} params.eventData - Full PayMongo event data
 * @returns {Promise<Object>} Fulfillment result
 */
export async function handleRefundSucceeded({
  refundId,
  eventData,
}) {
  console.log(`[PaymentFulfillment] 💸 Processing refund.updated for refund: ${refundId}`);

  const attributes = eventData.attributes || {};
  const paymentId = attributes.payment_id;
  const refundAmount = attributes.amount || 0;

  if (!paymentId) {
    console.warn(`[PaymentFulfillment] ❌ Missing payment_id in refund event`);
    return { success: false, reason: 'Missing payment_id in refund event' };
  }

  // 1. Update payment status to refunded (Single Source of Truth)
  await db.query(
    `UPDATE payment
     SET status = ?,
         refund_reference = ?,
         updated_at = ?
     WHERE paymongo_payment_id = ?`,
    [PAYMENT_STATUS.REFUNDED, refundId, new Date(), paymentId]
  );

  // 2. Find the order/booking for notifications
  const [paymentRows] = await db.query(
    `SELECT payment_for_id, payment_for FROM payment
     WHERE paymongo_payment_id = ?`,
    [paymentId]
  );

  if (!paymentRows || paymentRows.length === 0) {
    console.warn(`[PaymentFulfillment] ❌ Could not find payment record for refund`);
    return { success: false, reason: 'Could not find payment record for refund' };
  }

  const payment = paymentRows[0];
  const referenceId = payment.payment_for_id;
  const paymentFor = payment.payment_for;

  // 3. Update order/booking timestamp
  if (paymentFor === PAYMENT_FOR.ORDER) {
    await db.query(
      `UPDATE \`order\` SET updated_at = ? WHERE id = ?`,
      [new Date(), referenceId]
    );
  }

  // 4. Audit logging
  await auditService.logOrderEvent({
    orderId: referenceId,
    eventType: auditService.EVENT_TYPES.REFUNDED,
    oldValue: 'paid',
    newValue: 'refunded',
    actor: { id: null, role: 'system' },
    metadata: {
      refund_id: refundId,
      refund_amount: refundAmount / 100,
      webhook_event_type: 'refund.updated',
      payment_for: paymentFor,
    },
  });

  // 5. Emit real-time events
  if (paymentFor === PAYMENT_FOR.ORDER) {
    await emitPaymentEvents(referenceId, paymentId, PAYMENT_STATUS.REFUNDED, refundAmount);
  }

  console.log(`[PaymentFulfillment] ✅ Refund completed for ${paymentFor} ${referenceId}`);

  return {
    success: true,
    paymentFor,
    referenceId,
    status: PAYMENT_STATUS.REFUNDED,
    refundId,
    refundAmount: refundAmount / 100,
  };
}

// ============= Order Service Functions =============

/**
 * Mark an order as paid
 * Updates only the timestamp (payment table is single source of truth)
 *
 * @param {string} orderId - Order ID
 */
async function markOrderAsPaid(orderId) {
  await db.query(
    `UPDATE \`order\`
     SET updated_at = ?
     WHERE id = ?`,
    [new Date(), orderId]
  );
  console.log(`[PaymentFulfillment] ✅ Order ${orderId} payment confirmed`);
}

/**
 * Mark an order as failed payment
 *
 * @param {string} orderId - Order ID
 */
async function markOrderAsFailedPayment(orderId) {
  await db.query(
    `UPDATE \`order\`
     SET status = 'failed_payment',
         updated_at = ?
     WHERE id = ?`,
    [new Date(), orderId]
  );
  console.log(`[PaymentFulfillment] 💔 Order ${orderId} marked as failed_payment`);
}

// ============= Booking Service Functions =============

/**
 * Confirm a booking after successful payment
 *
 * @param {string} bookingId - Booking ID
 * @param {number} paymentAmountCentavos - Payment amount in centavos
 */
async function confirmBooking(bookingId, paymentAmountCentavos) {
  await db.query(
    `UPDATE booking
     SET booking_status = 'Reserved',
         balance = GREATEST(0, balance - ?)
     WHERE id = ?`,
    [paymentAmountCentavos / 100, bookingId]
  );
  console.log(`[PaymentFulfillment] ✅ Booking ${bookingId} confirmed (status: Reserved)`);
}

/**
 * Mark a booking as failed payment
 *
 * @param {string} bookingId - Booking ID
 */
async function markBookingAsFailedPayment(bookingId) {
  await db.query(
    `UPDATE booking SET booking_status = 'Canceled' WHERE id = ?`,
    [bookingId]
  );
  console.log(`[PaymentFulfillment] 💔 Booking ${bookingId} marked as Canceled (payment failed)`);
}

// ============= Helper Functions =============

/**
 * Update payment record in database (Single Source of Truth)
 *
 * @param {Object} params - Update parameters
 * @param {string} params.paymentFor - Payment for type (order/booking)
 * @param {string} params.referenceId - Order or booking ID
 * @param {string} params.status - Payment status
 * @param {string} params.paymongoPaymentId - PayMongo payment ID
 * @param {string} [params.actualPaymentMethod] - Actual payment method type from PayMongo
 * @param {string} [params.actualPaymentMethodId] - Payment method ID from PayMongo
 * @param {Object} params.metadata - Additional metadata to merge
 */
async function updatePaymentRecord({
  paymentFor,
  referenceId,
  status,
  paymongoPaymentId,
  actualPaymentMethod,
  actualPaymentMethodId,
  metadata = {},
}) {
  const metadataSetClauses = Object.entries(metadata)
    .map(([key, _]) => `'$.${key}', ?`)
    .join(', ');

  const metadataValues = Object.values(metadata);

  // Build SET clause dynamically to include payment method if provided
  let setClauses = `status = ?, paymongo_payment_id = ?`;
  let params = [status, paymongoPaymentId];

  // CRITICAL: Update payment_method with the ACTUAL method from PayMongo
  if (actualPaymentMethod) {
    setClauses += `, payment_method = ?`;
    params.push(actualPaymentMethod);
  }

  // Save payment method ID if provided
  if (actualPaymentMethodId) {
    setClauses += `, payment_method_id = ?`;
    params.push(actualPaymentMethodId);
  }

  // Add metadata JSON_SET clause
  if (metadataSetClauses) {
    setClauses += `, metadata = JSON_SET(COALESCE(metadata, '{}'), ${metadataSetClauses})`;
    params.push(...metadataValues);
  }

  setClauses += `, updated_at = ?`;
  params.push(new Date(), paymentFor, referenceId);

  await db.query(
    `UPDATE payment SET ${setClauses} WHERE payment_for = ? AND payment_for_id = ?`,
    params
  );
}

/**
 * Update payment record by PayMongo payment/intent ID (fallback)
 *
 * @param {Object} params - Update parameters
 */
async function updatePaymentRecordByPaymentId({
  paymongoPaymentId,
  paymentIntentId,
  status,
  metadata = {},
}) {
  const metadataSetClauses = Object.entries(metadata)
    .map(([key, _]) => `'$.${key}', ?`)
    .join(', ');

  const metadataValues = Object.values(metadata);

  await db.query(
    `UPDATE payment
     SET status = ?,
         paymongo_payment_id = ?,
         metadata = JSON_SET(
           COALESCE(metadata, '{}'),
           ${metadataSetClauses}
         ),
         updated_at = ?
     WHERE paymongo_payment_id = ? OR payment_intent_id = ?`,
    [status, paymongoPaymentId, ...metadataValues, new Date(), paymongoPaymentId, paymentIntentId]
  );
}

/**
 * Lookup payment record by payment_intent_id
 *
 * @param {string} paymentIntentId - PayMongo payment intent ID
 * @returns {Promise<Object|null>} Payment record or null
 */
async function lookupPaymentByIntentId(paymentIntentId) {
  if (!paymentIntentId) return null;

  const [rows] = await db.query(
    `SELECT payment_for_id, payment_for FROM payment WHERE payment_intent_id = ? LIMIT 1`,
    [paymentIntentId]
  );

  return rows && rows.length > 0 ? rows[0] : null;
}

/**
 * Lookup payment record by paymongo_payment_id
 *
 * @param {string} paymentId - PayMongo payment ID
 * @returns {Promise<Object|null>} Payment record or null
 */
async function lookupPaymentByPaymentId(paymentId) {
  if (!paymentId) return null;

  const [rows] = await db.query(
    `SELECT payment_for_id, payment_for FROM payment
     WHERE paymongo_payment_id = ? LIMIT 1`,
    [paymentId]
  );

  return rows && rows.length > 0 ? rows[0] : null;
}

// ============= Real-time Event Emitters =============

/**
 * Emit real-time payment events via Socket.IO
 *
 * @param {string} orderId - Order ID
 * @param {string} paymentId - Payment ID
 * @param {string} status - Payment status
 * @param {number} amountCentavos - Amount in centavos
 */
async function emitPaymentEvents(orderId, paymentId, status, amountCentavos) {
  try {
    const [orderRows] = await db.query(
      `SELECT o.id, o.order_number, o.business_id, o.user_id, o.status,
              p.status as payment_status, p.payment_method
       FROM \`order\` o
       LEFT JOIN payment p ON p.payment_for = 'order' AND p.payment_for_id = o.id
       WHERE o.id = ?`,
      [orderId]
    );

    if (orderRows && orderRows.length > 0) {
      const order = orderRows[0];

      const paymentObj = {
        id: paymentId,
        payment_for_id: orderId,
        status,
        payment_method: 'paymongo',
        amount: amountCentavos ? amountCentavos / 100 : 0,
      };

      socketService.emitPaymentUpdated(paymentObj, order);
      socketService.emitOrderUpdated(order, null);

      await notificationHelper.triggerPaymentUpdateNotifications(paymentObj, order);
    }
  } catch (error) {
    console.error('[PaymentFulfillment] Failed to emit payment events:', error);
  }
}

/**
 * Emit new order notification after payment confirmed
 *
 * @param {string} orderId - Order ID
 */
async function emitNewOrderNotification(orderId) {
  try {
    const [orderRows] = await db.query(
      `SELECT o.*, u.email as user_email FROM \`order\` o
       JOIN user u ON u.id = o.user_id
       WHERE o.id = ?`,
      [orderId]
    );

    if (orderRows && orderRows.length > 0) {
      const order = orderRows[0];

      const [itemsResult] = await db.query(
        "SELECT * FROM order_item WHERE order_id = ?",
        [orderId]
      );

      const completeOrderData = {
        ...order,
        items: itemsResult || [],
        item_count: itemsResult?.length || 0,
      };

      socketService.emitNewOrder(completeOrderData);
      await notificationHelper.triggerNewOrderNotifications(completeOrderData);

      console.log(`[PaymentFulfillment] ✅ Business notified of new paid order ${order.order_number}`);
    }
  } catch (notifError) {
    console.error(`[PaymentFulfillment] ❌ Failed to emit order notifications:`, notifError);
  }
}

// ============= Payment Verification Functions =============

/**
 * Payment verification status constants
 */
export const VERIFICATION_STATUS = {
  SUCCESS: 'success',
  PENDING: 'pending',
  PROCESSING: 'processing',
  FAILED: 'failed',
  UNKNOWN: 'unknown',
};

/**
 * Verify payment status by querying PayMongo Payment Intent
 * This is the core verification logic extracted from bookingController.
 *
 * @param {Object} params - Verification parameters
 * @param {string} params.paymentIntentId - PayMongo Payment Intent ID
 * @returns {Promise<Object>} Verification result with status and message
 */
export async function verifyPaymentIntentStatus({ paymentIntentId }) {
  if (!paymentIntentId) {
    return {
      verified: false,
      status: VERIFICATION_STATUS.FAILED,
      message: 'No payment intent ID provided',
      paymentIntentStatus: null,
      lastPaymentError: null,
      paymongoPaymentId: null,
      paymentMethodType: null,
      paymentMethodId: null,
    };
  }

  console.log(`[PaymentFulfillment] 🔍 Verifying payment intent: ${paymentIntentId}`);

  try {
    const paymentIntent = await paymongoService.getPaymentIntent(paymentIntentId);
    const piStatus = paymentIntent?.attributes?.status;
    const lastPaymentError = paymentIntent?.attributes?.last_payment_error;

    // Extract payment details from the payments array
    // The last payment in the array is the most recent successful one
    const payments = paymentIntent?.attributes?.payments || [];
    const lastPayment = payments.slice(-1)[0];

    // Extract PayMongo payment ID (e.g., "pay_...")
    const paymongoPaymentId = lastPayment?.id || null;

    // Extract payment method type (e.g., "gcash", "card")
    const paymentMethodType = lastPayment?.attributes?.source?.type ||
                              lastPayment?.attributes?.payment_method_type ||
                              null;

    // Extract payment method ID (e.g., "src_..." for e-wallets, "pm_..." for cards)
    const paymentMethodId = lastPayment?.attributes?.source?.id ||
                            paymentIntent?.attributes?.payment_method ||
                            null;

    console.log(`[PaymentFulfillment] 📊 PayMongo PI status: ${piStatus}`);
    console.log(`[PaymentFulfillment] 💳 Payment details - ID: ${paymongoPaymentId}, Method: ${paymentMethodType}, MethodID: ${paymentMethodId}`);

    // Map PayMongo status to verification result
    // PayMongo Payment Intent statuses:
    // - awaiting_payment_method: Payment method not yet attached or failed
    // - awaiting_next_action: Waiting for 3DS or redirect completion
    // - processing: Payment is being processed
    // - succeeded: Payment was successful
    const result = mapPaymentIntentStatusToVerification(piStatus, lastPaymentError);

    return {
      ...result,
      paymentIntentStatus: piStatus,
      lastPaymentError,
      paymongoPaymentId,
      paymentMethodType,
      paymentMethodId,
    };
  } catch (error) {
    console.error(`[PaymentFulfillment] ❌ Error verifying payment intent:`, error);

    // Handle PayMongo API 404
    if (error.response?.status === 404 || error.message?.includes('404')) {
      return {
        verified: false,
        status: VERIFICATION_STATUS.FAILED,
        message: 'Payment intent not found on PayMongo',
        paymentIntentStatus: null,
        lastPaymentError: null,
      };
    }

    throw error;
  }
}

/**
 * Map PayMongo Payment Intent status to verification result
 *
 * @param {string} piStatus - PayMongo Payment Intent status
 * @param {Object} lastPaymentError - Last payment error from PayMongo
 * @returns {Object} Verification result
 */
function mapPaymentIntentStatusToVerification(piStatus, lastPaymentError) {
  switch (piStatus) {
    case 'succeeded':
      return {
        verified: true,
        status: VERIFICATION_STATUS.SUCCESS,
        message: 'Payment verified successfully',
      };

    case 'awaiting_payment_method':
      // Payment failed or was cancelled - need new payment method
      return {
        verified: false,
        status: VERIFICATION_STATUS.FAILED,
        message: lastPaymentError?.message || 'Payment was cancelled or declined. Please try again.',
      };

    case 'awaiting_next_action':
      // Still waiting for user action (3DS, redirect)
      return {
        verified: false,
        status: VERIFICATION_STATUS.PENDING,
        message: 'Payment is still pending user authorization',
      };

    case 'processing':
      // Payment is processing
      return {
        verified: false,
        status: VERIFICATION_STATUS.PROCESSING,
        message: 'Payment is being processed. Please wait...',
      };

    default:
      return {
        verified: false,
        status: VERIFICATION_STATUS.UNKNOWN,
        message: `Unexpected payment status: ${piStatus}`,
      };
  }
}

/**
 * Verify and fulfill payment for a booking
 * Complete verification flow with database updates.
 *
 * @param {Object} params - Verification parameters
 * @param {string} params.bookingId - Booking ID
 * @param {string} params.paymentId - Payment record ID (our DB)
 * @param {string} params.paymentIntentId - PayMongo Payment Intent ID
 * @param {string} params.currentPaymentStatus - Current payment status in our DB
 * @returns {Promise<Object>} Verification and fulfillment result
 */
export async function verifyAndFulfillBookingPayment({
  bookingId,
  paymentId,
  paymentIntentId,
  currentPaymentStatus,
}) {
  console.log(`[PaymentFulfillment] 🔍 Verifying booking payment: ${bookingId}, PI: ${paymentIntentId}`);

  // 1. Verify with PayMongo
  const verificationResult = await verifyPaymentIntentStatus({ paymentIntentId });

  // 2. Update local records based on verification result
  if (verificationResult.verified && currentPaymentStatus === 'pending') {
    // Payment succeeded - update payment record with PayMongo details
    // Build dynamic SET clause to include payment method if available
    let setClauses = `status = 'paid', updated_at = ?`;
    let params = [new Date()];

    // Add paymongo_payment_id if available
    if (verificationResult.paymongoPaymentId) {
      setClauses += `, paymongo_payment_id = ?`;
      params.push(verificationResult.paymongoPaymentId);
    }

    // Add payment_method (type) if available
    if (verificationResult.paymentMethodType) {
      setClauses += `, payment_method = ?`;
      params.push(verificationResult.paymentMethodType);
    }

    // Add payment_method_id if available
    if (verificationResult.paymentMethodId) {
      setClauses += `, payment_method_id = ?`;
      params.push(verificationResult.paymentMethodId);
    }

    params.push(paymentId); // WHERE clause

    await db.query(
      `UPDATE payment SET ${setClauses} WHERE id = ?`,
      params
    );

    await db.query(
      `UPDATE booking SET booking_status = 'Reserved' WHERE id = ? AND booking_status IN ('Pending', 'Reserved')`,
      [bookingId]
    );

    console.log(`[PaymentFulfillment] ✅ Booking payment ${paymentId} verified and marked as paid (status: Reserved, paymongoId: ${verificationResult.paymongoPaymentId || 'N/A'})`);

    // Audit logging
    try {
      await auditService.logOrderEvent({
        orderId: bookingId,
        eventType: auditService.EVENT_TYPES.PAYMENT_UPDATED,
        oldValue: 'pending',
        newValue: 'paid',
        actor: { id: null, role: 'system' },
        metadata: {
          payment_id: paymentId,
          payment_intent_id: paymentIntentId,
          verification_source: 'manual_verification',
          payment_for: PAYMENT_FOR.BOOKING,
        },
      });
    } catch (auditErr) {
      console.warn(`[PaymentFulfillment] ⚠️ Audit logging skipped: ${auditErr.message}`);
    }
  } else if (verificationResult.status === VERIFICATION_STATUS.FAILED && currentPaymentStatus === 'pending') {
    // Payment failed - update payment record
    await db.query(
      `UPDATE payment SET status = 'failed', updated_at = ? WHERE id = ?`,
      [new Date(), paymentId]
    );

    console.log(`[PaymentFulfillment] ❌ Booking payment ${paymentId} marked as failed`);
  }

  return {
    ...verificationResult,
    bookingId,
    paymentId,
  };
}

/**
 * Verify and fulfill payment for an order
 * Complete verification flow with database updates.
 *
 * @param {Object} params - Verification parameters
 * @param {string} params.orderId - Order ID
 * @param {string} params.paymentId - Payment record ID (our DB)
 * @param {string} params.paymentIntentId - PayMongo Payment Intent ID
 * @param {string} params.currentPaymentStatus - Current payment status in our DB
 * @returns {Promise<Object>} Verification and fulfillment result
 */
export async function verifyAndFulfillOrderPayment({
  orderId,
  paymentId,
  paymentIntentId,
  currentPaymentStatus,
}) {
  console.log(`[PaymentFulfillment] 🔍 Verifying order payment: ${orderId}, PI: ${paymentIntentId}`);

  // 1. Verify with PayMongo
  const verificationResult = await verifyPaymentIntentStatus({ paymentIntentId });

  // 2. Update local records based on verification result
  if (verificationResult.verified && currentPaymentStatus === 'pending') {
    // Payment succeeded - update payment record with PayMongo details
    // Build dynamic SET clause to include payment method if available
    let setClauses = `status = 'paid', updated_at = ?`;
    let params = [new Date()];

    // Add paymongo_payment_id if available
    if (verificationResult.paymongoPaymentId) {
      setClauses += `, paymongo_payment_id = ?`;
      params.push(verificationResult.paymongoPaymentId);
    }

    // Add payment_method (type) if available
    if (verificationResult.paymentMethodType) {
      setClauses += `, payment_method = ?`;
      params.push(verificationResult.paymentMethodType);
    }

    // Add payment_method_id if available
    if (verificationResult.paymentMethodId) {
      setClauses += `, payment_method_id = ?`;
      params.push(verificationResult.paymentMethodId);
    }

    params.push(paymentId); // WHERE clause

    await db.query(
      `UPDATE payment SET ${setClauses} WHERE id = ?`,
      params
    );

    await db.query(
      `UPDATE \`order\` SET updated_at = ? WHERE id = ?`,
      [new Date(), orderId]
    );

    console.log(`[PaymentFulfillment] ✅ Order payment ${paymentId} verified and marked as paid (paymongoId: ${verificationResult.paymongoPaymentId || 'N/A'})`);

    // Emit real-time events
    await emitPaymentEvents(orderId, paymentId, PAYMENT_STATUS.PAID, null);
    await emitNewOrderNotification(orderId);

    // Audit logging
    try {
      await auditService.logOrderEvent({
        orderId,
        eventType: auditService.EVENT_TYPES.PAYMENT_UPDATED,
        oldValue: 'pending',
        newValue: 'paid',
        actor: { id: null, role: 'system' },
        metadata: {
          payment_id: paymentId,
          payment_intent_id: paymentIntentId,
          verification_source: 'manual_verification',
          payment_for: PAYMENT_FOR.ORDER,
        },
      });
    } catch (auditErr) {
      console.warn(`[PaymentFulfillment] ⚠️ Audit logging skipped: ${auditErr.message}`);
    }
  } else if (verificationResult.status === VERIFICATION_STATUS.FAILED && currentPaymentStatus === 'pending') {
    // Payment failed - update payment and order
    await db.query(
      `UPDATE payment SET status = 'failed', updated_at = ? WHERE id = ?`,
      [new Date(), paymentId]
    );

    await db.query(
      `UPDATE \`order\` SET status = 'failed_payment', updated_at = ? WHERE id = ?`,
      [new Date(), orderId]
    );

    console.log(`[PaymentFulfillment] ❌ Order payment ${paymentId} marked as failed`);
  }

  return {
    ...verificationResult,
    orderId,
    paymentId,
  };
}

// ============= Export =============

export default {
  // Core fulfillment functions
  handlePaymentPaid,
  handlePaymentFailed,
  handleRefundSucceeded,

  // Verification functions
  verifyPaymentIntentStatus,
  verifyAndFulfillBookingPayment,
  verifyAndFulfillOrderPayment,

  // Constants
  PAYMENT_STATUS,
  PAYMENT_FOR,
  VERIFICATION_STATUS,
};