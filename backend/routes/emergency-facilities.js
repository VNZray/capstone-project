/**
 * Emergency Facilities Routes
 * API endpoints for managing emergency facilities (police, hospitals, fire stations, evacuation centers)
 */

import express from "express";
import * as emergencyFacilityController from "../controller/emergencyFacilityController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeRole } from "../middleware/authorizeRole.js";

const router = express.Router();

// Public routes (for mobile app)
router.get("/active", emergencyFacilityController.getActiveEmergencyFacilities);
router.get("/nearby", emergencyFacilityController.getNearbyEmergencyFacilities);
router.get("/type/:type", emergencyFacilityController.getEmergencyFacilitiesByType);
router.get("/barangay/:barangayId", emergencyFacilityController.getEmergencyFacilitiesByBarangay);
router.get("/:id", emergencyFacilityController.getEmergencyFacilityById);

// Protected routes (Admin only)
router.get("/", authenticate, authorizeRole("Admin", "Tourism Staff"), emergencyFacilityController.getAllEmergencyFacilities);
router.post("/", authenticate, authorizeRole("Admin"), emergencyFacilityController.createEmergencyFacility);
router.put("/:id", authenticate, authorizeRole("Admin"), emergencyFacilityController.updateEmergencyFacility);
router.patch("/:id/status", authenticate, authorizeRole("Admin"), emergencyFacilityController.updateEmergencyFacilityStatus);
router.delete("/:id", authenticate, authorizeRole("Admin"), emergencyFacilityController.deleteEmergencyFacility);

export default router;
