import express from "express";
import * as bookingController from '../controller/accommodation/bookingController.js'
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRole } from '../middleware/authorizeRole.js';

const router = express.Router();

// Business staff roles for walk-in and front desk operations
const businessRoles = ["Admin", "Business Owner", "Manager", "Room Manager", "Receptionist"];

// Guest search endpoint for walk-in bookings (must be before /:id route)
router.get("/search/guests", authenticate, authorizeRole(...businessRoles), bookingController.searchGuests);

// Today's arrivals for a business
router.get("/business/:business_id/arrivals", authenticate, authorizeRole(...businessRoles), bookingController.getTodaysArrivals);

// Today's departures for a business
router.get("/business/:business_id/departures", authenticate, authorizeRole(...businessRoles), bookingController.getTodaysDepartures);

// Currently occupied rooms for a business
router.get("/business/:business_id/occupied", authenticate, authorizeRole(...businessRoles), bookingController.getCurrentlyOccupied);

// Walk-in booking (onsite check-in)
router.post("/walk-in", authenticate, authorizeRole(...businessRoles), bookingController.createWalkInBooking);

// Standard booking routes
router.post("/", bookingController.insertBooking);
router.get("/:id", authenticate, authorizeRole("Tourist", "Admin", "Business Owner", "Manager", "Room Manager", "Receptionist"), bookingController.getBookingById);
router.get("/", authenticate, authorizeRole("Admin", "Business Owner", "Manager", "Tourist", "Room Manager", "Receptionist"), bookingController.getAllBookings);
router.get("/tourist/:tourist_id", authenticate, authorizeRole("Tourist", "Admin", "Business Owner", "Manager", "Room Manager", "Receptionist"), bookingController.getBookingsByTouristId);
router.get("/room/:room_id", authenticate, authorizeRole("Tourist", "Admin", "Business Owner", "Manager", "Room Manager", "Receptionist"), bookingController.getBookingsByRoomId);
router.put("/:id", authenticate, authorizeRole("Tourist", "Admin", "Business Owner", "Manager", "Room Manager", "Receptionist"), bookingController.updateBooking);
router.delete("/:id", authenticate, authorizeRole("Admin", "Business Owner"), bookingController.deleteBooking);
router.get("/business/:business_id", bookingController.getBookingsByBusinessId);
router.get("/business/:business_id/available-rooms", bookingController.getAvailableRoomsByDateRange);

// NOTE: Payment routes have been moved to the unified payment workflow
// Use POST /api/payments/initiate with { payment_for: 'booking', reference_id: bookingId }
// Use POST /api/payments/verify for verification

export default router;
