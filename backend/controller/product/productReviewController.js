import db from "../../db.js";
import { v4 as uuidv4 } from "uuid";
import { handleDbError } from "../../utils/errorHandler.js";

// ==================== PRODUCT REVIEWS ====================

// Get all product reviews
export async function getAllProductReviews(req, res) {
  try {
    const [data] = await db.query("CALL GetAllProductReviews()");
    res.json(data);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get reviews by product ID
export async function getReviewsByProductId(req, res) {
  const { productId } = req.params;
  try {
    const [data] = await db.query("CALL GetReviewsByProductId(?)", [productId]);
    res.json(data);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get reviews by user ID
export async function getReviewsByUserId(req, res) {
  const { userId } = req.params;
  try {
    const [data] = await db.query("CALL GetReviewsByUserId(?)", [userId]);
    res.json(data);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get reviews by business ID
export async function getReviewsByBusinessId(req, res) {
  const { businessId } = req.params;
  try {
    const [data] = await db.query("CALL GetReviewsByBusinessId(?)", [businessId]);
    res.json(data);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get review by ID
export async function getProductReviewById(req, res) {
  const { id } = req.params;
  try {
    const [data] = await db.query("CALL GetProductReviewById(?)", [id]);
    
    if (!data || data.length === 0) {
      return res.status(404).json({ message: "Product review not found" });
    }
    res.json(data[0]);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Insert a new product review
export async function insertProductReview(req, res) {
  try {
    const id = uuidv4();
    const { 
      product_id, 
      user_id, 
      order_id, 
      rating, 
      review_title, 
      review_text,
      is_verified_purchase 
    } = req.body;

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const [data] = await db.query("CALL InsertProductReview(?, ?, ?, ?, ?, ?, ?, ?)", [
      id, product_id, user_id, order_id || null, rating, 
      review_title || null, review_text || null, is_verified_purchase || false
    ]);
    
    res.status(201).json({
      message: "Product review created successfully",
      data: data[0]
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Update product review
export async function updateProductReview(req, res) {
  const { id } = req.params;
  const { rating, review_title, review_text, status } = req.body;
  
  try {
    // Validate rating if provided
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const [data] = await db.query("CALL UpdateProductReview(?, ?, ?, ?, ?)", [
      id, rating || null, review_title || null, review_text || null, status || null
    ]);

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "Product review not found" });
    }

    res.json({
      message: "Product review updated successfully",
      data: data[0]
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Delete product review
export async function deleteProductReview(req, res) {
  const { id } = req.params;
  try {
    await db.query("CALL DeleteProductReview(?)", [id]);
    res.json({ message: "Product review deleted successfully" });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Update review status (for moderation)
export async function updateReviewStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;
  
  try {
    const validStatuses = ['active', 'hidden', 'flagged'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status. Must be: active, hidden, or flagged" });
    }

    const [data] = await db.query("CALL UpdateReviewStatus(?, ?)", [id, status]);

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "Product review not found" });
    }

    res.json({
      message: "Review status updated successfully",
      data: data[0]
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get product review statistics
export async function getProductReviewStats(req, res) {
  const { productId } = req.params;
  
  try {
    const [results] = await db.query("CALL GetProductReviewStats(?)", [productId]);
    
    if (!results || results.length < 2) {
      return res.status(404).json({ message: "Product not found or no reviews available" });
    }

    const statistics = results[0][0];
    const recent_reviews = results[1];

    res.json({
      statistics: statistics,
      recent_reviews: recent_reviews
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get business review statistics
export async function getBusinessReviewStats(req, res) {
  const { businessId } = req.params;
  
  try {
    const [results] = await db.query("CALL GetBusinessReviewStats(?)", [businessId]);
    
    if (!results || results.length < 2) {
      return res.status(404).json({ message: "Business not found or no reviews available" });
    }

    const overall_statistics = results[0][0];
    const product_statistics = results[1];

    res.json({
      overall_statistics: overall_statistics,
      product_statistics: product_statistics
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Check if user can review product (has purchased and hasn't reviewed yet)
export async function canUserReviewProduct(req, res) {
  const { productId, userId } = req.params;
  
  try {
    const [data] = await db.query("CALL CanUserReviewProduct(?, ?)", [productId, userId]);
    
    if (!data || data.length === 0) {
      return res.status(404).json({ message: "Product or user not found" });
    }

    res.json(data[0]);
  } catch (error) {
    return handleDbError(error, res);
  }
}
