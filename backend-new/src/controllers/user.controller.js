/**
 * User Controller
 * User management via stored procedures
 */
import { sequelize } from '../models/index.js';
import { ApiError } from '../utils/api-error.js';
import { extractProcedureResult, extractSingleResult } from '../utils/helpers.js';
import logger from '../config/logger.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

/**
 * Get all users
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const queryResult = await sequelize.query('CALL GetAllUsers()');
    const results = extractProcedureResult(queryResult);
    res.success(results);
  } catch (error) {
    logger.error('Error fetching users:', error);
    next(error);
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const queryResult = await sequelize.query('CALL GetUserById(?)', {
      replacements: [id]
    });
    const result = extractSingleResult(queryResult);

    if (!result) {
      throw ApiError.notFound('User not found');
    }

    res.success(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get user by email
 */
export const getUserByEmail = async (req, res, next) => {
  const { email } = req.params;
  try {
    const queryResult = await sequelize.query('CALL GetUserByEmail(?)', {
      replacements: [email]
    });
    const result = extractSingleResult(queryResult);

    if (!result) {
      throw ApiError.notFound('User not found');
    }

    res.success(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get users by role
 */
export const getUsersByRole = async (req, res, next) => {
  const { role_id } = req.params;
  try {
    const queryResult = await sequelize.query('CALL GetUsersByRole(?)', {
      replacements: [role_id]
    });
    const results = extractProcedureResult(queryResult);
    res.success(results);
  } catch (error) {
    next(error);
  }
};

/**
 * Update user
 */
export const updateUser = async (req, res, next) => {
  const { id } = req.params;
  try {
    const params = [
      id,
      req.body.email ?? null,
      req.body.phone_number ?? null,
      req.body.first_name ?? null,
      req.body.last_name ?? null,
      req.body.is_active ?? null,
      req.body.role_id ?? null
    ];

    const queryResult = await sequelize.query(
      'CALL UpdateUser(?, ?, ?, ?, ?, ?, ?)',
      { replacements: params }
    );
    const result = extractSingleResult(queryResult);

    if (!result) {
      throw ApiError.notFound('User not found');
    }

    logger.info(`User updated: ${id}`);

    res.success({
      message: 'User updated successfully',
      ...result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user
 */
export const deleteUser = async (req, res, next) => {
  const { id } = req.params;
  try {
    await sequelize.query('CALL DeleteUser(?)', {
      replacements: [id]
    });

    logger.info(`User deleted: ${id}`);

    res.success({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all user roles
 */
export const getAllRoles = async (req, res, next) => {
  try {
    const queryResult = await sequelize.query('CALL GetAllRoles()');
    const results = extractProcedureResult(queryResult);
    res.success(results);
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle user active status
 */
export const toggleUserStatus = async (req, res, next) => {
  const { id } = req.params;
  const { is_active } = req.body;
  try {
    const queryResult = await sequelize.query('CALL ToggleUserStatus(?, ?)', {
      replacements: [id, is_active]
    });
    const result = extractSingleResult(queryResult);

    if (!result) {
      throw ApiError.notFound('User not found');
    }

    logger.info(`User ${id} status toggled to ${is_active}`);

    res.success({
      message: 'User status updated successfully',
      ...result
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// USER CRUD
// ============================================================

/**
 * Insert user
 */
export const insertUser = async (req, res, next) => {
  try {
    const id = req.body.id || uuidv4();
    const rawPassword = req.body.password ?? null;
    const hashedPassword = rawPassword ? await bcrypt.hash(rawPassword, 10) : null;

    const params = [
      id,
      req.body.email ?? null,
      req.body.phone_number ?? null,
      hashedPassword,
      req.body.user_profile ?? null,
      req.body.otp ?? null,
      req.body.is_verified ?? false,
      req.body.is_active ?? false,
      req.body.last_login ?? null,
      req.body.user_role_id ?? null,
      req.body.barangay_id ?? null
    ];

    const queryResult = await sequelize.query(
      'CALL InsertUser(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      { replacements: params }
    );
    const result = extractSingleResult(queryResult);

    if (!result) {
      throw ApiError.internalError('Failed to create user');
    }

    logger.info(`User created: ${id}`);

    res.created(result, 'User created successfully');
  } catch (error) {
    next(error);
  }
};

// ============================================================
// USER ROLE MANAGEMENT
// ============================================================

/**
 * Get all user roles
 */
export const getAllUserRoles = async (req, res, next) => {
  try {
    const queryResult = await sequelize.query('CALL GetAllUserRoles()');
    const results = extractProcedureResult(queryResult);
    res.success(results);
  } catch (error) {
    next(error);
  }
};

/**
 * Get user role by ID
 */
export const getUserRoleById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const queryResult = await sequelize.query('CALL GetUserRoleById(?)', {
      replacements: [id]
    });
    const result = extractSingleResult(queryResult);

    if (!result) {
      throw ApiError.notFound('User role not found');
    }

    res.success(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get users by role ID
 */
export const getUsersByRoleId = async (req, res, next) => {
  const { user_role_id } = req.params;
  try {
    const queryResult = await sequelize.query('CALL GetUsersByRoleId(?)', {
      replacements: [user_role_id]
    });
    const results = extractProcedureResult(queryResult);
    res.success(results);
  } catch (error) {
    next(error);
  }
};

/**
 * Insert user role
 */
export const insertUserRole = async (req, res, next) => {
  try {
    const params = [
      req.body.role_name ?? null,
      req.body.role_description ?? null
    ];

    const queryResult = await sequelize.query('CALL InsertUserRole(?, ?)', {
      replacements: params
    });
    const result = extractSingleResult(queryResult);

    if (!result) {
      throw ApiError.internalError('Failed to create user role');
    }

    logger.info(`User role created: ${result.id}`);

    res.created(result, 'User role created successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update user role by ID
 */
export const updateUserRole = async (req, res, next) => {
  const { id } = req.params;
  try {
    const params = [
      id,
      req.body.role_name ?? null,
      req.body.role_description ?? null
    ];

    const queryResult = await sequelize.query('CALL UpdateUserRole(?, ?, ?)', {
      replacements: params
    });
    const result = extractSingleResult(queryResult);

    if (!result) {
      throw ApiError.notFound('User role not found');
    }

    logger.info(`User role updated: ${id}`);

    res.success(result, 'User role updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update user role by name
 */
export const updateUserRoleByName = async (req, res, next) => {
  try {
    const params = [
      req.body.role_name ?? null,
      req.body.new_role_name ?? null,
      req.body.role_description ?? null
    ];

    const queryResult = await sequelize.query('CALL UpdateUserRoleByName(?, ?, ?)', {
      replacements: params
    });
    const result = extractSingleResult(queryResult);

    if (!result) {
      throw ApiError.notFound('User role not found');
    }

    res.success(result, 'User role updated successfully');
  } catch (error) {
    next(error);
  }
};

// ============================================================
// STAFF USER MANAGEMENT
// ============================================================

/**
 * Insert a staff user with proper onboarding flags
 * Sets: is_verified=true, is_active=true, must_change_password=true, profile_completed=false
 * Generates an invitation token for email verification
 */
export const insertStaffUser = async (req, res, next) => {
  try {
    const id = uuidv4();

    // Hash password
    const rawPassword = req.body.password ?? 'staff123'; // Default temp password
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // Generate invitation token (expires in 48 hours)
    const invitationToken = crypto.randomBytes(32).toString('hex');
    const invitationExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

    const params = [
      id,
      req.body.email ?? null,
      req.body.phone_number ?? '',
      hashedPassword,
      req.body.user_role_id ?? null,
      req.body.barangay_id ?? null,
      invitationToken,
      invitationExpiresAt
    ];

    const queryResult = await sequelize.query(
      'CALL InsertStaffUser(?, ?, ?, ?, ?, ?, ?, ?)',
      { replacements: params }
    );
    const user = extractSingleResult(queryResult);

    if (!user) {
      throw ApiError.internalError('Failed to create staff user');
    }

    logger.info(`Staff user created: ${id}`);

    res.created({
      id: user.id,
      email: user.email,
      phone_number: user.phone_number,
      user_role_id: user.user_role_id,
      is_verified: user.is_verified,
      is_active: user.is_active,
      must_change_password: user.must_change_password,
      profile_completed: user.profile_completed,
      invitation_token: invitationToken,
      temp_password: rawPassword
    }, 'Staff user created successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Change password for a user (typically after first login)
 * Clears the must_change_password flag
 */
export const changePassword = async (req, res, next) => {
  const userId = req.user?.id;

  if (!userId) {
    throw ApiError.unauthorized('Authentication required');
  }

  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      throw ApiError.badRequest('Current and new password are required');
    }

    if (new_password.length < 8) {
      throw ApiError.badRequest('New password must be at least 8 characters');
    }

    // Get current user with password
    const userQueryResult = await sequelize.query('CALL GetUserById(?)', {
      replacements: [userId]
    });
    const user = extractSingleResult(userQueryResult);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // Verify current password
    const isMatch = await bcrypt.compare(current_password, user.password);
    if (!isMatch) {
      throw ApiError.unauthorized('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Update password and clear must_change_password flag
    await sequelize.query('CALL CompletePasswordChange(?, ?)', {
      replacements: [userId, hashedPassword]
    });

    logger.info(`User ${userId} changed password`);

    res.success({
      message: 'Password changed successfully',
      must_change_password: false
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Complete staff profile after first login
 * Clears invitation token and sets profile_completed=true
 */
export const completeStaffProfile = async (req, res, next) => {
  const userId = req.user?.id;

  if (!userId) {
    throw ApiError.unauthorized('Authentication required');
  }

  try {
    const queryResult = await sequelize.query('CALL CompleteStaffProfile(?)', {
      replacements: [userId]
    });
    const result = extractSingleResult(queryResult);

    if (!result) {
      throw ApiError.notFound('User not found');
    }

    logger.info(`Staff profile completed: ${userId}`);

    res.success({
      message: 'Profile completed successfully',
      profile_completed: true
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getAllUsers,
  getUserById,
  getUserByEmail,
  getUsersByRole,
  updateUser,
  deleteUser,
  getAllRoles,
  toggleUserStatus,
  insertUser,
  getAllUserRoles,
  getUserRoleById,
  getUsersByRoleId,
  insertUserRole,
  updateUserRole,
  updateUserRoleByName,
  insertStaffUser,
  changePassword,
  completeStaffProfile
};
