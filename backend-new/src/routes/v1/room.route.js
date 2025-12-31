/**
 * Room Routes
 * Room management endpoints - matches old backend patterns
 */
import { Router } from 'express';
import * as roomController from '../../controllers/room.controller.js';
import { asyncHandler } from '../../middlewares/error-handler.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorizeRoles } from '../../middlewares/authorize.js';

const router = Router();

// GET all rooms
router.get('/', asyncHandler(roomController.getAllRooms));

// GET rooms by business ID - place specific routes before :id
router.get('/business/:businessId', asyncHandler(roomController.getRoomsByBusinessId));

// GET available rooms by business and date range
router.get('/available/:businessId', asyncHandler(roomController.getAvailableRooms));

// GET room by ID
router.get('/:id', asyncHandler(roomController.getRoomById));

// POST new room
router.post(
  '/',
  authenticate,
  authorizeRoles('Tourism Admin', 'Admin', 'Business Owner'),
  asyncHandler(roomController.createRoom)
);

// PUT update room
router.put(
  '/:id',
  authenticate,
  authorizeRoles('Tourism Admin', 'Admin', 'Business Owner'),
  asyncHandler(roomController.updateRoom)
);

// PATCH update room status
router.patch(
  '/:id/status',
  authenticate,
  authorizeRoles('Tourism Admin', 'Admin', 'Business Owner'),
  asyncHandler(roomController.updateRoomStatus)
);

// DELETE room
router.delete(
  '/:id',
  authenticate,
  authorizeRoles('Tourism Admin', 'Admin', 'Business Owner'),
  asyncHandler(roomController.deleteRoom)
);

export default router;
