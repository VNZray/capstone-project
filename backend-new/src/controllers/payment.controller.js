/**
 * Payment Controller
 * Handles payment operations
 */
import { sequelize } from '../models/index.js';
import { ApiError } from '../utils/api-error.js';
import { extractProcedureResult, extractSingleResult } from '../utils/helpers.js';
import logger from '../config/logger.js';
import * as paymongoService from '../services/paymongo.service.js';

// ============= Constants =============
const VALID_PAYMENT_FOR = ['order', 'booking'];
const VALID_PAYMENT_METHODS = ['card', 'gcash', 'paymaya'];

const PAYMONGO_REDIRECT_BASE = (
  process.env.PAYMONGO_REDIRECT_BASE ||
  process.env.FRONTEND_BASE_URL ||
  'http://localhost:5173'
).replace(/\/$/, '');

// ============= Resource Lookup Helpers =============

/**
 * Lookup order resource and normalize to common structure
 */
async function lookupOrderResource(referenceId, userId) {
  const [rows] = await sequelize.query(`
    SELECT
      o.id, o.order_number, o.user_id, o.business_id, o.total_amount, o.status,
      p.status as payment_status,
      p.payment_method as existing_payment_method,
      p.payment_intent_id,
      p.client_key,
      p.id as existing_payment_id
     FROM \`order\` o
     LEFT JOIN payment p ON p.payment_for = 'order' AND p.payment_for_id = o.id
     WHERE o.id = ?
  `, { replacements: [referenceId] });

  if (!rows || rows.length === 0) {
    return { found: false, error: 'Order not found' };
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
      can_pay: order.status === 'pending' || order.status === 'failed_payment',
      status: order.status,
      payment_status: order.payment_status,
      existing_payment_id: order.existing_payment_id,
      existing_payment_intent_id: order.payment_intent_id,
      existing_client_key: order.client_key,
    },
    isOwner: order.user_id === userId,
  };
}

/**
 * Lookup booking resource and normalize to common structure
 */
async function lookupBookingResource(referenceId, userId) {
  const [rows] = await sequelize.query(`
    SELECT
      b.id, b.tourist_id, b.business_id, b.total_price, b.balance, b.booking_status,
      b.room_id,
      t.user_id as tourist_user_id,
      r.room_type, r.room_number,
      bus.business_name,
      p.status as payment_status,
      p.payment_intent_id,
      p.client_key,
      p.id as existing_payment_id
     FROM booking b
     LEFT JOIN tourist t ON b.tourist_id = t.id
     LEFT JOIN room r ON b.room_id = r.id
     LEFT JOIN business bus ON b.business_id = bus.id
     LEFT JOIN payment p ON p.payment_for = 'booking' AND p.payment_for_id = b.id
     WHERE b.id = ?
  `, { replacements: [referenceId] });

  if (!rows || rows.length === 0) {
    return { found: false, error: 'Booking not found' };
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
      owner_id: booking.tourist_user_id,
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
    },
    isOwner: booking.tourist_user_id === userId,
  };
}

async function lookupResource(paymentFor, referenceId, userId) {
  if (paymentFor === 'order') {
    return lookupOrderResource(referenceId, userId);
  } else if (paymentFor === 'booking') {
    return lookupBookingResource(referenceId, userId);
  }
  return { found: false, error: `Invalid payment_for: ${paymentFor}` };
}

// ============= Unified Payment Workflow =============

/**
 * Initiate unified payment (PIPM flow)
 * POST /api/v1/payments/workflow/initiate
 */
export const initiateUnifiedPayment = async (req, res, next) => {
  try {
    const { payment_for, reference_id, payment_method } = req.body;
    const user_id = req.user?.id;

    logger.info(`[PaymentWorkflow] Initiate payment - for: ${payment_for}, ref: ${reference_id}, method: ${payment_method}`);

    if (!user_id) {
      throw ApiError.unauthorized('Authentication required');
    }

    if (!payment_for || !VALID_PAYMENT_FOR.includes(payment_for)) {
      throw ApiError.badRequest(`Invalid payment_for. Must be one of: ${VALID_PAYMENT_FOR.join(', ')}`);
    }

    if (!reference_id) {
      throw ApiError.badRequest('reference_id is required');
    }

    // Lookup resource
    const lookup = await lookupResource(payment_for, reference_id, user_id);
    if (!lookup.found) {
      throw ApiError.notFound(lookup.error);
    }

    const { normalized, isOwner } = lookup;

    // Authorization check
    if (!isOwner) {
      throw ApiError.forbidden('You do not have permission to pay for this resource');
    }

    // Check if already paid
    if (normalized.is_paid) {
      throw ApiError.badRequest(`${payment_for} is already paid`);
    }

    // Check if payable
    if (!normalized.can_pay) {
      throw ApiError.badRequest(`${payment_for} cannot be paid in current status: ${normalized.status}`);
    }

    // Check for existing Payment Intent that can be reused
    if (normalized.existing_payment_intent_id && normalized.existing_client_key) {
      logger.info(`[PaymentWorkflow] Reusing existing Payment Intent: ${normalized.existing_payment_intent_id}`);

      res.success({
        payment_id: normalized.existing_payment_id,
        payment_intent_id: normalized.existing_payment_intent_id,
        client_key: normalized.existing_client_key,
        status: 'awaiting_payment_method',
        message: 'Existing payment session resumed'
      });
      return;
    }

    // Create new payment via PIPM flow
    const paymentMethodType = payment_method || 'gcash';
    if (!VALID_PAYMENT_METHODS.includes(paymentMethodType)) {
      throw ApiError.badRequest(`Invalid payment_method. Must be one of: ${VALID_PAYMENT_METHODS.join(', ')}`);
    }

    const amountCentavos = Math.round(normalized.amount * 100);
    const returnUrl = `${PAYMONGO_REDIRECT_BASE}/payments/${payment_for}/${reference_id}/complete`;

    // Create Payment Intent
    const paymentIntent = await paymongoService.createPaymentIntent(
      amountCentavos,
      normalized.description,
      {
        payment_for,
        reference_id,
        user_id
      }
    );

    // Create/update payment record
    const paymentId = crypto.randomUUID();
    await sequelize.query(`
      INSERT INTO payment (id, payer_id, payment_for, payment_for_id, amount, payment_method, status, payment_intent_id, client_key, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        payment_intent_id = VALUES(payment_intent_id),
        client_key = VALUES(client_key),
        payment_method = VALUES(payment_method)
    `, {
      replacements: [
        paymentId,
        user_id,
        payment_for,
        reference_id,
        normalized.amount,
        paymentMethodType,
        paymentIntent.id,
        paymentIntent.attributes.client_key
      ]
    });

    logger.info(`[PaymentWorkflow] Payment Intent created: ${paymentIntent.id}`);

    res.success({
      payment_id: paymentId,
      payment_intent_id: paymentIntent.id,
      client_key: paymentIntent.attributes.client_key,
      public_key: process.env.PAYMONGO_PUBLIC_KEY,
      amount: normalized.amount,
      return_url: returnUrl,
      status: 'awaiting_payment_method'
    });
  } catch (error) {
    logger.error('Error initiating unified payment:', error);
    next(error);
  }
};

/**
 * Verify payment status
 * GET /api/v1/payments/workflow/:paymentFor/:referenceId/verify
 */
export const verifyPaymentStatus = async (req, res, next) => {
  try {
    const { paymentFor, referenceId } = req.params;
    const user_id = req.user?.id;

    if (!VALID_PAYMENT_FOR.includes(paymentFor)) {
      throw ApiError.badRequest('Invalid payment_for');
    }

    const lookup = await lookupResource(paymentFor, referenceId, user_id);
    if (!lookup.found) {
      throw ApiError.notFound(lookup.error);
    }

    const { normalized } = lookup;

    // If we have a Payment Intent, check its status
    if (normalized.existing_payment_intent_id) {
      try {
        const paymentIntent = await paymongoService.getPaymentIntent(normalized.existing_payment_intent_id);
        const piStatus = paymentIntent.attributes.status;

        res.success({
          payment_for: paymentFor,
          reference_id: referenceId,
          payment_intent_status: piStatus,
          payment_status: normalized.payment_status || 'pending',
          is_paid: normalized.is_paid,
          resource_status: normalized.status
        });
        return;
      } catch (err) {
        logger.warn(`Could not fetch Payment Intent status: ${err.message}`);
      }
    }

    res.success({
      payment_for: paymentFor,
      reference_id: referenceId,
      payment_status: normalized.payment_status || 'pending',
      is_paid: normalized.is_paid,
      resource_status: normalized.status
    });
  } catch (error) {
    logger.error('Error verifying payment status:', error);
    next(error);
  }
};

/**
 * Create payment
 */
export const createPayment = async (req, res, next) => {
  try {
    const {
      payer_id,
      payment_for,
      payment_for_id,
      amount,
      payment_method,
      currency = 'PHP'
    } = req.body;

    const id = crypto.randomUUID();
    await sequelize.query(
      'CALL InsertPayment(?, ?, ?, ?, ?, ?, ?, ?)',
      {
        replacements: [id, payer_id, payment_for, payment_for_id, amount, currency, payment_method, 'pending']
      }
    );

    const queryResult = await sequelize.query('CALL GetPaymentById(?)', {
      replacements: [id]
    });
    const result = extractSingleResult(queryResult);

    res.status(201).success(result, 'Payment created');
  } catch (error) {
    logger.error('Error creating payment:', error);
    next(error);
  }
};

/**
 * Get payment by ID
 */
export const getPayment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const queryResult = await sequelize.query('CALL GetPaymentById(?)', {
      replacements: [id]
    });
    const result = extractSingleResult(queryResult);

    if (!result) {
      throw ApiError.notFound('Payment not found');
    }

    res.success(result);
  } catch (error) {
    logger.error('Error fetching payment:', error);
    next(error);
  }
};

/**
 * Update payment status
 */
export const updatePaymentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, providerPaymentId } = req.body;

    await sequelize.query('CALL UpdatePaymentStatus(?, ?)', {
      replacements: [id, status]
    });

    if (providerPaymentId) {
      await sequelize.query(
        'UPDATE payment SET paymongo_payment_id = ? WHERE id = ?',
        { replacements: [providerPaymentId, id] }
      );
    }

    const queryResult = await sequelize.query('CALL GetPaymentById(?)', {
      replacements: [id]
    });
    const result = extractSingleResult(queryResult);

    res.success(result, `Payment status updated to ${status}`);
  } catch (error) {
    logger.error('Error updating payment status:', error);
    next(error);
  }
};

/**
 * Get payments with filters
 */
export const getPayments = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, paymentMethod, startDate, endDate } = req.query;

    const queryResult = await sequelize.query('CALL GetAllPayments()');
    const results = extractProcedureResult(queryResult);

    // Apply filters
    let filtered = results;
    if (status) {
      filtered = filtered.filter(p => p.status === status);
    }
    if (paymentMethod) {
      filtered = filtered.filter(p => p.payment_method === paymentMethod);
    }
    if (startDate) {
      filtered = filtered.filter(p => new Date(p.created_at) >= new Date(startDate));
    }
    if (endDate) {
      filtered = filtered.filter(p => new Date(p.created_at) <= new Date(endDate));
    }

    // Apply pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const paginatedResults = filtered.slice(offset, offset + parseInt(limit));

    res.success({
      data: paginatedResults,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filtered.length
      }
    });
  } catch (error) {
    logger.error('Error fetching payments:', error);
    next(error);
  }
};

/**
 * Create refund
 */
export const createRefund = async (req, res, next) => {
  try {
    const { payment_id, amount, reason, booking_id, order_id } = req.body;

    const id = crypto.randomUUID();
    await sequelize.query(
      'CALL InsertRefund(?, ?, ?, ?, ?, ?)',
      { replacements: [id, payment_id, amount, reason, booking_id, order_id] }
    );

    const queryResult = await sequelize.query('CALL GetRefundById(?)', {
      replacements: [id]
    });
    const result = extractSingleResult(queryResult);

    res.status(201).success(result, 'Refund initiated');
  } catch (error) {
    logger.error('Error creating refund:', error);
    next(error);
  }
};

/**
 * Get refund by ID
 */
export const getRefund = async (req, res, next) => {
  try {
    const { id } = req.params;

    const queryResult = await sequelize.query('CALL GetRefundById(?)', {
      replacements: [id]
    });
    const result = extractSingleResult(queryResult);

    if (!result) {
      throw ApiError.notFound('Refund not found');
    }

    res.success(result);
  } catch (error) {
    logger.error('Error fetching refund:', error);
    next(error);
  }
};

/**
 * Update refund status
 */
export const updateRefundStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, providerRefundId } = req.body;
    const processedBy = req.user.id;

    if (status === 'approved') {
      await sequelize.query('CALL ApproveRefund(?, ?)', {
        replacements: [id, processedBy]
      });
    } else if (status === 'rejected') {
      await sequelize.query('CALL RejectRefund(?, ?, ?)', {
        replacements: [id, processedBy, req.body.notes || '']
      });
    } else if (status === 'processed') {
      await sequelize.query('CALL ProcessRefund(?, ?)', {
        replacements: [id, providerRefundId]
      });
    } else if (status === 'failed') {
      await sequelize.query('CALL FailRefund(?, ?)', {
        replacements: [id, req.body.notes || '']
      });
    }

    const queryResult = await sequelize.query('CALL GetRefundById(?)', {
      replacements: [id]
    });
    const result = extractSingleResult(queryResult);

    res.success(result, `Refund status updated to ${status}`);
  } catch (error) {
    logger.error('Error updating refund status:', error);
    next(error);
  }
};

/**
 * Process webhook event
 */
export const processWebhook = async (req, res, next) => {
  try {
    const { eventId, eventType, source } = req.body;
    const payload = req.body;

    // Check for duplicate
    const existingQuery = await sequelize.query('CALL GetWebhookEventByEventId(?)', {
      replacements: [eventId]
    });
    const existing = extractSingleResult(existingQuery);

    if (existing) {
      res.success(null, 'Event already processed');
      return;
    }

    // Log the webhook event
    const id = crypto.randomUUID();
    await sequelize.query(
      'CALL InsertWebhookEvent(?, ?, ?, ?, ?)',
      { replacements: [id, eventId, eventType, source, JSON.stringify(payload)] }
    );

    try {
      // Process based on event type - would contain payment provider specific logic
      await sequelize.query('CALL MarkWebhookEventProcessed(?)', {
        replacements: [id]
      });

      res.success(null, 'Webhook processed');
    } catch (processingError) {
      await sequelize.query('CALL MarkWebhookEventFailed(?, ?)', {
        replacements: [id, processingError.message]
      });
      throw processingError;
    }
  } catch (error) {
    logger.error('Error processing webhook:', error);
    next(error);
  }
};

/**
 * Get payment statistics
 */
export const getPaymentStats = async (req, res, next) => {
  try {
    const { startDate, endDate, businessId } = req.query;

    const queryResult = await sequelize.query('CALL GetAllPayments()');
    const results = extractProcedureResult(queryResult);

    // Apply filters
    let filtered = results;
    if (startDate) {
      filtered = filtered.filter(p => new Date(p.created_at) >= new Date(startDate));
    }
    if (endDate) {
      filtered = filtered.filter(p => new Date(p.created_at) <= new Date(endDate));
    }

    const stats = {
      totalPayments: filtered.length,
      totalAmount: filtered.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
      pendingPayments: filtered.filter(p => p.status === 'pending').length,
      paidPayments: filtered.filter(p => p.status === 'paid').length,
      failedPayments: filtered.filter(p => p.status === 'failed').length,
      refundedPayments: filtered.filter(p => p.status === 'refunded').length
    };

    res.success(stats);
  } catch (error) {
    logger.error('Error fetching payment stats:', error);
    next(error);
  }
};

/**
 * Expire pending payments (admin/cron)
 */
export const expirePendingPayments = async (req, res, next) => {
  try {
    const { hours = 24 } = req.query;

    const queryResult = await sequelize.query('CALL GetAllPayments()');
    const results = extractProcedureResult(queryResult);

    const cutoffDate = new Date(Date.now() - parseInt(hours) * 60 * 60 * 1000);
    const pendingToExpire = results.filter(p =>
      p.status === 'pending' && new Date(p.created_at) < cutoffDate
    );

    for (const payment of pendingToExpire) {
      await sequelize.query('CALL UpdatePaymentStatus(?, ?)', {
        replacements: [payment.id, 'failed']
      });
    }

    res.success({ expired: pendingToExpire.length }, `${pendingToExpire.length} pending payments expired`);
  } catch (error) {
    logger.error('Error expiring pending payments:', error);
    next(error);
  }
};

export default {
  createPayment,
  getPayment,
  updatePaymentStatus,
  getPayments,
  createRefund,
  getRefund,
  updateRefundStatus,
  processWebhook,
  getPaymentStats,
  expirePendingPayments,
  initiateUnifiedPayment,
  verifyPaymentStatus
};
