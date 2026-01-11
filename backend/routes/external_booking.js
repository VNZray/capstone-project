import express from "express";
import * as externalBookingController from "../controller/accommodation/externalBookingController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorizeRole.js";

const router = express.Router();

// External bookings require manage_bookings permission
router.post("/", authenticate, authorize('manage_bookings'), externalBookingController.insertExternalBooking);
router.get("/", authenticate, authorize('manage_bookings'), externalBookingController.getAllExternalBooking);

export default router;
