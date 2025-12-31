/**
 * Order Transition Service
 * Handles order state machine and transitions
 */
import { Order, OrderItem, OrderStatusHistory, Payment, sequelize } from '../models/index.js';
import * as auditService from './audit.service.js';
import * as notificationService from './notification.service.js';
import * as socketService from './socket.service.js';
import logger from '../config/logger.js';

/**
 * Valid order status transitions
 */
export const ORDER_TRANSITIONS = {
  pending_payment: ['cancelled_by_user', 'cancelled_by_business', 'failed_payment', 'accepted'],
  accepted: ['preparing', 'cancelled_by_business', 'cancelled_by_user'],
  preparing: ['ready_for_pickup', 'cancelled_by_business'],
  ready_for_pickup: ['picked_up', 'cancelled_by_business'],
  picked_up: [], // Terminal state
  cancelled_by_user: [], // Terminal state
  cancelled_by_business: [], // Terminal state
  failed_payment: ['pending_payment'], // Can retry payment
};

/**
 * Terminal (final) statuses
 */
export const TERMINAL_STATUSES = [
  'picked_up',
  'cancelled_by_user',
  'cancelled_by_business',
  'failed_payment',
];

/**
 * Validate if a status transition is allowed
 * @param {string} currentStatus - Current order status
 * @param {string} newStatus - Target status
 * @returns {boolean}
 */
export function isValidTransition(currentStatus, newStatus) {
  const validTransitions = ORDER_TRANSITIONS[currentStatus];
  return validTransitions && validTransitions.includes(newStatus);
}

/**
 * Transition order to a new status
 * @param {string} orderId - Order ID
 * @param {string} newStatus - Target status
 * @param {Object} options - Transition options
 * @param {Object} options.actor - Who is performing the transition
 * @param {string} options.reason - Reason for transition
 * @param {Object} options.metadata - Additional data
 * @returns {Promise<Object>} Updated order
 */
export async function transitionOrder(orderId, newStatus, options = {}) {
  const { actor = {}, reason = null, metadata = {} } = options;
  const transaction = await sequelize.transaction();

  try {
    // Get current order with lock
    const order = await Order.findByPk(orderId, {
      transaction,
      lock: true,
    });

    if (!order) {
      throw new Error('Order not found');
    }

    const oldStatus = order.status;

    // Validate transition
    if (!isValidTransition(oldStatus, newStatus)) {
      throw new Error(`Invalid transition from ${oldStatus} to ${newStatus}`);
    }

    // Update order status
    await order.update({ status: newStatus }, { transaction });

    // Create status history record
    await OrderStatusHistory.create({
      order_id: orderId,
      from_status: oldStatus,
      to_status: newStatus,
      changed_by: actor.id || null,
      change_reason: reason,
      metadata: metadata,
    }, { transaction });

    // Log audit event
    await auditService.logOrderEvent({
      orderId,
      eventType: auditService.EVENT_TYPES.STATUS_CHANGED,
      oldValue: oldStatus,
      newValue: newStatus,
      actor,
      metadata: { reason, ...metadata },
    });

    await transaction.commit();

    // Emit socket event
    socketService.emitOrderStatusUpdate(order, oldStatus);

    // Send notification to customer
    await notificationService.notifyTouristOrderUpdated(order, oldStatus);

    logger.info(`Order ${orderId} transitioned from ${oldStatus} to ${newStatus}`);

    return order;
  } catch (error) {
    await transaction.rollback();
    logger.error(`Order transition failed for ${orderId}:`, error);
    throw error;
  }
}

/**
 * Accept an order (business action)
 * @param {string} orderId - Order ID
 * @param {Object} actor - Business user performing action
 * @returns {Promise<Object>} Updated order
 */
export async function acceptOrder(orderId, actor) {
  return transitionOrder(orderId, 'accepted', {
    actor,
    reason: 'Order accepted by business',
  });
}

/**
 * Mark order as preparing
 * @param {string} orderId - Order ID
 * @param {Object} actor - User performing action
 * @returns {Promise<Object>} Updated order
 */
export async function markAsPreparing(orderId, actor) {
  return transitionOrder(orderId, 'preparing', {
    actor,
    reason: 'Order preparation started',
  });
}

/**
 * Mark order as ready for pickup
 * @param {string} orderId - Order ID
 * @param {Object} actor - User performing action
 * @returns {Promise<Object>} Updated order
 */
export async function markAsReady(orderId, actor) {
  return transitionOrder(orderId, 'ready_for_pickup', {
    actor,
    reason: 'Order ready for customer pickup',
  });
}

/**
 * Mark order as picked up (complete)
 * @param {string} orderId - Order ID
 * @param {Object} actor - User performing action
 * @returns {Promise<Object>} Updated order
 */
export async function markAsPickedUp(orderId, actor) {
  return transitionOrder(orderId, 'picked_up', {
    actor,
    reason: 'Order picked up by customer',
  });
}

/**
 * Cancel order by user
 * @param {string} orderId - Order ID
 * @param {Object} actor - User cancelling
 * @param {string} reason - Cancellation reason
 * @returns {Promise<Object>} Updated order
 */
export async function cancelByUser(orderId, actor, reason = 'Cancelled by customer') {
  return transitionOrder(orderId, 'cancelled_by_user', {
    actor,
    reason,
    metadata: { cancelled_by: 'user' },
  });
}

/**
 * Cancel order by business
 * @param {string} orderId - Order ID
 * @param {Object} actor - Business user cancelling
 * @param {string} reason - Cancellation reason
 * @returns {Promise<Object>} Updated order
 */
export async function cancelByBusiness(orderId, actor, reason = 'Cancelled by business') {
  return transitionOrder(orderId, 'cancelled_by_business', {
    actor,
    reason,
    metadata: { cancelled_by: 'business' },
  });
}

/**
 * Mark order as payment failed
 * @param {string} orderId - Order ID
 * @param {Object} metadata - Payment failure metadata
 * @returns {Promise<Object>} Updated order
 */
export async function markPaymentFailed(orderId, metadata = {}) {
  return transitionOrder(orderId, 'failed_payment', {
    actor: { role: 'system' },
    reason: 'Payment failed',
    metadata,
  });
}

/**
 * Restore stock for cancelled/failed order
 * @param {string} orderId - Order ID
 */
export async function restoreOrderStock(orderId) {
  const transaction = await sequelize.transaction();

  try {
    const orderItems = await OrderItem.findAll({
      where: { order_id: orderId },
      transaction,
    });

    for (const item of orderItems) {
      await sequelize.query(
        `UPDATE product SET stock_quantity = stock_quantity + ? WHERE id = ?`,
        {
          replacements: [item.quantity, item.product_id],
          transaction,
        }
      );
    }

    await transaction.commit();

    await auditService.logOrderEvent({
      orderId,
      eventType: auditService.EVENT_TYPES.STOCK_RESTORED,
      metadata: { items_count: orderItems.length },
    });

    logger.info(`Stock restored for order ${orderId}`);
  } catch (error) {
    await transaction.rollback();
    logger.error(`Failed to restore stock for order ${orderId}:`, error);
    throw error;
  }
}

export default {
  ORDER_TRANSITIONS,
  TERMINAL_STATUSES,
  isValidTransition,
  transitionOrder,
  acceptOrder,
  markAsPreparing,
  markAsReady,
  markAsPickedUp,
  cancelByUser,
  cancelByBusiness,
  markPaymentFailed,
  restoreOrderStock,
  canTransition,
  getAllowedNextStatuses,
  canCancelWithinGrace,
  getCancelledByActor,
  validateCancellation,
};

// ============================================================
// ENHANCED TRANSITION RULES (from old backend)
// ============================================================

/**
 * Role-based transition rules map
 * Key: current status, Value: { nextState: [allowedRoles] }
 */
const ROLE_TRANSITION_RULES = {
  pending: {
    accepted: ['business owner', 'manager', 'sales associate', 'admin'],
    confirmed: ['business owner', 'manager', 'sales associate', 'admin'],
    cancelled_by_business: ['business owner', 'manager', 'sales associate', 'admin'],
    cancelled_by_user: ['tourist', 'admin'],
    failed_payment: ['system', 'admin'],
  },
  accepted: {
    preparing: ['business owner', 'manager', 'sales associate', 'admin'],
    cancelled_by_business: ['business owner', 'manager', 'admin'],
  },
  confirmed: {
    preparing: ['business owner', 'manager', 'sales associate', 'admin'],
    cancelled_by_business: ['business owner', 'manager', 'admin'],
  },
  preparing: {
    ready_for_pickup: ['business owner', 'manager', 'sales associate', 'admin'],
    cancelled_by_business: ['business owner', 'manager', 'admin'],
  },
  ready_for_pickup: {
    picked_up: ['business owner', 'manager', 'sales associate', 'admin'],
    cancelled_by_business: ['business owner', 'manager', 'admin'],
  },
  picked_up: {},
  cancelled_by_user: {},
  cancelled_by_business: {},
  failed_payment: {},
};

/**
 * Check if a status transition is allowed (with role validation)
 * @param {string} currentStatus - Current order status
 * @param {string} newStatus - Desired new status
 * @param {string} actorRole - Role of the user attempting transition
 * @param {Object} order - Full order object with payment info
 * @returns {Object} { allowed: boolean, reason: string }
 */
export function canTransition(currentStatus, newStatus, actorRole, order = null) {
  currentStatus = currentStatus?.toLowerCase();
  newStatus = newStatus?.toLowerCase();
  actorRole = actorRole?.toLowerCase();

  if (!ROLE_TRANSITION_RULES[currentStatus]) {
    return { allowed: false, reason: `Invalid current status: ${currentStatus}` };
  }

  const allowedTransitions = ROLE_TRANSITION_RULES[currentStatus];
  if (!allowedTransitions[newStatus]) {
    const validNextStates = Object.keys(allowedTransitions);
    return {
      allowed: false,
      reason: `Cannot transition from ${currentStatus} to ${newStatus}. Valid next states: ${validNextStates.join(', ') || 'none (terminal state)'}`,
    };
  }

  const requiredRoles = allowedTransitions[newStatus];
  if (!requiredRoles.includes(actorRole)) {
    return {
      allowed: false,
      reason: `Role ${actorRole} is not authorized. Required: ${requiredRoles.join(', ')}`,
    };
  }

  // Payment status validation for PayMongo orders
  if (order && order.payment_method === 'paymongo') {
    const paymentStatus = order.payment_status?.toLowerCase() || 'pending';
    if (['preparing', 'ready_for_pickup'].includes(newStatus) && paymentStatus !== 'paid') {
      return {
        allowed: false,
        reason: `Cannot transition to ${newStatus}: Payment not confirmed (status: ${paymentStatus})`,
      };
    }
  }

  return { allowed: true, reason: null };
}

/**
 * Get allowed next statuses for current status and actor
 * @param {string} currentStatus
 * @param {string} actorRole
 * @returns {Array<string>} List of allowed next statuses
 */
export function getAllowedNextStatuses(currentStatus, actorRole) {
  currentStatus = currentStatus?.toLowerCase();
  actorRole = actorRole?.toLowerCase();

  if (!ROLE_TRANSITION_RULES[currentStatus]) return [];

  const allowedTransitions = ROLE_TRANSITION_RULES[currentStatus];
  return Object.entries(allowedTransitions)
    .filter(([_, roles]) => roles.includes(actorRole))
    .map(([status]) => status);
}

/**
 * Check if grace period cancellation is allowed
 * @param {Date|string} orderCreatedAt - Order creation timestamp
 * @param {number} graceSeconds - Grace period in seconds
 * @returns {Object} { allowed: boolean, reason: string, remainingSeconds: number }
 */
export function canCancelWithinGrace(orderCreatedAt, graceSeconds = 10) {
  const createdAt = new Date(orderCreatedAt);
  const now = new Date();
  const elapsedSeconds = (now - createdAt) / 1000;
  const remainingSeconds = Math.max(0, graceSeconds - elapsedSeconds);

  if (elapsedSeconds <= graceSeconds) {
    return { allowed: true, reason: null, remainingSeconds: Math.ceil(remainingSeconds) };
  }

  return {
    allowed: false,
    reason: `Grace period of ${graceSeconds} seconds has expired. Order was created ${Math.floor(elapsedSeconds)} seconds ago.`,
    remainingSeconds: 0,
  };
}

/**
 * Determine cancelled_by value based on actor role
 * @param {string} actorRole
 * @param {string} currentStatus
 * @returns {string} 'user' | 'business' | 'system'
 */
export function getCancelledByActor(actorRole, currentStatus) {
  const roleLower = actorRole?.toLowerCase();

  if (roleLower === 'tourist') return 'user';
  if (['business owner', 'manager', 'sales associate', 'staff'].includes(roleLower)) return 'business';
  if (roleLower === 'system' || currentStatus === 'failed_payment') return 'system';

  return 'system';
}

/**
 * Validate cancellation request
 * @param {Object} order - Order object
 * @param {string} actorRole - Role of actor
 * @param {number} graceSeconds - Grace period
 * @returns {Object} { allowed: boolean, reason: string, cancelled_by: string }
 */
export function validateCancellation(order, actorRole, graceSeconds = 10) {
  const currentStatus = order.status?.toLowerCase();
  const roleLower = actorRole?.toLowerCase();
  const paymentStatus = order.payment_status?.toLowerCase();
  const paymentMethod = order.payment_method?.toLowerCase();

  const isCashOnPickup = paymentMethod === 'cash_on_pickup';

  // Cannot cancel terminal states
  if (TERMINAL_STATUSES.includes(currentStatus)) {
    return { allowed: false, reason: `Cannot cancel order with status: ${currentStatus}`, cancelled_by: null };
  }

  // Tourist cancellation rules
  if (roleLower === 'tourist') {
    if (currentStatus !== 'pending' && currentStatus !== 'pending_payment') {
      return { allowed: false, reason: 'Tourists can only cancel pending orders', cancelled_by: null };
    }

    // Cash on pickup: Allow freely
    if (isCashOnPickup) {
      return { allowed: true, reason: null, cancelled_by: 'user' };
    }

    // PayMongo with pending/failed payment
    if (['pending', 'failed'].includes(paymentStatus)) {
      return { allowed: true, reason: null, cancelled_by: 'user' };
    }

    // Check grace period
    const graceCheck = canCancelWithinGrace(order.created_at, graceSeconds);
    if (!graceCheck.allowed) {
      return { allowed: false, reason: graceCheck.reason, cancelled_by: null };
    }

    return { allowed: true, reason: null, cancelled_by: 'user' };
  }

  // Business cancellation rules
  if (['business owner', 'manager', 'sales associate'].includes(roleLower)) {
    if (currentStatus === 'picked_up') {
      return { allowed: false, reason: 'Cannot cancel order that has been picked up', cancelled_by: null };
    }
    return { allowed: true, reason: null, cancelled_by: 'business' };
  }

  // Admin and system
  if (['admin', 'system', 'tourism admin'].includes(roleLower)) {
    return { allowed: true, reason: null, cancelled_by: getCancelledByActor(actorRole, currentStatus) };
  }

  return { allowed: false, reason: `Invalid actor role: ${actorRole}`, cancelled_by: null };
}
