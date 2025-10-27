import express from "express";
import * as serviceController from "../controller/serviceController.js";

const router = express.Router();

// ==================== SERVICE ROUTES (DISPLAY-ONLY) ====================
// Services are read-only in the mobile app, but business owners can manage them in the backend

// Get all active services (mobile app)
router.get("/", serviceController.getAllServices);

// Search services with filters
router.get("/search", serviceController.searchServices);

// Get services by business (for business dashboard)
router.get("/business/:businessId", serviceController.getServicesByBusinessId);

// Get service statistics for a business
router.get("/business/:businessId/stats", serviceController.getServiceStatsByBusiness);

// Get services by category (mobile app category view)
router.get("/category/:categoryId", serviceController.getServicesByCategoryId);

// Get single service details (mobile app detail view)
router.get("/:id", serviceController.getServiceById);

// ==================== SERVICE MANAGEMENT (BUSINESS OWNER) ====================

// Create new service
router.post("/", serviceController.insertService);

// Update service
router.put("/:id", serviceController.updateService);

// Delete service
router.delete("/:id", serviceController.deleteService);

export default router;
