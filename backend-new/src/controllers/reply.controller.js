/**
 * Reply Controller
 * Handles review replies management
 */
import { Reply, ReviewAndRating, User, sequelize } from '../models/index.js';
import { ApiError } from '../utils/api-error.js';
import { v4 as uuidv4 } from 'uuid';
import logger from '../config/logger.js';

/**
 * Get all replies for a review
 */
export const getRepliesByReviewId = async (req, res, next) => {
  try {
    const { reviewId } = req.params;

    const replies = await Reply.findAll({
      where: { review_id: reviewId },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'email']
      }],
      order: [['created_at', 'ASC']]
    });

    res.success(replies);
  } catch (error) {
    next(error);
  }
};

/**
 * Get reply by ID
 */
export const getReplyById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const reply = await Reply.findByPk(id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'email']
      }]
    });

    if (!reply) {
      throw ApiError.notFound('Reply not found');
    }

    res.success(reply);
  } catch (error) {
    next(error);
  }
};

/**
 * Create reply to review
 */
export const createReply = async (req, res, next) => {
  try {
    const { review_id, content, is_owner_reply = false } = req.body;
    const user_id = req.user?.id;

    if (!review_id || !content) {
      throw ApiError.badRequest('review_id and content are required');
    }

    // Verify review exists
    const review = await ReviewAndRating.findByPk(review_id);
    if (!review) {
      throw ApiError.notFound('Review not found');
    }

    const reply = await Reply.create({
      id: uuidv4(),
      review_id,
      user_id,
      content,
      is_owner_reply
    });

    res.created(reply, 'Reply created successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update reply
 */
export const updateReply = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const user_id = req.user?.id;

    const reply = await Reply.findByPk(id);

    if (!reply) {
      throw ApiError.notFound('Reply not found');
    }

    if (reply.user_id !== user_id) {
      throw ApiError.forbidden('You can only update your own replies');
    }

    await reply.update({ content });

    res.success(reply, 'Reply updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete reply
 */
export const deleteReply = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user_id = req.user?.id;
    const isAdmin = req.user?.role === 'Tourism Admin' || req.user?.role === 'Admin';

    const reply = await Reply.findByPk(id);

    if (!reply) {
      throw ApiError.notFound('Reply not found');
    }

    if (!isAdmin && reply.user_id !== user_id) {
      throw ApiError.forbidden('You can only delete your own replies');
    }

    await reply.destroy();

    res.success(null, 'Reply deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get replies by user ID
 */
export const getRepliesByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const replies = await Reply.findAll({
      where: { user_id: userId },
      include: [{
        model: ReviewAndRating,
        as: 'review',
        attributes: ['id', 'rating', 'comment']
      }],
      order: [['created_at', 'DESC']]
    });

    res.success(replies);
  } catch (error) {
    next(error);
  }
};
