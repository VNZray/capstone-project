import express from "express";
import * as promotionController from "../controller/promotionController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorizeRole.js";

const router = express.Router();

// Get all promotions
router.get("/", promotionController.getAllPromotions);

// Get all active promotions
router.get("/active", promotionController.getAllActivePromotions);

// Create new promotion (requires manage_promotions permission)
router.post("/", authenticate, authorize('manage_promotions'), promotionController.insertPromotion);

// Update expired promotions (maintenance)
router.post("/maintenance/update-expired", promotionController.updateExpiredPromotions);

// Get promotions by business ID
router.get("/business/:businessId", promotionController.getPromotionsByBusinessId);

// Get active promotions by business ID
router.get("/business/:businessId/active", promotionController.getActivePromotionsByBusinessId);

// Get promotion by ID
router.get("/:id", promotionController.getPromotionById);

// Update promotion (requires manage_promotions permission)
router.put("/:id", authenticate, authorize('manage_promotions'), promotionController.updatePromotion);

// Delete promotion (requires manage_promotions permission)
router.delete("/:id", authenticate, authorize('manage_promotions'), promotionController.deletePromotion);

export default router;
