/**
 * Order Controller
 * Handles order operations
 */
import { sequelize } from '../models/index.js';
import { ApiError } from '../utils/api-error.js';
import { extractProcedureResult, extractSingleResult } from '../utils/helpers.js';
import logger from '../config/logger.js';

/**
 * Create a new order
 */
export const createOrder = async (req, res, next) => {
  try {
    const { business_id, items, notes } = req.body;
    const touristId = req.user.tourist_id;

    if (!touristId) {
      throw ApiError.forbidden('Only tourists can create orders');
    }

    // Calculate total
    const totalAmount = items.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0
    );

    // Generate order number
    const orderNumQuery = await sequelize.query('CALL GenerateOrderNumber(?)', {
      replacements: [business_id]
    });
    const orderNumResult = extractSingleResult(orderNumQuery);
    const orderNumber = orderNumResult?.order_number || `ORD-${Date.now()}`;

    const orderId = crypto.randomUUID();
    await sequelize.query(
      'CALL InsertOrder(?, ?, ?, ?, ?, ?, ?)',
      {
        replacements: [orderId, orderNumber, business_id, touristId, totalAmount, 'pending', notes]
      }
    );

    // Insert order items
    for (const item of items) {
      const itemId = crypto.randomUUID();
      await sequelize.query(
        'CALL InsertOrderItem(?, ?, ?, ?, ?, ?, ?)',
        {
          replacements: [itemId, orderId, item.product_id, item.product_name, item.quantity, item.unit_price, item.notes]
        }
      );
    }

    const queryResult = await sequelize.query('CALL GetOrderById(?)', {
      replacements: [orderId]
    });
    const result = extractSingleResult(queryResult);

    res.status(201).success(result, 'Order created successfully');
  } catch (error) {
    logger.error('Error creating order:', error);
    next(error);
  }
};

/**
 * Get order by ID
 */
export const getOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    const queryResult = await sequelize.query('CALL GetOrderById(?)', {
      replacements: [id]
    });
    const result = extractSingleResult(queryResult);

    if (!result) {
      throw ApiError.notFound('Order not found');
    }

    // Get order items
    const itemsQuery = await sequelize.query('CALL GetOrderItemsByOrderId(?)', {
      replacements: [id]
    });
    const items = extractProcedureResult(itemsQuery);

    res.success({ ...result, items });
  } catch (error) {
    logger.error('Error fetching order:', error);
    next(error);
  }
};

/**
 * Get order by order number
 */
export const getOrderByNumber = async (req, res, next) => {
  try {
    const { orderNumber } = req.params;

    const queryResult = await sequelize.query('CALL GetOrderByOrderNumber(?)', {
      replacements: [orderNumber]
    });
    const result = extractSingleResult(queryResult);

    if (!result) {
      throw ApiError.notFound('Order not found');
    }

    // Get order items
    const itemsQuery = await sequelize.query('CALL GetOrderItemsByOrderId(?)', {
      replacements: [result.id]
    });
    const items = extractProcedureResult(itemsQuery);

    res.success({ ...result, items });
  } catch (error) {
    logger.error('Error fetching order by number:', error);
    next(error);
  }
};

/**
 * Get orders for a business
 */
export const getBusinessOrders = async (req, res, next) => {
  try {
    const { businessId } = req.params;
    const { page = 1, limit = 10, status, startDate, endDate } = req.query;

    const queryResult = await sequelize.query('CALL GetOrdersByBusinessId(?)', {
      replacements: [businessId]
    });
    const results = extractProcedureResult(queryResult);

    // Apply filters
    let filtered = results;
    if (status) {
      filtered = filtered.filter(o => o.status === status);
    }
    if (startDate) {
      filtered = filtered.filter(o => new Date(o.created_at) >= new Date(startDate));
    }
    if (endDate) {
      filtered = filtered.filter(o => new Date(o.created_at) <= new Date(endDate));
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
    logger.error('Error fetching business orders:', error);
    next(error);
  }
};

/**
 * Get my orders (tourist)
 */
export const getMyOrders = async (req, res, next) => {
  try {
    const touristId = req.user.tourist_id;
    const { page = 1, limit = 10, status } = req.query;

    if (!touristId) {
      throw ApiError.notFound('Tourist profile not found');
    }

    const queryResult = await sequelize.query('CALL GetOrdersByTouristId(?)', {
      replacements: [touristId]
    });
    const results = extractProcedureResult(queryResult);

    let filtered = results;
    if (status) {
      filtered = filtered.filter(o => o.status === status);
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
    logger.error('Error fetching my orders:', error);
    next(error);
  }
};

/**
 * Update order status
 */
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await sequelize.query('CALL UpdateOrderStatus(?, ?)', {
      replacements: [id, status]
    });

    // Log audit
    const auditId = crypto.randomUUID();
    await sequelize.query(
      'CALL InsertOrderAudit(?, ?, ?, ?, ?)',
      { replacements: [auditId, id, 'status_change', status, req.user?.id] }
    );

    const queryResult = await sequelize.query('CALL GetOrderById(?)', {
      replacements: [id]
    });
    const result = extractSingleResult(queryResult);

    res.success(result, `Order status updated to ${status}`);
  } catch (error) {
    logger.error('Error updating order status:', error);
    next(error);
  }
};

/**
 * Cancel order
 */
export const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    await sequelize.query('CALL UpdateOrderStatus(?, ?)', {
      replacements: [id, 'cancelled']
    });

    // Log audit with reason
    const auditId = crypto.randomUUID();
    await sequelize.query(
      'CALL InsertOrderAudit(?, ?, ?, ?, ?)',
      { replacements: [auditId, id, 'cancellation', reason, req.user?.id] }
    );

    const queryResult = await sequelize.query('CALL GetOrderById(?)', {
      replacements: [id]
    });
    const result = extractSingleResult(queryResult);

    res.success(result, 'Order cancelled successfully');
  } catch (error) {
    logger.error('Error cancelling order:', error);
    next(error);
  }
};

/**
 * Get order statistics
 */
export const getOrderStats = async (req, res, next) => {
  try {
    const { businessId } = req.params;
    const { startDate, endDate } = req.query;

    const queryResult = await sequelize.query('CALL GetOrdersByBusinessId(?)', {
      replacements: [businessId]
    });
    const results = extractProcedureResult(queryResult);

    // Apply date filters
    let filtered = results;
    if (startDate) {
      filtered = filtered.filter(o => new Date(o.created_at) >= new Date(startDate));
    }
    if (endDate) {
      filtered = filtered.filter(o => new Date(o.created_at) <= new Date(endDate));
    }

    // Calculate stats
    const stats = {
      totalOrders: filtered.length,
      totalRevenue: filtered.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0),
      pendingOrders: filtered.filter(o => o.status === 'pending').length,
      completedOrders: filtered.filter(o => o.status === 'completed').length,
      cancelledOrders: filtered.filter(o => o.status === 'cancelled').length
    };

    res.success(stats);
  } catch (error) {
    logger.error('Error fetching order stats:', error);
    next(error);
  }
};

/**
 * Validate arrival code
 */
export const validateArrivalCode = async (req, res, next) => {
  try {
    const { businessId } = req.params;
    const { arrivalCode } = req.body;

    const queryResult = await sequelize.query('CALL GetOrdersByBusinessId(?)', {
      replacements: [businessId]
    });
    const results = extractProcedureResult(queryResult);

    const order = results.find(o => o.arrival_code === arrivalCode && o.status === 'ready');

    if (!order) {
      res.success({ valid: false, message: 'Invalid or expired arrival code' });
      return;
    }

    res.success({ valid: true, order });
  } catch (error) {
    logger.error('Error validating arrival code:', error);
    next(error);
  }
};

/**
 * Complete order (after arrival code validation)
 */
export const completeOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    await sequelize.query('CALL UpdateOrderStatus(?, ?)', {
      replacements: [id, 'completed']
    });

    const queryResult = await sequelize.query('CALL GetOrderById(?)', {
      replacements: [id]
    });
    const result = extractSingleResult(queryResult);

    res.success(result, 'Order completed successfully');
  } catch (error) {
    logger.error('Error completing order:', error);
    next(error);
  }
};

// ============================================================
// ORDER WORKFLOW - Additional Functions
// ============================================================

/**
 * Verify arrival code for a business
 * Used when customer arrives to pick up their order
 */
export const verifyArrivalCode = async (req, res, next) => {
  try {
    const { businessId } = req.params;
    const { arrival_code } = req.body;

    if (!arrival_code) {
      throw ApiError.badRequest('Arrival code is required');
    }

    const queryResult = await sequelize.query('CALL VerifyArrivalCode(?, ?)', {
      replacements: [businessId, arrival_code]
    });
    const result = extractSingleResult(queryResult);

    if (!result) {
      res.success({ valid: false, message: 'Invalid arrival code or order not found' });
      return;
    }

    res.success({ valid: true, order: result });
  } catch (error) {
    logger.error('Error verifying arrival code:', error);
    next(error);
  }
};

/**
 * Mark customer as arrived for their order
 */
export const markCustomerArrived = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verify order exists
    const orderCheckQuery = await sequelize.query('CALL GetOrderById(?)', {
      replacements: [id]
    });
    const orderCheck = extractSingleResult(orderCheckQuery);

    if (!orderCheck) {
      throw ApiError.notFound('Order not found');
    }

    const queryResult = await sequelize.query('CALL MarkCustomerArrivedForOrder(?)', {
      replacements: [id]
    });
    const result = extractSingleResult(queryResult);

    if (!result) {
      throw ApiError.notFound('Order not found');
    }

    // Log audit
    const auditId = crypto.randomUUID();
    await sequelize.query(
      'CALL InsertOrderAudit(?, ?, ?, ?, ?)',
      { replacements: [auditId, id, 'customer_arrived', 'Customer arrived at location', req.user?.id] }
    );

    logger.info(`Customer arrived for order ${id}`);
    res.success(result, 'Customer arrival recorded successfully');
  } catch (error) {
    logger.error('Error marking customer arrived:', error);
    next(error);
  }
};

/**
 * Mark order as ready for pickup
 */
export const markOrderReady = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verify order exists and is in a valid state
    const orderCheckQuery = await sequelize.query('CALL GetOrderById(?)', {
      replacements: [id]
    });
    const orderCheck = extractSingleResult(orderCheckQuery);

    if (!orderCheck) {
      throw ApiError.notFound('Order not found');
    }

    const validStatuses = ['confirmed', 'preparing', 'processing'];

    if (!validStatuses.includes(orderCheck.status)) {
      throw ApiError.badRequest(`Cannot mark order as ready. Current status: ${orderCheck.status}`);
    }

    const queryResult = await sequelize.query('CALL MarkOrderAsReady(?)', {
      replacements: [id]
    });
    const result = extractSingleResult(queryResult);

    if (!result) {
      throw ApiError.notFound('Order not found');
    }

    // Log audit
    const auditId = crypto.randomUUID();
    await sequelize.query(
      'CALL InsertOrderAudit(?, ?, ?, ?, ?)',
      { replacements: [auditId, id, 'marked_ready', 'Order marked as ready for pickup', req.user?.id] }
    );

    logger.info(`Order ${id} marked as ready for pickup`);
    res.success(result, 'Order marked as ready for pickup');
  } catch (error) {
    logger.error('Error marking order ready:', error);
    next(error);
  }
};

/**
 * Mark order as picked up (completes the order)
 */
export const markOrderPickedUp = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verify order exists
    const orderCheckQuery = await sequelize.query('CALL GetOrderById(?)', {
      replacements: [id]
    });
    const orderCheck = extractSingleResult(orderCheckQuery);

    if (!orderCheck) {
      throw ApiError.notFound('Order not found');
    }

    if (orderCheck.status !== 'ready_for_pickup' && orderCheck.status !== 'ready') {
      throw ApiError.badRequest(`Cannot mark as picked up. Current status: ${orderCheck.status}`);
    }

    const queryResult = await sequelize.query('CALL MarkOrderAsPickedUp(?)', {
      replacements: [id]
    });
    const result = extractSingleResult(queryResult);

    if (!result) {
      throw ApiError.notFound('Order not found');
    }

    // Log audit
    const auditId = crypto.randomUUID();
    await sequelize.query(
      'CALL InsertOrderAudit(?, ?, ?, ?, ?)',
      { replacements: [auditId, id, 'picked_up', 'Order picked up by customer', req.user?.id] }
    );

    logger.info(`Order ${id} marked as picked up`);
    res.success(result, 'Order marked as picked up and completed');
  } catch (error) {
    logger.error('Error marking order picked up:', error);
    next(error);
  }
};

/**
 * Update payment status for an order
 */
export const updatePaymentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { payment_status } = req.body;

    if (!payment_status) {
      throw ApiError.badRequest('Payment status is required');
    }

    const validStatuses = ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'];
    if (!validStatuses.includes(payment_status)) {
      throw ApiError.badRequest(`Invalid payment status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const queryResult = await sequelize.query('CALL UpdatePaymentStatus(?, ?)', {
      replacements: [id, payment_status]
    });
    const result = extractSingleResult(queryResult);

    if (!result) {
      throw ApiError.notFound('Order not found');
    }

    // Log audit
    const auditId = crypto.randomUUID();
    await sequelize.query(
      'CALL InsertOrderAudit(?, ?, ?, ?, ?)',
      { replacements: [auditId, id, 'payment_update', `Payment status updated to ${payment_status}`, req.user?.id] }
    );

    logger.info(`Payment status for order ${id} updated to ${payment_status}`);
    res.success(result, `Payment status updated to ${payment_status}`);
  } catch (error) {
    logger.error('Error updating payment status:', error);
    next(error);
  }
};

/**
 * Confirm an order (business accepts the order)
 */
export const confirmOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verify order exists and is pending
    const orderCheckQuery = await sequelize.query('CALL GetOrderById(?)', {
      replacements: [id]
    });
    const orderCheck = extractSingleResult(orderCheckQuery);

    if (!orderCheck) {
      throw ApiError.notFound('Order not found');
    }

    if (orderCheck.status !== 'pending') {
      throw ApiError.badRequest(`Cannot confirm order. Current status: ${orderCheck.status}`);
    }

    await sequelize.query('CALL UpdateOrderStatus(?, ?)', {
      replacements: [id, 'confirmed']
    });

    const queryResult = await sequelize.query('CALL GetOrderById(?)', {
      replacements: [id]
    });
    const result = extractSingleResult(queryResult);

    // Log audit
    const auditId = crypto.randomUUID();
    await sequelize.query(
      'CALL InsertOrderAudit(?, ?, ?, ?, ?)',
      { replacements: [auditId, id, 'confirmed', 'Order confirmed by business', req.user?.id] }
    );

    logger.info(`Order ${id} confirmed`);
    res.success(result, 'Order confirmed successfully');
  } catch (error) {
    logger.error('Error confirming order:', error);
    next(error);
  }
};

/**
 * Start preparing an order
 */
export const startPreparing = async (req, res, next) => {
  try {
    const { id } = req.params;

    const orderCheckQuery = await sequelize.query('CALL GetOrderById(?)', {
      replacements: [id]
    });
    const orderCheck = extractSingleResult(orderCheckQuery);

    if (!orderCheck) {
      throw ApiError.notFound('Order not found');
    }

    if (orderCheck.status !== 'confirmed') {
      throw ApiError.badRequest(`Cannot start preparing. Current status: ${orderCheck.status}`);
    }

    await sequelize.query('CALL UpdateOrderStatus(?, ?)', {
      replacements: [id, 'preparing']
    });

    const queryResult = await sequelize.query('CALL GetOrderById(?)', {
      replacements: [id]
    });
    const result = extractSingleResult(queryResult);

    // Log audit
    const auditId = crypto.randomUUID();
    await sequelize.query(
      'CALL InsertOrderAudit(?, ?, ?, ?, ?)',
      { replacements: [auditId, id, 'preparing', 'Order preparation started', req.user?.id] }
    );

    logger.info(`Order ${id} preparation started`);
    res.success(result, 'Order preparation started');
  } catch (error) {
    logger.error('Error starting order preparation:', error);
    next(error);
  }
};

export default {
  createOrder,
  getOrder,
  getOrderByNumber,
  getBusinessOrders,
  getMyOrders,
  updateOrderStatus,
  cancelOrder,
  getOrderStats,
  validateArrivalCode,
  completeOrder,
  verifyArrivalCode,
  markCustomerArrived,
  markOrderReady,
  markOrderPickedUp,
  updatePaymentStatus,
  confirmOrder,
  startPreparing
};
