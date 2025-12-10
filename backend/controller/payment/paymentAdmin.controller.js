/**
 * Payment Admin Controller
 *
 * Admin-only endpoints for payment system management:
 * - Manual abandoned order cleanup
 * - Abandoned order statistics
 *
 * @module controller/payment/paymentAdmin.controller.js
 */

import * as abandonedOrderCleanupService from "../../services/abandonedOrderCleanupService.js";

/**
 * Manually trigger abandoned order cleanup
 * POST /api/payment/admin/cleanup-abandoned
 *
 * Admin only - triggers the cleanup process immediately
 */
export async function triggerAbandonedOrderCleanup(req, res) {
  try {
    console.log(
      `[PaymentAdmin] Manual cleanup triggered by user ${req.user?.id}`
    );

    const results = await abandonedOrderCleanupService.runManualCleanup();

    res.json({
      success: true,
      message: "Abandoned order cleanup completed",
      results: {
        abandonedOrders: results.abandonedOrders,
        expiredPaymentIntents: results.expiredPaymentIntents,
        stockRestored: results.stockRestored,
        errors: results.errors.length > 0 ? results.errors : undefined,
      },
    });
  } catch (error) {
    console.error("[PaymentAdmin] Manual cleanup failed:", error);
    res.status(500).json({
      success: false,
      error: "Cleanup operation failed",
      message: error.message,
    });
  }
}

/**
 * Get abandoned order statistics
 * GET /api/payment/admin/abandoned-stats
 *
 * Admin only - returns current stats about potentially abandoned orders
 */
export async function getAbandonedOrderStats(req, res) {
  try {
    const stats = await abandonedOrderCleanupService.getAbandonedOrderStats();

    res.json({
      success: true,
      data: {
        ...stats,
        nextCleanupIn: `${
          abandonedOrderCleanupService.CLEANUP_INTERVAL_MS / 1000 / 60
        } minutes`,
        configuration: {
          abandonmentThresholdMinutes:
            abandonedOrderCleanupService.ABANDONMENT_THRESHOLD_MINUTES,
          paymentIntentExpiryHours:
            abandonedOrderCleanupService.PAYMENT_INTENT_EXPIRY_HOURS,
          cleanupIntervalMs: abandonedOrderCleanupService.CLEANUP_INTERVAL_MS,
        },
      },
    });
  } catch (error) {
    console.error("[PaymentAdmin] Stats fetch failed:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch abandoned order statistics",
      message: error.message,
    });
  }
}
