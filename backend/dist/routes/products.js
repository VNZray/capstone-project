import express from "express";
import * as productController from "../controller/productController.js";

const router = express.Router();

// ==================== PRODUCT ROUTES ====================
// Note: Product categories are now managed via /api/shop-categories routes

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
