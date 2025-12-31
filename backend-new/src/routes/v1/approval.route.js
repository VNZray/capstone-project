/**
 * Approval Routes
 * Approval workflow management endpoints
 */
import { Router } from 'express';
import * as approvalController from '../../controllers/approval.controller.js';
import { asyncHandler } from '../../middlewares/error-handler.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorizeRoles } from '../../middlewares/authorize.js';
import { validateRequest } from '../../middlewares/validate-request.js';
import { approvalValidation } from '../../validations/approval.validation.js';

const router = Router();

// All approval routes require authentication and Tourism Admin role
router.use(authenticate, authorizeRoles('Tourism Admin'));

/**
 * @route   GET /api/v1/approvals/pending
 * @desc    Get pending approvals
 * @access  Private/Tourism Admin
 */
router.get(
  '/pending',
  validateRequest(approvalValidation.getPendingApprovals),
  asyncHandler(approvalController.getPendingApprovals)
);

/**
 * @route   GET /api/v1/approvals/:id
 * @desc    Get approval record by ID
 * @access  Private/Tourism Admin
 */
router.get(
  '/:id',
  asyncHandler(approvalController.getApprovalRecord)
);

/**
 * @route   GET /api/v1/approvals/:entityType/:entityId
 * @desc    Get approval records for an entity
 * @access  Private/Tourism Admin
 */
router.get(
  '/:entityType/:entityId',
  asyncHandler(approvalController.getApprovalRecords)
);

/**
 * @route   POST /api/v1/approvals/:entityType/:entityId/approve
 * @desc    Approve an entity
 * @access  Private/Tourism Admin
 */
router.post(
  '/:entityType/:entityId/approve',
  validateRequest(approvalValidation.approveEntity),
  asyncHandler(approvalController.approveEntity)
);

/**
 * @route   POST /api/v1/approvals/:entityType/:entityId/reject
 * @desc    Reject an entity
 * @access  Private/Tourism Admin
 */
router.post(
  '/:entityType/:entityId/reject',
  validateRequest(approvalValidation.rejectEntity),
  asyncHandler(approvalController.rejectEntity)
);

/**
 * @route   POST /api/v1/approvals/:entityType/:entityId/request-changes
 * @desc    Request changes for an entity
 * @access  Private/Tourism Admin
 */
router.post(
  '/:entityType/:entityId/request-changes',
  validateRequest(approvalValidation.requestChanges),
  asyncHandler(approvalController.requestChanges)
);

export default router;
