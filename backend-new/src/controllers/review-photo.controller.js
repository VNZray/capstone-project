/**
 * Review Photo Controller
 * Handles review photo management
 */
import { ReviewPhoto, ReviewAndRating, sequelize } from '../models/index.js';
import { ApiError } from '../utils/api-error.js';
import { v4 as uuidv4 } from 'uuid';
import logger from '../config/logger.js';

/**
 * Get all photos for a review
 */
export const getReviewPhotos = async (req, res, next) => {
  try {
    const { reviewId } = req.params;

    const photos = await ReviewPhoto.findAll({
      where: { review_id: reviewId },
      order: [['created_at', 'ASC']]
    });

    res.success(photos);
  } catch (error) {
    next(error);
  }
};

/**
 * Get review photo by ID
 */
export const getReviewPhotoById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const photo = await ReviewPhoto.findByPk(id);

    if (!photo) {
      throw ApiError.notFound('Review photo not found');
    }

    res.success(photo);
  } catch (error) {
    next(error);
  }
};

/**
 * Add photo to review
 */
export const addReviewPhoto = async (req, res, next) => {
  try {
    const { review_id, photo_url, caption } = req.body;

    if (!review_id || !photo_url) {
      throw ApiError.badRequest('review_id and photo_url are required');
    }

    // Verify review exists
    const review = await ReviewAndRating.findByPk(review_id);
    if (!review) {
      throw ApiError.notFound('Review not found');
    }

    const photo = await ReviewPhoto.create({
      id: uuidv4(),
      review_id,
      photo_url,
      caption
    });

    res.created(photo, 'Review photo added successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Add multiple photos to review
 */
export const addBulkReviewPhotos = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { review_id, photos } = req.body;

    if (!review_id || !photos || !Array.isArray(photos)) {
      throw ApiError.badRequest('review_id and photos array are required');
    }

    // Verify review exists
    const review = await ReviewAndRating.findByPk(review_id);
    if (!review) {
      throw ApiError.notFound('Review not found');
    }

    const createdPhotos = await Promise.all(
      photos.map(photo =>
        ReviewPhoto.create({
          id: uuidv4(),
          review_id,
          photo_url: photo.photo_url,
          caption: photo.caption
        }, { transaction })
      )
    );

    await transaction.commit();

    res.created(createdPhotos, 'Review photos added successfully');
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

/**
 * Update review photo
 */
export const updateReviewPhoto = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { photo_url, caption } = req.body;

    const photo = await ReviewPhoto.findByPk(id);

    if (!photo) {
      throw ApiError.notFound('Review photo not found');
    }

    await photo.update({
      photo_url: photo_url ?? photo.photo_url,
      caption: caption ?? photo.caption
    });

    res.success(photo, 'Review photo updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete review photo
 */
export const deleteReviewPhoto = async (req, res, next) => {
  try {
    const { id } = req.params;

    const photo = await ReviewPhoto.findByPk(id);

    if (!photo) {
      throw ApiError.notFound('Review photo not found');
    }

    await photo.destroy();

    res.success(null, 'Review photo deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete all photos for a review
 */
export const deleteAllReviewPhotos = async (req, res, next) => {
  try {
    const { reviewId } = req.params;

    await ReviewPhoto.destroy({
      where: { review_id: reviewId }
    });

    res.success(null, 'All review photos deleted successfully');
  } catch (error) {
    next(error);
  }
};
