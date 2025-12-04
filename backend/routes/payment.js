import express from "express";
import * as paymentController from "../controller/payment/index.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeRole } from "../middleware/authorizeRole.js";

const router = express.Router();

// ============= PIPM (Payment Intent Payment Method) Workflow Routes =============
// This is the recommended flow for all PayMongo payments

// Step 1: Create Payment Intent for an order (Tourist only)
// Returns payment_intent_id and client_key for frontend
router.post("/initiate", authenticate, authorizeRole("Tourist"), paymentController.initiatePayment);

// Alternative: Create Payment Intent with custom payment method types
router.post("/intent", authenticate, authorizeRole("Tourist"), paymentController.createPaymentIntentForOrder);

// Step 2: Create Payment Method (for e-wallets, server-side)
// For card payments, create payment method client-side using public key
router.post("/method", authenticate, authorizeRole("Tourist"), paymentController.createPaymentMethod);

// Step 3: Attach Payment Method to Payment Intent (for e-wallets, server-side)
// For card payments, attach client-side using public key + client_key
router.post("/intent/:id/attach", authenticate, authorizeRole("Tourist"), paymentController.attachPaymentMethodToIntent);

// Get Payment Intent status (useful for polling)
router.get("/intent/:id", authenticate, paymentController.getPaymentIntentStatus);

// ============= Webhook Routes =============

// Webhook endpoint (no auth, signature-based verification)
// Handles: payment.paid, payment.failed, refund.updated
router.post("/webhook", paymentController.handleWebhook);

// ============= Refund Routes =============

// Initiate refund (Admin only)
router.post("/:id/refund", authenticate, authorizeRole("Admin"), paymentController.initiateRefund);

// Get refund status
router.get("/:id/refund", authenticate, authorizeRole("Admin", "Business Owner"), paymentController.getRefundStatus);

// ============= Payment Query Routes =============

// Get all payments (Admin only for full list)
router.get("/", authenticate, authorizeRole("Admin", "Business Owner", "Staff", "Tourist"), paymentController.getAllPayments);

// Get payment by ID (ownership checked in controller)
router.get("/:id", authenticate, authorizeRole("Admin", "Business Owner", "Staff", "Tourist"), paymentController.getPaymentById);

// Get payments by payer ID
router.get("/payer/:payer_id", authenticate, authorizeRole("Admin", "Business Owner", "Staff", "Tourist"), paymentController.getPaymentByPayerId);

// Get payments by payment_for_id (order/booking/subscription ID)
router.get("/for/:payment_for_id", authenticate, authorizeRole("Admin", "Business Owner", "Staff", "Tourist"), paymentController.getPaymentByPaymentForId);

// Get payments by business ID
router.get("/business/:business_id", authenticate, authorizeRole("Admin", "Business Owner", "Staff", "Tourist"), paymentController.getPaymentByBusinessId);

// ============= CRUD Routes (Internal/Admin) =============

// Create payment record manually
router.post("/", paymentController.insertPayment);

// Update payment
router.put("/:id", authenticate, authorizeRole("Admin", "Business Owner", "Staff", "Tourist"), paymentController.updatePayment);

// Delete payment
router.delete("/:id", authenticate, authorizeRole("Admin", "Business Owner", "Staff", "Tourist"), paymentController.deletePayment);

export default router;
