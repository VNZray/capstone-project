/**
 * Tourist Controller
 * Tourist profile management via stored procedures
 */
import { sequelize } from '../models/index.js';
import { ApiError } from '../utils/api-error.js';
import { extractProcedureResult, extractSingleResult } from '../utils/helpers.js';
import logger from '../config/logger.js';
import { v4 as uuidv4 } from 'uuid';

// Tourist fields in order expected by stored procedures
const TOURIST_FIELDS = [
  'first_name',
  'middle_name',
  'last_name',
  'ethnicity',
  'birthdate',
  'age',
  'gender',
  'nationality',
  'origin',
  'user_id'
];

const buildTouristParams = (id, body) => [
  id,
  ...TOURIST_FIELDS.map(f => body?.[f] ?? null)
];

/**
 * Get all tourists
 */
export const getAllTourists = async (req, res, next) => {
  try {
    const queryResult = await sequelize.query('CALL GetAllTourists()');
    const results = extractProcedureResult(queryResult);
    res.success(results);
  } catch (error) {
    logger.error('Error fetching tourists:', error);
    next(error);
  }
};

/**
 * Get tourist by ID
 */
export const getTouristById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const queryResult = await sequelize.query('CALL GetTouristById(?)', {
      replacements: [id]
    });
    const result = extractSingleResult(queryResult);

    if (!result) {
      throw ApiError.notFound('Tourist not found');
    }

    res.success(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get tourist by user ID
 */
export const getTouristByUserId = async (req, res, next) => {
  const { user_id } = req.params;
  try {
    const queryResult = await sequelize.query('CALL GetTouristByUserId(?)', {
      replacements: [user_id]
    });
    const result = extractSingleResult(queryResult);

    if (!result) {
      throw ApiError.notFound('Tourist not found');
    }

    res.success(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Create tourist
 */
export const createTourist = async (req, res, next) => {
  try {
    const id = req.body.id || uuidv4();
    const params = buildTouristParams(id, req.body);

    const queryResult = await sequelize.query(
      `CALL InsertTourist(${params.map(() => '?').join(', ')})`,
      { replacements: params }
    );
    const result = extractSingleResult(queryResult);

    if (!result) {
      throw ApiError.internalError('Failed to create tourist');
    }

    logger.info(`Tourist created: ${id}`);

    res.created(result, 'Tourist created successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update tourist
 */
export const updateTourist = async (req, res, next) => {
  const { id } = req.params;
  try {
    const params = buildTouristParams(id, req.body);

    const queryResult = await sequelize.query(
      `CALL UpdateTourist(${params.map(() => '?').join(', ')})`,
      { replacements: params }
    );
    const result = extractSingleResult(queryResult);

    if (!result) {
      throw ApiError.notFound('Tourist not found');
    }

    logger.info(`Tourist updated: ${id}`);

    res.success(result, 'Tourist updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete tourist
 */
export const deleteTourist = async (req, res, next) => {
  const { id } = req.params;
  try {
    await sequelize.query('CALL DeleteTourist(?)', {
      replacements: [id]
    });

    // Confirm deletion
    const checkQuery = await sequelize.query('CALL GetTouristById(?)', {
      replacements: [id]
    });
    const check = extractSingleResult(checkQuery);

    if (check) {
      throw ApiError.internalError('Tourist not deleted');
    }

    logger.info(`Tourist deleted: ${id}`);

    res.success({ message: 'Tourist deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export default {
  getAllTourists,
  getTouristById,
  getTouristByUserId,
  createTourist,
  updateTourist,
  deleteTourist
};
