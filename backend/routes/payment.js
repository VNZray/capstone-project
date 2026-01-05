import express from "express";
import * as paymentController from "../controller/payment/index.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeRole, authorize, authorizeBusinessAccess } from "../middleware/authorizeRole.js";

const router = express.Router();

// ============= UNIFIED PAYMENT WORKFLOW (RECOMMENDED) =============
// Use these endpoints for BOTH Orders and Bookings
// Frontend calls this single API for all payment types

// PRIMARY: Initiate payment for any resource (order or booking)
// Body: { payment_for: 'order' | 'booking', reference_id: string, payment_method?: string }
// Any authenticated user can initiate payment for their own order/booking
router.post(
  "/initiate",
  authenticate,
  paymentController.initiateUnifiedPayment
);

// Get payment status by Payment Intent ID (any authenticated user - controller validates ownership)
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
  paymentController.verifyUnifiedPayment
);

// ============= Webhook Routes =============

// Webhook endpoint (no auth, signature-based verification)
// Handles: payment.paid, payment.failed, refund.updated
router.post("/webhook", paymentController.handleWebhook);

// ============= Refund Routes =============

// Initiate refund (platform admin only - requires manage_payments permission)
router.post(
  "/:id/refund",
  authenticate,
  authorizeRole('Admin', 'Tourism Officer'),
  authorize('manage_payments'),
  paymentController.initiateRefund
);

// Get refund status (business access or platform admin)
router.get(
  "/:id/refund",
  authenticate,
  paymentController.getRefundStatus
);

// ============= Payment Query Routes =============

// Get all payments (controller filters by access level)
router.get(
  "/",
  authenticate,
  paymentController.getAllPayments
);

// Get payment by ID (controller validates ownership/business access)
router.get(
  "/:id",
  authenticate,
  paymentController.getPaymentById
);

// Get payments by payer ID (controller validates ownership)
router.get(
  "/payer/:payer_id",
  authenticate,
  paymentController.getPaymentByPayerId
);

// Get payments by payment_for_id (order/booking/subscription ID)
router.get(
  "/for/:payment_for_id",
  authenticate,
  paymentController.getPaymentByPaymentForId
);

// Get payments by business ID
router.get(
  "/business/:business_id",
  authenticate,
  authorizeBusinessAccess('business_id'),
  paymentController.getPaymentByBusinessId
);

// ============= Admin: Abandoned Order Cleanup =============

// Manually trigger abandoned order cleanup (platform admin only)
router.post(
  "/admin/cleanup-abandoned",
  authenticate,
  authorizeRole('Admin', 'Tourism Officer'),
  authorize('manage_payments'),
  paymentController.triggerAbandonedOrderCleanup
);

// Get abandoned order statistics (platform admin only)
router.get(
  "/admin/abandoned-stats",
  authenticate,
  authorizeRole('Admin', 'Tourism Officer'),
  authorize('manage_payments'),
  paymentController.getAbandonedOrderStats
);

export default router;
