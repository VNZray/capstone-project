import express from "express";
import {
  getAllReviews,
  getReviewById,
  getReviewsByTypeAndEntityId,
  getReviewsByTouristId,
  insertReview,
  updateReview,
  deleteReview,
  getAverageRating,
  getTotalReviews,
} from "../controller/feedback/reviewController.js";
import { authenticate } from "../middleware/authenticate.js";

const router = express.Router();

// Reviews CRUD
router.get("/", getAllReviews);
router.get("/type/:review_type/:review_type_id", getReviewsByTypeAndEntityId);
router.get("/tourist/:touristId", authenticate, getReviewsByTouristId);
router.get("/:id", getReviewById);
router.post("/", authenticate, insertReview);
router.patch("/:id", authenticate, updateReview);
router.delete("/:id", authenticate, deleteReview);
router.get("/average/:review_type/:review_type_id", getAverageRating);
router.get("/total/:review_type/:review_type_id", getTotalReviews);

export default router;
