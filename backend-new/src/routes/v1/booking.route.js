/**
 * Booking Routes
 * Room booking management - matches old backend patterns
 */
import { Router } from 'express';
import * as bookingController from '../../controllers/booking.controller.js';
import { asyncHandler } from '../../middlewares/error-handler.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorizeRoles } from '../../middlewares/authorize.js';

const router = Router();

// ============================================================
// WALK-IN BOOKING & FRONT DESK OPERATIONS
// ============================================================

// Search guests for walk-in bookings
router.get(
  '/search-guests',
  authenticate,
  authorizeRoles('Business Owner', 'Manager', 'Receptionist'),
  asyncHandler(bookingController.searchGuests)
);

// Get today's arrivals for a business
router.get(
  '/arrivals/:business_id',
  authenticate,
  authorizeRoles('Business Owner', 'Manager', 'Receptionist'),
  asyncHandler(bookingController.getTodaysArrivals)
);

// Get today's departures for a business
router.get(
  '/departures/:business_id',
  authenticate,
  authorizeRoles('Business Owner', 'Manager', 'Receptionist'),
  asyncHandler(bookingController.getTodaysDepartures)
);

// Get currently occupied rooms for a business
router.get(
  '/occupied/:business_id',
  authenticate,
  authorizeRoles('Business Owner', 'Manager', 'Receptionist'),
  asyncHandler(bookingController.getCurrentlyOccupied)
);

// Create a walk-in booking
router.post(
  '/walk-in',
  authenticate,
  authorizeRoles('Business Owner', 'Manager', 'Receptionist'),
  asyncHandler(bookingController.createWalkInBooking)
);

// ============================================================
// STANDARD BOOKING OPERATIONS
// ============================================================

// GET all bookings
router.get('/', authenticate, asyncHandler(bookingController.getAllBookings));

// GET bookings by room ID - specific routes before :id
router.get('/room/:room_id', authenticate, asyncHandler(bookingController.getBookingsByRoomId));

// GET bookings by tourist ID
router.get('/tourist/:tourist_id', authenticate, asyncHandler(bookingController.getBookingsByTouristId));

// GET bookings by business ID
router.get('/business/:business_id', authenticate, asyncHandler(bookingController.getBookingsByBusinessId));

// GET bookings by status
router.get('/status/:status', authenticate, asyncHandler(bookingController.getBookingsByStatus));

// GET available rooms by date range
router.get('/available/:business_id', asyncHandler(bookingController.getAvailableRoomsByDateRange));

// GET booking by ID
router.get('/:id', authenticate, asyncHandler(bookingController.getBookingById));

// POST new booking
router.post('/', authenticate, asyncHandler(bookingController.insertBooking));

// PUT update booking
router.put('/:id', authenticate, asyncHandler(bookingController.updateBooking));

// PATCH update booking status
router.patch(
  '/:id/status',
  authenticate,
  authorizeRoles('Business Owner', 'Manager', 'Receptionist', 'Tourism Admin'),
  asyncHandler(bookingController.updateBookingStatus)
);

// DELETE booking
router.delete(
  '/:id',
  authenticate,
  authorizeRoles('Business Owner', 'Manager', 'Tourism Admin'),
  asyncHandler(bookingController.deleteBooking)
);

export default router;
