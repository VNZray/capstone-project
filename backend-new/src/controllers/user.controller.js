/**
 * User Controller
 * User management using Sequelize models
 */
import { sequelize, User, UserRole, Owner, Tourist } from '../models/index.js';
import { ApiError } from '../utils/api-error.js';
import logger from '../config/logger.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

/**
 * Get all users
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      include: [
        { model: UserRole, as: 'role' },
        { model: Tourist, as: 'tourist' },
        { model: Owner, as: 'owner' }
      ],
      attributes: { exclude: ['password'] },
      order: [['created_at', 'DESC']]
    });
    res.success(users);
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
    const user = await User.findByPk(id, {
      include: [
        { model: UserRole, as: 'role' },
        { model: Tourist, as: 'tourist' },
        { model: Owner, as: 'owner' }
      ],
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    res.success(user);
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
    const user = await User.findOne({
      where: { email },
      include: [
        { model: UserRole, as: 'role' },
        { model: Tourist, as: 'tourist' },
        { model: Owner, as: 'owner' }
      ],
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    res.success(user);
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
    const users = await User.findAll({
      where: { user_role_id: role_id },
      include: [
        { model: UserRole, as: 'role' },
        { model: Tourist, as: 'tourist' },
        { model: Owner, as: 'owner' }
      ],
      attributes: { exclude: ['password'] }
    });
    res.success(users);
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
    const user = await User.findByPk(id);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const updateData = {
      email: req.body.email,
      phone_number: req.body.phone_number,
      is_active: req.body.is_active,
      user_role_id: req.body.role_id || req.body.user_role_id
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key =>
      updateData[key] === undefined && delete updateData[key]
    );

    await user.update(updateData);

    logger.info(`User updated: ${id}`);

    res.success({
      message: 'User updated successfully',
      ...user.toJSON()
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
    const user = await User.findByPk(id);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    await user.destroy();

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
    const roles = await UserRole.findAll({
      order: [['id', 'ASC']]
    });
    res.success(roles);
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
    const user = await User.findByPk(id);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    await user.update({ is_active });

    logger.info(`User ${id} status toggled to ${is_active}`);

    res.success({
      message: 'User status updated successfully',
      ...user.toJSON()
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

    const user = await User.create({
      id,
      email: req.body.email,
      phone_number: req.body.phone_number,
      password: hashedPassword,
      user_profile: req.body.user_profile,
      is_verified: req.body.is_verified ?? false,
      is_active: req.body.is_active ?? false,
      last_login: req.body.last_login,
      user_role_id: req.body.user_role_id,
      barangay_id: req.body.barangay_id
    });

    logger.info(`User created: ${id}`);

    // Remove password from response
    const userResponse = user.toJSON();
    delete userResponse.password;

    res.created(userResponse, 'User created successfully');
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
    const roles = await UserRole.findAll({
      order: [['id', 'ASC']]
    });
    res.success(roles);
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
    const role = await UserRole.findByPk(id);

    if (!role) {
      throw ApiError.notFound('User role not found');
    }

    res.success(role);
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
    const users = await User.findAll({
      where: { user_role_id },
      include: [
        { model: UserRole, as: 'role' },
        { model: Tourist, as: 'tourist' },
        { model: Owner, as: 'owner' }
      ],
      attributes: { exclude: ['password'] }
    });
    res.success(users);
  } catch (error) {
    next(error);
  }
};

/**
 * Insert user role
 */
export const insertUserRole = async (req, res, next) => {
  try {
    const role = await UserRole.create({
      role_name: req.body.role_name,
      role_description: req.body.role_description,
      role_type: req.body.role_type || 'custom',
      is_custom: true,
      role_for: req.body.role_for,
      role_for_type: req.body.role_for_type,
      permissions: req.body.permissions || []
    });

    logger.info(`User role created: ${role.id}`);

    res.created(role, 'User role created successfully');
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
    const role = await UserRole.findByPk(id);

    if (!role) {
      throw ApiError.notFound('User role not found');
    }

    await role.update({
      role_name: req.body.role_name,
      role_description: req.body.role_description,
      permissions: req.body.permissions
    });

    logger.info(`User role updated: ${id}`);

    res.success(role, 'User role updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update user role by name
 */
export const updateUserRoleByName = async (req, res, next) => {
  try {
    const role = await UserRole.findOne({
      where: { role_name: req.body.role_name }
    });

    if (!role) {
      throw ApiError.notFound('User role not found');
    }

    await role.update({
      role_name: req.body.new_role_name || role.role_name,
      role_description: req.body.role_description
    });

    res.success(role, 'User role updated successfully');
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

    const user = await User.create({
      id,
      email: req.body.email,
      phone_number: req.body.phone_number || '',
      password: hashedPassword,
      user_role_id: req.body.user_role_id,
      barangay_id: req.body.barangay_id,
      is_verified: true,
      is_active: true,
      must_change_password: true,
      profile_completed: false,
      invitation_token: invitationToken,
      invitation_expires_at: invitationExpiresAt
    });

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
    const user = await User.findByPk(userId);

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
    await user.update({
      password: hashedPassword,
      must_change_password: false,
      password_changed_at: new Date()
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
    const user = await User.findByPk(userId);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    await user.update({
      profile_completed: true,
      invitation_token: null,
      invitation_expires_at: null
    });

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
