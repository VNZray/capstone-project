/**
 * Seasonal Pricing Routes
 * Seasonal pricing configuration endpoints
 */
import { Router } from 'express';
import * as seasonalPricingController from '../../controllers/seasonal-pricing.controller.js';
import { asyncHandler } from '../../middlewares/error-handler.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorizeRoles } from '../../middlewares/authorize.js';

const router = Router();

// Public routes
router.get('/', asyncHandler(seasonalPricingController.getAllSeasonalPricing));
router.get('/:id', asyncHandler(seasonalPricingController.getSeasonalPricingById));
router.get('/business/:businessId', asyncHandler(seasonalPricingController.getSeasonalPricingByBusinessId));
router.get('/room/:roomId', asyncHandler(seasonalPricingController.getSeasonalPricingByRoomId));
router.get('/room/:roomId/calculate', asyncHandler(seasonalPricingController.calculatePriceForDate));
router.get('/room/:roomId/calculate-range', asyncHandler(seasonalPricingController.calculatePriceForRange));

// Protected routes
router.post(
  '/',
  authenticate,
  authorizeRoles('Tourism Admin', 'Admin', 'Business Owner'),
  asyncHandler(seasonalPricingController.createSeasonalPricing)
);

router.put(
  '/:id',
  authenticate,
  authorizeRoles('Tourism Admin', 'Admin', 'Business Owner'),
  asyncHandler(seasonalPricingController.updateSeasonalPricing)
);

router.delete(
  '/:id',
  authenticate,
  authorizeRoles('Tourism Admin', 'Admin', 'Business Owner'),
  asyncHandler(seasonalPricingController.deleteSeasonalPricing)
);

export default router;
