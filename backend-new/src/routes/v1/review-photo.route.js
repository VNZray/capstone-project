/**
 * Review Photo Routes
 * Review photo management endpoints
 */
import { Router } from 'express';
import * as reviewPhotoController from '../../controllers/review-photo.controller.js';
import { asyncHandler } from '../../middlewares/error-handler.js';
import { authenticate } from '../../middlewares/authenticate.js';

const router = Router();

// Public routes
router.get('/review/:reviewId', asyncHandler(reviewPhotoController.getReviewPhotos));
router.get('/:id', asyncHandler(reviewPhotoController.getReviewPhotoById));

// Protected routes
router.post(
  '/',
  authenticate,
  asyncHandler(reviewPhotoController.addReviewPhoto)
);

router.post(
  '/bulk',
  authenticate,
  asyncHandler(reviewPhotoController.addBulkReviewPhotos)
);

router.put(
  '/:id',
  authenticate,
  asyncHandler(reviewPhotoController.updateReviewPhoto)
);

router.delete(
  '/:id',
  authenticate,
  asyncHandler(reviewPhotoController.deleteReviewPhoto)
);

router.delete(
  '/review/:reviewId',
  authenticate,
  asyncHandler(reviewPhotoController.deleteAllReviewPhotos)
);

export default router;
