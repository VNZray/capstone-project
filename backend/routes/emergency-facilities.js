/**
 * Emergency Facilities Routes
 * API endpoints for managing emergency facilities (police, hospitals, fire stations, evacuation centers)
 */

import express from "express";
import * as emergencyFacilityController from "../controller/emergencyFacilityController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeRole, authorize, authorizeAny } from "../middleware/authorizeRole.js";

const router = express.Router();

// Public routes (for mobile app)
router.get("/active", emergencyFacilityController.getActiveEmergencyFacilities);
router.get("/nearby", emergencyFacilityController.getNearbyEmergencyFacilities);
router.get("/type/:type", emergencyFacilityController.getEmergencyFacilitiesByType);
router.get("/barangay/:barangayId", emergencyFacilityController.getEmergencyFacilitiesByBarangay);
router.get("/:id", emergencyFacilityController.getEmergencyFacilityById);

// Protected routes - Platform scope (Admin/Tourism roles)
router.get("/", authenticate, authorizeRole('Admin', 'Tourism Officer'), authorizeAny('view_all_profiles', 'manage_services'), emergencyFacilityController.getAllEmergencyFacilities);
router.post("/", authenticate, authorize('manage_services'), emergencyFacilityController.createEmergencyFacility);
router.put("/:id", authenticate, authorize('manage_services'), emergencyFacilityController.updateEmergencyFacility);
router.patch("/:id/status", authenticate, authorize('manage_services'), emergencyFacilityController.updateEmergencyFacilityStatus);
router.delete("/:id", authenticate, authorize('manage_users'), emergencyFacilityController.deleteEmergencyFacility);

export default router;
