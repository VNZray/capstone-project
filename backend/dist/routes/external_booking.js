import express from "express";
import * as externalBookingController from "../controller/externalBookingController.js";

const router = express.Router();

router.post("/", externalBookingController.insertExternalBooking);
router.get("/", externalBookingController.getAllExternalBooking);

export default router;
