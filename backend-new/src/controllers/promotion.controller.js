/**
 * Promotion Controller
 * Handles promotion operations
 */
import { sequelize } from '../models/index.js';
import { ApiError } from '../utils/api-error.js';
import { extractProcedureResult, extractSingleResult } from '../utils/helpers.js';
import logger from '../config/logger.js';

/**
 * Create a promotion
 */
export const createPromotion = async (req, res, next) => {
  try {
    const {
      business_id,
      title,
      description,
      promotion_type,
      discount_value,
      discount_type,
      start_date,
      end_date,
      terms_conditions,
      image_url,
      is_featured = false,
      usage_limit
    } = req.body;

    const id = crypto.randomUUID();
    await sequelize.query(
      'CALL InsertPromotion(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      {
        replacements: [
          id, business_id, title, description, promotion_type,
          discount_value, discount_type, start_date, end_date,
          terms_conditions, image_url, is_featured
        ]
      }
    );

    if (usage_limit) {
      await sequelize.query(
        'UPDATE promotions SET usage_limit = ? WHERE id = ?',
        { replacements: [usage_limit, id] }
      );
    }

    const queryResult = await sequelize.query('CALL GetPromotionById(?)', {
      replacements: [id]
    });
    const result = extractSingleResult(queryResult);

    res.status(201).success(result, 'Promotion created successfully');
  } catch (error) {
    logger.error('Error creating promotion:', error);
    next(error);
  }
};

/**
 * Get promotion by ID
 */
export const getPromotion = async (req, res, next) => {
  try {
    const { id } = req.params;

    const queryResult = await sequelize.query('CALL GetPromotionById(?)', {
      replacements: [id]
    });
    const result = extractSingleResult(queryResult);

    if (!result) {
      throw ApiError.notFound('Promotion not found');
    }

    res.success(result);
  } catch (error) {
    logger.error('Error fetching promotion:', error);
    next(error);
  }
};

/**
 * Get promotions for a business
 */
export const getBusinessPromotions = async (req, res, next) => {
  try {
    const { businessId } = req.params;
    const { page = 1, limit = 10, isActive } = req.query;

    const queryResult = await sequelize.query('CALL GetPromotionsByBusinessId(?)', {
      replacements: [businessId]
    });
    const results = extractProcedureResult(queryResult);

    let filtered = results;
    if (isActive === 'true') {
      const now = new Date();
      filtered = filtered.filter(p => {
        const startDate = new Date(p.start_date);
        const endDate = new Date(p.end_date);
        return p.is_active && startDate <= now && endDate >= now;
      });
    }

    // Apply pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const paginatedResults = filtered.slice(offset, offset + parseInt(limit));

    res.success({
      data: paginatedResults,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filtered.length
      }
    });
  } catch (error) {
    logger.error('Error fetching business promotions:', error);
    next(error);
  }
};

/**
 * Get active promotions
 */
export const getActivePromotions = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, featured } = req.query;

    const queryResult = await sequelize.query('CALL GetActivePromotions()');
    const results = extractProcedureResult(queryResult);

    let filtered = results;
    if (featured === 'true') {
      filtered = filtered.filter(p => p.is_featured);
    }

    // Apply pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const paginatedResults = filtered.slice(offset, offset + parseInt(limit));

    res.success({
      data: paginatedResults,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filtered.length
      }
    });
  } catch (error) {
    logger.error('Error fetching active promotions:', error);
    next(error);
  }
};

/**
 * Update promotion
 */
export const updatePromotion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      promotion_type,
      discount_value,
      discount_type,
      start_date,
      end_date,
      terms_conditions,
      image_url,
      is_featured,
      is_active,
      usage_limit
    } = req.body;

    await sequelize.query(
      'CALL UpdatePromotion(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      {
        replacements: [
          id, title, description, promotion_type,
          discount_value, discount_type, start_date, end_date,
          terms_conditions, image_url, is_featured, is_active
        ]
      }
    );

    if (usage_limit !== undefined) {
      await sequelize.query(
        'UPDATE promotions SET usage_limit = ? WHERE id = ?',
        { replacements: [usage_limit, id] }
      );
    }

    const queryResult = await sequelize.query('CALL GetPromotionById(?)', {
      replacements: [id]
    });
    const result = extractSingleResult(queryResult);

    res.success(result, 'Promotion updated successfully');
  } catch (error) {
    logger.error('Error updating promotion:', error);
    next(error);
  }
};

/**
 * Delete promotion
 */
export const deletePromotion = async (req, res, next) => {
  try {
    const { id } = req.params;

    await sequelize.query('CALL DeletePromotion(?)', {
      replacements: [id]
    });

    res.success(null, 'Promotion deleted successfully');
  } catch (error) {
    logger.error('Error deleting promotion:', error);
    next(error);
  }
};

/**
 * Use promotion (increment usage)
 */
export const usePromotion = async (req, res, next) => {
  try {
    const { id } = req.params;

    await sequelize.query('CALL IncrementPromotionUsage(?)', {
      replacements: [id]
    });

    const queryResult = await sequelize.query('CALL GetPromotionById(?)', {
      replacements: [id]
    });
    const result = extractSingleResult(queryResult);

    res.success(result, 'Promotion usage recorded');
  } catch (error) {
    logger.error('Error using promotion:', error);
    next(error);
  }
};

/**
 * Toggle promotion status
 */
export const togglePromotionStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existingQuery = await sequelize.query('CALL GetPromotionById(?)', {
      replacements: [id]
    });
    const existing = extractSingleResult(existingQuery);

    if (!existing) {
      throw ApiError.notFound('Promotion not found');
    }

    const newStatus = !existing.is_active;

    await sequelize.query(
      'UPDATE promotions SET is_active = ? WHERE id = ?',
      { replacements: [newStatus, id] }
    );

    const queryResult = await sequelize.query('CALL GetPromotionById(?)', {
      replacements: [id]
    });
    const result = extractSingleResult(queryResult);

    res.success(result, `Promotion ${newStatus ? 'activated' : 'deactivated'}`);
  } catch (error) {
    logger.error('Error toggling promotion status:', error);
    next(error);
  }
};

/**
 * Toggle featured status
 */
export const toggleFeatured = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existingQuery = await sequelize.query('CALL GetPromotionById(?)', {
      replacements: [id]
    });
    const existing = extractSingleResult(existingQuery);

    if (!existing) {
      throw ApiError.notFound('Promotion not found');
    }

    const newFeatured = !existing.is_featured;

    await sequelize.query(
      'UPDATE promotions SET is_featured = ? WHERE id = ?',
      { replacements: [newFeatured, id] }
    );

    const queryResult = await sequelize.query('CALL GetPromotionById(?)', {
      replacements: [id]
    });
    const result = extractSingleResult(queryResult);

    res.success(result, `Promotion ${newFeatured ? 'featured' : 'unfeatured'}`);
  } catch (error) {
    logger.error('Error toggling featured status:', error);
    next(error);
  }
};

/**
 * Get featured promotions
 */
export const getFeaturedPromotions = async (req, res, next) => {
  try {
    const { limit = 5 } = req.query;

    const queryResult = await sequelize.query('CALL GetActivePromotions()');
    const results = extractProcedureResult(queryResult);

    const featured = results.filter(p => p.is_featured).slice(0, parseInt(limit));

    res.success(featured);
  } catch (error) {
    logger.error('Error fetching featured promotions:', error);
    next(error);
  }
};

export default {
  createPromotion,
  getPromotion,
  getBusinessPromotions,
  getActivePromotions,
  updatePromotion,
  deletePromotion,
  usePromotion,
  togglePromotionStatus,
  toggleFeatured,
  getFeaturedPromotions
};
