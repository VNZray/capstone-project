import express from "express";
import {
  getAllReplies,
  getReplyById,
  getRepliesByReviewId,
  insertReply,
  updateReply,
  deleteReply,
} from "../controller/feedback/replyController.js";

const router = express.Router();

// Replies CRUD
router.get("/", getAllReplies);
router.get("/review/:reviewId", getRepliesByReviewId);
router.get("/:id", getReplyById);
router.post("/", insertReply);
router.patch("/:id", updateReply);
router.delete("/:id", deleteReply);

export default router;
