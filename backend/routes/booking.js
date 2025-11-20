import express from "express";
import * as bookingController from '../controller/accommodation/bookingController.js'
import { authenticate } from "../middleware/authenticate.js";
import { authorizeRole } from "../middleware/authorizeRole.js";

const router = express.Router();

router.post("/", authenticate, authorizeRole(
"Admin", "Business Owner", "Staff"
), bookingController.insertBooking);
router.get("/:id", authenticate, authorizeRole(
"Admin", "Business Owner", "Staff"
), bookingController.getBookingById);
router.get("/", authenticate, authorizeRole(
"Admin", "Business Owner", "Staff"
), bookingController.getAllBookings);
router.get("/tourist/:tourist_id", authenticate, authorizeRole(
"Admin", "Business Owner", "Staff"
), bookingController.getBookingsByTouristId);
router.get("/room/:room_id", bookingController.getBookingsByRoomId);
router.put("/:id", authenticate, authorizeRole(
"Admin", "Business Owner", "Staff"
), bookingController.updateBooking);
router.delete("/:id", authenticate, authorizeRole(
"Admin", "Business Owner", "Staff"
), bookingController.deleteBooking);

export default router;
