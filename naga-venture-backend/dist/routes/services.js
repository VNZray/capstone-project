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
router.delete("/:id", serviceController.deleteService);

export default router;
