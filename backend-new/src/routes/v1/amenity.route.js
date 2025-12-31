/**
 * Amenity Routes
 * Amenity management endpoints
 */
import { Router } from 'express';
import * as amenityController from '../../controllers/amenity.controller.js';
import { asyncHandler } from '../../middlewares/error-handler.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorizeRoles } from '../../middlewares/authorize.js';

const router = Router();

// Public routes
router.get('/', asyncHandler(amenityController.getAmenities));
router.get('/:id', asyncHandler(amenityController.getAmenityById));

// Protected routes (admin only)
router.post(
  '/',
  authenticate,
  authorizeRoles('Tourism Admin', 'Admin', 'Business Owner'),
  asyncHandler(amenityController.createAmenity)
);

router.put(
  '/:id',
  authenticate,
  authorizeRoles('Tourism Admin', 'Admin'),
  asyncHandler(amenityController.updateAmenity)
);

router.delete(
  '/:id',
  authenticate,
  authorizeRoles('Tourism Admin', 'Admin'),
  asyncHandler(amenityController.deleteAmenity)
);

export default router;
