/**
 * Category Routes
 * Category and entity category management endpoints
 */
import { Router } from 'express';
import * as categoryController from '../../controllers/category.controller.js';
import { asyncHandler } from '../../middlewares/error-handler.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorizeRoles } from '../../middlewares/authorize.js';

const router = Router();

// ==================== LEGACY ENDPOINTS (deprecated) ====================
router.get('/types', asyncHandler(categoryController.getAllTypes));
router.get('/types/accommodation-shop', asyncHandler(categoryController.getAccommodationAndShopTypes));
router.get('/types/:id', asyncHandler(categoryController.getTypeById));
router.get('/legacy/:id', asyncHandler(categoryController.getLegacyCategory));
router.get('/legacy/category/:id', asyncHandler(categoryController.getLegacyCategoryById));

// ==================== CATEGORY ENDPOINTS ====================
// Public routes
router.get('/', asyncHandler(categoryController.getAllCategories));
router.get('/tree', asyncHandler(categoryController.getCategoryTree));
router.get('/:id', asyncHandler(categoryController.getCategoryById));
router.get('/:id/children', asyncHandler(categoryController.getCategoryChildren));

// Protected routes (admin only)
router.post(
  '/',
  authenticate,
  authorizeRoles('Tourism Admin', 'Admin'),
  asyncHandler(categoryController.createCategory)
);

router.put(
  '/:id',
  authenticate,
  authorizeRoles('Tourism Admin', 'Admin'),
  asyncHandler(categoryController.updateCategory)
);

router.delete(
  '/:id',
  authenticate,
  authorizeRoles('Tourism Admin', 'Admin'),
  asyncHandler(categoryController.deleteCategory)
);

// ==================== ENTITY CATEGORY ENDPOINTS ====================
// Get categories for an entity
router.get(
  '/entity/:entityType/:entityId',
  asyncHandler(categoryController.getEntityCategories)
);

// Get all entities in a category
router.get(
  '/:categoryId/entities',
  asyncHandler(categoryController.getEntitiesByCategory)
);

// Add category to an entity (protected)
router.post(
  '/entity/:entityType/:entityId',
  authenticate,
  asyncHandler(categoryController.addEntityCategory)
);

// Remove category from an entity (protected)
router.delete(
  '/entity/:entityType/:entityId/:categoryId',
  authenticate,
  asyncHandler(categoryController.removeEntityCategory)
);

// Set primary category for an entity (protected)
router.patch(
  '/entity/:entityType/:entityId/:categoryId/primary',
  authenticate,
  asyncHandler(categoryController.setEntityPrimaryCategory)
);

export default router;
