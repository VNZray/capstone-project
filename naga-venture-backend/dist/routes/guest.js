import express from "express";
import * as guestController from '../controller/guestController.js'

const router = express.Router();

router.post("/", guestController.insertGuest);
router.get("/:id", guestController.getGuestById);
router.get("/", guestController.getAllGuests);
router.get("/booking/:booking_id", guestController.getGuestsByBookingId);
router.put("/:id", guestController.updateGuest);
router.delete("/:id", guestController.deleteGuest);

export default router;
