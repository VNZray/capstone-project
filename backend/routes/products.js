import express from "express";
import * as productController from "../controller/productController.js";

const router = express.Router();

// ==================== PRODUCT CATEGORY ROUTES ====================

// Product Categories
router.get("/categories", productController.getAllProductCategories);
router.post("/categories", productController.insertProductCategory);
router.get("/categories/business/:businessId", productController.getProductCategoriesByBusinessId);
router.get("/categories/:id", productController.getProductCategoryById);
router.put("/categories/:id", productController.updateProductCategory);
router.delete("/categories/:id", productController.deleteProductCategory);

// ==================== PRODUCT ROUTES ====================

// Products
router.get("/", productController.getAllProducts);
router.post("/", productController.insertProduct);
router.get("/business/:businessId", productController.getProductsByBusinessId);
router.get("/category/:categoryId", productController.getProductsByCategoryId);
router.get("/:id", productController.getProductById);
router.put("/:id", productController.updateProduct);
router.delete("/:id", productController.deleteProduct);

// ==================== PRODUCT STOCK ROUTES ====================

// Product Stock Management
router.get("/:productId/stock", productController.getProductStock);
router.put("/:productId/stock", productController.updateProductStock);
router.get("/:productId/stock/history", productController.getProductStockHistory);

export default router;
