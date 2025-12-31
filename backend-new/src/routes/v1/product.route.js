/**
 * Product Routes
 * Product management endpoints
 */
import { Router } from 'express';
import * as productController from '../../controllers/product.controller.js';
import { asyncHandler } from '../../middlewares/error-handler.js';
import { authenticate, optionalAuth } from '../../middlewares/authenticate.js';
import { authorizeRoles } from '../../middlewares/authorize.js';
import { validateRequest } from '../../middlewares/validate-request.js';
import { productValidation } from '../../validations/product.validation.js';

const router = Router();

/**
 * @route   GET /api/v1/products/business/:businessId
 * @desc    Get products for a business (public)
 * @access  Public
 */
router.get(
  '/business/:businessId',
  optionalAuth,
  validateRequest(productValidation.getBusinessProducts),
  asyncHandler(productController.getBusinessProducts)
);

/**
 * @route   GET /api/v1/products/business/:businessId/best-sellers
 * @desc    Get best selling products
 * @access  Public
 */
router.get(
  '/business/:businessId/best-sellers',
  asyncHandler(productController.getBestSellers)
);

/**
 * @route   GET /api/v1/products/:id
 * @desc    Get product by ID
 * @access  Public
 */
router.get(
  '/:id',
  asyncHandler(productController.getProduct)
);

/**
 * @route   GET /api/v1/products/:id/availability
 * @desc    Check product availability
 * @access  Public
 */
router.get(
  '/:id/availability',
  validateRequest(productValidation.checkAvailability),
  asyncHandler(productController.checkAvailability)
);

// Protected routes
router.use(authenticate);

/**
 * @route   GET /api/v1/products/low-stock
 * @desc    Get low stock products
 * @access  Private/Business Staff
 */
router.get(
  '/low-stock',
  authorizeRoles('Business Owner', 'Manager', 'Sales Associate'),
  asyncHandler(productController.getLowStockProducts)
);

/**
 * @route   POST /api/v1/products
 * @desc    Create a product
 * @access  Private/Business Staff
 */
router.post(
  '/',
  authorizeRoles('Business Owner', 'Manager', 'Sales Associate'),
  validateRequest(productValidation.createProduct),
  asyncHandler(productController.createProduct)
);

/**
 * @route   PATCH /api/v1/products/:id
 * @desc    Update a product
 * @access  Private/Business Staff
 */
router.patch(
  '/:id',
  authorizeRoles('Business Owner', 'Manager', 'Sales Associate'),
  validateRequest(productValidation.updateProduct),
  asyncHandler(productController.updateProduct)
);

/**
 * @route   DELETE /api/v1/products/:id
 * @desc    Delete a product
 * @access  Private/Business Staff
 */
router.delete(
  '/:id',
  authorizeRoles('Business Owner', 'Manager'),
  asyncHandler(productController.deleteProduct)
);

/**
 * @route   PATCH /api/v1/products/:id/stock
 * @desc    Update product stock
 * @access  Private/Business Staff
 */
router.patch(
  '/:id/stock',
  authorizeRoles('Business Owner', 'Manager', 'Sales Associate'),
  validateRequest(productValidation.updateStock),
  asyncHandler(productController.updateStock)
);

export default router;
