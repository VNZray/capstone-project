import express from "express";
import * as externalBookingController from "../controller/externalBookingController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeRole } from "../middleware/authorizeRole.js";

const router = express.Router();

router.post("/", authenticate, authorizeRole("Business Owner", "Staff", "Admin"), externalBookingController.insertExternalBooking);
router.get("/", authenticate, authorizeRole("Business Owner", "Staff", "Admin"), externalBookingController.getAllExternalBooking);

export default router;
