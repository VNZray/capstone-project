/**
 * External Booking Routes
 * External booking integration endpoints
 */
import { Router } from 'express';
import * as externalBookingController from '../../controllers/external-booking.controller.js';
import { asyncHandler } from '../../middlewares/error-handler.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorizeRoles } from '../../middlewares/authorize.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Routes
router.get(
  '/',
  authorizeRoles('Tourism Admin', 'Admin', 'Business Owner'),
  asyncHandler(externalBookingController.getAllExternalBookings)
);

router.get(
  '/:id',
  authorizeRoles('Tourism Admin', 'Admin', 'Business Owner'),
  asyncHandler(externalBookingController.getExternalBookingById)
);

router.get(
  '/business/:businessId',
  authorizeRoles('Tourism Admin', 'Admin', 'Business Owner'),
  asyncHandler(externalBookingController.getExternalBookingsByBusinessId)
);

router.get(
  '/room/:roomId',
  authorizeRoles('Tourism Admin', 'Admin', 'Business Owner'),
  asyncHandler(externalBookingController.getExternalBookingsByRoomId)
);

router.post(
  '/',
  authorizeRoles('Tourism Admin', 'Admin', 'Business Owner'),
  asyncHandler(externalBookingController.createExternalBooking)
);

router.put(
  '/:id',
  authorizeRoles('Tourism Admin', 'Admin', 'Business Owner'),
  asyncHandler(externalBookingController.updateExternalBooking)
);

router.patch(
  '/:id/status',
  authorizeRoles('Tourism Admin', 'Admin', 'Business Owner'),
  asyncHandler(externalBookingController.updateExternalBookingStatus)
);

router.delete(
  '/:id',
  authorizeRoles('Tourism Admin', 'Admin', 'Business Owner'),
  asyncHandler(externalBookingController.deleteExternalBooking)
);

export default router;
