/**
 * Staff Controller
 * Handles staff management operations
 */
import { sequelize } from '../models/index.js';
import { ApiError } from '../utils/api-error.js';
import { extractProcedureResult, extractSingleResult } from '../utils/helpers.js';
import logger from '../config/logger.js';

/**
 * Create staff member
 */
export const createStaff = async (req, res, next) => {
  try {
    const { user_id, business_id, role, position } = req.body;

    const id = crypto.randomUUID();
    await sequelize.query(
      'CALL InsertStaff(?, ?, ?, ?, ?)',
      { replacements: [id, user_id, business_id, role, position] }
    );

    const queryResult = await sequelize.query('CALL GetStaffById(?)', {
      replacements: [id]
    });
    const result = extractSingleResult(queryResult);

    res.status(201).success(result, 'Staff member created successfully');
  } catch (error) {
    logger.error('Error creating staff:', error);
    next(error);
  }
};

/**
 * Get staff by ID
 */
export const getStaff = async (req, res, next) => {
  try {
    const { id } = req.params;

    const queryResult = await sequelize.query('CALL GetStaffById(?)', {
      replacements: [id]
    });
    const result = extractSingleResult(queryResult);

    if (!result) {
      throw ApiError.notFound('Staff member not found');
    }

    res.success(result);
  } catch (error) {
    logger.error('Error fetching staff:', error);
    next(error);
  }
};

/**
 * Get staff for a business
 */
export const getBusinessStaff = async (req, res, next) => {
  try {
    const { businessId } = req.params;
    const { page = 1, limit = 10, status, search } = req.query;

    let results;
    if (status === 'active') {
      const queryResult = await sequelize.query('CALL GetActiveStaffByBusinessId(?)', {
        replacements: [businessId]
      });
      results = extractProcedureResult(queryResult);
    } else {
      const queryResult = await sequelize.query('CALL GetStaffByBusinessId(?)', {
        replacements: [businessId]
      });
      results = extractProcedureResult(queryResult);
    }

    // Apply filters
    let filtered = results;
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(s =>
        s.position?.toLowerCase().includes(searchLower) ||
        s.role?.toLowerCase().includes(searchLower)
      );
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
    logger.error('Error fetching business staff:', error);
    next(error);
  }
};

/**
 * Update staff member
 */
export const updateStaff = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, position, is_active } = req.body;

    await sequelize.query(
      'CALL UpdateStaff(?, ?, ?, ?)',
      { replacements: [id, role, position, is_active] }
    );

    const queryResult = await sequelize.query('CALL GetStaffById(?)', {
      replacements: [id]
    });
    const result = extractSingleResult(queryResult);

    res.success(result, 'Staff member updated successfully');
  } catch (error) {
    logger.error('Error updating staff:', error);
    next(error);
  }
};

/**
 * Update staff status
 */
export const updateStaffStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (status === 'inactive') {
      await sequelize.query('CALL DeactivateStaff(?)', {
        replacements: [id]
      });
    } else {
      await sequelize.query(
        'CALL UpdateStaff(?, NULL, NULL, ?)',
        { replacements: [id, true] }
      );
    }

    const queryResult = await sequelize.query('CALL GetStaffById(?)', {
      replacements: [id]
    });
    const result = extractSingleResult(queryResult);

    res.success(result, `Staff status updated to ${status}`);
  } catch (error) {
    logger.error('Error updating staff status:', error);
    next(error);
  }
};

/**
 * Remove staff member
 */
export const removeStaff = async (req, res, next) => {
  try {
    const { id } = req.params;

    await sequelize.query('CALL DeleteStaff(?)', {
      replacements: [id]
    });

    res.success(null, 'Staff member removed successfully');
  } catch (error) {
    logger.error('Error removing staff:', error);
    next(error);
  }
};

/**
 * Invite staff member
 */
export const inviteStaff = async (req, res, next) => {
  try {
    const { businessId } = req.params;
    const { email, role, position } = req.body;

    const id = crypto.randomUUID();
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await sequelize.query(
      'CALL InsertStaffOnboarding(?, ?, ?, ?, ?, ?)',
      { replacements: [id, businessId, email, role, token, expiresAt] }
    );

    const queryResult = await sequelize.query('CALL GetStaffOnboardingById(?)', {
      replacements: [id]
    });
    const result = extractSingleResult(queryResult);

    res.status(201).success(result, 'Staff invitation sent');
  } catch (error) {
    logger.error('Error inviting staff:', error);
    next(error);
  }
};

/**
 * Get my staff profile
 */
export const getMyStaffProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const queryResult = await sequelize.query('CALL GetStaffByUserId(?)', {
      replacements: [userId]
    });
    const result = extractSingleResult(queryResult);

    if (!result) {
      throw ApiError.notFound('Staff profile not found');
    }

    res.success(result);
  } catch (error) {
    logger.error('Error fetching my staff profile:', error);
    next(error);
  }
};

/**
 * Get staff count for business
 */
export const getStaffCount = async (req, res, next) => {
  try {
    const { businessId } = req.params;
    const { status } = req.query;

    let results;
    if (status === 'active') {
      const queryResult = await sequelize.query('CALL GetActiveStaffByBusinessId(?)', {
        replacements: [businessId]
      });
      results = extractProcedureResult(queryResult);
    } else {
      const queryResult = await sequelize.query('CALL GetStaffByBusinessId(?)', {
        replacements: [businessId]
      });
      results = extractProcedureResult(queryResult);
    }

    res.success({ count: results.length });
  } catch (error) {
    logger.error('Error fetching staff count:', error);
    next(error);
  }
};

export default {
  createStaff,
  getStaff,
  getBusinessStaff,
  updateStaff,
  updateStaffStatus,
  removeStaff,
  inviteStaff,
  getMyStaffProfile,
  getStaffCount
};
