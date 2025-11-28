import express from "express";
import * as productReviewController from "../controller/productReviewController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeRole } from "../middleware/authorizeRole.js";

const router = express.Router();

// ==================== PRODUCT REVIEW ROUTES ====================

// Product Reviews
router.get("/", productReviewController.getAllProductReviews);
router.post("/", authenticate, productReviewController.insertProductReview);
router.get("/product/:productId", productReviewController.getReviewsByProductId);
router.get("/product/:productId/stats", productReviewController.getProductReviewStats);
router.get("/user/:userId", productReviewController.getReviewsByUserId);
router.get("/business/:businessId", productReviewController.getReviewsByBusinessId);
router.get("/business/:businessId/stats", productReviewController.getBusinessReviewStats);
router.get("/can-review/:productId/:userId", productReviewController.canUserReviewProduct);
router.get("/:id", productReviewController.getProductReviewById);
router.put("/:id", authenticate, productReviewController.updateProductReview);
router.put("/:id/status", authenticate, authorizeRole("Business Owner", "Staff", "Admin"), productReviewController.updateReviewStatus);
router.delete("/:id", authenticate, productReviewController.deleteProductReview);

export default router;
