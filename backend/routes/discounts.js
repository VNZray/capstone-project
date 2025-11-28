import express from "express";
import * as discountController from "../controller/discountController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeRole } from "../middleware/authorizeRole.js";

const router = express.Router();

// ==================== DISCOUNT ROUTES ====================

// Discounts
router.get("/", discountController.getAllDiscounts);
router.post("/", authenticate, authorizeRole("Business Owner", "Staff", "Admin"), discountController.insertDiscount);
router.get("/business/:businessId", discountController.getDiscountsByBusinessId);
router.get("/business/:businessId/active", discountController.getActiveDiscountsByBusinessId);
router.post("/maintenance/update-expired", authenticate, authorizeRole("Admin"), discountController.updateExpiredDiscounts);
router.get("/:id", discountController.getDiscountById);
router.put("/:id", authenticate, authorizeRole("Business Owner", "Staff", "Admin"), discountController.updateDiscount);
router.delete("/:id", authenticate, authorizeRole("Business Owner", "Staff", "Admin"), discountController.deleteDiscount);

// ==================== DISCOUNT VALIDATION & USAGE ROUTES ====================

// Discount Validation and Usage
router.post("/:discountId/validate", discountController.validateDiscount);
router.put("/:discountId/products/:productId/stock", discountController.updateDiscountProductStock);
router.put("/:discountId/products/batch", discountController.batchUpdateDiscountProducts);
router.get("/:id/stats", discountController.getDiscountStats);

export default router;