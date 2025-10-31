import db from "../../db.js";
import { v4 as uuidv4 } from "uuid";
import { handleDbError } from "../../utils/errorHandler.js";

// Get photos for a review
export async function getPhotosByReviewId(req, res) {
  const { reviewId } = req.params;
  try {
    const [rows] = await db.query("CALL GetReviewPhotosByReviewId(?)", [reviewId]);
    res.json(rows);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Add one or many photos to a review
// Body: { photos: string[] }
export async function addPhotos(req, res) {
  const { reviewId } = req.params;
  const { photos } = req.body || {};
  if (!Array.isArray(photos) || photos.length === 0) {
    return res.status(400).json({ message: "photos must be a non-empty array of URLs" });
  }
  try {
    const created = [];
    for (const url of photos) {
      if (!url || typeof url !== "string") continue;
      const id = uuidv4();
      const [rows] = await db.query("CALL InsertReviewPhoto(?, ?, ?)", [id, reviewId, url]);
      if (rows && rows[0]) created.push(rows[0]);
    }
    res.status(201).json({ message: "Photos added", data: created });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Delete a single photo by id
export async function deletePhoto(req, res) {
  const { photoId } = req.params;
  try {
    await db.query("CALL DeleteReviewPhoto(?)", [photoId]);
    res.json({ message: "Photo deleted" });
  } catch (error) {
    return handleDbError(error, res);
  }
}
