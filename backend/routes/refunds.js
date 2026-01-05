/**
 * Refund Routes
 * 
 * API routes for refund and cancellation operations.
 * 
 * Order Refund Endpoints (also registered in orders.js):
 * - GET /api/orders/:orderId/refund-eligibility
 * - POST /api/orders/:orderId/refund
 * - POST /api/orders/:orderId/cancel-request
 * - GET /api/orders/:orderId/refund-status
 * 
 * Booking Refund Endpoints (also registered in booking.js):
 * - GET /api/bookings/:bookingId/refund-eligibility
 * - POST /api/bookings/:bookingId/refund
 * 
 * Standalone Refund Endpoints:
 * - GET /api/refunds/my - User's refund history
 * - GET /api/refunds/:refundId - Get refund by ID
 * - GET /api/refunds/business/:businessId/stats - Business refund stats
 * 
 * @see controller/refund/refundController.js
 * @see services/refundService.js
 */

import express from 'express';
import rateLimit from 'express-rate-limit';
import * as refundController from '../controller/refund/index.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRole, authorizeAny, authorizeBusinessAccess } from '../middleware/authorizeRole.js';
import { hasAnyPermission } from '../utils/authHelpers.js';

const router = express.Router();

// ==================== RATE LIMITERS ====================

/**
 * Rate limiter for refund requests
 * Prevents refund abuse and brute force attacks
 * Limit: 5 refund requests per hour per user
 */
const refundRequestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 refund requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip,
  message: {
    success: false,
    error: 'Too many refund requests. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  // Skip rate limit for users with admin permissions
  skip: async (req) => hasAnyPermission(req.user?.id, ['manage_refunds', 'manage_orders'])
});

/**
 * Rate limiter for eligibility checks
 * More lenient than refund requests
 * Limit: 30 checks per 15 minutes per user
 */
const eligibilityCheckLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip,
  message: {
    success: false,
    error: 'Too many requests. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

// ==================== USER REFUND ROUTES ====================

// Get user's refund history (any authenticated user can view their own refunds)
router.get(
  '/my',
  authenticate,
  refundController.getMyRefunds
);

// Get refund by ID (controller checks ownership/business access)
router.get(
  '/:refundId',
  authenticate,
  refundController.getRefundById
);

// ==================== BUSINESS ROUTES ====================

// Get refund statistics for a business
router.get(
  '/business/:businessId/stats',
  authenticate,
  authorizeBusinessAccess('businessId'),
  refundController.getBusinessRefundStats
);

// ==================== ORDER REFUND ROUTES ====================
// These are also registered in orders.js for convenience

// Check order refund eligibility (any authenticated user for their own orders)
router.get(
  '/orders/:orderId/eligibility',
  authenticate,
  eligibilityCheckLimiter,
  refundController.checkRefundEligibility
);

// Request refund for a paid order (controller validates order ownership)
router.post(
  '/orders/:orderId/refund',
  authenticate,
  refundRequestLimiter,
  refundController.requestOrderRefund
);

// Cancel a cash on pickup order (controller validates order ownership)
router.post(
  '/orders/:orderId/cancel',
  authenticate,
  refundRequestLimiter,
  refundController.cancelOrderRequest
);

// Get order refund status (controller validates ownership/business access)
router.get(
  '/orders/:orderId/status',
  authenticate,
  refundController.getOrderRefundStatus
);

// ==================== BOOKING REFUND ROUTES ====================
// These are also registered in booking.js for convenience

// Check booking refund eligibility (controller validates booking ownership)
router.get(
  '/bookings/:bookingId/eligibility',
  authenticate,
  eligibilityCheckLimiter,
  refundController.checkBookingRefundEligibility
);

// Request refund for a booking (controller validates booking ownership)
router.post(
  '/bookings/:bookingId/refund',
  authenticate,
  refundRequestLimiter,
  refundController.requestBookingRefund
);

export default router;
