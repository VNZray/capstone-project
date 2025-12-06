import express from "express";
import * as paymentController from "../controller/paymentController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeRole } from "../middleware/authorizeRole.js";

const router = express.Router();

// ============= PayMongo Integration Routes =============

// Initiate payment using Checkout Session (Tourist only) - RECOMMENDED
router.post("/initiate", authenticate, authorizeRole("Tourist"), paymentController.initiatePayment);

// ============= Payment Intent Workflow Routes =============
// For custom checkout integration with more control

// Create Payment Intent for an order (Tourist only)
router.post("/intent", authenticate, authorizeRole("Tourist"), paymentController.createPaymentIntentForOrder);

// Attach Payment Method to Payment Intent (for e-wallets, server-side)
router.post("/intent/:id/attach", authenticate, authorizeRole("Tourist"), paymentController.attachPaymentMethodToIntent);

// Get Payment Intent status
router.get("/intent/:id", authenticate, paymentController.getPaymentIntentStatus);

// ============= Webhook & Refund Routes =============

// Webhook endpoint (no auth, signature-based verification)
router.post("/webhook", paymentController.handleWebhook);

// Initiate refund (Admin only)
router.post("/:id/refund", authenticate, authorizeRole("Admin"), paymentController.initiateRefund);

// ============= Legacy Payment Routes =============
// Add authentication and authorization to legacy routes (Phase 4)

router.post("/", paymentController.insertPayment);
router.get("/:id", authenticate,  authorizeRole("Admin", "Business Owner", "Manager", "Room Manager", "Receptionist", "Tourist"), paymentController.getPaymentById); // Ownership checked in controller
router.get("/", authenticate,   authorizeRole("Admin", "Business Owner", "Manager", "Room Manager", "Receptionist", "Tourist"), paymentController.getAllPayments);
router.delete("/:id", authenticate,  authorizeRole("Admin", "Business Owner", "Manager", "Room Manager", "Receptionist", "Tourist"), paymentController.deletePayment);
router.put("/:id", authenticate,  authorizeRole("Admin", "Business Owner", "Manager", "Room Manager", "Receptionist", "Tourist"), paymentController.updatePayment);
router.get("/payer/:payer_id", authenticate, authorizeRole("Admin", "Business Owner", "Manager", "Room Manager", "Receptionist", "Tourist"), paymentController.getPaymentByPayerId); // Should add ownership check
router.get("/for/:payment_for_id", authenticate, authorizeRole("Admin", "Business Owner", "Manager", "Room Manager", "Receptionist", "Tourist"), paymentController.getPaymentByPaymentForId); // Should add ownership check
router.get("/business/:business_id", authenticate,  authorizeRole("Admin", "Business Owner", "Manager", "Room Manager", "Receptionist", "Tourist"), paymentController.getPaymentByBusinessId);

export default router;
