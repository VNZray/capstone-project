/**
 * Room Blocked Dates Routes
 * Room availability blocking endpoints
 */
import { Router } from 'express';
import * as roomBlockedDatesController from '../../controllers/room-blocked-dates.controller.js';
import { asyncHandler } from '../../middlewares/error-handler.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorizeRoles } from '../../middlewares/authorize.js';

const router = Router();

// Public routes
router.get('/', asyncHandler(roomBlockedDatesController.getAllBlockedDates));
router.get('/:id', asyncHandler(roomBlockedDatesController.getBlockedDateById));
router.get('/room/:roomId', asyncHandler(roomBlockedDatesController.getBlockedDatesByRoomId));
router.get('/business/:businessId', asyncHandler(roomBlockedDatesController.getBlockedDatesByBusinessId));
router.get('/room/:roomId/range', asyncHandler(roomBlockedDatesController.getBlockedDatesInRange));
router.get('/room/:roomId/availability', asyncHandler(roomBlockedDatesController.checkRoomAvailability));

// Protected routes
router.post(
  '/',
  authenticate,
  authorizeRoles('Tourism Admin', 'Admin', 'Business Owner', 'Manager', 'Room Manager', 'Receptionist'),
  asyncHandler(roomBlockedDatesController.createBlockedDate)
);

router.put(
  '/:id',
  authenticate,
  authorizeRoles('Tourism Admin', 'Admin', 'Business Owner', 'Manager', 'Room Manager', 'Receptionist'),
  asyncHandler(roomBlockedDatesController.updateBlockedDate)
);

router.delete(
  '/:id',
  authenticate,
  authorizeRoles('Tourism Admin', 'Admin', 'Business Owner', 'Manager', 'Room Manager'),
  asyncHandler(roomBlockedDatesController.deleteBlockedDate)
);

export default router;
