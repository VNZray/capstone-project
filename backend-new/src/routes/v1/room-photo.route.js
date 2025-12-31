/**
 * Room Photo Routes
 * Room photo management endpoints
 */
import { Router } from 'express';
import * as roomPhotoController from '../../controllers/room-photo.controller.js';
import { asyncHandler } from '../../middlewares/error-handler.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorizeRoles } from '../../middlewares/authorize.js';

const router = Router();

// Public routes
router.get('/room/:roomId', asyncHandler(roomPhotoController.getRoomPhotos));
router.get('/:id', asyncHandler(roomPhotoController.getRoomPhotoById));

// Protected routes
router.post(
  '/',
  authenticate,
  authorizeRoles('Tourism Admin', 'Admin', 'Business Owner'),
  asyncHandler(roomPhotoController.addRoomPhoto)
);

router.post(
  '/bulk',
  authenticate,
  authorizeRoles('Tourism Admin', 'Admin', 'Business Owner'),
  asyncHandler(roomPhotoController.addBulkRoomPhotos)
);

router.put(
  '/:id',
  authenticate,
  authorizeRoles('Tourism Admin', 'Admin', 'Business Owner'),
  asyncHandler(roomPhotoController.updateRoomPhoto)
);

router.patch(
  '/:id/primary',
  authenticate,
  authorizeRoles('Tourism Admin', 'Admin', 'Business Owner'),
  asyncHandler(roomPhotoController.setRoomPhotoPrimary)
);

router.delete(
  '/:id',
  authenticate,
  authorizeRoles('Tourism Admin', 'Admin', 'Business Owner'),
  asyncHandler(roomPhotoController.deleteRoomPhoto)
);

router.delete(
  '/room/:roomId',
  authenticate,
  authorizeRoles('Tourism Admin', 'Admin', 'Business Owner'),
  asyncHandler(roomPhotoController.deleteAllRoomPhotos)
);

export default router;
