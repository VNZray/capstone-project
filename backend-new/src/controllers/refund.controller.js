/**
 * Refund Controller
 * Handles refund processing and management
 */
import { Refund, Payment, Order, Booking, sequelize } from '../models/index.js';
import { ApiError } from '../utils/api-error.js';
import { calculateOffset, formatPagination } from '../utils/helpers.js';
import { v4 as uuidv4 } from 'uuid';
import logger from '../config/logger.js';

/**
 * Get all refunds with pagination
 */
export const getAllRefunds = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, payment_id } = req.query;

    const whereClause = {};

    if (status) {
      whereClause.status = status;
    }

    if (payment_id) {
      whereClause.payment_id = payment_id;
    }

    const offset = calculateOffset(page, limit);

    const { count, rows: refunds } = await Refund.findAndCountAll({
      where: whereClause,
      include: [{
        model: Payment,
        as: 'payment',
        attributes: ['id', 'amount', 'payment_method', 'payment_status']
      }],
      limit: parseInt(limit),
      offset,
      order: [['created_at', 'DESC']]
    });

    const pagination = formatPagination(count, parseInt(page), parseInt(limit));
    res.paginated(refunds, pagination);
  } catch (error) {
    next(error);
  }
};

/**
 * Get refund by ID
 */
export const getRefundById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const refund = await Refund.findByPk(id, {
      include: [{
        model: Payment,
        as: 'payment'
      }]
    });

    if (!refund) {
      throw ApiError.notFound('Refund not found');
    }

    res.success(refund);
  } catch (error) {
    next(error);
  }
};

/**
 * Get refunds by payment ID
 */
export const getRefundsByPaymentId = async (req, res, next) => {
  try {
    const { paymentId } = req.params;

    const refunds = await Refund.findAll({
      where: { payment_id: paymentId },
      order: [['created_at', 'DESC']]
    });

    res.success(refunds);
  } catch (error) {
    next(error);
  }
};

/**
 * Get refunds by user ID
 */
export const getRefundsByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const refunds = await Refund.findAll({
      include: [{
        model: Payment,
        as: 'payment',
        where: { user_id: userId }
      }],
      order: [['created_at', 'DESC']]
    });

    res.success(refunds);
  } catch (error) {
    next(error);
  }
};

/**
 * Create refund request
 */
export const createRefund = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      payment_id,
      amount,
      reason,
      refund_type = 'full',
      notes
    } = req.body;

    if (!payment_id || !amount) {
      throw ApiError.badRequest('payment_id and amount are required');
    }

    // Verify payment exists and is eligible for refund
    const payment = await Payment.findByPk(payment_id);

    if (!payment) {
      throw ApiError.notFound('Payment not found');
    }

    if (payment.payment_status !== 'completed') {
      throw ApiError.badRequest('Only completed payments can be refunded');
    }

    // Check if already refunded
    const existingRefund = await Refund.findOne({
      where: {
        payment_id,
        status: { [sequelize.Sequelize.Op.in]: ['pending', 'processing', 'completed'] }
      }
    });

    if (existingRefund) {
      throw ApiError.conflict('A refund already exists for this payment');
    }

    // Validate refund amount
    if (amount > payment.amount) {
      throw ApiError.badRequest('Refund amount cannot exceed payment amount');
    }

    const refund = await Refund.create({
      id: uuidv4(),
      payment_id,
      amount,
      reason,
      refund_type,
      notes,
      status: 'pending',
      requested_by: req.user?.id || null,
      requested_at: new Date()
    }, { transaction });

    await transaction.commit();

    res.created(refund, 'Refund request created successfully');
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

/**
 * Process refund (admin)
 */
export const processRefund = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { status, admin_notes, provider_refund_id } = req.body;

    const validStatuses = ['approved', 'processing', 'completed', 'rejected', 'failed'];

    if (!validStatuses.includes(status)) {
      throw ApiError.badRequest(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const refund = await Refund.findByPk(id);

    if (!refund) {
      throw ApiError.notFound('Refund not found');
    }

    if (refund.status === 'completed') {
      throw ApiError.badRequest('Refund already completed');
    }

    await refund.update({
      status,
      admin_notes,
      provider_refund_id,
      processed_by: req.user?.id || null,
      processed_at: status === 'completed' ? new Date() : refund.processed_at
    }, { transaction });

    // If completed, update payment status
    if (status === 'completed') {
      const payment = await Payment.findByPk(refund.payment_id);
      if (payment) {
        await payment.update({
          payment_status: 'refunded'
        }, { transaction });
      }
    }

    await transaction.commit();

    res.success(refund, `Refund ${status} successfully`);
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

/**
 * Cancel refund request
 */
export const cancelRefund = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { cancellation_reason } = req.body;

    const refund = await Refund.findByPk(id);

    if (!refund) {
      throw ApiError.notFound('Refund not found');
    }

    if (!['pending', 'approved'].includes(refund.status)) {
      throw ApiError.badRequest('Only pending or approved refunds can be cancelled');
    }

    await refund.update({
      status: 'cancelled',
      admin_notes: cancellation_reason
    });

    res.success(refund, 'Refund cancelled successfully');
  } catch (error) {
    next(error);
  }
};

// ============================================================
// ORDER REFUND ENDPOINTS (from old backend)
// ============================================================

/**
 * Check if an order is eligible for refund/cancellation
 * GET /api/v1/orders/:orderId/refund-eligibility
 */
export const checkOrderRefundEligibility = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const userId = req.user?.id;

    // Lookup order with payment info
    const [orderRows] = await sequelize.query(`
      SELECT o.*, p.status as payment_status, p.payment_method, p.amount as payment_amount
      FROM \`order\` o
      LEFT JOIN payment p ON p.payment_for = 'order' AND p.payment_for_id = o.id
      WHERE o.id = ?
    `, { replacements: [orderId] });

    if (!orderRows || orderRows.length === 0) {
      throw ApiError.notFound('Order not found');
    }

    const order = orderRows[0];

    // Verify ownership
    if (order.user_id !== userId) {
      throw ApiError.forbidden('You do not have permission to view this order');
    }

    const paymentMethod = order.payment_method || 'cash_on_pickup';
    const isCashOnPickup = paymentMethod === 'cash_on_pickup';
    const isPaid = order.payment_status === 'paid';
    const orderStatus = order.status?.toLowerCase();

    // Determine eligibility
    let eligible = false;
    let canCancel = false;
    let reason = '';
    let requiresCustomerService = false;

    // Terminal states - cannot refund/cancel
    if (['picked_up', 'completed', 'cancelled', 'cancelled_by_user', 'cancelled_by_business'].includes(orderStatus)) {
      reason = 'Order is already completed or cancelled';
      requiresCustomerService = orderStatus === 'picked_up' || orderStatus === 'completed';
    }
    // Cash on pickup - can cancel if pending
    else if (isCashOnPickup) {
      if (orderStatus === 'pending') {
        canCancel = true;
        reason = 'Order can be cancelled (no payment made)';
      } else {
        reason = 'Order is being processed and cannot be cancelled';
        requiresCustomerService = true;
      }
    }
    // Paid orders - check status
    else if (isPaid) {
      if (orderStatus === 'pending') {
        eligible = true;
        reason = 'Order is eligible for refund';
      } else {
        reason = 'Order is already being processed';
        requiresCustomerService = true;
      }
    }
    // Pending payment
    else {
      canCancel = true;
      reason = 'Order can be cancelled (payment pending)';
    }

    const actions = [];
    if (eligible) {
      actions.push({
        action: 'refund',
        label: 'Request Refund',
        description: `Request a full refund of ₱${parseFloat(order.payment_amount || order.total_amount).toFixed(2)}`,
        endpoint: `POST /api/v1/orders/${orderId}/refund`
      });
    }
    if (canCancel) {
      actions.push({
        action: 'cancel',
        label: 'Cancel Order',
        description: 'Cancel this order',
        endpoint: `POST /api/v1/orders/${orderId}/cancel`
      });
    }
    if (requiresCustomerService) {
      actions.push({
        action: 'customer_service',
        label: 'Contact Customer Service',
        description: 'Please contact customer service for assistance'
      });
    }

    res.success({
      orderId,
      eligible,
      canCancel,
      reason,
      paymentMethod,
      amount: parseFloat(order.payment_amount || order.total_amount || 0),
      requiresCustomerService,
      actions
    });
  } catch (error) {
    logger.error('Error checking refund eligibility:', error);
    next(error);
  }
};

/**
 * Get user's refund history
 * GET /api/v1/refunds/my
 */
export const getMyRefunds = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw ApiError.unauthorized('Authentication required');
    }

    const refunds = await Refund.findAll({
      include: [{
        model: Payment,
        as: 'payment',
        where: { payer_id: userId },
        required: true
      }],
      order: [['created_at', 'DESC']]
    });

    res.success(refunds);
  } catch (error) {
    logger.error('Error fetching user refunds:', error);
    next(error);
  }
};

/**
 * Request order refund
 * POST /api/v1/orders/:orderId/refund
 */
export const requestOrderRefund = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { orderId } = req.params;
    const userId = req.user?.id;
    const { reason = 'requested_by_customer', notes } = req.body;

    // Lookup order with payment
    const [orderRows] = await sequelize.query(`
      SELECT o.*, p.id as payment_id, p.status as payment_status, p.amount as payment_amount,
             p.paymongo_payment_id, p.payment_method
      FROM \`order\` o
      LEFT JOIN payment p ON p.payment_for = 'order' AND p.payment_for_id = o.id
      WHERE o.id = ?
    `, { replacements: [orderId], transaction });

    if (!orderRows || orderRows.length === 0) {
      await transaction.rollback();
      throw ApiError.notFound('Order not found');
    }

    const order = orderRows[0];

    // Verify ownership
    if (order.user_id !== userId) {
      await transaction.rollback();
      throw ApiError.forbidden('You do not have permission to refund this order');
    }

    // Verify eligible
    if (order.payment_status !== 'paid') {
      await transaction.rollback();
      throw ApiError.badRequest('Order is not paid and cannot be refunded');
    }

    if (order.status !== 'pending') {
      await transaction.rollback();
      throw ApiError.badRequest('Order is being processed. Please contact customer service.');
    }

    // Create refund record
    const refundId = uuidv4();
    await Refund.create({
      id: refundId,
      payment_id: order.payment_id,
      amount: order.payment_amount || order.total_amount,
      reason,
      notes,
      refund_type: 'full',
      status: 'pending',
      requested_by: userId,
      requested_at: new Date()
    }, { transaction });

    // Update order status
    await sequelize.query('CALL UpdateOrderStatus(?, ?)', {
      replacements: [orderId, 'cancelled_by_user'],
      transaction
    });

    await transaction.commit();

    logger.info(`Refund requested for order ${orderId} by user ${userId}`);

    res.created({
      refund_id: refundId,
      order_id: orderId,
      amount: order.payment_amount || order.total_amount,
      status: 'pending',
      message: 'Refund request submitted successfully. Your refund will be processed within 3-5 business days.'
    });
  } catch (error) {
    await transaction.rollback();
    logger.error('Error requesting order refund:', error);
    next(error);
  }
};

export default {
  getAllRefunds,
  getRefundById,
  getRefundsByPaymentId,
  getRefundsByUserId,
  createRefund,
  processRefund,
  cancelRefund,
  checkOrderRefundEligibility,
  getMyRefunds,
  requestOrderRefund
};