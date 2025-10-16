import express from "express";
import * as serviceController from "../controller/serviceController.js";

const router = express.Router();

// ==================== SERVICE ROUTES ====================
// Note: Service categories are now managed via /api/shop-categories routes

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
