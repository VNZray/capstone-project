/**
 * Tourism Staff Management Routes
 * Admin routes for creating/managing tourism staff with full user+profile management
 */
import { Router } from 'express';
import * as tourismStaffController from '../../controllers/tourism-staff-management.controller.js';
import { asyncHandler } from '../../middlewares/error-handler.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorizeRoles, authorize } from '../../middlewares/authorize.js';

const router = Router();

// All routes require authentication and Tourism Admin role
router.use(authenticate);
router.use(authorizeRoles('Tourism Admin'));

/**
 * @route   GET /api/v1/tourism-staff
 * @desc    List all tourism staff with user role info
 * @access  Private/Admin
 */
router.get(
  '/',
  asyncHandler(tourismStaffController.listTourismStaff)
);

/**
 * @route   GET /api/v1/tourism-staff/:id
 * @desc    Get tourism staff by ID
 * @access  Private/Admin
 */
router.get(
  '/:id',
  asyncHandler(tourismStaffController.getTourismStaffById)
);

/**
 * @route   POST /api/v1/tourism-staff
 * @desc    Create tourism staff (user + profile in transaction)
 * @access  Private/Admin
 */
router.post(
  '/',
  asyncHandler(tourismStaffController.createTourismStaff)
);

/**
 * @route   PUT /api/v1/tourism-staff/:id
 * @desc    Update tourism staff
 * @access  Private/Admin
 */
router.put(
  '/:id',
  asyncHandler(tourismStaffController.updateTourismStaff)
);

/**
 * @route   PATCH /api/v1/tourism-staff/:id/status
 * @desc    Change tourism staff account status
 * @access  Private/Admin
 */
router.patch(
  '/:id/status',
  asyncHandler(tourismStaffController.changeTourismStaffStatus)
);

/**
 * @route   POST /api/v1/tourism-staff/:id/reset-password
 * @desc    Reset tourism staff password
 * @access  Private/Admin
 */
router.post(
  '/:id/reset-password',
  asyncHandler(tourismStaffController.resetTourismStaffPassword)
);

export default router;
