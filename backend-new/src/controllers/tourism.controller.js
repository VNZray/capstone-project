/**
 * Tourism Controller
 * Tourism staff profile management via stored procedures
 */
import { sequelize } from '../models/index.js';
import { ApiError } from '../utils/api-error.js';
import { extractProcedureResult, extractSingleResult } from '../utils/helpers.js';
import logger from '../config/logger.js';
import { v4 as uuidv4 } from 'uuid';

// Tourism fields in order expected by stored procedures
const TOURISM_FIELDS = [
  'first_name',
  'middle_name',
  'last_name',
  'position',
  'user_id'
];

const buildTourismParams = (id, body) => [
  id,
  ...TOURISM_FIELDS.map(f => body?.[f] ?? null)
];

/**
 * Get all tourism staff
 */
export const getAllTourism = async (req, res, next) => {
  try {
    const queryResult = await sequelize.query('CALL GetAllTourism()');
    const results = extractProcedureResult(queryResult);
    res.success(results);
  } catch (error) {
    logger.error('Error fetching tourism staff:', error);
    next(error);
  }
};

/**
 * Get tourism by ID
 */
export const getTourismById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const queryResult = await sequelize.query('CALL GetTourismById(?)', {
      replacements: [id]
    });
    const result = extractSingleResult(queryResult);

    if (!result) {
      throw ApiError.notFound('Tourism staff not found');
    }

    res.success(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get tourism by user ID
 */
export const getTourismByUserId = async (req, res, next) => {
  const { user_id } = req.params;
  try {
    const queryResult = await sequelize.query('CALL GetTourismByUserId(?)', {
      replacements: [user_id]
    });
    const result = extractSingleResult(queryResult);

    if (!result) {
      throw ApiError.notFound('Tourism staff not found');
    }

    res.success(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Create tourism staff
 */
export const createTourism = async (req, res, next) => {
  try {
    const id = req.body.id || uuidv4();
    const params = buildTourismParams(id, req.body);

    const queryResult = await sequelize.query(
      `CALL InsertTourism(${params.map(() => '?').join(', ')})`,
      { replacements: params }
    );
    const result = extractSingleResult(queryResult);

    if (!result) {
      throw ApiError.internalError('Failed to create tourism staff');
    }

    logger.info(`Tourism staff created: ${id}`);

    res.created(result, 'Tourism staff created successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update tourism staff
 */
export const updateTourism = async (req, res, next) => {
  const { id } = req.params;
  try {
    const params = buildTourismParams(id, req.body);

    const queryResult = await sequelize.query(
      `CALL UpdateTourism(${params.map(() => '?').join(', ')})`,
      { replacements: params }
    );
    const result = extractSingleResult(queryResult);

    if (!result) {
      throw ApiError.notFound('Tourism staff not found');
    }

    logger.info(`Tourism staff updated: ${id}`);

    res.success(result, 'Tourism staff updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete tourism staff
 */
export const deleteTourism = async (req, res, next) => {
  const { id } = req.params;
  try {
    await sequelize.query('CALL DeleteTourism(?)', {
      replacements: [id]
    });

    // Confirm deletion
    const checkQuery = await sequelize.query('CALL GetTourismById(?)', {
      replacements: [id]
    });
    const check = extractSingleResult(checkQuery);

    if (check) {
      throw ApiError.internalError('Tourism staff not deleted');
    }

    logger.info(`Tourism staff deleted: ${id}`);

    res.success({ message: 'Tourism staff deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export default {
  getAllTourism,
  getTourismById,
  getTourismByUserId,
  createTourism,
  updateTourism,
  deleteTourism
};
