/**
 * Tourism Routes
 * Tourism staff profile management endpoints
 */
import { Router } from 'express';
import * as tourismController from '../../controllers/tourism.controller.js';
import { asyncHandler } from '../../middlewares/error-handler.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorizeRoles } from '../../middlewares/authorize.js';

const router = Router();

/**
 * @route   GET /api/v1/tourism
 * @desc    Get all tourism staff
 * @access  Public
 */
router.get(
  '/',
  asyncHandler(tourismController.getAllTourism)
);

/**
 * @route   GET /api/v1/tourism/user/:user_id
 * @desc    Get tourism by user ID
 * @access  Public
 */
router.get(
  '/user/:user_id',
  asyncHandler(tourismController.getTourismByUserId)
);

/**
 * @route   GET /api/v1/tourism/:id
 * @desc    Get tourism by ID
 * @access  Public
 */
router.get(
  '/:id',
  asyncHandler(tourismController.getTourismById)
);

// Protected routes
router.use(authenticate);

/**
 * @route   POST /api/v1/tourism
 * @desc    Create tourism staff
 * @access  Private/Admin
 */
router.post(
  '/',
  authorizeRoles('Tourism Admin', 'Admin'),
  asyncHandler(tourismController.createTourism)
);

/**
 * @route   PUT /api/v1/tourism/:id
 * @desc    Update tourism staff
 * @access  Private/Admin
 */
router.put(
  '/:id',
  authorizeRoles('Tourism Admin', 'Admin'),
  asyncHandler(tourismController.updateTourism)
);

/**
 * @route   DELETE /api/v1/tourism/:id
 * @desc    Delete tourism staff
 * @access  Private/Admin
 */
router.delete(
  '/:id',
  authorizeRoles('Tourism Admin', 'Admin'),
  asyncHandler(tourismController.deleteTourism)
);

export default router;
