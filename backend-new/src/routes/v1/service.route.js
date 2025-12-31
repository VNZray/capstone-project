/**
 * Service Routes
 * Service management endpoints
 */
import { Router } from 'express';
import * as serviceController from '../../controllers/service.controller.js';
import { asyncHandler } from '../../middlewares/error-handler.js';
import { authenticate, optionalAuth } from '../../middlewares/authenticate.js';
import { authorizeRoles } from '../../middlewares/authorize.js';
import { validateRequest } from '../../middlewares/validate-request.js';
import { serviceValidation } from '../../validations/service.validation.js';

const router = Router();

/**
 * @route   GET /api/v1/services/business/:businessId
 * @desc    Get services for a business (public)
 * @access  Public
 */
router.get(
  '/business/:businessId',
  optionalAuth,
  validateRequest(serviceValidation.getBusinessServices),
  asyncHandler(serviceController.getBusinessServices)
);

/**
 * @route   GET /api/v1/services/:id
 * @desc    Get service by ID
 * @access  Public
 */
router.get(
  '/:id',
  asyncHandler(serviceController.getService)
);

// Protected routes
router.use(authenticate);

/**
 * @route   POST /api/v1/services
 * @desc    Create a service
 * @access  Private/Business Staff
 */
router.post(
  '/',
  authorizeRoles('Business Owner', 'Manager'),
  validateRequest(serviceValidation.createService),
  asyncHandler(serviceController.createService)
);

/**
 * @route   PATCH /api/v1/services/:id
 * @desc    Update a service
 * @access  Private/Business Staff
 */
router.patch(
  '/:id',
  authorizeRoles('Business Owner', 'Manager'),
  validateRequest(serviceValidation.updateService),
  asyncHandler(serviceController.updateService)
);

/**
 * @route   DELETE /api/v1/services/:id
 * @desc    Delete a service
 * @access  Private/Business Staff
 */
router.delete(
  '/:id',
  authorizeRoles('Business Owner', 'Manager'),
  asyncHandler(serviceController.deleteService)
);

/**
 * @route   POST /api/v1/services/:id/inquiries
 * @desc    Create an inquiry for a service
 * @access  Private/Tourist
 */
router.post(
  '/:id/inquiries',
  authorizeRoles('Tourist'),
  validateRequest(serviceValidation.createInquiry),
  asyncHandler(serviceController.createInquiry)
);

/**
 * @route   GET /api/v1/services/:id/inquiries
 * @desc    Get inquiries for a service
 * @access  Private/Business Staff
 */
router.get(
  '/:id/inquiries',
  authorizeRoles('Business Owner', 'Manager'),
  asyncHandler(serviceController.getServiceInquiries)
);

/**
 * @route   GET /api/v1/services/business/:businessId/inquiries
 * @desc    Get all inquiries for a business
 * @access  Private/Business Staff
 */
router.get(
  '/business/:businessId/inquiries',
  authorizeRoles('Business Owner', 'Manager'),
  asyncHandler(serviceController.getBusinessInquiries)
);

/**
 * @route   PATCH /api/v1/services/inquiries/:inquiryId/status
 * @desc    Update inquiry status
 * @access  Private/Business Staff
 */
router.patch(
  '/inquiries/:inquiryId/status',
  authorizeRoles('Business Owner', 'Manager'),
  validateRequest(serviceValidation.updateInquiryStatus),
  asyncHandler(serviceController.updateInquiryStatus)
);

export default router;
