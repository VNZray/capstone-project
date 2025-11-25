import express from "express";
import {
  getAllReviews,
  getReviewById,
  getReviewsByTypeAndEntityId,
  insertReview,
  updateReview,
  deleteReview,
} from "../controller/feedback/reviewController.js";
import { authenticate } from "../middleware/authenticate.js";

const router = express.Router();

// Reviews CRUD
router.get("/", getAllReviews);
router.get("/type/:review_type/:review_type_id", getReviewsByTypeAndEntityId);
router.get("/:id", getReviewById);
router.post("/", authenticate, insertReview);
router.patch("/:id", authenticate, updateReview);
router.delete("/:id", authenticate, deleteReview);

export default router;
