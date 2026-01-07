import express from "express";
import * as productController from "../controller/productController.js";
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorizeRole.js';

const router = express.Router();

// ==================== PRODUCT ROUTES ====================
// Note: Product categories are now managed via /api/shop-categories routes

// Products - Read routes are public for browsing
router.get("/", productController.getAllProducts);
router.get("/business/:businessId", productController.getProductsByBusinessId);
router.get("/category/:categoryId", productController.getProductsByCategoryId);
router.get("/:id", productController.getProductById);

// Write routes require manage_shop permission (bundles product + service management)
router.post("/", authenticate, authorize('manage_shop'), productController.insertProduct);
router.put("/:id", authenticate, authorize('manage_shop'), productController.updateProduct);
router.delete("/:id", authenticate, authorize('manage_shop'), productController.deleteProduct);

// ==================== PRODUCT STOCK ROUTES ====================

// Product Stock Management - requires authentication
router.get("/:productId/stock", authenticate, productController.getProductStock);
router.put("/:productId/stock", authenticate, authorize('manage_shop'), productController.updateProductStock);
router.get("/:productId/stock/history", authenticate, authorize('manage_shop'), productController.getProductStockHistory);

export default router;
