import express from "express";
import * as shopCategoryController from "../controller/shop/shopCategoryController.js";

const router = express.Router();

// ==================== SHOP CATEGORY ROUTES ====================

// Get all shop categories
router.get("/", shopCategoryController.getAllShopCategories);

// Create new shop category
router.post("/", shopCategoryController.insertShopCategory);

// Get shop categories by business ID
router.get("/business/:businessId", shopCategoryController.getShopCategoriesByBusinessId);

// Get shop categories by business ID and type (with query param ?type=product|service|both)
router.get("/business/:businessId/filter", shopCategoryController.getShopCategoriesByBusinessIdAndType);

// Get shop category statistics for business
router.get("/business/:businessId/stats", shopCategoryController.getShopCategoryStats);

// Get shop category by ID
router.get("/:id", shopCategoryController.getShopCategoryById);

// Update shop category
router.put("/:id", shopCategoryController.updateShopCategory);

// Delete shop category
router.delete("/:id", shopCategoryController.deleteShopCategory);

export default router;
