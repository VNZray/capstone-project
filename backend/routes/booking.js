import express from "express";
import * as bookingController from '../controller/accommodation/bookingController.js'

const router = express.Router();

router.post("/", bookingController.insertBooking);
router.get("/:id", bookingController.getBookingById);
router.get("/", bookingController.getAllBookings);
router.get("/tourist/:tourist_id", bookingController.getBookingsByTouristId);
router.get("/room/:room_id", bookingController.getBookingsByRoomId);
router.put("/:id", bookingController.updateBooking);
router.delete("/:id", bookingController.deleteBooking);

export default router;
