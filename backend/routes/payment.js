import express from "express";
import * as paymentController from "../controller/payment/index.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeRole } from "../middleware/authorizeRole.js";

const router = express.Router();

// ============= UNIFIED PAYMENT WORKFLOW (RECOMMENDED) =============
// Use these endpoints for BOTH Orders and Bookings
// Frontend calls this single API for all payment types

// PRIMARY: Initiate payment for any resource (order or booking)
// Body: { payment_for: 'order' | 'booking', reference_id: string, payment_method?: string }
router.post(
  "/initiate",
  authenticate,
  authorizeRole("Tourist"),
  paymentController.initiateUnifiedPayment
);

// Get payment status by Payment Intent ID (replaces verifyBookingPayment)
router.get(
  "/intent/:paymentIntentId",
  authenticate,
  paymentController.getUnifiedPaymentStatus
);

// Verify and fulfill payment after redirect
// Body: { payment_for: 'order' | 'booking', reference_id: string, payment_id: string }
router.post(
  "/verify",
  authenticate,
  authorizeRole("Tourist"),
  paymentController.verifyUnifiedPayment
);

// ============= Webhook Routes =============

// Webhook endpoint (no auth, signature-based verification)
// Handles: payment.paid, payment.failed, refund.updated
router.post("/webhook", paymentController.handleWebhook);

// ============= Refund Routes =============

// Initiate refund (Admin only)
router.post(
  "/:id/refund",
  authenticate,
  authorizeRole("Admin"),
  paymentController.initiateRefund
);

// Get refund status
router.get(
  "/:id/refund",
  authenticate,
  authorizeRole("Admin", "Business Owner"),
  paymentController.getRefundStatus
);

// ============= Payment Query Routes =============

// Get all payments (Admin only for full list)
router.get(
  "/",
  authenticate,
  authorizeRole("Admin", "Business Owner", "Staff", "Tourist"),
  paymentController.getAllPayments
);

// Get payment by ID (ownership checked in controller)
router.get(
  "/:id",
  authenticate,
  authorizeRole("Admin", "Business Owner", "Staff", "Tourist"),
  paymentController.getPaymentById
);

// Get payments by payer ID
router.get(
  "/payer/:payer_id",
  authenticate,
  authorizeRole("Admin", "Business Owner", "Staff", "Tourist"),
  paymentController.getPaymentByPayerId
);

// Get payments by payment_for_id (order/booking/subscription ID)
router.get(
  "/for/:payment_for_id",
  authenticate,
  authorizeRole("Admin", "Business Owner", "Staff", "Tourist"),
  paymentController.getPaymentByPaymentForId
);

// Get payments by business ID
router.get(
  "/business/:business_id",
  authenticate,
  authorizeRole("Admin", "Business Owner", "Staff", "Tourist"),
  paymentController.getPaymentByBusinessId
);

// ============= Admin: Abandoned Order Cleanup =============

// Manually trigger abandoned order cleanup (Admin only)
router.post(
  "/admin/cleanup-abandoned",
  authenticate,
  authorizeRole("Admin"),
  paymentController.triggerAbandonedOrderCleanup
);

// Get abandoned order statistics (Admin only)
router.get(
  "/admin/abandoned-stats",
  authenticate,
  authorizeRole("Admin"),
  paymentController.getAbandonedOrderStats
);

export default router;
