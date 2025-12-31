/**
 * Product Review Routes
 * Product-specific review endpoints
 */
import { Router } from 'express';
import * as productReviewController from '../../controllers/product-review.controller.js';
import { asyncHandler } from '../../middlewares/error-handler.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorizeRoles } from '../../middlewares/authorize.js';

const router = Router();

// Public routes
router.get('/', asyncHandler(productReviewController.getAllProductReviews));
router.get('/product/:productId', asyncHandler(productReviewController.getProductReviewsByProductId));
router.get('/product/:productId/summary', asyncHandler(productReviewController.getProductRatingSummary));
router.get('/:id', asyncHandler(productReviewController.getProductReviewById));

// User routes (require auth)
router.get(
  '/user/:userId',
  authenticate,
  asyncHandler(productReviewController.getProductReviewsByUserId)
);

router.post(
  '/',
  authenticate,
  asyncHandler(productReviewController.createProductReview)
);

router.put(
  '/:id',
  authenticate,
  asyncHandler(productReviewController.updateProductReview)
);

router.delete(
  '/:id',
  authenticate,
  asyncHandler(productReviewController.deleteProductReview)
);

export default router;
