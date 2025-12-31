/**
 * Review Routes
 * Review management endpoints
 */
import { Router } from 'express';
import * as reviewController from '../../controllers/review.controller.js';
import { asyncHandler } from '../../middlewares/error-handler.js';
import { authenticate, optionalAuth } from '../../middlewares/authenticate.js';
import { authorizeRoles } from '../../middlewares/authorize.js';
import { validateRequest } from '../../middlewares/validate-request.js';
import { reviewValidation } from '../../validations/review.validation.js';

const router = Router();

/**
 * @route   GET /api/v1/reviews/business/:businessId
 * @desc    Get reviews for a business (public)
 * @access  Public
 */
router.get(
  '/business/:businessId',
  optionalAuth,
  validateRequest(reviewValidation.getBusinessReviews),
  asyncHandler(reviewController.getBusinessReviews)
);

/**
 * @route   GET /api/v1/reviews/business/:businessId/rating
 * @desc    Get business rating summary
 * @access  Public
 */
router.get(
  '/business/:businessId/rating',
  asyncHandler(reviewController.getBusinessRating)
);

/**
 * @route   GET /api/v1/reviews/:id
 * @desc    Get review by ID
 * @access  Public
 */
router.get(
  '/:id',
  asyncHandler(reviewController.getReview)
);

// Protected routes
router.use(authenticate);

/**
 * @route   GET /api/v1/reviews/my-reviews
 * @desc    Get current user's reviews
 * @access  Private/Tourist
 */
router.get(
  '/my-reviews',
  authorizeRoles('Tourist'),
  asyncHandler(reviewController.getMyReviews)
);

/**
 * @route   POST /api/v1/reviews
 * @desc    Create a review
 * @access  Private/Tourist
 */
router.post(
  '/',
  authorizeRoles('Tourist'),
  validateRequest(reviewValidation.createReview),
  asyncHandler(reviewController.createReview)
);

/**
 * @route   PATCH /api/v1/reviews/:id
 * @desc    Update a review
 * @access  Private/Tourist
 */
router.patch(
  '/:id',
  authorizeRoles('Tourist'),
  validateRequest(reviewValidation.updateReview),
  asyncHandler(reviewController.updateReview)
);

/**
 * @route   DELETE /api/v1/reviews/:id
 * @desc    Delete a review
 * @access  Private/Tourist, Admin
 */
router.delete(
  '/:id',
  authorizeRoles('Tourist', 'Tourism Admin'),
  asyncHandler(reviewController.deleteReview)
);

/**
 * @route   POST /api/v1/reviews/:id/reply
 * @desc    Add reply to a review
 * @access  Private/Business Owner
 */
router.post(
  '/:id/reply',
  authorizeRoles('Business Owner', 'Manager'),
  validateRequest(reviewValidation.addReply),
  asyncHandler(reviewController.addReply)
);

/**
 * @route   POST /api/v1/reviews/:id/photos
 * @desc    Add photo to a review
 * @access  Private/Tourist
 */
router.post(
  '/:id/photos',
  authorizeRoles('Tourist'),
  validateRequest(reviewValidation.addPhoto),
  asyncHandler(reviewController.addPhoto)
);

export default router;
