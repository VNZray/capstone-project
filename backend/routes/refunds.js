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
import { authorizeRole } from '../middleware/authorizeRole.js';

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
  skip: (req) => req.user?.role === 'Admin'
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

// Get user's refund history
router.get(
  '/my',
  authenticate,
  authorizeRole('Tourist', 'Business Owner', 'Admin'),
  refundController.getMyRefunds
);

// Get refund by ID
router.get(
  '/:refundId',
  authenticate,
  authorizeRole('Tourist', 'Business Owner', 'Admin'),
  refundController.getRefundById
);

// ==================== BUSINESS ROUTES ====================

// Get refund statistics for a business
router.get(
  '/business/:businessId/stats',
  authenticate,
  authorizeRole('Business Owner', 'Admin'),
  refundController.getBusinessRefundStats
);

// ==================== ORDER REFUND ROUTES ====================
// These are also registered in orders.js for convenience

// Check order refund eligibility
router.get(
  '/orders/:orderId/eligibility',
  authenticate,
  eligibilityCheckLimiter,
  authorizeRole('Tourist'),
  refundController.checkRefundEligibility
);

// Request refund for a paid order
router.post(
  '/orders/:orderId/refund',
  authenticate,
  refundRequestLimiter,
  authorizeRole('Tourist'),
  refundController.requestOrderRefund
);

// Cancel a cash on pickup order
router.post(
  '/orders/:orderId/cancel',
  authenticate,
  refundRequestLimiter,
  authorizeRole('Tourist'),
  refundController.cancelOrderRequest
);

// Get order refund status
router.get(
  '/orders/:orderId/status',
  authenticate,
  authorizeRole('Tourist', 'Business Owner', 'Admin'),
  refundController.getOrderRefundStatus
);

// ==================== BOOKING REFUND ROUTES ====================
// These are also registered in booking.js for convenience

// Check booking refund eligibility
router.get(
  '/bookings/:bookingId/eligibility',
  authenticate,
  eligibilityCheckLimiter,
  authorizeRole('Tourist'),
  refundController.checkBookingRefundEligibility
);

// Request refund for a booking
router.post(
  '/bookings/:bookingId/refund',
  authenticate,
  refundRequestLimiter,
  authorizeRole('Tourist'),
  refundController.requestBookingRefund
);

export default router;
