/**
 * Audit Service
 * Provides persistent audit logging for order lifecycle events
 */
import { sequelize } from '../models/index.js';
import logger from '../config/logger.js';

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
  DISCOUNT_REVERTED: 'discount_reverted',
};

/**
 * Log an order audit event
 * @param {Object} params - Event parameters
 * @param {string} params.orderId - The order ID being audited
 * @param {string} params.eventType - Type of event (use EVENT_TYPES constants)
 * @param {string} [params.oldValue] - Previous value (for state changes)
 * @param {string} [params.newValue] - New value (for state changes)
 * @param {Object} [params.actor] - Information about who triggered the event
 * @param {string} [params.actor.id] - User ID
 * @param {string} [params.actor.role] - User role
 * @param {string} [params.actor.ip] - IP address
 * @param {Object} [params.metadata] - Additional context
 * @returns {Promise<Object>} The created audit record
 */
export async function logOrderEvent({
  orderId,
  eventType,
  oldValue = null,
  newValue = null,
  actor = {},
  metadata = null,
}) {
  try {
    const [result] = await sequelize.query(
      `INSERT INTO order_audit
       (order_id, event_type, old_value, new_value, actor_id, actor_role, actor_ip, metadata, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      {
        replacements: [
          orderId,
          eventType,
          oldValue,
          newValue,
          actor?.id || null,
          actor?.role || null,
          actor?.ip || null,
          metadata ? JSON.stringify(metadata) : null,
        ],
        type: sequelize.QueryTypes.INSERT,
      }
    );

    logger.debug(`Audit: Logged ${eventType} for order ${orderId}`, {
      actor: actor?.id || 'system',
      oldValue,
      newValue,
    });

    return { id: result };
  } catch (error) {
    logger.error(`Audit: Failed to log ${eventType} for order ${orderId}:`, error);
    // Don't throw - audit logging should not break the main flow
  }
}

/**
 * Get audit trail for an order
 * @param {string} orderId - Order ID
 * @param {Object} options - Query options
 * @param {number} options.limit - Max records to return
 * @param {number} options.offset - Records to skip
 * @returns {Promise<Array>} Audit records
 */
export async function getOrderAuditTrail(orderId, { limit = 50, offset = 0 } = {}) {
  try {
    const [records] = await sequelize.query(
      `SELECT * FROM order_audit
       WHERE order_id = ?
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      {
        replacements: [orderId, limit, offset],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    return records;
  } catch (error) {
    logger.error(`Audit: Failed to get trail for order ${orderId}:`, error);
    return [];
  }
}

/**
 * Log a booking audit event
 * @param {Object} params - Event parameters
 */
export async function logBookingEvent({
  bookingId,
  eventType,
  oldValue = null,
  newValue = null,
  actor = {},
  metadata = null,
}) {
  try {
    await sequelize.query(
      `INSERT INTO booking_audit
       (booking_id, event_type, old_value, new_value, actor_id, actor_role, actor_ip, metadata, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      {
        replacements: [
          bookingId,
          eventType,
          oldValue,
          newValue,
          actor?.id || null,
          actor?.role || null,
          actor?.ip || null,
          metadata ? JSON.stringify(metadata) : null,
        ],
        type: sequelize.QueryTypes.INSERT,
      }
    );

    logger.debug(`Audit: Logged ${eventType} for booking ${bookingId}`);
  } catch (error) {
    logger.error(`Audit: Failed to log ${eventType} for booking ${bookingId}:`, error);
  }
}

export default {
  EVENT_TYPES,
  logOrderEvent,
  getOrderAuditTrail,
  logBookingEvent,
};
