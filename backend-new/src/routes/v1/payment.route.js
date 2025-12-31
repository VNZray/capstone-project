/**
 * Payment Routes
 * Payment management endpoints
 */
import { Router } from 'express';
import * as paymentController from '../../controllers/payment.controller.js';
import { asyncHandler } from '../../middlewares/error-handler.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorizeRoles } from '../../middlewares/authorize.js';
import { validateRequest } from '../../middlewares/validate-request.js';
import { paymentValidation } from '../../validations/payment.validation.js';

const router = Router();

/**
 * @route   POST /api/v1/payments/webhook
 * @desc    Handle payment webhook
 * @access  Public
 */
router.post(
  '/webhook',
  asyncHandler(paymentController.processWebhook)
);

// All other payment routes require authentication
router.use(authenticate);

// ============================================================
// UNIFIED PAYMENT WORKFLOW (PIPM Flow)
// ============================================================

/**
 * @route   POST /api/v1/payments/workflow/initiate
 * @desc    Initiate unified payment for order or booking
 * @access  Private/Tourist
 */
router.post(
  '/workflow/initiate',
  authorizeRoles('Tourist'),
  asyncHandler(paymentController.initiateUnifiedPayment)
);

/**
 * @route   GET /api/v1/payments/workflow/:paymentFor/:referenceId/verify
 * @desc    Verify payment status for order or booking
 * @access  Private
 */
router.get(
  '/workflow/:paymentFor/:referenceId/verify',
  asyncHandler(paymentController.verifyPaymentStatus)
);

// ============================================================
// STANDARD PAYMENT OPERATIONS
// ============================================================

/**
 * @route   GET /api/v1/payments
 * @desc    Get payments
 * @access  Private/Business Staff, Admin
 */
router.get(
  '/',
  authorizeRoles('Business Owner', 'Manager', 'Tourism Admin'),
  validateRequest(paymentValidation.getPayments),
  asyncHandler(paymentController.getPayments)
);

/**
 * @route   GET /api/v1/payments/stats
 * @desc    Get payment statistics
 * @access  Private/Business Staff, Admin
 */
router.get(
  '/stats',
  authorizeRoles('Business Owner', 'Manager', 'Tourism Admin'),
  asyncHandler(paymentController.getPaymentStats)
);

/**
 * @route   GET /api/v1/payments/:id
 * @desc    Get payment by ID
 * @access  Private
 */
router.get(
  '/:id',
  asyncHandler(paymentController.getPayment)
);

/**
 * @route   POST /api/v1/payments
 * @desc    Create a payment
 * @access  Private/Tourist
 */
router.post(
  '/',
  authorizeRoles('Tourist'),
  validateRequest(paymentValidation.createPayment),
  asyncHandler(paymentController.createPayment)
);

/**
 * @route   PATCH /api/v1/payments/:id/status
 * @desc    Update payment status
 * @access  Private/Business Staff, Admin
 */
router.patch(
  '/:id/status',
  authorizeRoles('Business Owner', 'Manager', 'Tourism Admin'),
  validateRequest(paymentValidation.updateStatus),
  asyncHandler(paymentController.updatePaymentStatus)
);

/**
 * @route   POST /api/v1/payments/:id/refund
 * @desc    Create a refund
 * @access  Private/Business Staff, Admin
 */
router.post(
  '/:id/refund',
  authorizeRoles('Business Owner', 'Manager', 'Tourism Admin'),
  validateRequest(paymentValidation.createRefund),
  asyncHandler(paymentController.createRefund)
);

/**
 * @route   GET /api/v1/payments/refunds/:refundId
 * @desc    Get refund by ID
 * @access  Private
 */
router.get(
  '/refunds/:refundId',
  asyncHandler(paymentController.getRefund)
);

/**
 * @route   PATCH /api/v1/payments/refunds/:refundId/status
 * @desc    Update refund status
 * @access  Private/Business Staff, Admin
 */
router.patch(
  '/refunds/:refundId/status',
  authorizeRoles('Business Owner', 'Manager', 'Tourism Admin'),
  validateRequest(paymentValidation.updateRefundStatus),
  asyncHandler(paymentController.updateRefundStatus)
);

/**
 * @route   POST /api/v1/payments/expire-pending
 * @desc    Expire pending payments
 * @access  Private/Admin
 */
router.post(
  '/expire-pending',
  authorizeRoles('Tourism Admin'),
  asyncHandler(paymentController.expirePendingPayments)
);

export default router;
