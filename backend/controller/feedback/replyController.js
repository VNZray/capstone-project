import db from "../../db.js";
import { v4 as uuidv4 } from "uuid";
import { handleDbError } from "../../utils/errorHandler.js";

// ===== Replies (reply) =====

// Get all replies
export async function getAllReplies(req, res) {
  try {
    const [data] = await db.query("CALL GetAllReplies()");
    res.json(data);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get reply by id
export async function getReplyById(req, res) {
  const { id } = req.params;
  try {
    const [data] = await db.query("CALL GetReplyById(?)", [id]);
    if (!data || data.length === 0) {
      return res.status(404).json({ message: "Reply not found" });
    }
    res.json(data[0]);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get replies by review id
export async function getRepliesByReviewId(req, res) {
  const { reviewId } = req.params;
  try {
    const [data] = await db.query("CALL GetRepliesByReviewId(?)", [reviewId]);
    res.json(data);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Insert reply
export async function insertReply(req, res) {
  try {
    const id = uuidv4();
    const { review_and_rating_id, message, responder_id } = req.body;

    if (!review_and_rating_id || !message || !responder_id) {
      return res.status(400).json({ message: "review_and_rating_id, message, and responder_id are required" });
    }

    const [data] = await db.query("CALL InsertReply(?, ?, ?, ?)", [
      id,
      review_and_rating_id,
      message,
      responder_id,
    ]);

    res.status(201).json({ message: "Reply created", data: data[0] });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Update reply (message only)
export async function updateReply(req, res) {
  const { id } = req.params;
  const { message } = req.body;
  try {
    const [data] = await db.query("CALL UpdateReply(?, ?)", [
      id,
      message ?? null,
    ]);

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "Reply not found" });
    }

    res.json({ message: "Reply updated", data: data[0] });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Delete reply
export async function deleteReply(req, res) {
  const { id } = req.params;
  try {
    await db.query("CALL DeleteReply(?)", [id]);
    res.json({ message: "Reply deleted" });
  } catch (error) {
    return handleDbError(error, res);
  }
}
