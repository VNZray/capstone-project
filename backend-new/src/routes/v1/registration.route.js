/**
 * Registration Routes
 * Business registration endpoints
 */
import { Router } from 'express';
import * as businessController from '../../controllers/business.controller.js';
import { asyncHandler } from '../../middlewares/error-handler.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorizeRoles } from '../../middlewares/authorize.js';

const router = Router();

/**
 * @route   GET /api/v1/registration
 * @desc    Get all business registrations
 * @access  Private/Admin
 */
router.get(
  '/',
  authenticate,
  authorizeRoles('Tourism Admin', 'Admin'),
  asyncHandler(businessController.getAllBusinessRegistrations)
);

/**
 * @route   POST /api/v1/registration
 * @desc    Register a new business
 * @access  Private/Business Owner
 */
router.post(
  '/',
  authenticate,
  authorizeRoles('Business Owner'),
  asyncHandler(businessController.registerBusiness)
);

/**
 * @route   GET /api/v1/registration/:id
 * @desc    Get business registration by ID
 * @access  Private
 */
router.get(
  '/:id',
  authenticate,
  asyncHandler(businessController.getBusinessRegistrationById)
);

/**
 * @route   PUT /api/v1/registration/:id
 * @desc    Update business registration
 * @access  Private/Business Owner
 */
router.put(
  '/:id',
  authenticate,
  authorizeRoles('Business Owner', 'Tourism Admin', 'Admin'),
  asyncHandler(businessController.updateBusinessRegistration)
);

/**
 * @route   DELETE /api/v1/registration/:id
 * @desc    Delete business registration
 * @access  Private/Admin
 */
router.delete(
  '/:id',
  authenticate,
  authorizeRoles('Tourism Admin', 'Admin'),
  asyncHandler(businessController.deleteBusinessRegistration)
);

export default router;
