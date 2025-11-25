import express from "express";
import {
  getAllReviews,
  getReviewById,
  getReviewsByTypeAndEntityId,
  insertReview,
  updateReview,
  deleteReview,
} from "../controller/feedback/reviewController.js";

const router = express.Router();

// Reviews CRUD
router.get("/", getAllReviews);
router.get("/type/:review_type/:review_type_id", getReviewsByTypeAndEntityId);
router.get("/:id", getReviewById);
router.post("/", insertReview);
router.patch("/:id", updateReview);
router.delete("/:id", deleteReview);

export default router;
