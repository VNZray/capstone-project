import express from "express";
import * as orderController from "../controller/orderController.js";

const router = express.Router();

// ==================== ORDER ROUTES ====================

// Orders
router.get("/", orderController.getAllOrders);
router.post("/", orderController.insertOrder);
router.get("/business/:businessId", orderController.getOrdersByBusinessId);
router.get("/business/:businessId/stats", orderController.getOrderStatsByBusiness);
router.post("/business/:businessId/verify-arrival", orderController.verifyArrivalCode);
router.get("/user/:userId", orderController.getOrdersByUserId);
router.get("/:id", orderController.getOrderById);
router.put("/:id/status", orderController.updateOrderStatus);
router.put("/:id/payment", orderController.updatePaymentStatus);
router.put("/:id/cancel", orderController.cancelOrder);
router.put("/:id/arrived", orderController.markCustomerArrivedForOrder);
router.put("/:id/ready", orderController.markOrderAsReady);
router.put("/:id/picked-up", orderController.markOrderAsPickedUp);

export default router;
