import express from "express";
import * as productReviewController from "../controller/productReviewController.js";

const router = express.Router();

// ==================== PRODUCT REVIEW ROUTES ====================

// Product Reviews
router.get("/", productReviewController.getAllProductReviews);
router.post("/", productReviewController.insertProductReview);
router.get("/product/:productId", productReviewController.getReviewsByProductId);
router.get("/product/:productId/stats", productReviewController.getProductReviewStats);
router.get("/user/:userId", productReviewController.getReviewsByUserId);
router.get("/business/:businessId", productReviewController.getReviewsByBusinessId);
router.get("/business/:businessId/stats", productReviewController.getBusinessReviewStats);
router.get("/can-review/:productId/:userId", productReviewController.canUserReviewProduct);
router.get("/:id", productReviewController.getProductReviewById);
router.put("/:id", productReviewController.updateProductReview);
router.put("/:id/status", productReviewController.updateReviewStatus);
router.delete("/:id", productReviewController.deleteProductReview);

export default router;
