/**
 * Permit Controller
 * Handles permit operations
 */
import { sequelize } from '../models/index.js';
import { ApiError } from '../utils/api-error.js';
import { extractProcedureResult, extractSingleResult } from '../utils/helpers.js';
import logger from '../config/logger.js';

/**
 * Create a permit
 */
export const createPermit = async (req, res, next) => {
  try {
    const {
      business_id,
      permit_type,
      permit_number,
      issuing_authority,
      issue_date,
      expiry_date,
      document_url,
      notes
    } = req.body;

    const id = crypto.randomUUID();
    await sequelize.query(
      'CALL InsertPermit(?, ?, ?, ?, ?, ?, ?, ?, ?)',
      {
        replacements: [
          id, business_id, permit_type, permit_number, issuing_authority,
          issue_date, expiry_date, document_url, notes
        ]
      }
    );

    const queryResult = await sequelize.query('CALL GetPermitById(?)', {
      replacements: [id]
    });
    const result = extractSingleResult(queryResult);

    res.status(201).success(result, 'Permit created successfully');
  } catch (error) {
    logger.error('Error creating permit:', error);
    next(error);
  }
};

/**
 * Get permit by ID
 */
export const getPermit = async (req, res, next) => {
  try {
    const { id } = req.params;

    const queryResult = await sequelize.query('CALL GetPermitById(?)', {
      replacements: [id]
    });
    const result = extractSingleResult(queryResult);

    if (!result) {
      throw ApiError.notFound('Permit not found');
    }

    res.success(result);
  } catch (error) {
    logger.error('Error fetching permit:', error);
    next(error);
  }
};

/**
 * Get permits for a business
 */
export const getBusinessPermits = async (req, res, next) => {
  try {
    const { businessId } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    const queryResult = await sequelize.query('CALL GetPermitsByBusinessId(?)', {
      replacements: [businessId]
    });
    const results = extractProcedureResult(queryResult);

    let filtered = results;
    if (status) {
      filtered = filtered.filter(p => p.status === status);
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
    logger.error('Error fetching business permits:', error);
    next(error);
  }
};

/**
 * Update permit
 */
export const updatePermit = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      permit_type,
      permit_number,
      issuing_authority,
      issue_date,
      expiry_date,
      document_url,
      notes
    } = req.body;

    await sequelize.query(
      'CALL UpdatePermit(?, ?, ?, ?, ?, ?, ?, ?)',
      {
        replacements: [
          id, permit_type, permit_number, issuing_authority,
          issue_date, expiry_date, document_url, notes
        ]
      }
    );

    const queryResult = await sequelize.query('CALL GetPermitById(?)', {
      replacements: [id]
    });
    const result = extractSingleResult(queryResult);

    res.success(result, 'Permit updated successfully');
  } catch (error) {
    logger.error('Error updating permit:', error);
    next(error);
  }
};

/**
 * Update permit status
 */
export const updatePermitStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await sequelize.query('CALL UpdatePermitStatus(?, ?)', {
      replacements: [id, status]
    });

    const queryResult = await sequelize.query('CALL GetPermitById(?)', {
      replacements: [id]
    });
    const result = extractSingleResult(queryResult);

    res.success(result, `Permit status updated to ${status}`);
  } catch (error) {
    logger.error('Error updating permit status:', error);
    next(error);
  }
};

/**
 * Delete permit
 */
export const deletePermit = async (req, res, next) => {
  try {
    const { id } = req.params;

    await sequelize.query('CALL DeletePermit(?)', {
      replacements: [id]
    });

    res.success(null, 'Permit deleted successfully');
  } catch (error) {
    logger.error('Error deleting permit:', error);
    next(error);
  }
};

/**
 * Get all permits (admin)
 */
export const getAllPermits = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, permitType } = req.query;

    const queryResult = await sequelize.query('CALL GetAllPermits()');
    const results = extractProcedureResult(queryResult);

    let filtered = results;
    if (status) {
      filtered = filtered.filter(p => p.status === status);
    }
    if (permitType) {
      filtered = filtered.filter(p => p.permit_type === permitType);
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
    logger.error('Error fetching all permits:', error);
    next(error);
  }
};

/**
 * Get pending permits (admin)
 */
export const getPendingPermits = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const queryResult = await sequelize.query('CALL GetPendingPermits()');
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
    logger.error('Error fetching pending permits:', error);
    next(error);
  }
};

/**
 * Get expiring permits
 */
export const getExpiringPermits = async (req, res, next) => {
  try {
    const { days = 30, businessId } = req.query;

    let results;
    if (businessId) {
      const queryResult = await sequelize.query('CALL GetPermitsByBusinessId(?)', {
        replacements: [businessId]
      });
      results = extractProcedureResult(queryResult);
    } else {
      const queryResult = await sequelize.query('CALL GetAllPermits()');
      results = extractProcedureResult(queryResult);
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + parseInt(days));

    const expiring = results.filter(p => {
      if (!p.expiry_date) return false;
      const expiryDate = new Date(p.expiry_date);
      return expiryDate <= cutoffDate && expiryDate >= new Date();
    });

    res.success(expiring);
  } catch (error) {
    logger.error('Error fetching expiring permits:', error);
    next(error);
  }
};

/**
 * Get permit types
 */
export const getPermitTypes = async (req, res, next) => {
  try {
    const permitTypes = [
      { value: 'business_permit', label: 'Business Permit' },
      { value: 'sanitary_permit', label: 'Sanitary Permit' },
      { value: 'fire_safety', label: 'Fire Safety Certificate' },
      { value: 'tourism_accreditation', label: 'DOT Accreditation' },
      { value: 'environmental_compliance', label: 'Environmental Compliance Certificate' },
      { value: 'building_permit', label: 'Building Permit' },
      { value: 'liquor_license', label: 'Liquor License' },
      { value: 'other', label: 'Other' }
    ];

    res.success(permitTypes);
  } catch (error) {
    logger.error('Error fetching permit types:', error);
    next(error);
  }
};

export default {
  createPermit,
  getPermit,
  getBusinessPermits,
  updatePermit,
  updatePermitStatus,
  deletePermit,
  getAllPermits,
  getPendingPermits,
  getExpiringPermits,
  getPermitTypes
};
