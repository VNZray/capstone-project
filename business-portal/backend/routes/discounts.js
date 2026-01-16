import express from "express";
import * as discountController from "../controller/discount/discountController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeRole, authorize } from "../middleware/authorizeRole.js";

const router = express.Router();

// ==================== DISCOUNT ROUTES ====================

// Discounts (public read, authenticated write)
router.get("/", discountController.getAllDiscounts);
// Creating discounts requires manage_promotions permission
router.post("/", authenticate, authorize('manage_promotions'), discountController.insertDiscount);
router.get("/business/:businessId", discountController.getDiscountsByBusinessId);
router.get("/business/:businessId/active", discountController.getActiveDiscountsByBusinessId);
// Maintenance - platform admin only
router.post("/maintenance/update-expired", authenticate, authorizeRole('Admin', 'Tourism Officer'), discountController.updateExpiredDiscounts);
router.get("/:id", discountController.getDiscountById);
router.put("/:id", authenticate, authorize('manage_promotions'), discountController.updateDiscount);
router.delete("/:id", authenticate, authorize('manage_promotions'), discountController.deleteDiscount);

// ==================== DISCOUNT VALIDATION & USAGE ROUTES ====================

// Discount Validation and Usage
router.post("/:discountId/validate", discountController.validateDiscount);
router.put("/:discountId/products/:productId/stock", discountController.updateDiscountProductStock);
router.put("/:discountId/products/batch", discountController.batchUpdateDiscountProducts);
router.get("/:id/stats", discountController.getDiscountStats);

export default router;