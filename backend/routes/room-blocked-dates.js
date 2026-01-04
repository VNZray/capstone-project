import express from "express";
import * as roomBlockedDatesController from "../controller/accommodation/roomBlockedDatesController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeRole, authorize, authorizeAny } from "../middleware/authorizeRole.js";

const router = express.Router();

// Get all blocked dates (platform admins only)
router.get(
  "/",
  authenticate,
  authorizeRole('Admin', 'Tourism Officer'),
  authorize('view_all_profiles'),
  roomBlockedDatesController.getAllBlockedDates
);

// Get blocked dates by business ID (public - for mobile calendar display)
router.get(
  "/business/:business_id",
  roomBlockedDatesController.getBlockedDatesByBusinessId
);

// Get blocked dates by room ID (public - for booking calendar display)
router.get(
  "/room/:room_id",
  roomBlockedDatesController.getBlockedDatesByRoomId
);

// Get blocked dates in a date range for a room (any authenticated user)
router.get(
  "/room/:room_id/range",
  authenticate,
  roomBlockedDatesController.getBlockedDatesInRange
);

// Check room availability for a date range (any authenticated user)
router.get(
  "/room/:room_id/availability",
  authenticate,
  roomBlockedDatesController.checkRoomAvailability
);

// Get single blocked date by ID (any authenticated user)
router.get(
  "/:id",
  authenticate,
  roomBlockedDatesController.getBlockedDateById
);

// Create a blocked date range (requires manage_rooms permission)
router.post(
  "/",
  authenticate,
  authorize('manage_rooms'),
  roomBlockedDatesController.insertBlockedDate
);

// Bulk block dates for multiple rooms (requires manage_rooms permission)
router.post(
  "/bulk",
  authenticate,
  authorize('manage_rooms'),
  roomBlockedDatesController.bulkBlockDates
);

// Update a blocked date range (requires manage_rooms permission)
router.put(
  "/:id",
  authenticate,
  authorize('manage_rooms'),
  roomBlockedDatesController.updateBlockedDate
);

// Delete a blocked date range (requires manage_rooms permission)
router.delete(
  "/:id",
  authenticate,
  authorize('manage_rooms'),
  roomBlockedDatesController.deleteBlockedDate
);

export default router;
