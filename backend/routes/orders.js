import express from "express";
import rateLimit from "express-rate-limit";
import * as orderController from "../controller/order/index.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeRole } from "../middleware/authorizeRole.js";

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
    // Skip rate limiting for Admin users
    return req.user?.role === 'Admin';
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
  skip: (req) => req.user?.role === 'Admin'
});

// ==================== ORDER ROUTES ====================

// Public/Admin routes
router.get("/", authenticate, authorizeRole("Admin"), orderController.getAllOrders);

// Tourist routes - create and view own orders
router.post("/", authenticate, orderCreationLimiter, authorizeRole("Tourist"), orderController.insertOrder);
router.get("/user/:userId", authenticate, orderController.getOrdersByUserId); // Will add ownership check in controller

// Business routes - manage business orders
router.get("/business/:businessId", authenticate, authorizeRole("Business Owner", "Staff", "Admin"), orderController.getOrdersByBusinessId);
router.get("/business/:businessId/stats", authenticate, authorizeRole("Business Owner", "Staff", "Admin"), orderController.getOrderStatsByBusiness);
router.post("/business/:businessId/verify-arrival", authenticate, authorizeRole("Business Owner", "Staff", "Admin"), orderController.verifyArrivalCode);

// Order details - accessible by owner (tourist or business) and admin
router.get("/:id", authenticate, orderController.getOrderById); // Will add ownership check in controller

// Status updates - business and admin only
router.patch("/:id/status", authenticate, authorizeRole("Business Owner", "Staff", "Admin"), orderController.updateOrderStatus);
router.patch("/:id/payment-status", authenticate, authorizeRole("Admin"), orderController.updatePaymentStatus);

// Cancellation - tourist (within grace) or business
router.post("/:id/cancel", authenticate, orderCancellationLimiter, orderController.cancelOrder); // Role check in controller

// Pickup workflow - business only
router.post("/:id/arrived", authenticate, authorizeRole("Business Owner", "Staff", "Admin"), orderController.markCustomerArrivedForOrder);
router.post("/:id/mark-ready", authenticate, authorizeRole("Business Owner", "Staff", "Admin"), orderController.markOrderAsReady);
router.post("/:id/mark-picked-up", authenticate, authorizeRole("Business Owner", "Staff", "Admin"), orderController.markOrderAsPickedUp);

export default router;
