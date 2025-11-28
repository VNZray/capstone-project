import express from "express";
import * as promotionController from "../controller/promotionController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeRole } from "../middleware/authorizeRole.js";

const router = express.Router();

// Get all promotions
router.get("/", promotionController.getAllPromotions);

// Get all active promotions
router.get("/active", promotionController.getAllActivePromotions);

// Create new promotion
router.post("/", authenticate, authorizeRole("Business Owner", "Staff", "Admin"), promotionController.insertPromotion);

// Update expired promotions (maintenance)
router.post("/maintenance/update-expired", promotionController.updateExpiredPromotions);

// Get promotions by business ID
router.get("/business/:businessId", promotionController.getPromotionsByBusinessId);

// Get active promotions by business ID
router.get("/business/:businessId/active", promotionController.getActivePromotionsByBusinessId);

// Get promotion by ID
router.get("/:id", promotionController.getPromotionById);

// Update promotion
router.put("/:id", authenticate, authorizeRole("Business Owner", "Staff", "Admin"), promotionController.updatePromotion);

// Delete promotion
router.delete("/:id", authenticate, authorizeRole("Business Owner", "Staff", "Admin"), promotionController.deletePromotion);

export default router;
