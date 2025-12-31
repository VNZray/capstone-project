/**
 * Refund Routes
 * Refund management endpoints
 */
import { Router } from 'express';
import * as refundController from '../../controllers/refund.controller.js';
import { asyncHandler } from '../../middlewares/error-handler.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorizeRoles } from '../../middlewares/authorize.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// User routes
router.get('/', asyncHandler(refundController.getAllRefunds));
router.get('/:id', asyncHandler(refundController.getRefundById));
router.get('/payment/:paymentId', asyncHandler(refundController.getRefundsByPaymentId));
router.get('/user/:userId', asyncHandler(refundController.getRefundsByUserId));
router.post('/', asyncHandler(refundController.createRefund));
router.post('/:id/cancel', asyncHandler(refundController.cancelRefund));

// Admin routes
router.post(
  '/:id/process',
  authorizeRoles('Tourism Admin', 'Admin', 'Business Owner'),
  asyncHandler(refundController.processRefund)
);

export default router;
