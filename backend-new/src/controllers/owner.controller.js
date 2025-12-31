/**
 * Owner Controller
 * Owner profile management via stored procedures
 */
import { sequelize } from '../models/index.js';
import { ApiError } from '../utils/api-error.js';
import { extractProcedureResult, extractSingleResult } from '../utils/helpers.js';
import logger from '../config/logger.js';
import { v4 as uuidv4 } from 'uuid';

// Owner fields in order expected by stored procedures
const OWNER_FIELDS = [
  'first_name',
  'middle_name',
  'last_name',
  'age',
  'birthdate',
  'gender',
  'user_id'
];

const buildOwnerParams = (id, body) => [
  id,
  ...OWNER_FIELDS.map(f => body?.[f] ?? null)
];

/**
 * Get all owners
 */
export const getAllOwners = async (req, res, next) => {
  try {
    const queryResult = await sequelize.query('CALL GetAllOwners()');
    const results = extractProcedureResult(queryResult);
    res.success(results);
  } catch (error) {
    logger.error('Error fetching owners:', error);
    next(error);
  }
};

/**
 * Get owner by ID
 */
export const getOwnerById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const queryResult = await sequelize.query('CALL GetOwnerById(?)', {
      replacements: [id]
    });
    const result = extractSingleResult(queryResult);

    if (!result) {
      throw ApiError.notFound('Owner not found');
    }

    res.success(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get owner by user ID
 */
export const getOwnerByUserId = async (req, res, next) => {
  const { user_id } = req.params;
  try {
    const queryResult = await sequelize.query('CALL GetOwnerByUserId(?)', {
      replacements: [user_id]
    });
    const result = extractSingleResult(queryResult);

    if (!result) {
      throw ApiError.notFound('Owner not found');
    }

    res.success(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Create owner
 */
export const insertOwner = async (req, res, next) => {
  try {
    const id = req.body.id || uuidv4();
    const params = buildOwnerParams(id, req.body);

    const queryResult = await sequelize.query(
      `CALL InsertOwner(${params.map(() => '?').join(', ')})`,
      { replacements: params }
    );
    const result = extractSingleResult(queryResult);

    if (!result) {
      throw ApiError.internalError('Failed to create owner');
    }

    logger.info(`Owner created: ${id}`);

    res.created(result, 'Owner created successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update owner
 */
export const updateOwnerById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const params = buildOwnerParams(id, req.body);

    const queryResult = await sequelize.query(
      `CALL UpdateOwner(${params.map(() => '?').join(', ')})`,
      { replacements: params }
    );
    const result = extractSingleResult(queryResult);

    if (!result) {
      throw ApiError.notFound('Owner not found');
    }

    logger.info(`Owner updated: ${id}`);

    res.success(result, 'Owner updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete owner
 */
export const deleteOwnerById = async (req, res, next) => {
  const { id } = req.params;
  try {
    await sequelize.query('CALL DeleteOwner(?)', {
      replacements: [id]
    });

    // Confirm deletion
    const checkQuery = await sequelize.query('CALL GetOwnerById(?)', {
      replacements: [id]
    });
    const check = extractSingleResult(checkQuery);

    if (check) {
      throw ApiError.internalError('Owner not deleted');
    }

    logger.info(`Owner deleted: ${id}`);

    res.success({ message: 'Owner deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export default {
  getAllOwners,
  getOwnerById,
  getOwnerByUserId,
  insertOwner,
  updateOwnerById,
  deleteOwnerById
};