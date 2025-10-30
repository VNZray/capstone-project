import express from "express";
import * as discountController from "../controller/discountController.js";

const router = express.Router();

// ==================== DISCOUNT ROUTES ====================

// Discounts
router.get("/", discountController.getAllDiscounts);
router.post("/", discountController.insertDiscount);
router.get("/business/:businessId", discountController.getDiscountsByBusinessId);
router.get("/business/:businessId/active", discountController.getActiveDiscountsByBusinessId);
router.get("/:id", discountController.getDiscountById);
router.put("/:id", discountController.updateDiscount);
router.delete("/:id", discountController.deleteDiscount);

// ==================== DISCOUNT VALIDATION & USAGE ROUTES ====================

// Discount Validation and Usage
router.post("/:discountId/validate", discountController.validateDiscount);
router.put("/:discountId/usage", discountController.updateDiscountUsage);
router.get("/:id/stats", discountController.getDiscountStats);

export default router;
