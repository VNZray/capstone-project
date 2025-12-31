/**
 * Promotion Routes
 * Promotion management endpoints
 */
import { Router } from 'express';
import * as promotionController from '../../controllers/promotion.controller.js';
import { asyncHandler } from '../../middlewares/error-handler.js';
import { authenticate, optionalAuth } from '../../middlewares/authenticate.js';
import { authorizeRoles } from '../../middlewares/authorize.js';
import { validateRequest } from '../../middlewares/validate-request.js';
import { promotionValidation } from '../../validations/promotion.validation.js';

const router = Router();

/**
 * @route   GET /api/v1/promotions/featured
 * @desc    Get featured promotions (public)
 * @access  Public
 */
router.get(
  '/featured',
  asyncHandler(promotionController.getFeaturedPromotions)
);

/**
 * @route   GET /api/v1/promotions/business/:businessId/active
 * @desc    Get active promotions for a business (public)
 * @access  Public
 */
router.get(
  '/business/:businessId/active',
  optionalAuth,
  asyncHandler(promotionController.getActivePromotions)
);

/**
 * @route   GET /api/v1/promotions/:id
 * @desc    Get promotion by ID
 * @access  Public
 */
router.get(
  '/:id',
  asyncHandler(promotionController.getPromotion)
);

// Protected routes
router.use(authenticate);

/**
 * @route   GET /api/v1/promotions/business/:businessId
 * @desc    Get all promotions for a business
 * @access  Private/Business Staff
 */
router.get(
  '/business/:businessId',
  authorizeRoles('Business Owner', 'Manager'),
  validateRequest(promotionValidation.getBusinessPromotions),
  asyncHandler(promotionController.getBusinessPromotions)
);

/**
 * @route   POST /api/v1/promotions
 * @desc    Create a promotion
 * @access  Private/Business Staff
 */
router.post(
  '/',
  authorizeRoles('Business Owner', 'Manager'),
  validateRequest(promotionValidation.createPromotion),
  asyncHandler(promotionController.createPromotion)
);

/**
 * @route   PATCH /api/v1/promotions/:id
 * @desc    Update a promotion
 * @access  Private/Business Staff
 */
router.patch(
  '/:id',
  authorizeRoles('Business Owner', 'Manager'),
  validateRequest(promotionValidation.updatePromotion),
  asyncHandler(promotionController.updatePromotion)
);

/**
 * @route   PATCH /api/v1/promotions/:id/toggle
 * @desc    Toggle promotion status
 * @access  Private/Business Staff
 */
router.patch(
  '/:id/toggle',
  authorizeRoles('Business Owner', 'Manager'),
  asyncHandler(promotionController.togglePromotionStatus)
);

/**
 * @route   DELETE /api/v1/promotions/:id
 * @desc    Delete a promotion
 * @access  Private/Business Staff
 */
router.delete(
  '/:id',
  authorizeRoles('Business Owner', 'Manager'),
  asyncHandler(promotionController.deletePromotion)
);

export default router;
