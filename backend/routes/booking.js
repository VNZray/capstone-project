import express from "express";
import * as bookingController from '../controller/accommodation/bookingController.js'
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRole, authorize, authorizeAny, authorizeBusinessAccess } from '../middleware/authorizeRole.js';

const router = express.Router();

// Guest search endpoint for walk-in bookings (must be before /:id route)
// Requires manage_bookings permission (staff with front desk access)
router.get("/search/guests", authenticate, authorize('manage_bookings'), bookingController.searchGuests);

// Today's arrivals for a business (requires business access + view permission)
router.get("/business/:business_id/arrivals", authenticate, authorizeBusinessAccess('business_id'), bookingController.getTodaysArrivals);

// Today's departures for a business
router.get("/business/:business_id/departures", authenticate, authorizeBusinessAccess('business_id'), bookingController.getTodaysDepartures);

// Currently occupied rooms for a business
router.get("/business/:business_id/occupied", authenticate, authorizeBusinessAccess('business_id'), bookingController.getCurrentlyOccupied);

// Walk-in booking (onsite check-in) - requires manage_bookings permission
router.post("/walk-in", authenticate, authorize('manage_bookings'), bookingController.createWalkInBooking);

// Standard booking routes
router.post("/", bookingController.insertBooking);
// Get booking by ID (controller validates ownership/business access)
router.get("/:id", authenticate, bookingController.getBookingById);
// Get all bookings (any authenticated user - controller filters by access)
router.get("/", authenticate, bookingController.getAllBookings);
// Get tourist's bookings (controller validates tourist ownership)
router.get("/tourist/:tourist_id", authenticate, bookingController.getBookingsByTouristId);
// Get bookings by room (controller validates business access)
router.get("/room/:room_id", authenticate, bookingController.getBookingsByRoomId);
// Update booking (controller validates ownership/business access)
router.put("/:id", authenticate, bookingController.updateBooking);
// Delete booking (requires manage_bookings permission)
router.delete("/:id", authenticate, authorize('manage_bookings'), bookingController.deleteBooking);
router.get("/business/:business_id", bookingController.getBookingsByBusinessId);
router.get("/business/:business_id/available-rooms", bookingController.getAvailableRoomsByDateRange);

// NOTE: Payment routes have been moved to the unified payment workflow
// Use POST /api/payments/initiate with { payment_for: 'booking', reference_id: bookingId }
// Use POST /api/payments/verify for verification

export default router;
