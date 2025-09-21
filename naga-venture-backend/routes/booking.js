import express from "express";
import * as bookingController from '../controller/bookingController.js'

const router = express.Router();

router.post("/", bookingController.insertBooking);
router.get("/:id", bookingController.getBookingById);
router.get("/", bookingController.getAllBookings);
router.get("/tourist/:tourist_id", bookingController.getBookingsByTouristId);
router.put("/:id", bookingController.updateBooking);
router.delete("/:id", bookingController.deleteBooking);

export default router;
