/**
 * Business Amenity Routes
 * Business-specific amenity assignment endpoints
 */
import { Router } from 'express';
import * as businessAmenityController from '../../controllers/business-amenity.controller.js';
import { asyncHandler } from '../../middlewares/error-handler.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorizeRoles } from '../../middlewares/authorize.js';

const router = Router();

// Public routes
router.get('/', asyncHandler(businessAmenityController.getAllBusinessAmenities));
router.get('/business/:businessId', asyncHandler(businessAmenityController.getBusinessAmenitiesByBusinessId));
router.get('/:id', asyncHandler(businessAmenityController.getBusinessAmenityById));

// Protected routes
router.post(
  '/',
  authenticate,
  authorizeRoles('Tourism Admin', 'Admin', 'Business Owner'),
  asyncHandler(businessAmenityController.addBusinessAmenity)
);

router.post(
  '/bulk',
  authenticate,
  authorizeRoles('Tourism Admin', 'Admin', 'Business Owner'),
  asyncHandler(businessAmenityController.addBulkBusinessAmenities)
);

router.delete(
  '/:id',
  authenticate,
  authorizeRoles('Tourism Admin', 'Admin', 'Business Owner'),
  asyncHandler(businessAmenityController.removeBusinessAmenity)
);

router.delete(
  '/business/:business_id/amenity/:amenity_id',
  authenticate,
  authorizeRoles('Tourism Admin', 'Admin', 'Business Owner'),
  asyncHandler(businessAmenityController.removeBusinessAmenityByIds)
);

export default router;
