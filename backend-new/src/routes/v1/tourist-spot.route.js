/**
 * Tourist Spot Routes
 * Tourist spot management endpoints
 */
import { Router } from 'express';
import * as touristSpotController from '../../controllers/tourist-spot.controller.js';
import { asyncHandler } from '../../middlewares/error-handler.js';
import { authenticate, optionalAuth } from '../../middlewares/authenticate.js';
import { authorizeRoles } from '../../middlewares/authorize.js';
import { validateRequest } from '../../middlewares/validate-request.js';
import { touristSpotValidation } from '../../validations/tourist-spot.validation.js';

const router = Router();

/**
 * @route   GET /api/v1/tourist-spots
 * @desc    Get all tourist spots (public)
 * @access  Public
 */
router.get(
  '/',
  optionalAuth,
  validateRequest(touristSpotValidation.getAllTouristSpots),
  asyncHandler(touristSpotController.getAllTouristSpots)
);

/**
 * @route   GET /api/v1/tourist-spots/featured
 * @desc    Get featured tourist spots
 * @access  Public
 */
router.get(
  '/featured',
  asyncHandler(touristSpotController.getFeaturedSpots)
);

/**
 * @route   GET /api/v1/tourist-spots/category/:category
 * @desc    Get tourist spots by category
 * @access  Public
 */
router.get(
  '/category/:category',
  asyncHandler(touristSpotController.getSpotsByCategory)
);

/**
 * @route   GET /api/v1/tourist-spots/:id
 * @desc    Get tourist spot by ID
 * @access  Public
 */
router.get(
  '/:id',
  asyncHandler(touristSpotController.getTouristSpot)
);

// Protected routes (Tourism Admin only)
router.use(authenticate, authorizeRoles('Tourism Admin'));

/**
 * @route   POST /api/v1/tourist-spots
 * @desc    Create a tourist spot
 * @access  Private/Tourism Admin
 */
router.post(
  '/',
  validateRequest(touristSpotValidation.createTouristSpot),
  asyncHandler(touristSpotController.createTouristSpot)
);

/**
 * @route   PATCH /api/v1/tourist-spots/:id
 * @desc    Update a tourist spot
 * @access  Private/Tourism Admin
 */
router.patch(
  '/:id',
  validateRequest(touristSpotValidation.updateTouristSpot),
  asyncHandler(touristSpotController.updateTouristSpot)
);

/**
 * @route   DELETE /api/v1/tourist-spots/:id
 * @desc    Delete a tourist spot
 * @access  Private/Tourism Admin
 */
router.delete(
  '/:id',
  asyncHandler(touristSpotController.deleteTouristSpot)
);

/**
 * @route   POST /api/v1/tourist-spots/:id/images
 * @desc    Add image to tourist spot
 * @access  Private/Tourism Admin
 */
router.post(
  '/:id/images',
  validateRequest(touristSpotValidation.addImage),
  asyncHandler(touristSpotController.addImage)
);

/**
 * @route   DELETE /api/v1/tourist-spots/:id/images/:imageId
 * @desc    Remove image from tourist spot
 * @access  Private/Tourism Admin
 */
router.delete(
  '/:id/images/:imageId',
  asyncHandler(touristSpotController.removeImage)
);

/**
 * @route   PATCH /api/v1/tourist-spots/:id/schedule
 * @desc    Update tourist spot schedule
 * @access  Private/Tourism Admin
 */
router.patch(
  '/:id/schedule',
  validateRequest(touristSpotValidation.updateSchedule),
  asyncHandler(touristSpotController.updateSchedule)
);

/**
 * @route   PATCH /api/v1/tourist-spots/:id/status
 * @desc    Update tourist spot status
 * @access  Private/Tourism Admin
 */
router.patch(
  '/:id/status',
  validateRequest(touristSpotValidation.updateStatus),
  asyncHandler(touristSpotController.updateStatus)
);

export default router;
