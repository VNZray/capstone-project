import express from "express";
import * as promotionController from "../controller/promotionController.js";

const router = express.Router();

// Get all promotions
router.get("/", promotionController.getAllPromotions);

// Get all active promotions
router.get("/active", promotionController.getAllActivePromotions);

// Create new promotion
router.post("/", promotionController.insertPromotion);

// Update expired promotions (maintenance)
router.post("/maintenance/update-expired", promotionController.updateExpiredPromotions);

// Get promotions by business ID
router.get("/business/:businessId", promotionController.getPromotionsByBusinessId);

// Get active promotions by business ID
router.get("/business/:businessId/active", promotionController.getActivePromotionsByBusinessId);

// Get promotion by ID
router.get("/:id", promotionController.getPromotionById);

// Update promotion
router.put("/:id", promotionController.updatePromotion);

// Delete promotion
router.delete("/:id", promotionController.deletePromotion);

export default router;
