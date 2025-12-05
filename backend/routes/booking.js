import express from "express";
import * as bookingController from '../controller/accommodation/bookingController.js'
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRole } from '../middleware/authorizeRole.js';

const router = express.Router();

// All booking routes require authentication
router.post("/", bookingController.insertBooking);
router.get("/:id", authenticate, authorizeRole("Tourist", "Admin", "Business Owner", "Manager", "Room Manager", "Receptionist"), bookingController.getBookingById);
router.get("/", authenticate, authorizeRole("Admin", "Business Owner", "Manager", "Tourist", "Room Manager", "Receptionist"), bookingController.getAllBookings);
router.get("/tourist/:tourist_id", authenticate, authorizeRole("Tourist", "Admin", "Business Owner", "Manager", "Room Manager", "Receptionist"), bookingController.getBookingsByTouristId);
router.get("/room/:room_id", authenticate, authorizeRole("Tourist", "Admin", "Business Owner", "Manager", "Room Manager", "Receptionist"), bookingController.getBookingsByRoomId);
router.put("/:id", authenticate, authorizeRole("Tourist", "Admin", "Business Owner", "Manager", "Room Manager", "Receptionist"), bookingController.updateBooking);
router.delete("/:id", authenticate, authorizeRole("Admin", "Business Owner"), bookingController.deleteBooking);
router.get("/business/:business_id", bookingController.getBookingsByBusinessId);

// PayMongo payment initiation for bookings
// POST /api/bookings/:id/initiate-payment
router.post("/:id/initiate-payment", authenticate, bookingController.initiateBookingPayment);

// Verify payment status after PayMongo redirect
// GET /api/bookings/:id/verify-payment/:paymentId
router.get("/:id/verify-payment/:paymentId", authenticate, bookingController.verifyBookingPayment);

export default router;
