import express from "express";
import * as roomBlockedDatesController from "../controller/accommodation/roomBlockedDatesController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeRole } from "../middleware/authorizeRole.js";

const router = express.Router();

// All routes require authentication and appropriate roles
const businessRoles = ["Admin", "Business Owner", "Manager", "Room Manager", "Receptionist"];

// Get all blocked dates (Admin only)
router.get(
  "/",
  authenticate,
  authorizeRole("Admin"),
  roomBlockedDatesController.getAllBlockedDates
);

// Get blocked dates by business ID
router.get(
  "/business/:business_id",
  authenticate,
  authorizeRole(...businessRoles),
  roomBlockedDatesController.getBlockedDatesByBusinessId
);

// Get blocked dates by room ID
router.get(
  "/room/:room_id",
  authenticate,
  authorizeRole(...businessRoles),
  roomBlockedDatesController.getBlockedDatesByRoomId
);

// Get blocked dates in a date range for a room
router.get(
  "/room/:room_id/range",
  authenticate,
  authorizeRole(...businessRoles),
  roomBlockedDatesController.getBlockedDatesInRange
);

// Check room availability for a date range
router.get(
  "/room/:room_id/availability",
  authenticate,
  authorizeRole(...businessRoles, "Tourist"),
  roomBlockedDatesController.checkRoomAvailability
);

// Get single blocked date by ID
router.get(
  "/:id",
  authenticate,
  authorizeRole(...businessRoles),
  roomBlockedDatesController.getBlockedDateById
);

// Create a blocked date range
router.post(
  "/",
  authenticate,
  authorizeRole("Admin", "Business Owner", "Manager", "Room Manager"),
  roomBlockedDatesController.insertBlockedDate
);

// Bulk block dates for multiple rooms
router.post(
  "/bulk",
  authenticate,
  authorizeRole("Admin", "Business Owner", "Manager", "Room Manager"),
  roomBlockedDatesController.bulkBlockDates
);

// Update a blocked date range
router.put(
  "/:id",
  authenticate,
  authorizeRole("Admin", "Business Owner", "Manager", "Room Manager"),
  roomBlockedDatesController.updateBlockedDate
);

// Delete a blocked date range
router.delete(
  "/:id",
  authenticate,
  authorizeRole("Admin", "Business Owner", "Manager", "Room Manager"),
  roomBlockedDatesController.deleteBlockedDate
);

export default router;
