/**
 * Mobile Booking Routes
 * Handles ONLINE bookings for tourists via the mobile app.
 * Walk-in bookings are handled by the Business Backend (port 4000).
 */

import express from "express";
import * as bookingController from "../controller/booking/bookingController.js";
import { authenticate } from "../middleware/authenticate.js";

const router = express.Router();

// ===== PUBLIC ROUTES =====

// Get available rooms for a date range (for browsing/searching)
router.get("/available-rooms", bookingController.getAvailableRooms);

// ===== AUTHENTICATED ROUTES (Tourist) =====

// Get all bookings for the authenticated tourist
router.get("/my-bookings", authenticate, bookingController.getMyBookings);

// Get a specific booking by ID
router.get("/:id", authenticate, bookingController.getBookingById);

// Create a new online booking
router.post("/", authenticate, bookingController.createOnlineBooking);

// Cancel a booking
router.put("/:id/cancel", authenticate, bookingController.cancelBooking);

export default router;
