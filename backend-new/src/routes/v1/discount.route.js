/**
 * Discount Routes
 * Discount management endpoints
 */
import { Router } from 'express';
import * as discountController from '../../controllers/discount.controller.js';
import { asyncHandler } from '../../middlewares/error-handler.js';
import { authenticate, optionalAuth } from '../../middlewares/authenticate.js';
import { authorizeRoles } from '../../middlewares/authorize.js';
import { validateRequest } from '../../middlewares/validate-request.js';
import { discountValidation } from '../../validations/discount.validation.js';

const router = Router();

/**
 * @route   GET /api/v1/discounts/business/:businessId/active
 * @desc    Get active discounts for a business (public)
 * @access  Public
 */
router.get(
  '/business/:businessId/active',
  optionalAuth,
  asyncHandler(discountController.getActiveDiscounts)
);

/**
 * @route   POST /api/v1/discounts/validate
 * @desc    Validate a discount code
 * @access  Public
 */
router.post(
  '/validate',
  optionalAuth,
  validateRequest(discountValidation.validateDiscount),
  asyncHandler(discountController.validateDiscount)
);

/**
 * @route   POST /api/v1/discounts/apply
 * @desc    Apply a discount to an order
 * @access  Public
 */
router.post(
  '/apply',
  optionalAuth,
  validateRequest(discountValidation.applyDiscount),
  asyncHandler(discountController.applyDiscount)
);

// Protected routes
router.use(authenticate);

/**
 * @route   GET /api/v1/discounts/business/:businessId
 * @desc    Get all discounts for a business
 * @access  Private/Business Staff
 */
router.get(
  '/business/:businessId',
  authorizeRoles('Business Owner', 'Manager'),
  validateRequest(discountValidation.getBusinessDiscounts),
  asyncHandler(discountController.getBusinessDiscounts)
);

/**
 * @route   GET /api/v1/discounts/:id
 * @desc    Get discount by ID
 * @access  Private/Business Staff
 */
router.get(
  '/:id',
  authorizeRoles('Business Owner', 'Manager'),
  asyncHandler(discountController.getDiscount)
);

/**
 * @route   POST /api/v1/discounts
 * @desc    Create a discount
 * @access  Private/Business Staff
 */
router.post(
  '/',
  authorizeRoles('Business Owner', 'Manager'),
  validateRequest(discountValidation.createDiscount),
  asyncHandler(discountController.createDiscount)
);

/**
 * @route   PATCH /api/v1/discounts/:id
 * @desc    Update a discount
 * @access  Private/Business Staff
 */
router.patch(
  '/:id',
  authorizeRoles('Business Owner', 'Manager'),
  validateRequest(discountValidation.updateDiscount),
  asyncHandler(discountController.updateDiscount)
);

/**
 * @route   PATCH /api/v1/discounts/:id/toggle
 * @desc    Toggle discount status
 * @access  Private/Business Staff
 */
router.patch(
  '/:id/toggle',
  authorizeRoles('Business Owner', 'Manager'),
  asyncHandler(discountController.toggleDiscountStatus)
);

/**
 * @route   DELETE /api/v1/discounts/:id
 * @desc    Delete a discount
 * @access  Private/Business Staff
 */
router.delete(
  '/:id',
  authorizeRoles('Business Owner', 'Manager'),
  asyncHandler(discountController.deleteDiscount)
);

export default router;
