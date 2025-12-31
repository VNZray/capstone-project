/**
 * Staff Routes
 * Staff management endpoints
 */
import { Router } from 'express';
import * as staffController from '../../controllers/staff.controller.js';
import { asyncHandler } from '../../middlewares/error-handler.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorizeRoles } from '../../middlewares/authorize.js';
import { validateRequest } from '../../middlewares/validate-request.js';
import { staffValidation } from '../../validations/staff.validation.js';

const router = Router();

// All staff routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/staff/my-profile
 * @desc    Get my staff profile
 * @access  Private/Staff
 */
router.get(
  '/my-profile',
  authorizeRoles('Manager', 'Receptionist', 'Sales Associate', 'Room Manager'),
  asyncHandler(staffController.getMyStaffProfile)
);

/**
 * @route   GET /api/v1/staff/business/:businessId
 * @desc    Get all staff for a business
 * @access  Private/Business Owner, Manager
 */
router.get(
  '/business/:businessId',
  authorizeRoles('Business Owner', 'Manager'),
  validateRequest(staffValidation.getBusinessStaff),
  asyncHandler(staffController.getBusinessStaff)
);

/**
 * @route   GET /api/v1/staff/business/:businessId/count
 * @desc    Get staff count for a business
 * @access  Private/Business Owner, Manager
 */
router.get(
  '/business/:businessId/count',
  authorizeRoles('Business Owner', 'Manager'),
  asyncHandler(staffController.getStaffCount)
);

/**
 * @route   GET /api/v1/staff/:id
 * @desc    Get staff by ID
 * @access  Private/Business Owner, Manager
 */
router.get(
  '/:id',
  authorizeRoles('Business Owner', 'Manager'),
  asyncHandler(staffController.getStaff)
);

/**
 * @route   POST /api/v1/staff
 * @desc    Create staff member
 * @access  Private/Business Owner
 */
router.post(
  '/',
  authorizeRoles('Business Owner'),
  validateRequest(staffValidation.createStaff),
  asyncHandler(staffController.createStaff)
);

/**
 * @route   POST /api/v1/staff/invite
 * @desc    Invite staff member by email
 * @access  Private/Business Owner
 */
router.post(
  '/invite',
  authorizeRoles('Business Owner'),
  validateRequest(staffValidation.inviteStaff),
  asyncHandler(staffController.inviteStaff)
);

/**
 * @route   PATCH /api/v1/staff/:id
 * @desc    Update staff member
 * @access  Private/Business Owner, Manager
 */
router.patch(
  '/:id',
  authorizeRoles('Business Owner', 'Manager'),
  validateRequest(staffValidation.updateStaff),
  asyncHandler(staffController.updateStaff)
);

/**
 * @route   PATCH /api/v1/staff/:id/status
 * @desc    Update staff status
 * @access  Private/Business Owner
 */
router.patch(
  '/:id/status',
  authorizeRoles('Business Owner'),
  validateRequest(staffValidation.updateStaffStatus),
  asyncHandler(staffController.updateStaffStatus)
);

/**
 * @route   DELETE /api/v1/staff/:id
 * @desc    Remove staff member
 * @access  Private/Business Owner
 */
router.delete(
  '/:id',
  authorizeRoles('Business Owner'),
  asyncHandler(staffController.removeStaff)
);

export default router;
