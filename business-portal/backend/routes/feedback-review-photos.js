import express from "express";
import {
  getPhotosByReviewId,
  addPhotos,
  deletePhoto,
} from "../controller/feedback/reviewPhotoController.js";

const router = express.Router();

// GET /reviews/:reviewId/photos
router.get("/reviews/:reviewId/photos", getPhotosByReviewId);

// POST /reviews/:reviewId/photos
router.post("/reviews/:reviewId/photos", addPhotos);

// DELETE /reviews/photos/:photoId
router.delete("/reviews/photos/:photoId", deletePhoto);

export default router;
