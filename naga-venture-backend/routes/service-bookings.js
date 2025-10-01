import express from "express";
import * as serviceBookingController from "../controller/serviceBookingController.js";

const router = express.Router();

// ==================== SERVICE BOOKING ROUTES ====================

// Service Bookings
router.get("/", serviceBookingController.getAllServiceBookings);
router.post("/", serviceBookingController.insertServiceBooking);
router.get("/business/:businessId", serviceBookingController.getServiceBookingsByBusinessId);
router.get("/business/:businessId/upcoming", serviceBookingController.getUpcomingServiceBookings);
router.get("/business/:businessId/stats", serviceBookingController.getServiceBookingStatsByBusiness);
router.get("/user/:userId", serviceBookingController.getServiceBookingsByUserId);
router.get("/:id", serviceBookingController.getServiceBookingById);
router.put("/:id/status", serviceBookingController.updateServiceBookingStatus);
router.put("/:id/payment", serviceBookingController.updateServiceBookingPaymentStatus);
router.put("/:id/cancel", serviceBookingController.cancelServiceBooking);
router.put("/:id/arrived", serviceBookingController.markCustomerArrived);

export default router;
