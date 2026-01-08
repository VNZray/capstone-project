import express from "express";
import * as seasonalPricingController from "../controller/accommodation/seasonalPricingController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeRole, authorize, authorizeBusinessAccess } from "../middleware/authorizeRole.js";

const router = express.Router();

// Get all seasonal pricing (platform admin only)
router.get(
  "/",
  authenticate,
  seasonalPricingController.getAllSeasonalPricing
);

// Get seasonal pricing by business ID (any authenticated user - controller validates access)
router.get(
  "/business/:business_id",
  authenticate,
  seasonalPricingController.getSeasonalPricingByBusinessId
);

// Get seasonal pricing by room ID (any authenticated user - public for booking flow)
router.get(
  "/room/:room_id",
  authenticate,
  seasonalPricingController.getSeasonalPricingByRoomId
);

// Calculate price for a specific date (public for booking flow)
router.get(
  "/calculate/:room_id/date",
  authenticate,
  seasonalPricingController.calculatePriceForDate
);

// Calculate price for a date range (public for booking flow)
router.get(
  "/calculate/:room_id/range",
  authenticate,
  seasonalPricingController.calculatePriceForDateRange
);

// Get seasonal pricing by ID (any authenticated user)
router.get(
  "/:id",
  authenticate,
  seasonalPricingController.getSeasonalPricingById
);

// Create seasonal pricing (requires manage_rooms permission)
router.post(
  "/",
  authenticate,
  authorize('manage_rooms'),
  seasonalPricingController.insertSeasonalPricing
);

// Upsert (create or update) seasonal pricing
router.post(
  "/upsert",
  authenticate,
  authorize('manage_rooms'),
  seasonalPricingController.upsertSeasonalPricing
);

// Update seasonal pricing
router.put(
  "/:id",
  authenticate,
  authorize('manage_rooms'),
  seasonalPricingController.updateSeasonalPricing
);

// Delete seasonal pricing
router.delete(
  "/:id",
  authenticate,
  authorize('manage_rooms'),
  seasonalPricingController.deleteSeasonalPricing
);

export default router;
