/**
 * Tourism Staff Management Controller
 * Admin routes for creating/managing tourism staff with user+profile in transaction
 */
import { sequelize } from '../models/index.js';
import { User, UserRole } from '../models/index.js';
import { ApiError } from '../utils/api-error.js';
import logger from '../config/logger.js';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { randomBytes } from 'crypto';
import { extractProcedureResult, extractSingleResult } from '../utils/helpers.js';

const toBool = (v, d = null) => (typeof v === 'boolean' ? v : d);

function generateTempPassword(len = 12) {
  return randomBytes(Math.ceil((len * 3) / 4)).toString('base64url').slice(0, len);
}

/**
 * List all tourism staff with user role info
 */
export const listTourismStaff = async (req, res, next) => {
  try {
    const queryResult = await sequelize.query('CALL GetTourismListWithUserRole()');
    const results = extractProcedureResult(queryResult);
    res.success(results);
  } catch (error) {
    logger.error('Error listing tourism staff:', error);
    next(error);
  }
};

/**
 * Get tourism staff by ID with user role info
 */
export const getTourismStaffById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const queryResult = await sequelize.query('CALL GetTourismWithUserRoleById(?)', {
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
 * Create tourism staff (user + tourism profile in transaction)
 */
export const createTourismStaff = async (req, res, next) => {
  const {
    email,
    phone_number,
    password,
    first_name,
    middle_name,
    last_name,
    position,
    user_role_id,
    role_name,
    is_verified = false,
    is_active = true,
    barangay_id = null
  } = req.body || {};

  if (!email || !phone_number || !first_name || !last_name) {
    throw ApiError.badRequest('email, phone_number, first_name, last_name are required');
  }

  const transaction = await sequelize.transaction();

  try {
    let resolvedRoleId = user_role_id ?? null;

    // Resolve role by name if not provided by ID
    if (!resolvedRoleId && role_name) {
      const role = await UserRole.findOne({
        where: sequelize.where(
          sequelize.fn('LOWER', sequelize.col('role_name')),
          role_name.toLowerCase()
        ),
        transaction
      });
      if (!role) {
        throw ApiError.notFound(`Role not found: ${role_name}`);
      }
      resolvedRoleId = role.id;
    }

    const userId = uuidv4();
    const rawPassword = password || generateTempPassword(12);
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // Insert user
    const userParams = [
      userId,
      email,
      phone_number,
      hashedPassword,
      null, // profile_url
      null, // otp
      !!is_verified,
      !!is_active,
      null, // otp_expires_at
      resolvedRoleId,
      barangay_id
    ];

    const [userResults] = await sequelize.query(
      'CALL InsertUser(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      { replacements: userParams, transaction }
    );

    const insertedUser = extractSingleResult(userResults);
    if (!insertedUser) {
      throw ApiError.internalError('Failed to insert user');
    }

    // Insert tourism profile
    const tourismId = uuidv4();
    const tourismParams = [
      tourismId,
      first_name,
      middle_name ?? null,
      last_name,
      position ?? null,
      userId
    ];

    const [tourismResults] = await sequelize.query(
      'CALL InsertTourism(?, ?, ?, ?, ?, ?)',
      { replacements: tourismParams, transaction }
    );

    const insertedTourism = extractSingleResult(tourismResults);
    if (!insertedTourism) {
      throw ApiError.internalError('Failed to insert tourism profile');
    }

    await transaction.commit();

    logger.info(`Tourism staff created: ${tourismId} (user: ${userId})`);

    res.created({
      message: 'Tourism staff created',
      user: {
        id: userId,
        email,
        phone_number,
        is_verified: !!is_verified,
        is_active: !!is_active,
        user_role_id: resolvedRoleId
      },
      tourism: insertedTourism,
      credentials: password ? undefined : { temporary_password: rawPassword }
    });
  } catch (error) {
    await transaction.rollback();

    // Handle duplicate key errors
    if (error.original?.code === 'ER_DUP_ENTRY') {
      throw ApiError.conflict('Email or phone number already exists');
    }

    next(error);
  }
};

/**
 * Update tourism staff (user + tourism profile)
 */
export const updateTourismStaff = async (req, res, next) => {
  const { id } = req.params;
  const {
    email,
    phone_number,
    password,
    first_name,
    middle_name,
    last_name,
    position,
    user_role_id,
    role_name,
    is_verified,
    is_active,
    barangay_id
  } = req.body || {};

  const transaction = await sequelize.transaction();

  try {
    // Get current tourism profile
    const tourismQuery = await sequelize.query('CALL GetTourismById(?)', {
      replacements: [id],
      transaction
    });

    const currentTourism = extractSingleResult(tourismQuery);
    if (!currentTourism) {
      await transaction.rollback();
      throw ApiError.notFound('Tourism staff not found');
    }

    const userId = currentTourism.user_id;
    let resolvedRoleId = user_role_id ?? null;

    // Resolve role by name if provided
    if (!resolvedRoleId && role_name) {
      const role = await UserRole.findOne({
        where: sequelize.where(
          sequelize.fn('LOWER', sequelize.col('role_name')),
          role_name.toLowerCase()
        ),
        transaction
      });
      if (!role) {
        throw ApiError.notFound(`Role not found: ${role_name}`);
      }
      resolvedRoleId = role.id;
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    // Update user
    const userParams = [
      userId,
      email ?? null,
      phone_number ?? null,
      hashedPassword,
      null,
      null,
      toBool(is_verified),
      toBool(is_active),
      null,
      resolvedRoleId,
      barangay_id ?? null
    ];

    const [userResults] = await sequelize.query(
      'CALL UpdateUser(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      { replacements: userParams, transaction }
    );

    const updatedUser = extractSingleResult(userResults);
    if (!updatedUser) {
      throw ApiError.internalError('Failed to update user');
    }

    // Update tourism profile
    const tourismParams = [
      id,
      first_name ?? null,
      middle_name ?? null,
      last_name ?? null,
      position ?? null,
      null // user_id doesn't change
    ];

    const [tourismResults] = await sequelize.query(
      'CALL UpdateTourism(?, ?, ?, ?, ?, ?)',
      { replacements: tourismParams, transaction }
    );

    const updatedTourism = extractSingleResult(tourismResults);
    if (!updatedTourism) {
      throw ApiError.internalError('Failed to update tourism profile');
    }

    await transaction.commit();

    logger.info(`Tourism staff updated: ${id}`);

    res.success({
      message: 'Tourism staff updated',
      user: updatedUser,
      tourism: updatedTourism
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

/**
 * Change tourism staff account status (active/verified)
 */
export const changeTourismStaffStatus = async (req, res, next) => {
  const { id } = req.params;
  const { is_active, is_verified } = req.body || {};

  try {
    // Get current tourism profile
    const tourismQuery = await sequelize.query('CALL GetTourismById(?)', {
      replacements: [id]
    });

    const currentTourism = extractSingleResult(tourismQuery);
    if (!currentTourism) {
      throw ApiError.notFound('Tourism staff not found');
    }

    const userId = currentTourism.user_id;

    // Update user status
    const userParams = [
      userId,
      null,
      null,
      null,
      null,
      null,
      toBool(is_verified),
      toBool(is_active),
      null,
      null,
      null
    ];

    const [userResults] = await sequelize.query(
      'CALL UpdateUser(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      { replacements: userParams }
    );

    const updated = extractSingleResult(userResults);
    if (!updated) {
      throw ApiError.internalError('Failed to update status');
    }

    logger.info(`Tourism staff ${id} status updated`);

    res.success({ message: 'Status updated', user: updated });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset tourism staff password (generate temp password)
 */
export const resetTourismStaffPassword = async (req, res, next) => {
  const { id } = req.params;

  try {
    // Get current tourism profile
    const tourismQuery = await sequelize.query('CALL GetTourismById(?)', {
      replacements: [id]
    });

    const currentTourism = extractSingleResult(tourismQuery);
    if (!currentTourism) {
      throw ApiError.notFound('Tourism staff not found');
    }

    const userId = currentTourism.user_id;
    const temp = generateTempPassword(12);
    const hashedPassword = await bcrypt.hash(temp, 10);

    // Update user with new password
    const userParams = [
      userId,
      null,
      null,
      hashedPassword,
      null,
      null,
      null,
      null,
      null,
      null,
      null
    ];

    await sequelize.query(
      'CALL UpdateUser(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      { replacements: userParams }
    );

    logger.info(`Tourism staff ${id} password reset`);

    res.success({
      message: 'Temporary password generated',
      credentials: { temporary_password: temp }
    });
  } catch (error) {
    next(error);
  }
};

export default {
  listTourismStaff,
  getTourismStaffById,
  createTourismStaff,
  updateTourismStaff,
  changeTourismStaffStatus,
  resetTourismStaffPassword
};
