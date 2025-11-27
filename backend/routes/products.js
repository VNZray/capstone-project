import express from "express";
import * as productController from "../controller/productController.js";
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRole } from '../middleware/authorizeRole.js';

const router = express.Router();

// ==================== PRODUCT ROUTES ====================
// Note: Product categories are now managed via /api/shop-categories routes

// Products - Read routes are public for browsing
router.get("/", productController.getAllProducts);
router.get("/business/:businessId", productController.getProductsByBusinessId);
router.get("/category/:categoryId", productController.getProductsByCategoryId);
router.get("/:id", productController.getProductById);

// Write routes require authentication
router.post("/", authenticate, authorizeRole("Admin", "Business Owner", "Staff"), productController.insertProduct);
router.put("/:id", authenticate, authorizeRole("Admin", "Business Owner", "Staff"), productController.updateProduct);
router.delete("/:id", authenticate, authorizeRole("Admin", "Business Owner"), productController.deleteProduct);

// ==================== PRODUCT STOCK ROUTES ====================

// Product Stock Management - requires authentication
router.get("/:productId/stock", authenticate, productController.getProductStock);
router.put("/:productId/stock", authenticate, authorizeRole("Admin", "Business Owner", "Staff"), productController.updateProductStock);
router.get("/:productId/stock/history", authenticate, authorizeRole("Admin", "Business Owner", "Staff"), productController.getProductStockHistory);

export default router;
