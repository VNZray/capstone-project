import db from "../../db.js";
import { v4 as uuidv4 } from "uuid";
import { handleDbError } from "../../utils/errorHandler.js";

// ===== Reviews (review_and_rating) =====

// Get all reviews
export async function getAllReviews(req, res) {
  try {
    const [data] = await db.query("CALL GetAllReviews()");
    res.json(data);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get review by id
export async function getReviewById(req, res) {
  const { id } = req.params;
  try {
    const [data] = await db.query("CALL GetReviewById(?)", [id]);
    if (!data || data.length === 0) {
      return res.status(404).json({ message: "Review not found" });
    }
    // Optionally include photos
    let photos = [];
    try {
      const [p] = await db.query("CALL GetReviewPhotosByReviewId(?)", [id]);
      photos = Array.isArray(p) ? p : [];
    } catch (_) {
      // If photo procedures are not present yet, ignore
    }
    const review = data[0];
    res.json({ ...review, photos });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get reviews by type and entity id with photos and replies
export async function getReviewsByTypeAndEntityId(req, res) {
  const { review_type, review_type_id } = req.params;
  try {
    const [reviews] = await db.query("CALL GetReviewsByTypeAndEntityId(?, ?)", [review_type, review_type_id]);
    
    // Fetch photos and replies for each review
    const enrichedReviews = await Promise.all(
      (reviews || []).map(async (review) => {
        let photos = [];
        let replies = [];
        
        try {
          const [p] = await db.query("CALL GetReviewPhotosByReviewId(?)", [review.id]);
          photos = Array.isArray(p) ? p : [];
        } catch (_) {}
        
        try {
          const [r] = await db.query("CALL GetRepliesByReviewId(?)", [review.id]);
          replies = Array.isArray(r) ? r : [];
        } catch (_) {}
        
        return { ...review, photos, replies };
      })
    );
    
    res.json(enrichedReviews);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Insert review
export async function insertReview(req, res) {
  try {
    const id = uuidv4();
    const { review_type, review_type_id, rating, message, tourist_id, photos } = req.body;

    // Basic validation
    if (!review_type || !review_type_id || !rating || !message || !tourist_id) {
      return res.status(400).json({ message: "review_type, review_type_id, rating, message, and tourist_id are required" });
    }
    
    const numRating = Number(rating);
    if (!Number.isFinite(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ message: "Rating must be a number between 1 and 5" });
    }

    const [data] = await db.query("CALL InsertReview(?, ?, ?, ?, ?, ?)", [
      id,
      review_type,
      review_type_id,
      numRating,
      message,
      tourist_id,
    ]);

    // If there are photos (array of URLs), attach them
    let attached = [];
    if (Array.isArray(photos) && photos.length > 0) {
      for (const url of photos) {
        if (!url || typeof url !== "string") continue;
        const photoId = uuidv4();
        try {
          const [p] = await db.query("CALL InsertReviewPhoto(?, ?, ?)", [
            photoId,
            id,
            url,
          ]);
          if (p && p[0]) attached.push(p[0]);
        } catch (_) {
          // skip if procedure not present
        }
      }
    }

    const created = data[0] ? { ...data[0], photos: attached } : undefined;
    res.status(201).json({ message: "Review created", data: created });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Update review (partial)
export async function updateReview(req, res) {
  const { id } = req.params;
  const { review_type, review_type_id, rating, message } = req.body;
  try {
    if (rating !== undefined && rating !== null) {
      const r = Number(rating);
      if (Number.isFinite(r) && (r < 1 || r > 5)) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
      }
    }

    const [data] = await db.query("CALL UpdateReview(?, ?, ?, ?, ?)", [
      id,
      review_type ?? null,
      review_type_id ?? null,
      rating ?? null,
      message ?? null,
    ]);

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.json({ message: "Review updated", data: data[0] });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Delete review
export async function deleteReview(req, res) {
  const { id } = req.params;
  try {
    await db.query("CALL DeleteReview(?)", [id]);
    res.json({ message: "Review deleted" });
  } catch (error) {
    return handleDbError(error, res);
  }
}
