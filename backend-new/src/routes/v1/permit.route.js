/**
 * Permit Routes
 * Permit management endpoints
 */
import { Router } from 'express';
import * as permitController from '../../controllers/permit.controller.js';
import { asyncHandler } from '../../middlewares/error-handler.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorizeRoles } from '../../middlewares/authorize.js';
import { validateRequest } from '../../middlewares/validate-request.js';
import { permitValidation } from '../../validations/permit.validation.js';

const router = Router();

// All permit routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/permits
 * @desc    Get all permits (admin)
 * @access  Private/Tourism Admin
 */
router.get(
  '/',
  authorizeRoles('Tourism Admin'),
  validateRequest(permitValidation.getAllPermits),
  asyncHandler(permitController.getAllPermits)
);

/**
 * @route   GET /api/v1/permits/expiring
 * @desc    Get expiring permits
 * @access  Private/Tourism Admin
 */
router.get(
  '/expiring',
  authorizeRoles('Tourism Admin'),
  validateRequest(permitValidation.getExpiringPermits),
  asyncHandler(permitController.getExpiringPermits)
);

/**
 * @route   GET /api/v1/permits/expired
 * @desc    Get expired permits
 * @access  Private/Tourism Admin
 */
router.get(
  '/expired',
  authorizeRoles('Tourism Admin'),
  asyncHandler(permitController.getExpiredPermits)
);

/**
 * @route   GET /api/v1/permits/business/:businessId
 * @desc    Get permits for a business
 * @access  Private/Business Owner, Tourism Admin
 */
router.get(
  '/business/:businessId',
  authorizeRoles('Business Owner', 'Manager', 'Tourism Admin'),
  asyncHandler(permitController.getBusinessPermits)
);

/**
 * @route   GET /api/v1/permits/:id
 * @desc    Get permit by ID
 * @access  Private
 */
router.get(
  '/:id',
  asyncHandler(permitController.getPermit)
);

/**
 * @route   POST /api/v1/permits
 * @desc    Create a permit
 * @access  Private/Business Owner
 */
router.post(
  '/',
  authorizeRoles('Business Owner'),
  validateRequest(permitValidation.createPermit),
  asyncHandler(permitController.createPermit)
);

/**
 * @route   PATCH /api/v1/permits/:id
 * @desc    Update a permit
 * @access  Private/Business Owner
 */
router.patch(
  '/:id',
  authorizeRoles('Business Owner'),
  validateRequest(permitValidation.updatePermit),
  asyncHandler(permitController.updatePermit)
);

/**
 * @route   PATCH /api/v1/permits/:id/status
 * @desc    Update permit status
 * @access  Private/Tourism Admin
 */
router.patch(
  '/:id/status',
  authorizeRoles('Tourism Admin'),
  validateRequest(permitValidation.updateStatus),
  asyncHandler(permitController.updatePermitStatus)
);

/**
 * @route   DELETE /api/v1/permits/:id
 * @desc    Delete a permit
 * @access  Private/Business Owner
 */
router.delete(
  '/:id',
  authorizeRoles('Business Owner'),
  asyncHandler(permitController.deletePermit)
);

/**
 * @route   POST /api/v1/permits/check-expired
 * @desc    Check and update expired permits
 * @access  Private/Tourism Admin
 */
router.post(
  '/check-expired',
  authorizeRoles('Tourism Admin'),
  asyncHandler(permitController.checkExpiredPermits)
);

export default router;
