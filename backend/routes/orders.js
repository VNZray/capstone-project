import express from "express";
import rateLimit from "express-rate-limit";
import * as orderController from "../controller/order/index.js";
import * as refundController from "../controller/refund/index.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeRole, authorize, authorizeAny, authorizeBusinessAccess } from "../middleware/authorizeRole.js";
import { hasAnyPermission } from "../utils/authHelpers.js";

const router = express.Router();

// ==================== RATE LIMITERS ====================

/**
 * Rate limiter for order creation
 * Prevents order flooding and brute force attacks
 * Limit: 10 orders per 15 minutes per user
 */
const orderCreationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 orders per window
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  keyGenerator: (req) => {
    // Use user ID if authenticated, otherwise fall back to IP
    return req.user?.id || req.ip;
  },
  message: {
    success: false,
    error: 'Too many order attempts. Please try again in 15 minutes.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  skip: (req) => {
    // Skip rate limiting for users with platform admin permissions
    return hasAnyPermission(req.user, 'manage_orders', 'manage_users');
  }
});

/**
 * Rate limiter for order cancellation
 * Prevents abuse of cancellation system
 * Limit: 5 cancellations per hour per user
 */
const orderCancellationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 cancellations per hour
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip,
  message: {
    success: false,
    error: 'Too many cancellation attempts. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  skip: (req) => hasAnyPermission(req.user, 'manage_orders', 'manage_users')
});

// ==================== ORDER ROUTES ====================

// Platform admin: Get all orders
router.get("/", authenticate, authorizeRole('Admin', 'Tourism Officer'), authorize('manage_orders'), orderController.getAllOrders);

// Any authenticated user can create orders
router.post("/", authenticate, orderCreationLimiter, orderController.insertOrder);

// User's own orders (controller validates ownership)
router.get("/user/:userId", authenticate, orderController.getOrdersByUserId);

// Business routes - use business access check
router.get("/business/:businessId", authenticate, authorizeBusinessAccess('businessId'), orderController.getOrdersByBusinessId);
router.get("/business/:businessId/stats", authenticate, authorizeBusinessAccess('businessId'), orderController.getOrderStatsByBusiness);
router.post("/business/:businessId/verify-arrival", authenticate, authorizeBusinessAccess('businessId'), orderController.verifyArrivalCode);

// Order details - accessible by owner (tourist or business) and admin (controller validates)
router.get("/:id", authenticate, orderController.getOrderById);

// Status updates - requires manage_orders permission
router.patch("/:id/status", authenticate, authorize('manage_orders'), orderController.updateOrderStatus);
// Payment status updates - platform admin only
router.patch("/:id/payment-status", authenticate, authorizeRole('Admin', 'Tourism Officer'), authorize('manage_orders'), orderController.updatePaymentStatus);

// Cancellation - role check in controller for flexibility
router.post("/:id/cancel", authenticate, orderCancellationLimiter, orderController.cancelOrder);

// ==================== REFUND ROUTES ====================

/**
 * Rate limiter for refund requests
 * Prevents refund abuse
 * Limit: 5 refund requests per hour per user
 */
const refundRequestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip,
  message: {
    success: false,
    error: 'Too many refund requests. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  skip: (req) => hasAnyPermission(req.user, 'manage_refunds', 'manage_orders')
});

// Refund routes - controller validates order ownership
router.get("/:orderId/refund-eligibility", authenticate, refundController.checkRefundEligibility);
router.post("/:orderId/refund", authenticate, refundRequestLimiter, refundController.requestOrderRefund);
router.post("/:orderId/cancel-request", authenticate, refundRequestLimiter, refundController.cancelOrderRequest);
router.get("/:orderId/refund-status", authenticate, refundController.getOrderRefundStatus);

// Pickup workflow - requires manage_orders permission
router.post("/:id/arrived", authenticate, authorize('manage_orders'), orderController.markCustomerArrivedForOrder);
router.post("/:id/mark-ready", authenticate, authorize('manage_orders'), orderController.markOrderAsReady);
router.post("/:id/mark-picked-up", authenticate, authorize('manage_orders'), orderController.markOrderAsPickedUp);

export default router;
