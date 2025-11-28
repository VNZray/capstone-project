import express from "express";
import * as orderController from "../controller/order/index.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeRole } from "../middleware/authorizeRole.js";

const router = express.Router();

// ==================== ORDER ROUTES ====================

// Public/Admin routes
router.get("/", authenticate, authorizeRole("Admin"), orderController.getAllOrders);

// Tourist routes - create and view own orders
router.post("/", authenticate, authorizeRole("Tourist"), orderController.insertOrder);
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
router.post("/:id/cancel", authenticate, orderController.cancelOrder); // Role check in controller

// Pickup workflow - business only
router.post("/:id/arrived", authenticate, authorizeRole("Business Owner", "Staff", "Admin"), orderController.markCustomerArrivedForOrder);
router.post("/:id/mark-ready", authenticate, authorizeRole("Business Owner", "Staff", "Admin"), orderController.markOrderAsReady);
router.post("/:id/mark-picked-up", authenticate, authorizeRole("Business Owner", "Staff", "Admin"), orderController.markOrderAsPickedUp);

export default router;
