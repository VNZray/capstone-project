import express from "express";
import * as serviceController from "../controller/serviceController.js";

const router = express.Router();

// ==================== SERVICE CATEGORY ROUTES ====================

// Service Categories
router.get("/categories", serviceController.getAllServiceCategories);
router.post("/categories", serviceController.insertServiceCategory);
router.get("/categories/business/:businessId", serviceController.getServiceCategoriesByBusinessId);
router.get("/categories/:id", serviceController.getServiceCategoryById);
router.put("/categories/:id", serviceController.updateServiceCategory);
router.delete("/categories/:id", serviceController.deleteServiceCategory);

// ==================== SERVICE ROUTES ====================

// Services
router.get("/", serviceController.getAllServices);
router.post("/", serviceController.insertService);
router.get("/search", serviceController.searchServices);
router.get("/business/:businessId", serviceController.getServicesByBusinessId);
router.get("/business/:businessId/pricing", serviceController.getServicesWithPricing);
router.get("/business/:businessId/stats", serviceController.getServiceStatsByBusiness);
router.get("/category/:categoryId", serviceController.getServicesByCategoryId);
router.get("/:id", serviceController.getServiceById);
router.put("/:id", serviceController.updateService);
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
