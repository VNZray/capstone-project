/**
 * Review Controller
 * Handles review and rating operations
 */
import { sequelize } from '../models/index.js';
import { ApiError } from '../utils/api-error.js';
import { extractProcedureResult, extractSingleResult } from '../utils/helpers.js';
import logger from '../config/logger.js';

/**
 * Create a new review
 */
export const createReview = async (req, res, next) => {
  try {
    const { business_id, rating, comment, review_type = 'business' } = req.body;
    const touristId = req.user.tourist_id;

    if (!touristId) {
      throw ApiError.forbidden('Only tourists can create reviews');
    }

    const id = crypto.randomUUID();
    await sequelize.query(
      'CALL InsertReviewAndRating(?, ?, ?, ?, ?, ?)',
      { replacements: [id, review_type, business_id, touristId, rating, comment] }
    );

    const queryResult = await sequelize.query('CALL GetReviewAndRatingById(?)', {
      replacements: [id]
    });
    const result = extractSingleResult(queryResult);

    res.status(201).success(result, 'Review created successfully');
  } catch (error) {
    logger.error('Error creating review:', error);
    next(error);
  }
};

/**
 * Get review by ID
 */
export const getReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    const queryResult = await sequelize.query('CALL GetReviewAndRatingById(?)', {
      replacements: [id]
    });
    const result = extractSingleResult(queryResult);

    if (!result) {
      throw ApiError.notFound('Review not found');
    }

    res.success(result);
  } catch (error) {
    logger.error('Error fetching review:', error);
    next(error);
  }
};

/**
 * Get reviews for a business
 */
export const getBusinessReviews = async (req, res, next) => {
  try {
    const { businessId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const queryResult = await sequelize.query(
      'CALL GetReviewsByTypeAndId(?, ?)',
      { replacements: ['business', businessId] }
    );
    const results = extractProcedureResult(queryResult);

    // Apply pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const paginatedResults = results.slice(offset, offset + parseInt(limit));

    res.success({
      data: paginatedResults,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: results.length
      }
    });
  } catch (error) {
    logger.error('Error fetching business reviews:', error);
    next(error);
  }
};

/**
 * Get average rating for a business
 */
export const getBusinessRating = async (req, res, next) => {
  try {
    const { businessId } = req.params;

    const queryResult = await sequelize.query(
      'CALL GetAverageRatingByTypeAndId(?, ?)',
      { replacements: ['business', businessId] }
    );
    const result = extractSingleResult(queryResult);

    res.success(result || { average_rating: 0, total_reviews: 0 });
  } catch (error) {
    logger.error('Error fetching business rating:', error);
    next(error);
  }
};

/**
 * Update a review
 */
export const updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const touristId = req.user.tourist_id;

    const existingQuery = await sequelize.query('CALL GetReviewAndRatingById(?)', {
      replacements: [id]
    });
    const existing = extractSingleResult(existingQuery);

    if (!existing) {
      throw ApiError.notFound('Review not found');
    }

    if (existing.tourist_id !== touristId) {
      throw ApiError.forbidden('You can only update your own reviews');
    }

    await sequelize.query('CALL UpdateReviewAndRating(?, ?, ?)', {
      replacements: [id, rating, comment]
    });

    const updatedQuery = await sequelize.query('CALL GetReviewAndRatingById(?)', {
      replacements: [id]
    });
    const updated = extractSingleResult(updatedQuery);

    res.success(updated, 'Review updated successfully');
  } catch (error) {
    logger.error('Error updating review:', error);
    next(error);
  }
};

/**
 * Delete a review
 */
export const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const touristId = req.user.tourist_id;
    const isAdmin = req.user.role === 'admin';

    const existingQuery = await sequelize.query('CALL GetReviewAndRatingById(?)', {
      replacements: [id]
    });
    const existing = extractSingleResult(existingQuery);

    if (!existing) {
      throw ApiError.notFound('Review not found');
    }

    if (!isAdmin && existing.tourist_id !== touristId) {
      throw ApiError.forbidden('You can only delete your own reviews');
    }

    await sequelize.query('CALL DeleteReviewAndRating(?)', {
      replacements: [id]
    });

    res.success(null, 'Review deleted successfully');
  } catch (error) {
    logger.error('Error deleting review:', error);
    next(error);
  }
};

/**
 * Add reply to review (business owner)
 */
export const addReply = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reply_text } = req.body;
    const userId = req.user.id;

    const existingQuery = await sequelize.query('CALL GetReviewAndRatingById(?)', {
      replacements: [id]
    });
    const existing = extractSingleResult(existingQuery);

    if (!existing) {
      throw ApiError.notFound('Review not found');
    }

    const replyId = crypto.randomUUID();
    await sequelize.query('CALL InsertReply(?, ?, ?, ?)', {
      replacements: [replyId, id, userId, reply_text]
    });

    const repliesQuery = await sequelize.query('CALL GetRepliesByReviewId(?)', {
      replacements: [id]
    });
    const replies = extractProcedureResult(repliesQuery);

    res.status(201).success(replies[0], 'Reply added successfully');
  } catch (error) {
    logger.error('Error adding reply:', error);
    next(error);
  }
};

/**
 * Add photo to review
 */
export const addPhoto = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { photo_url } = req.body;
    const touristId = req.user.tourist_id;

    const existingQuery = await sequelize.query('CALL GetReviewAndRatingById(?)', {
      replacements: [id]
    });
    const existing = extractSingleResult(existingQuery);

    if (!existing) {
      throw ApiError.notFound('Review not found');
    }

    if (existing.tourist_id !== touristId) {
      throw ApiError.forbidden('You can only add photos to your own reviews');
    }

    const photoId = crypto.randomUUID();
    await sequelize.query('CALL InsertReviewPhoto(?, ?, ?)', {
      replacements: [photoId, id, photo_url]
    });

    const photosQuery = await sequelize.query('CALL GetReviewPhotosByReviewId(?)', {
      replacements: [id]
    });
    const photos = extractProcedureResult(photosQuery);

    res.status(201).success(photos[photos.length - 1], 'Photo added successfully');
  } catch (error) {
    logger.error('Error adding photo:', error);
    next(error);
  }
};

/**
 * Get reviews by tourist
 */
export const getMyReviews = async (req, res, next) => {
  try {
    const touristId = req.user.tourist_id;
    const { page = 1, limit = 10 } = req.query;

    if (!touristId) {
      throw ApiError.notFound('Tourist profile not found');
    }

    const queryResult = await sequelize.query('CALL GetReviewsByTouristId(?)', {
      replacements: [touristId]
    });
    const results = extractProcedureResult(queryResult);

    // Apply pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const paginatedResults = results.slice(offset, offset + parseInt(limit));

    res.success({
      data: paginatedResults,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: results.length
      }
    });
  } catch (error) {
    logger.error('Error fetching my reviews:', error);
    next(error);
  }
};

export default {
  createReview,
  getReview,
  getBusinessReviews,
  getBusinessRating,
  updateReview,
  deleteReview,
  addReply,
  addPhoto,
  getMyReviews
};
