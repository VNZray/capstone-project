/**
 * Abandoned Order Cleanup Service
 *
 * Handles automatic cleanup of abandoned/ghosted orders and payment intents.
 * This service runs periodically to:
 *
 * 1. Mark abandoned orders as failed_payment
 * 2. Cancel expired PayMongo payment intents
 * 3. Restore stock for abandoned orders
 * 4. Log audit events for all cleanup actions
 *
 * @module services/abandonedOrderCleanupService
 * @see docs/ORDERING_SYSTEM_AUDIT.md
 */

import db from "../db.js";
import * as paymongoService from "./paymongoService.js";
import * as auditService from "./auditService.js";

// ============================================================================
// Configuration Constants
// ============================================================================

/**
 * Cleanup interval: every 15 minutes (in milliseconds)
 * This ensures abandoned orders are cleaned up promptly
 */
const CLEANUP_INTERVAL_MS = parseInt(
  process.env.ABANDONED_ORDER_CLEANUP_INTERVAL_MS || "900000",
  10
); // 15 minutes

/**
 * Time threshold for considering an order "abandoned" (in minutes)
 * Orders with pending payments older than this are considered abandoned
 */
const ABANDONMENT_THRESHOLD_MINUTES = parseInt(
  process.env.ABANDONMENT_THRESHOLD_MINUTES || "30",
  10
);

/**
 * PayMongo Payment Intent expiration time (in hours)
 * PayMongo Payment Intents expire after 24 hours by default
 */
const PAYMENT_INTENT_EXPIRY_HOURS = parseInt(
  process.env.PAYMENT_INTENT_EXPIRY_HOURS || "24",
  10
);

/**
 * Grace period before marking as abandoned after payment intent expiry (in minutes)
 * Gives buffer for webhook delays
 */
const POST_EXPIRY_GRACE_MINUTES = parseInt(
  process.env.POST_EXPIRY_GRACE_MINUTES || "5",
  10
);

let cleanupIntervalId = null;

// ============================================================================
// Core Cleanup Functions
// ============================================================================

/**
 * Main cleanup function - orchestrates all abandoned order cleanup tasks
 *
 * @returns {Promise<{
 *   expiredPaymentIntents: number,
 *   abandonedOrders: number,
 *   stockRestored: number,
 *   errors: string[]
 * }>}
 */
export async function cleanupAbandonedOrders() {
  console.log(
    `[AbandonedOrderCleanup] 🧹 Starting cleanup at ${new Date().toISOString()}`
  );

  const results = {
    expiredPaymentIntents: 0,
    abandonedOrders: 0,
    stockRestored: 0,
    errors: [],
  };

  try {
    // Step 1: Find and process abandoned online payment orders
    const abandonedCount = await processAbandonedOnlinePaymentOrders(results);
    results.abandonedOrders = abandonedCount;

    // Step 2: Verify and sync payment intent statuses with PayMongo
    const syncedCount = await syncPaymentIntentStatuses(results);
    results.expiredPaymentIntents += syncedCount;

    // Step 3: Log summary
    console.log(`[AbandonedOrderCleanup] ✅ Cleanup complete:`, {
      abandonedOrders: results.abandonedOrders,
      expiredPaymentIntents: results.expiredPaymentIntents,
      stockRestored: results.stockRestored,
      errors: results.errors.length,
    });

    return results;
  } catch (error) {
    console.error(
      "[AbandonedOrderCleanup] ❌ Fatal error during cleanup:",
      error.message
    );
    results.errors.push(error.message);
    return results;
  }
}

/**
 * Process abandoned online payment orders
 *
 * An order is considered "abandoned" if:
 * - Payment method is online (gcash, paymaya, card)
 * - Payment status is 'pending'
 * - Order status is 'pending'
 * - Payment created more than ABANDONMENT_THRESHOLD_MINUTES ago
 *   (We use payment.created_at because it's stored in UTC consistently,
 *    unlike order.created_at which may use server timezone)
 *
 * @param {Object} results - Results object to accumulate counts
 * @returns {Promise<number>} Number of orders processed
 */
async function processAbandonedOnlinePaymentOrders(results) {
  const cutoffTime = new Date(
    Date.now() - ABANDONMENT_THRESHOLD_MINUTES * 60 * 1000
  );

  console.log(
    `[AbandonedOrderCleanup] Looking for payments abandoned before ${cutoffTime.toISOString()}`
  );

  try {
    // Find abandoned orders with pending online payments
    // NOTE: Using p.created_at instead of o.created_at because payment timestamps
    // are stored in UTC (via JavaScript Date), while order timestamps may use
    // server timezone (MariaDB CURRENT_TIMESTAMP in PHT), causing timezone mismatch
    const [abandonedOrders] = await db.query(
      `
      SELECT 
        o.id as order_id,
        o.order_number,
        o.status as order_status,
        o.created_at,
        o.user_id,
        o.business_id,
        p.id as payment_id,
        p.payment_intent_id,
        p.status as payment_status,
        p.payment_method,
        p.created_at as payment_created_at
      FROM \`order\` o
      INNER JOIN payment p ON p.payment_for = 'order' AND p.payment_for_id = o.id
      WHERE o.status = 'pending'
        AND p.status = 'pending'
        AND p.payment_method IN ('gcash', 'paymaya', 'card')
        AND p.created_at < ?
      ORDER BY p.created_at ASC
      LIMIT 50
    `,
      [cutoffTime]
    );

    if (!abandonedOrders || abandonedOrders.length === 0) {
      console.log("[AbandonedOrderCleanup] No abandoned orders found");
      return 0;
    }

    console.log(
      `[AbandonedOrderCleanup] Found ${abandonedOrders.length} potentially abandoned orders`
    );

    let processedCount = 0;

    for (const order of abandonedOrders) {
      try {
        // Verify payment intent status with PayMongo before marking as abandoned
        let shouldMarkAbandoned = true;
        let paymentIntentStatus = "unknown";

        if (order.payment_intent_id) {
          try {
            const paymentIntent = await paymongoService.getPaymentIntent(
              order.payment_intent_id
            );
            paymentIntentStatus =
              paymentIntent?.attributes?.status || "unknown";

            console.log(
              `[AbandonedOrderCleanup] Order ${order.order_number}: Payment Intent status = ${paymentIntentStatus}`
            );

            // Don't mark as abandoned if payment is still processing
            if (
              ["awaiting_next_action", "processing"].includes(
                paymentIntentStatus
              )
            ) {
              // Check if it's been too long in this state (48+ hours)
              const orderAge =
                Date.now() - new Date(order.created_at).getTime();
              const hoursOld = orderAge / (1000 * 60 * 60);

              if (
                hoursOld <
                PAYMENT_INTENT_EXPIRY_HOURS + POST_EXPIRY_GRACE_MINUTES / 60
              ) {
                console.log(
                  `[AbandonedOrderCleanup] Order ${
                    order.order_number
                  }: Skipping - payment still processing (${hoursOld.toFixed(
                    1
                  )}h old)`
                );
                shouldMarkAbandoned = false;
              }
            }

            // If payment succeeded, don't mark as abandoned (webhook may be delayed)
            if (paymentIntentStatus === "succeeded") {
              console.log(
                `[AbandonedOrderCleanup] Order ${order.order_number}: Payment succeeded - updating status via webhook sync`
              );
              shouldMarkAbandoned = false;
              // TODO: Could trigger payment fulfillment here if webhook was missed
            }
          } catch (paymongoError) {
            console.warn(
              `[AbandonedOrderCleanup] Could not verify Payment Intent ${order.payment_intent_id}:`,
              paymongoError.message
            );
            // If we can't verify, still mark as abandoned if old enough
          }
        }

        if (shouldMarkAbandoned) {
          await markOrderAsAbandoned(order, paymentIntentStatus, results);
          processedCount++;
        }
      } catch (orderError) {
        console.error(
          `[AbandonedOrderCleanup] Error processing order ${order.order_number}:`,
          orderError.message
        );
        results.errors.push(
          `Order ${order.order_number}: ${orderError.message}`
        );
      }
    }

    return processedCount;
  } catch (error) {
    console.error(
      "[AbandonedOrderCleanup] Error querying abandoned orders:",
      error.message
    );
    results.errors.push(`Query error: ${error.message}`);
    return 0;
  }
}

/**
 * Mark an order as abandoned and restore stock
 *
 * @param {Object} order - Order data from query
 * @param {string} paymentIntentStatus - Status from PayMongo
 * @param {Object} results - Results object to accumulate counts
 */
async function markOrderAsAbandoned(order, paymentIntentStatus, results) {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    console.log(
      `[AbandonedOrderCleanup] Marking order ${order.order_number} as abandoned (PI status: ${paymentIntentStatus})`
    );

    // 1. Update order status to failed_payment
    await connection.query(
      `
      UPDATE \`order\` 
      SET status = 'failed_payment',
          cancelled_at = NOW(),
          cancelled_by = 'system',
          cancellation_reason = ?,
          updated_at = NOW()
      WHERE id = ?
    `,
      [
        `Abandoned order: Payment not completed within ${ABANDONMENT_THRESHOLD_MINUTES} minutes. Payment Intent status: ${paymentIntentStatus}`,
        order.order_id,
      ]
    );

    // 2. Update payment status to failed (simple update without JSON manipulation for compatibility)
    await connection.query(
      `
      UPDATE payment 
      SET status = 'failed',
          updated_at = NOW()
      WHERE id = ?
    `,
      [order.payment_id]
    );

    // 3. Restore stock for all order items
    const [orderItems] = await connection.query(
      `
      SELECT oi.product_id, oi.quantity
      FROM order_item oi
      WHERE oi.order_id = ?
    `,
      [order.order_id]
    );

    for (const item of orderItems) {
      await connection.query(
        `
        UPDATE product_stock 
        SET current_stock = current_stock + ?,
            updated_at = NOW()
        WHERE product_id = ?
      `,
        [item.quantity, item.product_id]
      );

      // Log stock restoration in history
      await connection.query(
        `
        INSERT INTO stock_history (id, product_id, change_type, quantity_change, previous_stock, new_stock, notes)
        SELECT UUID(), ?, 'adjustment', ?, 
               current_stock - ?, current_stock, 
               ?
        FROM product_stock WHERE product_id = ?
      `,
        [
          item.product_id,
          item.quantity,
          item.quantity,
          `Abandoned order restored: ${order.order_number}`,
          item.product_id,
        ]
      );

      // Update product status if needed
      await connection.query(
        `
        UPDATE product 
        SET status = IF(
          (SELECT current_stock FROM product_stock WHERE product_id = ?) > 0,
          'active',
          status
        )
        WHERE id = ?
      `,
        [item.product_id, item.product_id]
      );

      results.stockRestored++;
    }

    // 4. Note: Discount usage restoration removed
    // The discount table no longer has current_usage_count column (simplified MVP schema).
    // Per-product discount stock is tracked in discount_product.current_stock_used.
    // For now, we don't restore discount stock on abandonment since:
    // - Discounted products are rare edge case for abandoned orders
    // - Stock restoration for products is already handled above
    // TODO: If needed, implement per-product discount stock restoration by querying
    // order_item to find discounted products and updating discount_product.current_stock_used

    await connection.commit();

    // 5. Log audit event (outside transaction for reliability)
    try {
      await auditService.logOrderEvent({
        orderId: order.order_id,
        eventType: auditService.EVENT_TYPES.CANCELLED,
        oldValue: "pending",
        newValue: "failed_payment",
        actor: { role: "System" },
        metadata: {
          cancelled_by: "system",
          reason: "abandoned_payment",
          payment_intent_status: paymentIntentStatus,
          abandoned_after_minutes: ABANDONMENT_THRESHOLD_MINUTES,
          stock_items_restored: orderItems.length,
        },
      });
    } catch (auditError) {
      console.error(
        `[AbandonedOrderCleanup] Audit log failed for ${order.order_number}:`,
        auditError.message
      );
    }

    console.log(
      `[AbandonedOrderCleanup] ✅ Order ${order.order_number} marked as abandoned, ${orderItems.length} items restored`
    );
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Sync payment intent statuses with PayMongo
 *
 * This handles cases where webhooks may have been missed.
 * Checks payment intents that are older than the expiry time
 * and syncs their status.
 *
 * @param {Object} results - Results object to accumulate counts
 * @returns {Promise<number>} Number of intents synced
 */
async function syncPaymentIntentStatuses(results) {
  const expiryTime = new Date(
    Date.now() - PAYMENT_INTENT_EXPIRY_HOURS * 60 * 60 * 1000
  );

  try {
    // Find old pending payments that might be expired
    const [oldPayments] = await db.query(
      `
      SELECT 
        p.id as payment_id,
        p.payment_intent_id,
        p.payment_for,
        p.payment_for_id,
        p.status,
        p.created_at,
        o.order_number
      FROM payment p
      LEFT JOIN \`order\` o ON p.payment_for = 'order' AND p.payment_for_id = o.id
      WHERE p.status = 'pending'
        AND p.payment_intent_id IS NOT NULL
        AND p.created_at < ?
      ORDER BY p.created_at ASC
      LIMIT 20
    `,
      [expiryTime]
    );

    if (!oldPayments || oldPayments.length === 0) {
      return 0;
    }

    console.log(
      `[AbandonedOrderCleanup] Syncing ${oldPayments.length} old payment intent statuses`
    );

    let syncedCount = 0;

    for (const payment of oldPayments) {
      try {
        const paymentIntent = await paymongoService.getPaymentIntent(
          payment.payment_intent_id
        );
        const status = paymentIntent?.attributes?.status;

        if (!status) continue;

        // Map PayMongo status to our payment status
        let newStatus = null;
        if (status === "succeeded") {
          newStatus = "paid";
        } else if (
          ["cancelled", "expired", "payment_failed"].includes(status)
        ) {
          newStatus = "failed";
        }

        if (newStatus && newStatus !== payment.status) {
          await db.query(
            `
            UPDATE payment 
            SET status = ?,
                updated_at = NOW()
            WHERE id = ?
          `,
            [newStatus, payment.payment_id]
          );

          console.log(
            `[AbandonedOrderCleanup] Synced payment ${payment.payment_for_id}: ${payment.status} -> ${newStatus} (PI: ${status})`
          );
          syncedCount++;

          // If payment failed, update order status
          if (newStatus === "failed" && payment.payment_for === "order") {
            await db.query(
              `
              UPDATE \`order\` 
              SET status = 'failed_payment',
                  cancelled_at = NOW(),
                  cancelled_by = 'system',
                  cancellation_reason = 'Payment expired or failed',
                  updated_at = NOW()
              WHERE id = ? AND status = 'pending'
            `,
              [payment.payment_for_id]
            );
          }
        }
      } catch (error) {
        console.warn(
          `[AbandonedOrderCleanup] Could not sync payment intent ${payment.payment_intent_id}:`,
          error.message
        );
      }
    }

    return syncedCount;
  } catch (error) {
    console.error(
      "[AbandonedOrderCleanup] Error syncing payment intents:",
      error.message
    );
    results.errors.push(`Sync error: ${error.message}`);
    return 0;
  }
}

// ============================================================================
// Scheduler Functions
// ============================================================================

/**
 * Start the automatic abandoned order cleanup scheduler
 */
export function startAbandonedOrderCleanupScheduler() {
  if (cleanupIntervalId) {
    console.warn("[AbandonedOrderCleanup] Scheduler already running");
    return;
  }

  // Run initial cleanup after a short delay (give server time to fully start)
  setTimeout(() => {
    cleanupAbandonedOrders().catch((err) =>
      console.error(
        "[AbandonedOrderCleanup] Initial cleanup failed:",
        err.message
      )
    );
  }, 30000); // 30 second delay

  // Schedule periodic cleanup
  cleanupIntervalId = setInterval(() => {
    cleanupAbandonedOrders().catch((err) =>
      console.error(
        "[AbandonedOrderCleanup] Scheduled cleanup failed:",
        err.message
      )
    );
  }, CLEANUP_INTERVAL_MS);

  const intervalMinutes = CLEANUP_INTERVAL_MS / 1000 / 60;
  console.log(
    `[AbandonedOrderCleanup] Scheduler started (every ${intervalMinutes} minutes, threshold: ${ABANDONMENT_THRESHOLD_MINUTES} minutes)`
  );
}

/**
 * Stop the automatic abandoned order cleanup scheduler
 */
export function stopAbandonedOrderCleanupScheduler() {
  if (cleanupIntervalId) {
    clearInterval(cleanupIntervalId);
    cleanupIntervalId = null;
    console.log("[AbandonedOrderCleanup] Scheduler stopped");
  }
}

/**
 * Run cleanup manually (for testing or admin actions)
 * @returns {Promise<Object>} Cleanup results
 */
export async function runManualCleanup() {
  console.log("[AbandonedOrderCleanup] Manual cleanup triggered");
  return cleanupAbandonedOrders();
}

// ============================================================================
// Statistics & Monitoring
// ============================================================================

/**
 * Get statistics about potentially abandoned orders
 *
 * @returns {Promise<{
 *   pendingOnlinePayments: number,
 *   abandonedThreshold: number,
 *   potentiallyAbandoned: number,
 *   oldestPendingAge: number|null
 * }>}
 */
export async function getAbandonedOrderStats() {
  try {
    const cutoffTime = new Date(
      Date.now() - ABANDONMENT_THRESHOLD_MINUTES * 60 * 1000
    );

    // Use p.created_at for consistent UTC timestamps (see processAbandonedOnlinePaymentOrders comment)
    const [rows] = await db.query(
      `
      SELECT 
        COUNT(*) as pending_online_payments,
        SUM(CASE WHEN p.created_at < ? THEN 1 ELSE 0 END) as potentially_abandoned,
        MIN(p.created_at) as oldest_pending
      FROM \`order\` o
      INNER JOIN payment p ON p.payment_for = 'order' AND p.payment_for_id = o.id
      WHERE o.status = 'pending'
        AND p.status = 'pending'
        AND p.payment_method IN ('gcash', 'paymaya', 'card')
    `,
      [cutoffTime]
    );

    const stats = rows[0] || {};

    let oldestAgeMinutes = null;
    if (stats.oldest_pending) {
      oldestAgeMinutes = Math.floor(
        (Date.now() - new Date(stats.oldest_pending).getTime()) / 60000
      );
    }

    return {
      pendingOnlinePayments: stats.pending_online_payments || 0,
      abandonedThreshold: ABANDONMENT_THRESHOLD_MINUTES,
      potentiallyAbandoned: stats.potentially_abandoned || 0,
      oldestPendingAgeMinutes: oldestAgeMinutes,
    };
  } catch (error) {
    console.error(
      "[AbandonedOrderCleanup] Error getting stats:",
      error.message
    );
    throw error;
  }
}

// ============================================================================
// Export
// ============================================================================

// Named exports for configuration constants (for testing)
export {
  ABANDONMENT_THRESHOLD_MINUTES,
  PAYMENT_INTENT_EXPIRY_HOURS,
  CLEANUP_INTERVAL_MS,
};

export default {
  cleanupAbandonedOrders,
  startAbandonedOrderCleanupScheduler,
  stopAbandonedOrderCleanupScheduler,
  runManualCleanup,
  getAbandonedOrderStats,

  // Configuration (also available via named exports above)
  ABANDONMENT_THRESHOLD_MINUTES,
  PAYMENT_INTENT_EXPIRY_HOURS,
  CLEANUP_INTERVAL_MS,
};
