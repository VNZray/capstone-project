/**
 * Product Review Controller
 * Handles product-specific reviews and ratings
 */
import { sequelize } from '../models/index.js';
import { ApiError } from '../utils/api-error.js';
import { calculateOffset, formatPagination } from '../utils/helpers.js';
import { v4 as uuidv4 } from 'uuid';
import logger from '../config/logger.js';

// Using raw queries for product reviews since table structure may vary

/**
 * Get all product reviews with pagination
 */
export const getAllProductReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, product_id, rating, status } = req.query;

    let query = `
      SELECT pr.*, p.name as product_name, u.email as reviewer_email
      FROM product_reviews pr
      LEFT JOIN product p ON pr.product_id = p.id
      LEFT JOIN user u ON pr.user_id = u.id
      WHERE 1=1
    `;

    const replacements = [];

    if (product_id) {
      query += ' AND pr.product_id = ?';
      replacements.push(product_id);
    }

    if (rating) {
      query += ' AND pr.rating = ?';
      replacements.push(parseInt(rating));
    }

    if (status) {
      query += ' AND pr.status = ?';
      replacements.push(status);
    }

    query += ' ORDER BY pr.created_at DESC';
    query += ` LIMIT ? OFFSET ?`;
    replacements.push(parseInt(limit), calculateOffset(page, limit));

    const [reviews] = await sequelize.query(query, { replacements });

    // Get total count
    const [countResult] = await sequelize.query('SELECT COUNT(*) as total FROM product_reviews');
    const total = countResult[0]?.total || 0;

    const pagination = formatPagination(total, parseInt(page), parseInt(limit));
    res.paginated(reviews, pagination);
  } catch (error) {
    next(error);
  }
};

/**
 * Get product reviews by product ID
 */
export const getProductReviewsByProductId = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const offset = calculateOffset(page, limit);

    const [reviews] = await sequelize.query(
      `SELECT pr.*, u.email as reviewer_email
       FROM product_reviews pr
       LEFT JOIN user u ON pr.user_id = u.id
       WHERE pr.product_id = ?
       ORDER BY pr.created_at DESC
       LIMIT ? OFFSET ?`,
      { replacements: [productId, parseInt(limit), offset] }
    );

    // Get total count for this product
    const [countResult] = await sequelize.query(
      'SELECT COUNT(*) as total FROM product_reviews WHERE product_id = ?',
      { replacements: [productId] }
    );
    const total = countResult[0]?.total || 0;

    // Get average rating
    const [avgResult] = await sequelize.query(
      'SELECT AVG(rating) as average_rating, COUNT(*) as review_count FROM product_reviews WHERE product_id = ?',
      { replacements: [productId] }
    );

    const pagination = formatPagination(total, parseInt(page), parseInt(limit));

    res.paginated(reviews, pagination, {
      average_rating: parseFloat(avgResult[0]?.average_rating) || 0,
      review_count: avgResult[0]?.review_count || 0
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get product review by ID
 */
export const getProductReviewById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [reviews] = await sequelize.query(
      `SELECT pr.*, p.name as product_name, u.email as reviewer_email
       FROM product_reviews pr
       LEFT JOIN product p ON pr.product_id = p.id
       LEFT JOIN user u ON pr.user_id = u.id
       WHERE pr.id = ?`,
      { replacements: [id] }
    );

    if (!reviews || reviews.length === 0) {
      throw ApiError.notFound('Product review not found');
    }

    res.success(reviews[0]);
  } catch (error) {
    next(error);
  }
};

/**
 * Get reviews by user ID
 */
export const getProductReviewsByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const [reviews] = await sequelize.query(
      `SELECT pr.*, p.name as product_name
       FROM product_reviews pr
       LEFT JOIN product p ON pr.product_id = p.id
       WHERE pr.user_id = ?
       ORDER BY pr.created_at DESC`,
      { replacements: [userId] }
    );

    res.success(reviews);
  } catch (error) {
    next(error);
  }
};

/**
 * Create product review
 */
export const createProductReview = async (req, res, next) => {
  try {
    const {
      product_id,
      order_id,
      rating,
      title,
      comment,
      pros,
      cons
    } = req.body;

    const user_id = req.user?.id;

    if (!product_id || !rating) {
      throw ApiError.badRequest('product_id and rating are required');
    }

    if (rating < 1 || rating > 5) {
      throw ApiError.badRequest('Rating must be between 1 and 5');
    }

    // Check if user already reviewed this product
    const [existing] = await sequelize.query(
      'SELECT id FROM product_reviews WHERE product_id = ? AND user_id = ?',
      { replacements: [product_id, user_id] }
    );

    if (existing && existing.length > 0) {
      throw ApiError.conflict('You have already reviewed this product');
    }

    const id = uuidv4();

    await sequelize.query(
      `INSERT INTO product_reviews
       (id, product_id, order_id, user_id, rating, title, comment, pros, cons, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', NOW())`,
      {
        replacements: [
          id,
          product_id,
          order_id || null,
          user_id,
          rating,
          title || null,
          comment || null,
          pros || null,
          cons || null
        ]
      }
    );

    res.created({ id, message: 'Product review created successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Update product review
 */
export const updateProductReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, title, comment, pros, cons } = req.body;
    const user_id = req.user?.id;

    // Check if review exists and belongs to user
    const [reviews] = await sequelize.query(
      'SELECT * FROM product_reviews WHERE id = ?',
      { replacements: [id] }
    );

    if (!reviews || reviews.length === 0) {
      throw ApiError.notFound('Product review not found');
    }

    const review = reviews[0];

    if (review.user_id !== user_id) {
      throw ApiError.forbidden('You can only update your own reviews');
    }

    if (rating && (rating < 1 || rating > 5)) {
      throw ApiError.badRequest('Rating must be between 1 and 5');
    }

    await sequelize.query(
      `UPDATE product_reviews
       SET rating = COALESCE(?, rating),
           title = COALESCE(?, title),
           comment = COALESCE(?, comment),
           pros = COALESCE(?, pros),
           cons = COALESCE(?, cons),
           updated_at = NOW()
       WHERE id = ?`,
      { replacements: [rating, title, comment, pros, cons, id] }
    );

    res.success({ id }, 'Product review updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete product review
 */
export const deleteProductReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user_id = req.user?.id;
    const isAdmin = req.user?.role === 'Tourism Admin' || req.user?.role === 'Admin';

    // Check if review exists
    const [reviews] = await sequelize.query(
      'SELECT * FROM product_reviews WHERE id = ?',
      { replacements: [id] }
    );

    if (!reviews || reviews.length === 0) {
      throw ApiError.notFound('Product review not found');
    }

    const review = reviews[0];

    if (!isAdmin && review.user_id !== user_id) {
      throw ApiError.forbidden('You can only delete your own reviews');
    }

    await sequelize.query('DELETE FROM product_reviews WHERE id = ?', {
      replacements: [id]
    });

    res.success(null, 'Product review deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get product rating summary
 */
export const getProductRatingSummary = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const [summary] = await sequelize.query(
      `SELECT
        COUNT(*) as total_reviews,
        AVG(rating) as average_rating,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star
       FROM product_reviews
       WHERE product_id = ?`,
      { replacements: [productId] }
    );

    res.success(summary[0] || {
      total_reviews: 0,
      average_rating: 0,
      five_star: 0,
      four_star: 0,
      three_star: 0,
      two_star: 0,
      one_star: 0
    });
  } catch (error) {
    next(error);
  }
};
