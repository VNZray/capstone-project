/**
 * Universal Payment Workflow Controller
 *
 * Unified payment initiation and verification for both Orders and Bookings.
 * This controller replaces the hardcoded order-only logic with a dynamic
 * resource lookup based on payment_for parameter.
 *
 * Architecture: THIN controller - handles HTTP concerns only.
 * Business logic delegated to PaymentFulfillmentService.
 *
 * @see services/paymentFulfillmentService.js
 * @see services/paymongoService.js
 */

import db from "../../db.js";
import { v4 as uuidv4 } from "uuid";
import * as paymongoService from "../../services/paymongoService.js";
import * as paymentFulfillmentService from "../../services/paymentFulfillmentService.js";
import { ensureUserRole } from "../../utils/authHelpers.js";

// ============= Constants =============

const VALID_PAYMENT_FOR = ['order', 'booking'];
const VALID_PAYMENT_METHODS = ['card', 'gcash', 'paymaya'];

// Environment configuration
const PAYMONGO_REDIRECT_BASE = (
  process.env.PAYMONGO_REDIRECT_BASE ||
  process.env.FRONTEND_BASE_URL ||
  "http://localhost:5173"
).replace(/\/$/, "");

// ============= Resource Lookup Strategies =============

/**
 * Lookup order resource and normalize to common structure
 *
 * @param {string} referenceId - Order ID
 * @param {string} userId - Authenticated user ID
 * @returns {Promise<Object>} Normalized resource data
 */
async function lookupOrderResource(referenceId, userId) {
  const [rows] = await db.query(
    `SELECT
      o.id, o.order_number, o.user_id, o.business_id, o.total_amount, o.status,
      p.status as payment_status,
      p.payment_method as existing_payment_method,
      p.payment_intent_id,
      p.client_key,
      p.id as existing_payment_id
     FROM \`order\` o
     LEFT JOIN payment p ON p.payment_for = 'order' AND p.payment_for_id = o.id
     WHERE o.id = ?`,
    [referenceId]
  );

  if (!rows || rows.length === 0) {
    return { found: false, error: "Order not found" };
  }

  const order = rows[0];

  return {
    found: true,
    resource: order,
    normalized: {
      id: order.id,
      owner_id: order.user_id,
      business_id: order.business_id,
      amount: order.total_amount,
      description: `Order #${order.order_number}`,
      display_name: order.order_number,
      is_paid: order.payment_status === 'paid',
      can_pay: order.status === 'pending',
      status: order.status,
      payment_status: order.payment_status,
      existing_payment_id: order.existing_payment_id,
      existing_payment_intent_id: order.payment_intent_id,
      existing_client_key: order.client_key,
      existing_payment_method: order.existing_payment_method,
    },
    // Order uses user_id directly
    isOwner: order.user_id === userId,
  };
}

/**
 * Lookup booking resource and normalize to common structure
 *
 * @param {string} referenceId - Booking ID
 * @param {string} userId - Authenticated user ID
 * @returns {Promise<Object>} Normalized resource data
 */
async function lookupBookingResource(referenceId, userId) {
  const [rows] = await db.query(
    `SELECT
      b.id, b.tourist_id, b.business_id, b.total_price, b.balance, b.booking_status,
      b.room_id, b.check_in_date, b.check_out_date,
      t.user_id as tourist_user_id,
      r.room_type, r.room_number,
      bus.business_name,
      p.status as payment_status,
      p.payment_method as existing_payment_method,
      p.payment_intent_id,
      p.client_key,
      p.id as existing_payment_id
     FROM booking b
     LEFT JOIN tourist t ON b.tourist_id = t.id
     LEFT JOIN room r ON b.room_id = r.id
     LEFT JOIN business bus ON b.business_id = bus.id
     LEFT JOIN payment p ON p.payment_for = 'booking' AND p.payment_for_id = b.id
     WHERE b.id = ?`,
    [referenceId]
  );

  if (!rows || rows.length === 0) {
    return { found: false, error: "Booking not found" };
  }

  const booking = rows[0];
  const roomName = booking.room_type && booking.room_number
    ? `${booking.room_type} - ${booking.room_number}`
    : 'Room';
  const shortId = booking.id.substring(0, 8);

  return {
    found: true,
    resource: booking,
    normalized: {
      id: booking.id,
      owner_id: booking.tourist_user_id, // Resolved from tourist table
      tourist_id: booking.tourist_id,
      business_id: booking.business_id,
      amount: booking.balance || booking.total_price,
      description: `Booking ${shortId} - ${roomName} at ${booking.business_name || 'Accommodation'}`,
      display_name: `Booking ${shortId}`,
      is_paid: ['Reserved', 'Checked-In', 'Checked-Out'].includes(booking.booking_status),
      can_pay: ['Pending'].includes(booking.booking_status),
      status: booking.booking_status,
      payment_status: booking.payment_status,
      existing_payment_id: booking.existing_payment_id,
      existing_payment_intent_id: booking.payment_intent_id,
      existing_client_key: booking.client_key,
      existing_payment_method: booking.existing_payment_method,
      // Extra booking metadata
      room_id: booking.room_id,
      room_name: roomName,
      check_in_date: booking.check_in_date,
      check_out_date: booking.check_out_date,
    },
    // Booking uses tourist_id -> tourist.user_id
    isOwner: booking.tourist_user_id === userId,
  };
}

/**
 * Dynamic resource lookup based on payment_for type
 *
 * @param {string} paymentFor - 'order' or 'booking'
 * @param {string} referenceId - Resource ID
 * @param {string} userId - Authenticated user ID
 * @returns {Promise<Object>} Lookup result
 */
async function lookupResource(paymentFor, referenceId, userId) {
  if (paymentFor === 'order') {
    return lookupOrderResource(referenceId, userId);
  } else if (paymentFor === 'booking') {
    return lookupBookingResource(referenceId, userId);
  }

  return { found: false, error: `Invalid payment_for: ${paymentFor}` };
}

// ============= Controller Functions =============

/**
 * Unified Payment Initiation
 * POST /api/payments/workflow/initiate
 *
 * Body: {
 *   payment_for: 'order' | 'booking',
 *   reference_id: string,
 *   payment_method?: 'card' | 'gcash' | 'paymaya'
 * }
 *
 * Auth: Required (Tourist role)
 *
 * This endpoint dynamically looks up the target resource (Order or Booking)
 * and creates a PayMongo Payment Intent for it.
 */
export async function initiateUnifiedPayment(req, res) {
  try {
    const { payment_for, reference_id, payment_method } = req.body;
    const user_id = req.user?.id;

    // 1. Validate input
    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    if (!payment_for || !VALID_PAYMENT_FOR.includes(payment_for)) {
      return res.status(400).json({
        success: false,
        message: `Invalid payment_for. Must be one of: ${VALID_PAYMENT_FOR.join(', ')}`
      });
    }

    if (!reference_id) {
      return res.status(400).json({
        success: false,
        message: "reference_id is required"
      });
    }

    // Validate payment_method if provided
    if (payment_method && !VALID_PAYMENT_METHODS.includes(payment_method)) {
      return res.status(400).json({
        success: false,
        message: `Invalid payment_method. Must be one of: ${VALID_PAYMENT_METHODS.join(', ')}`
      });
    }

    // 2. Dynamic Resource Lookup
    const lookupResult = await lookupResource(payment_for, reference_id, user_id);

    if (!lookupResult.found) {
      return res.status(404).json({
        success: false,
        message: lookupResult.error
      });
    }

    const { normalized, isOwner } = lookupResult;

    // 3. Authorization - verify ownership
    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: `You are not authorized to initiate payment for this ${payment_for}`
      });
    }

    // 4. Validate payment state
    if (normalized.is_paid) {
      return res.status(400).json({
        success: false,
        message: `Payment already completed for this ${payment_for}`
      });
    }

    if (!normalized.can_pay) {
      return res.status(400).json({
        success: false,
        message: `Cannot initiate payment for ${payment_for} with status: ${normalized.status}`
      });
    }

    // 5. Determine payment method allowed
    const effectivePaymentMethod = payment_method || normalized.existing_payment_method;
    const allowedMethods = effectivePaymentMethod && VALID_PAYMENT_METHODS.includes(effectivePaymentMethod)
      ? [effectivePaymentMethod]
      : VALID_PAYMENT_METHODS;

    // 6. Check for existing valid Payment Intent
    if (normalized.existing_payment_intent_id) {
      try {
        const existingIntent = await paymongoService.getPaymentIntent(normalized.existing_payment_intent_id);
        const intentStatus = existingIntent.attributes.status;

        // If intent is still valid, return it
        if (['awaiting_payment_method', 'awaiting_next_action'].includes(intentStatus)) {
          console.log(`[PaymentWorkflow] Returning existing Payment Intent: ${normalized.existing_payment_intent_id}`);

          return res.status(200).json({
            success: true,
            message: "Existing Payment Intent retrieved",
            data: {
              payment_id: normalized.existing_payment_id,
              payment_intent_id: normalized.existing_payment_intent_id,
              client_key: existingIntent.attributes.client_key,
              payment_for,
              reference_id,
              display_name: normalized.display_name,
              amount: normalized.amount,
              amount_centavos: Math.round(normalized.amount * 100),
              currency: 'PHP',
              payment_method_allowed: existingIntent.attributes.payment_method_allowed,
              status: intentStatus,
              public_key: process.env.PAYMONGO_PUBLIC_KEY
            }
          });
        }
      } catch (err) {
        console.log('[PaymentWorkflow] Existing intent not found or invalid, creating new one...');
      }
    }

    // 7. Validate amount (minimum ₱20 for Payment Intents)
    const amountInCentavos = Math.round(normalized.amount * 100);

    if (amountInCentavos < 2000) {
      return res.status(400).json({
        success: false,
        message: `Amount too low for Payment Intent (minimum ₱20.00), got ₱${normalized.amount.toFixed(2)}`
      });
    }

    // 8. Build metadata for webhook reconciliation
    const metadata = {
      payment_for,
      reference_id,
      user_id,
      business_id: normalized.business_id,
      amount: normalized.amount.toString(),
      source: 'unified_workflow',
      // Include booking-specific metadata if applicable
      ...(payment_for === 'booking' && {
        tourist_id: normalized.tourist_id,
        room_id: normalized.room_id,
        booking_id: reference_id,
      }),
      // Include order-specific metadata if applicable
      ...(payment_for === 'order' && {
        order_id: reference_id,
      }),
    };

    // 9. Create Payment Intent via PayMongo
    console.log(`[PaymentWorkflow] Creating Payment Intent for ${payment_for} ${reference_id}`);

    const paymentIntent = await paymongoService.createPaymentIntent({
      orderId: reference_id, // Used as reference in PayMongo
      amount: amountInCentavos,
      description: normalized.description,
      paymentMethodAllowed: allowedMethods,
      metadata,
      statementDescriptor: 'CITY VENTURE'
    });

    const paymentIntentId = paymentIntent.id;
    const clientKey = paymentIntent.attributes.client_key;

    // 10. Create or update payment record (Single Source of Truth)
    const payment_id = normalized.existing_payment_id || uuidv4();
    const created_at = new Date();
    const initialPaymentMethod = effectivePaymentMethod || 'card';

    if (normalized.existing_payment_id) {
      // Update existing payment record with new intent
      await db.query(
        `UPDATE payment
         SET payment_intent_id = ?, client_key = ?, metadata = ?, updated_at = ?
         WHERE id = ?`,
        [
          paymentIntentId,
          clientKey,
          JSON.stringify({ ...metadata, client_key: clientKey }),
          created_at,
          payment_id
        ]
      );
    } else {
      // Insert new payment record using stored procedure for consistency
      await db.query(
        `CALL InsertPayment(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          payment_id,
          'Tourist',              // payer_type
          'Full Payment',         // payment_type
          initialPaymentMethod,   // payment_method
          normalized.amount,      // amount
          'pending',              // status
          payment_for,            // payment_for
          user_id,                // payer_id
          reference_id,           // payment_for_id
          created_at
        ]
      );

      // Update with PayMongo intent details
      await db.query(
        `UPDATE payment
         SET payment_intent_id = ?, client_key = ?, currency = 'PHP', metadata = ?
         WHERE id = ?`,
        [
          paymentIntentId,
          clientKey,
          JSON.stringify({ ...metadata, client_key: clientKey }),
          payment_id
        ]
      );
    }

    console.log(`[PaymentWorkflow] ✅ Payment Intent created: ${paymentIntentId} for ${payment_for} ${reference_id}`);

    // 11. Return intent details to client
    res.status(201).json({
      success: true,
      message: "Payment Intent created successfully",
      data: {
        payment_id,
        payment_intent_id: paymentIntentId,
        client_key: clientKey,
        payment_for,
        reference_id,
        display_name: normalized.display_name,
        amount: normalized.amount,
        amount_centavos: amountInCentavos,
        currency: 'PHP',
        payment_method_allowed: allowedMethods,
        status: paymentIntent.attributes.status,
        public_key: process.env.PAYMONGO_PUBLIC_KEY
      }
    });

  } catch (error) {
    console.error("[PaymentWorkflow] Error initiating payment:", error);

    if (error.message?.includes('PayMongo')) {
      return res.status(502).json({
        success: false,
        message: "Payment provider error. Please try again later."
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to initiate payment",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Get Payment Intent Status (Unified)
 * GET /api/payments/workflow/status/:paymentIntentId
 *
 * Query: { payment_for?: 'order' | 'booking' }
 *
 * Auth: Required
 *
 * Retrieves the current status of a Payment Intent from PayMongo
 * and returns it along with the associated resource status.
 */
export async function getUnifiedPaymentStatus(req, res) {
  try {
    const { paymentIntentId } = req.params;
    const { payment_for } = req.query;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: "paymentIntentId is required"
      });
    }

    // 1. Find the payment record by payment_intent_id
    let query = `
      SELECT p.*,
             CASE WHEN p.payment_for = 'order' THEN o.user_id
                  WHEN p.payment_for = 'booking' THEN t.user_id
                  ELSE NULL END as owner_user_id
      FROM payment p
      LEFT JOIN \`order\` o ON p.payment_for = 'order' AND p.payment_for_id = o.id
      LEFT JOIN booking b ON p.payment_for = 'booking' AND p.payment_for_id = b.id
      LEFT JOIN tourist t ON b.tourist_id = t.id
      WHERE p.payment_intent_id = ?
    `;
    const queryParams = [paymentIntentId];

    // Optionally filter by payment_for
    if (payment_for && VALID_PAYMENT_FOR.includes(payment_for)) {
      query += ` AND p.payment_for = ?`;
      queryParams.push(payment_for);
    }

    const [rows] = await db.query(query, queryParams);

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Payment Intent not found"
      });
    }

    const payment = rows[0];

    // 2. Authorization check
    const userRole = await ensureUserRole(req);
    if (userRole !== 'Admin' && payment.owner_user_id !== user_id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this payment intent"
      });
    }

    // 3. Retrieve Payment Intent from PayMongo
    let paymongoIntent = null;
    let actualPaymentMethod = null;
    let actualPaymentMethodId = null;

    try {
      paymongoIntent = await paymongoService.getPaymentIntent(paymentIntentId);

      // Extract actual payment method from PayMongo
      // The payment intent has a 'payments' array - the last one is the most recent
      const lastPayment = paymongoIntent.attributes?.payments?.slice(-1)[0];
      actualPaymentMethod = lastPayment?.attributes?.source?.type || lastPayment?.attributes?.payment_method_type;

      // Payment method ID can be in different locations depending on payment type:
      // - For e-wallets: lastPayment.attributes.source.id (e.g., "src_...")
      // - For cards: paymongoIntent.attributes.payment_method (e.g., "pm_...")
      // - Alternative: lastPayment.id is the payment ID (e.g., "pay_...")
      actualPaymentMethodId = lastPayment?.attributes?.source?.id
        || paymongoIntent.attributes?.payment_method
        || lastPayment?.id;

      console.log(`[PaymentWorkflow] PayMongo data - Method: ${actualPaymentMethod}, ID: ${actualPaymentMethodId}`);

    } catch (err) {
      console.warn("[PaymentWorkflow] Failed to fetch from PayMongo, relying on local DB:", err.message);
    }

    // 4. "Just-in-Time" Sync: If DB has wrong method OR missing ID, fix it
    // This handles the case where webhook hasn't fired yet but PayMongo shows the actual method
    const needsMethodSync = actualPaymentMethod && payment.payment_method !== actualPaymentMethod;
    const needsIdSync = actualPaymentMethodId && !payment.payment_method_id;

    if (needsMethodSync || needsIdSync) {
      console.log(`[PaymentWorkflow] Syncing payment data:`);
      if (needsMethodSync) {
        console.log(`  - Method: ${payment.payment_method} -> ${actualPaymentMethod}`);
      }
      if (needsIdSync) {
        console.log(`  - ID: NULL -> ${actualPaymentMethodId}`);
      }

      await db.query(
        `UPDATE payment
         SET payment_method = COALESCE(?, payment_method),
             payment_method_id = COALESCE(?, payment_method_id),
             updated_at = ?
         WHERE id = ?`,
        [actualPaymentMethod, actualPaymentMethodId, new Date(), payment.id]
      );

      // Update local variables so response is correct immediately
      if (actualPaymentMethod) payment.payment_method = actualPaymentMethod;
      if (actualPaymentMethodId) payment.payment_method_id = actualPaymentMethodId;
    }

    // 5. Return unified response
    // CRITICAL: Map local payment.status to 'order_payment_status' for frontend compatibility
    // The frontend PaymentIntentService.pollPaymentIntentStatus() checks for 'order_payment_status'
    res.status(200).json({
      success: true,
      data: {
        payment_id: payment.id,
        payment_intent_id: paymentIntentId,
        payment_for: payment.payment_for,
        reference_id: payment.payment_for_id,

        // PayMongo status (e.g., 'succeeded', 'processing', 'awaiting_next_action')
        status: paymongoIntent?.attributes?.status || 'unknown',

        // Local DB status - CRITICAL for frontend poll loop exit
        // Frontend checks: status.data.order_payment_status === 'paid'
        order_payment_status: payment.status,

        // Payment method info (synced from PayMongo)
        payment_method: payment.payment_method,
        payment_method_id: payment.payment_method_id,

        amount: paymongoIntent ? paymongoIntent.attributes.amount / 100 : payment.amount,
        currency: paymongoIntent?.attributes?.currency || payment.currency || 'PHP',
        client_key: payment.client_key,
        payment_method_allowed: paymongoIntent?.attributes?.payment_method_allowed || [],
        last_payment_error: paymongoIntent?.attributes?.last_payment_error || null,
        next_action: paymongoIntent?.attributes?.next_action || null,
        payments: paymongoIntent?.attributes?.payments || [],
      }
    });

  } catch (error) {
    console.error("[PaymentWorkflow] Error retrieving payment status:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve payment status",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Verify and Fulfill Payment (Unified)
 * POST /api/payments/workflow/verify
 *
 * Body: {
 *   payment_for: 'order' | 'booking',
 *   reference_id: string,
 *   payment_id: string
 * }
 *
 * Auth: Required (Tourist role)
 *
 * Verifies payment status with PayMongo and fulfills the payment
 * by updating local records if successful.
 */
export async function verifyUnifiedPayment(req, res) {
  try {
    const { payment_for, reference_id, payment_id } = req.body;
    const user_id = req.user?.id;

    // 1. Validate input
    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    if (!payment_for || !VALID_PAYMENT_FOR.includes(payment_for)) {
      return res.status(400).json({
        success: false,
        message: `Invalid payment_for. Must be one of: ${VALID_PAYMENT_FOR.join(', ')}`
      });
    }

    if (!reference_id || !payment_id) {
      return res.status(400).json({
        success: false,
        message: "reference_id and payment_id are required"
      });
    }

    // 2. Lookup resource for authorization
    const lookupResult = await lookupResource(payment_for, reference_id, user_id);

    if (!lookupResult.found) {
      return res.status(404).json({
        success: false,
        message: lookupResult.error
      });
    }

    if (!lookupResult.isOwner) {
      return res.status(403).json({
        success: false,
        message: `You are not authorized to verify payment for this ${payment_for}`
      });
    }

    // 3. Fetch payment record
    const [paymentRows] = await db.query(
      `SELECT id, payment_intent_id, status FROM payment WHERE id = ? AND payment_for = ? AND payment_for_id = ?`,
      [payment_id, payment_for, reference_id]
    );

    if (!paymentRows || paymentRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found"
      });
    }

    const payment = paymentRows[0];

    if (!payment.payment_intent_id) {
      return res.status(400).json({
        success: false,
        message: "No payment intent ID found for this payment"
      });
    }

    // 4. Delegate verification to PaymentFulfillmentService
    let verificationResult;

    if (payment_for === 'order') {
      verificationResult = await paymentFulfillmentService.verifyAndFulfillOrderPayment({
        orderId: reference_id,
        paymentId: payment_id,
        paymentIntentId: payment.payment_intent_id,
        currentPaymentStatus: payment.status,
      });
    } else if (payment_for === 'booking') {
      verificationResult = await paymentFulfillmentService.verifyAndFulfillBookingPayment({
        bookingId: reference_id,
        paymentId: payment_id,
        paymentIntentId: payment.payment_intent_id,
        currentPaymentStatus: payment.status,
      });
    }

    // 5. Return verification result
    return res.status(200).json({
      success: true,
      data: {
        verified: verificationResult.verified,
        payment_status: verificationResult.status,
        message: verificationResult.message,
        payment_intent_status: verificationResult.paymentIntentStatus,
        payment_for,
        reference_id,
        payment_id,
        amount: lookupResult.normalized.amount,
        last_payment_error: verificationResult.lastPaymentError
      }
    });

  } catch (error) {
    console.error("[PaymentWorkflow] Error verifying payment:", error);

    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        message: "Payment intent not found on PayMongo"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to verify payment",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// ============= Export =============

export default {
  initiateUnifiedPayment,
  getUnifiedPaymentStatus,
  verifyUnifiedPayment,
};