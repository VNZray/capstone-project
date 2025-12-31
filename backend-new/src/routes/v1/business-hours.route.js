/**
 * Business Hours Routes
 * Business operating hours management endpoints
 */
import { Router } from 'express';
import * as businessHoursController from '../../controllers/business-hours.controller.js';
import { asyncHandler } from '../../middlewares/error-handler.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorizeRoles } from '../../middlewares/authorize.js';

const router = Router();

// Public routes
router.get('/business/:businessId', asyncHandler(businessHoursController.getBusinessHours));
router.get('/:id', asyncHandler(businessHoursController.getBusinessHoursById));

// Protected routes
router.post(
  '/',
  authenticate,
  authorizeRoles('Tourism Admin', 'Admin', 'Business Owner'),
  asyncHandler(businessHoursController.upsertBusinessHours)
);

router.put(
  '/:id',
  authenticate,
  authorizeRoles('Tourism Admin', 'Admin', 'Business Owner'),
  asyncHandler(businessHoursController.updateBusinessHours)
);

router.delete(
  '/:id',
  authenticate,
  authorizeRoles('Tourism Admin', 'Admin', 'Business Owner'),
  asyncHandler(businessHoursController.deleteBusinessHours)
);

router.delete(
  '/business/:businessId',
  authenticate,
  authorizeRoles('Tourism Admin', 'Admin', 'Business Owner'),
  asyncHandler(businessHoursController.deleteAllBusinessHours)
);

export default router;
