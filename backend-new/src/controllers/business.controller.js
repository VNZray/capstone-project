/**
 * Business Controller
 * Handles business management via stored procedures
 */
import { sequelize } from '../models/index.js';
import { ApiError } from '../utils/api-error.js';
import { extractProcedureResult, extractSingleResult } from '../utils/helpers.js';
import logger from '../config/logger.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Get all businesses
 */
export const getAllBusiness = async (req, res, next) => {
  try {
    const queryResult = await sequelize.query('CALL GetAllBusinesses()');
    const businessList = extractProcedureResult(queryResult);

    // Add placeholder category data
    const businesses = businessList.map(business => ({
      ...business,
      categories: [],
      category_ids: []
    }));

    res.success(businesses);
  } catch (error) {
    logger.error('Error fetching businesses:', error);
    next(error);
  }
};

/**
 * Get business by owner ID
 */
export const getBusinessByOwnerId = async (req, res, next) => {
  const { id } = req.params;
  try {
    const queryResult = await sequelize.query('CALL GetBusinessByOwnerId(?)', {
      replacements: [id]
    });
    const results = extractProcedureResult(queryResult);

    if (results.length === 0) {
      throw ApiError.notFound('Business not found');
    }

    res.success(results);
  } catch (error) {
    next(error);
  }
};

/**
 * Get business by ID
 */
export const getBusinessById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const queryResult = await sequelize.query('CALL GetBusinessById(?)', {
      replacements: [id]
    });
    const result = extractSingleResult(queryResult);

    if (!result) {
      throw ApiError.notFound('Business not found');
    }

    res.success(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Insert a new business
 */
export const insertBusiness = async (req, res, next) => {
  try {
    const id = uuidv4();

    const params = [
      id,
      req.body.business_name ?? null,
      req.body.description ?? null,
      req.body.min_price ?? null,
      req.body.max_price ?? null,
      req.body.email ?? null,
      req.body.phone_number ?? null,
      req.body.barangay_id ?? null,
      req.body.address ?? null,
      req.body.owner_id ?? null,
      req.body.status ?? null,
      req.body.business_image ?? null,
      req.body.latitude ?? null,
      req.body.longitude ?? null,
      req.body.website_url ?? null,
      req.body.facebook_url ?? null,
      req.body.instagram_url ?? null,
      req.body.hasBooking ?? null,
      req.body.hasStore ?? null
    ];

    const queryResult = await sequelize.query(
      'CALL InsertBusiness(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      { replacements: params }
    );
    const businessResult = extractSingleResult(queryResult);

    logger.info(`Business created: ${id}`);

    res.created({
      message: 'Business created successfully',
      ...businessResult
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update business
 */
export const updateBusiness = async (req, res, next) => {
  const { id } = req.params;
  try {
    const params = [
      id,
      req.body.business_name ?? null,
      req.body.description ?? null,
      req.body.min_price ?? null,
      req.body.max_price ?? null,
      req.body.email ?? null,
      req.body.phone_number ?? null,
      req.body.barangay_id ?? null,
      req.body.address ?? null,
      req.body.owner_id ?? null,
      req.body.status ?? null,
      req.body.business_image ?? null,
      req.body.latitude ?? null,
      req.body.longitude ?? null,
      req.body.website_url ?? null,
      req.body.facebook_url ?? null,
      req.body.instagram_url ?? null,
      req.body.hasBooking ?? null,
      req.body.hasStore ?? null
    ];

    const queryResult = await sequelize.query(
      'CALL UpdateBusiness(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      { replacements: params }
    );
    const result = extractSingleResult(queryResult);

    if (!result) {
      throw ApiError.notFound('Business not found');
    }

    logger.info(`Business updated: ${id}`);

    res.success({
      message: 'Business updated successfully',
      ...result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete business
 */
export const deleteBusiness = async (req, res, next) => {
  const { id } = req.params;
  try {
    await sequelize.query('CALL DeleteBusiness(?)', {
      replacements: [id]
    });

    logger.info(`Business deleted: ${id}`);

    res.success({ message: 'Business deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all approved/active businesses
 */
export const getApprovedBusinesses = async (req, res, next) => {
  try {
    const queryResult = await sequelize.query('CALL GetBusinessesByStatus(?)', {
      replacements: ['Active']
    });
    const results = extractProcedureResult(queryResult);
    res.success(results);
  } catch (error) {
    next(error);
  }
};

/**
 * Get businesses by status
 */
export const getBusinessesByStatus = async (req, res, next) => {
  const { status } = req.params;
  try {
    const queryResult = await sequelize.query('CALL GetBusinessesByStatus(?)', {
      replacements: [status]
    });
    const results = extractProcedureResult(queryResult);
    res.success(results);
  } catch (error) {
    next(error);
  }
};

/**
 * Update business status
 */
export const updateBusinessStatus = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const queryResult = await sequelize.query('CALL UpdateBusinessStatus(?, ?)', {
      replacements: [id, status]
    });
    const result = extractSingleResult(queryResult);

    if (!result) {
      throw ApiError.notFound('Business not found');
    }

    logger.info(`Business ${id} status updated to ${status}`);

    res.success({
      message: 'Business status updated successfully',
      ...result
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getAllBusiness,
  getBusinessByOwnerId,
  getBusinessById,
  insertBusiness,
  updateBusiness,
  deleteBusiness,
  getApprovedBusinesses,
  getBusinessesByStatus,
  updateBusinessStatus
};
