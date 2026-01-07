/**
 * Order Audit Service
 *
 * Provides persistent audit logging for all order lifecycle events.
 * This service implements the audit trail requirement from spec.md:
 * "Log order lifecycle events, actor, timestamp, and IP"
 *
 * @see docs/ORDERING_SYSTEM_AUDIT.md - Phase 2
 */

import db from '../db.js';

/**
 * Event type constants for order audit logging
 */
export const EVENT_TYPES = {
  // Order lifecycle events
  CREATED: 'created',
  STATUS_CHANGED: 'status_changed',
  PAYMENT_UPDATED: 'payment_updated',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',

  // Pickup workflow events
  ARRIVAL_VERIFIED: 'arrival_verified',
  MARKED_READY: 'marked_ready',
  PICKED_UP: 'picked_up',

  // System events
  PAYMENT_WEBHOOK: 'payment_webhook',
  STOCK_RESTORED: 'stock_restored',
  DISCOUNT_APPLIED: 'discount_applied',
  DISCOUNT_REVERTED: 'discount_reverted'
};

/**
 * Log an order audit event
 *
 * @param {Object} params - Event parameters
 * @param {number|string} params.orderId - The order ID being audited
 * @param {string} params.eventType - Type of event (use EVENT_TYPES constants)
 * @param {string} [params.oldValue] - Previous value (for state changes)
 * @param {string} [params.newValue] - New value (for state changes)
 * @param {Object} [params.actor] - Information about who triggered the event
 * @param {number|string} [params.actor.id] - User ID
 * @param {string} [params.actor.role] - User role (Tourist, Business Owner, Staff, Admin)
 * @param {string} [params.actor.ip] - IP address
 * @param {Object} [params.metadata] - Additional context as key-value pairs
 * @returns {Promise<{id: number}>} The created audit record ID
 *
 * @example
 * // Log order creation
 * await logOrderEvent({
 *   orderId: 123,
 *   eventType: EVENT_TYPES.CREATED,
 *   newValue: 'pending',
 *   actor: { id: 456, role: 'Tourist', ip: '192.168.1.1' },
 *   metadata: { payment_method: 'paymongo', total_amount: 15000 }
 * });
 *
 * @example
 * // Log status change
 * await logOrderEvent({
 *   orderId: 123,
 *   eventType: EVENT_TYPES.STATUS_CHANGED,
 *   oldValue: 'pending',
 *   newValue: 'accepted',
 *   actor: { id: 789, role: 'Business Owner', ip: '10.0.0.1' }
 * });
 */
export async function logOrderEvent({
  orderId,
  eventType,
  oldValue = null,
  newValue = null,
  actor = {},
  metadata = null
}) {
  try {
    const [result] = await db.query(
      `INSERT INTO order_audit
       (order_id, event_type, old_value, new_value, actor_id, actor_role, actor_ip, metadata)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId,
        eventType,
        oldValue,
        newValue,
        actor?.id || null,
        actor?.role || null,
        actor?.ip || null,
        metadata ? JSON.stringify(metadata) : null
      ]
    );

    console.log(`[Audit] Logged ${eventType} for order ${orderId}`, {
      actor: actor?.id || 'system',
      oldValue,
      newValue
    });

    return { id: result.insertId };
  } catch (error) {
    // Log error but don't throw - audit failures should not break order operations
    console.error(`[Audit] Failed to log event for order ${orderId}:`, error.message);
    return { id: null, error: error.message };
  }
}

/**
 * Log order creation event with full context
 *
 * @param {Object} params - Creation parameters
 * @param {number|string} params.orderId - The created order ID
 * @param {string} params.orderNumber - Human-readable order number
 * @param {Object} params.actor - User who created the order
 * @param {Object} params.orderDetails - Order details for metadata
 * @returns {Promise<{id: number}>}
 */
export async function logOrderCreated({ orderId, orderNumber, actor, orderDetails }) {
  return logOrderEvent({
    orderId,
    eventType: EVENT_TYPES.CREATED,
    newValue: 'pending',
    actor,
    metadata: {
      order_number: orderNumber,
      payment_method: orderDetails.payment_method,
      total_amount: orderDetails.total_amount,
      item_count: orderDetails.item_count,
      business_id: orderDetails.business_id
    }
  });
}

/**
 * Log order status change
 *
 * @param {Object} params - Status change parameters
 * @param {number|string} params.orderId - The order ID
 * @param {string} params.oldStatus - Previous status
 * @param {string} params.newStatus - New status
 * @param {Object} params.actor - User who changed the status
 * @param {string} [params.reason] - Optional reason for the change
 * @returns {Promise<{id: number}>}
 */
export async function logStatusChange({ orderId, oldStatus, newStatus, actor, reason = null }) {
  return logOrderEvent({
    orderId,
    eventType: EVENT_TYPES.STATUS_CHANGED,
    oldValue: oldStatus,
    newValue: newStatus,
    actor,
    metadata: reason ? { reason } : null
  });
}

/**
 * Log payment status update
 *
 * @param {Object} params - Payment update parameters
 * @param {number|string} params.orderId - The order ID
 * @param {string} params.oldStatus - Previous payment status
 * @param {string} params.newStatus - New payment status
 * @param {Object} [params.actor] - User who updated (null for webhook)
 * @param {Object} [params.paymentDetails] - Additional payment context
 * @returns {Promise<{id: number}>}
 */
export async function logPaymentUpdate({ orderId, oldStatus, newStatus, actor = null, paymentDetails = {} }) {
  const eventType = newStatus === 'refunded' ? EVENT_TYPES.REFUNDED : EVENT_TYPES.PAYMENT_UPDATED;

  return logOrderEvent({
    orderId,
    eventType,
    oldValue: oldStatus,
    newValue: newStatus,
    actor: actor || { role: 'System' },
    metadata: {
      ...paymentDetails,
      source: actor ? 'manual' : 'webhook'
    }
  });
}

/**
 * Log order cancellation
 *
 * @param {Object} params - Cancellation parameters
 * @param {number|string} params.orderId - The order ID
 * @param {string} params.previousStatus - Status before cancellation
 * @param {string} params.cancelledBy - Who cancelled: 'user', 'business', 'system'
 * @param {Object} params.actor - User who cancelled
 * @param {string} [params.reason] - Cancellation reason
 * @returns {Promise<{id: number}>}
 */
export async function logCancellation({ orderId, previousStatus, cancelledBy, actor, reason = null }) {
  const newStatus = cancelledBy === 'user' ? 'cancelled_by_user' :
                    cancelledBy === 'business' ? 'cancelled_by_business' :
                    'cancelled';

  return logOrderEvent({
    orderId,
    eventType: EVENT_TYPES.CANCELLED,
    oldValue: previousStatus,
    newValue: newStatus,
    actor,
    metadata: {
      cancelled_by: cancelledBy,
      reason
    }
  });
}

/**
 * Log pickup workflow event (arrival, ready, picked up)
 *
 * @param {Object} params - Pickup event parameters
 * @param {number|string} params.orderId - The order ID
 * @param {string} params.eventType - One of: ARRIVAL_VERIFIED, MARKED_READY, PICKED_UP
 * @param {Object} params.actor - Staff/owner who processed
 * @param {Object} [params.metadata] - Additional context
 * @returns {Promise<{id: number}>}
 */
export async function logPickupEvent({ orderId, eventType, actor, metadata = null }) {
  return logOrderEvent({
    orderId,
    eventType,
    actor,
    metadata
  });
}

/**
 * Get audit trail for an order
 *
 * @param {number|string} orderId - The order ID
 * @param {Object} [options] - Query options
 * @param {number} [options.limit=50] - Maximum records to return
 * @param {number} [options.offset=0] - Offset for pagination
 * @returns {Promise<Array>} Array of audit records
 */
export async function getOrderAuditTrail(orderId, { limit = 50, offset = 0 } = {}) {
  const [rows] = await db.query(
    `SELECT
       oa.id,
       oa.order_id,
       oa.event_type,
       oa.old_value,
       oa.new_value,
       oa.actor_id,
       oa.actor_role,
       oa.actor_ip,
       oa.metadata,
       oa.created_at,
       u.first_name AS actor_first_name,
       u.last_name AS actor_last_name,
       u.email AS actor_email
     FROM order_audit oa
     LEFT JOIN user u ON u.id = oa.actor_id
     WHERE oa.order_id = ?
     ORDER BY oa.created_at DESC
     LIMIT ? OFFSET ?`,
    [orderId, limit, offset]
  );

  return rows.map(row => ({
    ...row,
    metadata: row.metadata ? JSON.parse(row.metadata) : null
  }));
}

/**
 * Get recent audit events across all orders (for admin dashboard)
 *
 * @param {Object} [options] - Query options
 * @param {string} [options.eventType] - Filter by event type
 * @param {number} [options.actorId] - Filter by actor
 * @param {number} [options.limit=100] - Maximum records
 * @returns {Promise<Array>} Array of audit records with order info
 */
export async function getRecentAuditEvents({ eventType = null, actorId = null, limit = 100 } = {}) {
  let query = `
    SELECT
      oa.*,
      o.order_number,
      o.business_id,
      u.first_name AS actor_first_name,
      u.last_name AS actor_last_name
    FROM order_audit oa
    JOIN orders o ON o.id = oa.order_id
    LEFT JOIN user u ON u.id = oa.actor_id
    WHERE 1=1
  `;
  const params = [];

  if (eventType) {
    query += ' AND oa.event_type = ?';
    params.push(eventType);
  }

  if (actorId) {
    query += ' AND oa.actor_id = ?';
    params.push(actorId);
  }

  query += ' ORDER BY oa.created_at DESC LIMIT ?';
  params.push(limit);

  const [rows] = await db.query(query, params);

  return rows.map(row => ({
    ...row,
    metadata: row.metadata ? JSON.parse(row.metadata) : null
  }));
}

export default {
  EVENT_TYPES,
  logOrderEvent,
  logOrderCreated,
  logStatusChange,
  logPaymentUpdate,
  logCancellation,
  logPickupEvent,
  getOrderAuditTrail,
  getRecentAuditEvents
};
