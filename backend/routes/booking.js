import express from "express";
import * as bookingController from '../controller/accommodation/bookingController.js'
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRole } from '../middleware/authorizeRole.js';

const router = express.Router();

// All booking routes require authentication
router.post("/", bookingController.insertBooking);
router.get("/:id", authenticate, authorizeRole("Tourist", "Admin", "Business Owner", "Staff"), bookingController.getBookingById);
router.get("/", authenticate, authorizeRole("Admin", "Business Owner", "Staff", "Tourist"), bookingController.getAllBookings);
router.get("/tourist/:tourist_id", authenticate, authorizeRole("Tourist", "Admin", "Business Owner", "Staff"), bookingController.getBookingsByTouristId);
router.get("/room/:room_id", authenticate, authorizeRole("Tourist", "Admin", "Business Owner", "Staff"), bookingController.getBookingsByRoomId);
router.put("/:id", authenticate, authorizeRole("Tourist", "Admin", "Business Owner", "Staff"), bookingController.updateBooking);
router.delete("/:id", authenticate, authorizeRole("Admin", "Business Owner"), bookingController.deleteBooking);
router.get("/business/:business_id", bookingController.getBookingsByBusinessId);

// NOTE: Payment routes have been moved to the unified payment workflow
// Use POST /api/payments/initiate with { payment_for: 'booking', reference_id: bookingId }
// Use POST /api/payments/verify for verification

export default router;
