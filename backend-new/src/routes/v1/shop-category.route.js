/**
 * Shop Category Routes
 * Shop category management endpoints
 */
import { Router } from 'express';
import * as shopCategoryController from '../../controllers/shop-category.controller.js';
import { asyncHandler } from '../../middlewares/error-handler.js';
import { authenticate, optionalAuth } from '../../middlewares/authenticate.js';
import { authorizeRoles } from '../../middlewares/authorize.js';
import { validateRequest } from '../../middlewares/validate-request.js';
import { shopCategoryValidation } from '../../validations/shop-category.validation.js';

const router = Router();

/**
 * @route   GET /api/v1/shop-categories/business/:businessId
 * @desc    Get categories for a business (public)
 * @access  Public
 */
router.get(
  '/business/:businessId',
  optionalAuth,
  asyncHandler(shopCategoryController.getBusinessCategories)
);

/**
 * @route   GET /api/v1/shop-categories/business/:businessId/with-counts
 * @desc    Get categories with product counts
 * @access  Public
 */
router.get(
  '/business/:businessId/with-counts',
  optionalAuth,
  asyncHandler(shopCategoryController.getCategoriesWithCounts)
);

/**
 * @route   GET /api/v1/shop-categories/:id
 * @desc    Get category by ID
 * @access  Public
 */
router.get(
  '/:id',
  asyncHandler(shopCategoryController.getCategory)
);

// Protected routes
router.use(authenticate);

/**
 * @route   POST /api/v1/shop-categories
 * @desc    Create a category
 * @access  Private/Business Staff
 */
router.post(
  '/',
  authorizeRoles('Business Owner', 'Manager'),
  validateRequest(shopCategoryValidation.createCategory),
  asyncHandler(shopCategoryController.createCategory)
);

/**
 * @route   PATCH /api/v1/shop-categories/:id
 * @desc    Update a category
 * @access  Private/Business Staff
 */
router.patch(
  '/:id',
  authorizeRoles('Business Owner', 'Manager'),
  validateRequest(shopCategoryValidation.updateCategory),
  asyncHandler(shopCategoryController.updateCategory)
);

/**
 * @route   DELETE /api/v1/shop-categories/:id
 * @desc    Delete a category
 * @access  Private/Business Staff
 */
router.delete(
  '/:id',
  authorizeRoles('Business Owner', 'Manager'),
  asyncHandler(shopCategoryController.deleteCategory)
);

/**
 * @route   POST /api/v1/shop-categories/business/:businessId/reorder
 * @desc    Reorder categories
 * @access  Private/Business Staff
 */
router.post(
  '/business/:businessId/reorder',
  authorizeRoles('Business Owner', 'Manager'),
  validateRequest(shopCategoryValidation.reorderCategories),
  asyncHandler(shopCategoryController.reorderCategories)
);

export default router;
