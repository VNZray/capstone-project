import express from "express";
import * as seasonalPricingController from "../controller/accommodation/seasonalPricingController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeRole } from "../middleware/authorizeRole.js";

const router = express.Router();

// Roles that can manage seasonal pricing
const businessRoles = ["Admin", "Business Owner", "Manager"];
const viewRoles = [...businessRoles, "Room Manager", "Receptionist", "Tourist"];

// Get all seasonal pricing (Admin only)
router.get(
  "/",
  authenticate,
  authorizeRole("Admin"),
  seasonalPricingController.getAllSeasonalPricing
);

// Get seasonal pricing by business ID
router.get(
  "/business/:business_id",
  authenticate,
  authorizeRole(...viewRoles),
  seasonalPricingController.getSeasonalPricingByBusinessId
);

// Get seasonal pricing by room ID
router.get(
  "/room/:room_id",
  authenticate,
  authorizeRole(...viewRoles),
  seasonalPricingController.getSeasonalPricingByRoomId
);

// Calculate price for a specific date
router.get(
  "/calculate/:room_id/date",
  authenticate,
  authorizeRole(...viewRoles),
  seasonalPricingController.calculatePriceForDate
);

// Calculate price for a date range
router.get(
  "/calculate/:room_id/range",
  authenticate,
  authorizeRole(...viewRoles),
  seasonalPricingController.calculatePriceForDateRange
);

// Get seasonal pricing by ID
router.get(
  "/:id",
  authenticate,
  authorizeRole(...viewRoles),
  seasonalPricingController.getSeasonalPricingById
);

// Create seasonal pricing
router.post(
  "/",
  authenticate,
  authorizeRole(...businessRoles),
  seasonalPricingController.insertSeasonalPricing
);

// Upsert (create or update) seasonal pricing
router.post(
  "/upsert",
  authenticate,
  authorizeRole(...businessRoles),
  seasonalPricingController.upsertSeasonalPricing
);

// Update seasonal pricing
router.put(
  "/:id",
  authenticate,
  authorizeRole(...businessRoles),
  seasonalPricingController.updateSeasonalPricing
);

// Delete seasonal pricing
router.delete(
  "/:id",
  authenticate,
  authorizeRole(...businessRoles),
  seasonalPricingController.deleteSeasonalPricing
);

export default router;
