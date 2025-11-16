import express from "express";
import * as paymentController from "../controller/paymentController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeRole } from "../middleware/authorizeRole.js";

const router = express.Router();

// ============= PayMongo Integration Routes =============

// Initiate payment (Tourist only)
router.post("/initiate", authenticate, authorizeRole("Tourist"), paymentController.initiatePayment);

// Webhook endpoint (no auth, signature-based verification)
router.post("/webhook", paymentController.handleWebhook);

// Initiate refund (Admin only)
router.post("/:id/refund", authenticate, authorizeRole("Admin"), paymentController.initiateRefund);

// ============= Legacy Payment Routes =============
// Add authentication and authorization to legacy routes (Phase 4)

router.post("/", authenticate, authorizeRole("Admin", "Owner", "Staff"), paymentController.insertPayment);
router.get("/:id", authenticate, paymentController.getPaymentById); // Ownership checked in controller
router.get("/", authenticate, authorizeRole("Admin"), paymentController.getAllPayments);
router.delete("/:id", authenticate, authorizeRole("Admin"), paymentController.deletePayment);
router.put("/:id", authenticate, authorizeRole("Admin"), paymentController.updatePayment);
router.get("/payer/:payer_id", authenticate, paymentController.getPaymentByPayerId); // Should add ownership check
router.get("/for/:payment_for_id", authenticate, paymentController.getPaymentByPaymentForId); // Should add ownership check
router.get("/business/:business_id", authenticate, authorizeRole("Owner", "Staff", "Admin"), paymentController.getPaymentByBusinessId);

export default router;
