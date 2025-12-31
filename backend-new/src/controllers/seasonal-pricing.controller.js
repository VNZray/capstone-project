/**
 * Seasonal Pricing Controller
 * Handles seasonal pricing configurations for rooms
 */
import { sequelize } from '../models/index.js';
import { ApiError } from '../utils/api-error.js';
import { extractProcedureResult, extractSingleResult } from '../utils/helpers.js';
import { v4 as uuidv4 } from 'uuid';
import logger from '../config/logger.js';

// Note: Using raw queries since seasonal pricing may use stored procedures
// Model can be created if needed based on actual table structure

/**
 * Get all seasonal pricing configurations
 */
export const getAllSeasonalPricing = async (req, res, next) => {
  try {
    const queryResult = await sequelize.query('CALL GetAllSeasonalPricing()');
    const results = extractProcedureResult(queryResult);
    res.success(results);
  } catch (error) {
    next(error);
  }
};

/**
 * Get seasonal pricing by ID
 */
export const getSeasonalPricingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const queryResult = await sequelize.query('CALL GetSeasonalPricingById(?)', {
      replacements: [id]
    });
    const result = extractSingleResult(queryResult);

    if (!result) {
      throw ApiError.notFound('Seasonal pricing not found');
    }

    res.success(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get seasonal pricing by business ID
 */
export const getSeasonalPricingByBusinessId = async (req, res, next) => {
  try {
    const { businessId } = req.params;
    const queryResult = await sequelize.query('CALL GetSeasonalPricingByBusinessId(?)', {
      replacements: [businessId]
    });
    const results = extractProcedureResult(queryResult);

    res.success(results);
  } catch (error) {
    next(error);
  }
};

/**
 * Get seasonal pricing by room ID
 */
export const getSeasonalPricingByRoomId = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const queryResult = await sequelize.query('CALL GetSeasonalPricingByRoomId(?)', {
      replacements: [roomId]
    });
    const result = extractSingleResult(queryResult);

    if (!result) {
      throw ApiError.notFound('No seasonal pricing configured for this room');
    }

    res.success(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Create seasonal pricing configuration
 */
export const createSeasonalPricing = async (req, res, next) => {
  try {
    const {
      business_id,
      room_id = null,
      base_price,
      weekend_price = null,
      weekend_days = null,
      peak_season_price = null,
      peak_season_months = null,
      high_season_price = null,
      high_season_months = null,
      low_season_price = null,
      low_season_months = null,
      is_active = true
    } = req.body;

    if (!business_id) {
      throw ApiError.badRequest('business_id is required');
    }

    if (base_price === undefined || base_price === null) {
      throw ApiError.badRequest('base_price is required');
    }

    const id = uuidv4();

    const queryResult = await sequelize.query(
      'CALL InsertSeasonalPricing(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      {
        replacements: [
          id,
          business_id,
          room_id,
          base_price,
          weekend_price,
          weekend_days ? JSON.stringify(weekend_days) : null,
          peak_season_price,
          peak_season_months ? JSON.stringify(peak_season_months) : null,
          high_season_price,
          high_season_months ? JSON.stringify(high_season_months) : null,
          low_season_price,
          low_season_months ? JSON.stringify(low_season_months) : null,
          is_active
        ]
      }
    );
    const result = extractSingleResult(queryResult);

    res.created(result || { id }, 'Seasonal pricing created successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update seasonal pricing configuration
 */
export const updateSeasonalPricing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      base_price,
      weekend_price,
      weekend_days,
      peak_season_price,
      peak_season_months,
      high_season_price,
      high_season_months,
      low_season_price,
      low_season_months,
      is_active
    } = req.body;

    const queryResult = await sequelize.query(
      'CALL UpdateSeasonalPricing(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      {
        replacements: [
          id,
          base_price ?? null,
          weekend_price ?? null,
          weekend_days ? JSON.stringify(weekend_days) : null,
          peak_season_price ?? null,
          peak_season_months ? JSON.stringify(peak_season_months) : null,
          high_season_price ?? null,
          high_season_months ? JSON.stringify(high_season_months) : null,
          low_season_price ?? null,
          low_season_months ? JSON.stringify(low_season_months) : null,
          is_active ?? true
        ]
      }
    );
    const result = extractSingleResult(queryResult);

    res.success(result || { id }, 'Seasonal pricing updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete seasonal pricing configuration
 */
export const deleteSeasonalPricing = async (req, res, next) => {
  try {
    const { id } = req.params;

    await sequelize.query('CALL DeleteSeasonalPricing(?)', {
      replacements: [id]
    });

    res.success(null, 'Seasonal pricing deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Calculate price for a specific date
 */
export const calculatePriceForDate = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { date } = req.query;

    if (!date) {
      throw ApiError.badRequest('date is required');
    }

    const queryResult = await sequelize.query('CALL CalculatePriceForDate(?, ?)', {
      replacements: [roomId, date]
    });
    const result = extractSingleResult(queryResult);

    res.success(result || { room_id: roomId, date, price: null });
  } catch (error) {
    next(error);
  }
};

/**
 * Calculate total price for a date range
 */
export const calculatePriceForRange = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      throw ApiError.badRequest('start_date and end_date are required');
    }

    const queryResult = await sequelize.query('CALL CalculatePriceForRange(?, ?, ?)', {
      replacements: [roomId, start_date, end_date]
    });
    const result = extractSingleResult(queryResult);

    res.success(result || {
      room_id: roomId,
      start_date,
      end_date,
      total_price: null,
      breakdown: []
    });
  } catch (error) {
    next(error);
  }
};
