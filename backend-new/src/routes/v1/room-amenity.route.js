/**
 * Room Amenity Routes
 * Room-specific amenity assignment endpoints
 */
import { Router } from 'express';
import * as roomAmenityController from '../../controllers/room-amenity.controller.js';
import { asyncHandler } from '../../middlewares/error-handler.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorizeRoles } from '../../middlewares/authorize.js';

const router = Router();

// Public routes
router.get('/', asyncHandler(roomAmenityController.getAllRoomAmenities));
router.get('/room/:roomId', asyncHandler(roomAmenityController.getRoomAmenitiesByRoomId));
router.get('/:id', asyncHandler(roomAmenityController.getRoomAmenityById));

// Protected routes
router.post(
  '/',
  authenticate,
  authorizeRoles('Tourism Admin', 'Admin', 'Business Owner'),
  asyncHandler(roomAmenityController.addRoomAmenity)
);

router.post(
  '/bulk',
  authenticate,
  authorizeRoles('Tourism Admin', 'Admin', 'Business Owner'),
  asyncHandler(roomAmenityController.addBulkRoomAmenities)
);

router.delete(
  '/:id',
  authenticate,
  authorizeRoles('Tourism Admin', 'Admin', 'Business Owner'),
  asyncHandler(roomAmenityController.removeRoomAmenity)
);

router.delete(
  '/room/:room_id/amenity/:amenity_id',
  authenticate,
  authorizeRoles('Tourism Admin', 'Admin', 'Business Owner'),
  asyncHandler(roomAmenityController.removeRoomAmenityByIds)
);

export default router;
