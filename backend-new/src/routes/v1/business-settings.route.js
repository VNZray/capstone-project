/**
 * Business Settings Routes
 * Business settings, policies, and hours management endpoints
 */
import { Router } from 'express';
import * as businessSettingsController from '../../controllers/business-settings.controller.js';
import { asyncHandler } from '../../middlewares/error-handler.js';
import { authenticate, optionalAuth } from '../../middlewares/authenticate.js';
import { authorizeRoles } from '../../middlewares/authorize.js';
import { validateRequest } from '../../middlewares/validate-request.js';
import { businessSettingsValidation } from '../../validations/business-settings.validation.js';

const router = Router();

/**
 * @route   GET /api/v1/business-settings/:businessId/hours
 * @desc    Get business hours (public)
 * @access  Public
 */
router.get(
  '/:businessId/hours',
  optionalAuth,
  asyncHandler(businessSettingsController.getHours)
);

/**
 * @route   GET /api/v1/business-settings/:businessId/policies
 * @desc    Get business policies (public)
 * @access  Public
 */
router.get(
  '/:businessId/policies',
  optionalAuth,
  asyncHandler(businessSettingsController.getPolicies)
);

/**
 * @route   GET /api/v1/business-settings/:businessId/is-open
 * @desc    Check if business is currently open
 * @access  Public
 */
router.get(
  '/:businessId/is-open',
  asyncHandler(businessSettingsController.checkIfOpen)
);

// Protected routes
router.use(authenticate);

/**
 * @route   GET /api/v1/business-settings/:businessId
 * @desc    Get business settings
 * @access  Private/Business Staff
 */
router.get(
  '/:businessId',
  authorizeRoles('Business Owner', 'Manager'),
  asyncHandler(businessSettingsController.getSettings)
);

/**
 * @route   GET /api/v1/business-settings/:businessId/full
 * @desc    Get full business configuration
 * @access  Private/Business Staff
 */
router.get(
  '/:businessId/full',
  authorizeRoles('Business Owner', 'Manager'),
  asyncHandler(businessSettingsController.getFullConfiguration)
);

/**
 * @route   PUT /api/v1/business-settings/:businessId
 * @desc    Update business settings
 * @access  Private/Business Staff
 */
router.put(
  '/:businessId',
  authorizeRoles('Business Owner', 'Manager'),
  validateRequest(businessSettingsValidation.updateSettings),
  asyncHandler(businessSettingsController.updateSettings)
);

/**
 * @route   PUT /api/v1/business-settings/:businessId/policies
 * @desc    Update business policies
 * @access  Private/Business Staff
 */
router.put(
  '/:businessId/policies',
  authorizeRoles('Business Owner', 'Manager'),
  validateRequest(businessSettingsValidation.updatePolicies),
  asyncHandler(businessSettingsController.updatePolicies)
);

/**
 * @route   PUT /api/v1/business-settings/:businessId/hours
 * @desc    Update business hours
 * @access  Private/Business Staff
 */
router.put(
  '/:businessId/hours',
  authorizeRoles('Business Owner', 'Manager'),
  validateRequest(businessSettingsValidation.updateHours),
  asyncHandler(businessSettingsController.updateHours)
);

/**
 * @route   PATCH /api/v1/business-settings/:businessId/hours/:day
 * @desc    Update single day hours
 * @access  Private/Business Staff
 */
router.patch(
  '/:businessId/hours/:day',
  authorizeRoles('Business Owner', 'Manager'),
  validateRequest(businessSettingsValidation.updateDayHours),
  asyncHandler(businessSettingsController.updateDayHours)
);

/**
 * @route   POST /api/v1/business-settings/:businessId/initialize
 * @desc    Initialize default configuration
 * @access  Private/Business Owner
 */
router.post(
  '/:businessId/initialize',
  authorizeRoles('Business Owner'),
  asyncHandler(businessSettingsController.initializeConfiguration)
);

export default router;
