/**
 * Favorite Controller
 * Handles favorite operations
 */
import { sequelize } from '../models/index.js';
import { ApiError } from '../utils/api-error.js';
import { extractProcedureResult, extractSingleResult } from '../utils/helpers.js';
import logger from '../config/logger.js';

/**
 * Add to favorites
 */
export const addFavorite = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const touristId = req.user.tourist_id;
    const { favoriteType, favoriteId } = req.body;

    if (!touristId) {
      throw ApiError.forbidden('Only tourists can add favorites');
    }

    const id = crypto.randomUUID();
    await sequelize.query(
      'CALL InsertFavorite(?, ?, ?, ?)',
      { replacements: [id, touristId, favoriteType, favoriteId] }
    );

    const queryResult = await sequelize.query('CALL GetFavoriteById(?)', {
      replacements: [id]
    });
    const result = extractSingleResult(queryResult);

    res.status(201).success(result, 'Added to favorites');
  } catch (error) {
    logger.error('Error adding favorite:', error);
    next(error);
  }
};

/**
 * Remove from favorites
 */
export const removeFavorite = async (req, res, next) => {
  try {
    const touristId = req.user.tourist_id;
    const { favoriteType, favoriteId } = req.body;

    if (!touristId) {
      throw ApiError.forbidden('Only tourists can remove favorites');
    }

    await sequelize.query(
      'CALL DeleteFavoriteByTargetAndTourist(?, ?, ?)',
      { replacements: [touristId, favoriteType, favoriteId] }
    );

    res.success(null, 'Removed from favorites');
  } catch (error) {
    logger.error('Error removing favorite:', error);
    next(error);
  }
};

/**
 * Toggle favorite
 */
export const toggleFavorite = async (req, res, next) => {
  try {
    const touristId = req.user.tourist_id;
    const { favoriteType, favoriteId } = req.body;

    if (!touristId) {
      throw ApiError.forbidden('Only tourists can toggle favorites');
    }

    const queryResult = await sequelize.query(
      'CALL ToggleFavorite(?, ?, ?)',
      { replacements: [touristId, favoriteType, favoriteId] }
    );
    const result = extractSingleResult(queryResult);

    const isFavorited = result?.is_favorited === 1;

    res.success(
      { isFavorited },
      isFavorited ? 'Added to favorites' : 'Removed from favorites'
    );
  } catch (error) {
    logger.error('Error toggling favorite:', error);
    next(error);
  }
};

/**
 * Check if favorited
 */
export const checkFavorite = async (req, res, next) => {
  try {
    const touristId = req.user.tourist_id;
    const { favoriteType, favoriteId } = req.query;

    if (!touristId) {
      res.success({ isFavorited: false });
      return;
    }

    const queryResult = await sequelize.query(
      'CALL CheckIsFavorite(?, ?, ?)',
      { replacements: [touristId, favoriteType, favoriteId] }
    );
    const result = extractSingleResult(queryResult);

    const isFavorited = result?.is_favorite === 1;

    res.success({ isFavorited });
  } catch (error) {
    logger.error('Error checking favorite:', error);
    next(error);
  }
};

/**
 * Get favorites by type
 */
export const getFavoritesByType = async (req, res, next) => {
  try {
    const touristId = req.user.tourist_id;
    const { type } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!touristId) {
      throw ApiError.notFound('Tourist profile not found');
    }

    const queryResult = await sequelize.query(
      'CALL GetFavoritesByTouristAndType(?, ?)',
      { replacements: [touristId, type] }
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
    logger.error('Error fetching favorites by type:', error);
    next(error);
  }
};

/**
 * Get all favorites
 */
export const getAllFavorites = async (req, res, next) => {
  try {
    const touristId = req.user.tourist_id;
    const { page = 1, limit = 20 } = req.query;

    if (!touristId) {
      throw ApiError.notFound('Tourist profile not found');
    }

    const queryResult = await sequelize.query('CALL GetFavoritesByTouristId(?)', {
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
    logger.error('Error fetching all favorites:', error);
    next(error);
  }
};

/**
 * Get favorite count for an item
 */
export const getFavoriteCount = async (req, res, next) => {
  try {
    const { favoriteType, favoriteId } = req.params;

    const [results] = await sequelize.query(
      'SELECT COUNT(*) as count FROM favorites WHERE favorite_type = ? AND favorite_id = ?',
      { replacements: [favoriteType, favoriteId] }
    );

    res.success({ count: results[0]?.count || 0 });
  } catch (error) {
    logger.error('Error fetching favorite count:', error);
    next(error);
  }
};

/**
 * Clear all favorites
 */
export const clearFavorites = async (req, res, next) => {
  try {
    const touristId = req.user.tourist_id;
    const { type } = req.query;

    if (!touristId) {
      throw ApiError.notFound('Tourist profile not found');
    }

    let query = 'DELETE FROM favorites WHERE tourist_id = ?';
    const replacements = [touristId];

    if (type) {
      query += ' AND favorite_type = ?';
      replacements.push(type);
    }

    const [result] = await sequelize.query(query, { replacements });
    const deleted = result?.affectedRows || 0;

    res.success({ deleted }, `${deleted} favorites cleared`);
  } catch (error) {
    logger.error('Error clearing favorites:', error);
    next(error);
  }
};

export default {
  addFavorite,
  removeFavorite,
  toggleFavorite,
  checkFavorite,
  getFavoritesByType,
  getAllFavorites,
  getFavoriteCount,
  clearFavorites
};
