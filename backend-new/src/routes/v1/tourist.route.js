/**
 * Tourist Routes
 * Tourist profile management endpoints
 */
import { Router } from 'express';
import * as touristController from '../../controllers/tourist.controller.js';
import { asyncHandler } from '../../middlewares/error-handler.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorizeRoles } from '../../middlewares/authorize.js';

const router = Router();

/**
 * @route   POST /api/v1/tourists
 * @desc    Create tourist (part of user signup flow)
 * @access  Public
 */
router.post(
  '/',
  asyncHandler(touristController.createTourist)
);

// Protected routes
router.use(authenticate);

/**
 * @route   GET /api/v1/tourists
 * @desc    Get all tourists
 * @access  Private/Admin
 */
router.get(
  '/',
  authorizeRoles('Tourism Admin', 'Admin'),
  asyncHandler(touristController.getAllTourists)
);

/**
 * @route   GET /api/v1/tourists/user/:user_id
 * @desc    Get tourist by user ID
 * @access  Private
 */
router.get(
  '/user/:user_id',
  asyncHandler(touristController.getTouristByUserId)
);

/**
 * @route   GET /api/v1/tourists/:id
 * @desc    Get tourist by ID
 * @access  Private
 */
router.get(
  '/:id',
  asyncHandler(touristController.getTouristById)
);

/**
 * @route   PUT /api/v1/tourists/:id
 * @desc    Update tourist
 * @access  Private
 */
router.put(
  '/:id',
  asyncHandler(touristController.updateTourist)
);

/**
 * @route   DELETE /api/v1/tourists/:id
 * @desc    Delete tourist
 * @access  Private/Admin
 */
router.delete(
  '/:id',
  authorizeRoles('Tourism Admin', 'Admin'),
  asyncHandler(touristController.deleteTourist)
);

export default router;
