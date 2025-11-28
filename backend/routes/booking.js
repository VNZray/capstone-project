import express from "express";
import * as bookingController from '../controller/accommodation/bookingController.js'
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRole } from '../middleware/authorizeRole.js';

const router = express.Router();

// All booking routes require authentication
router.post("/", authenticate, bookingController.insertBooking);
router.get("/:id", authenticate, bookingController.getBookingById);
router.get("/", authenticate, authorizeRole("Admin", "Business Owner", "Staff"), bookingController.getAllBookings);
router.get("/tourist/:tourist_id", authenticate, bookingController.getBookingsByTouristId);
router.get("/room/:room_id", authenticate, bookingController.getBookingsByRoomId);
router.put("/:id", authenticate, bookingController.updateBooking);
router.delete("/:id", authenticate, authorizeRole("Admin", "Business Owner"), bookingController.deleteBooking);

export default router;
