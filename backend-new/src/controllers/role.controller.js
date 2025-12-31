/**
 * Role Controller
 * Handles role and permission management
 */
import { UserRole, sequelize } from '../models/index.js';
import { ApiError } from '../utils/api-error.js';
import { v4 as uuidv4 } from 'uuid';
import logger from '../config/logger.js';

/**
 * Get all roles
 */
export const getAllRoles = async (req, res, next) => {
  try {
    const roles = await UserRole.findAll({
      order: [['role_name', 'ASC']]
    });

    res.success(roles);
  } catch (error) {
    next(error);
  }
};

/**
 * Get role by ID
 */
export const getRoleById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const role = await UserRole.findByPk(id);

    if (!role) {
      throw ApiError.notFound('Role not found');
    }

    res.success(role);
  } catch (error) {
    next(error);
  }
};

/**
 * Get role by name
 */
export const getRoleByName = async (req, res, next) => {
  try {
    const { name } = req.params;

    const role = await UserRole.findOne({
      where: { role_name: name }
    });

    if (!role) {
      throw ApiError.notFound('Role not found');
    }

    res.success(role);
  } catch (error) {
    next(error);
  }
};

/**
 * Create new role
 */
export const createRole = async (req, res, next) => {
  try {
    const { role_name, description, permissions } = req.body;

    if (!role_name) {
      throw ApiError.badRequest('role_name is required');
    }

    // Check for duplicate
    const existing = await UserRole.findOne({
      where: { role_name }
    });

    if (existing) {
      throw ApiError.conflict('Role with this name already exists');
    }

    const role = await UserRole.create({
      id: uuidv4(),
      role_name,
      description,
      permissions: permissions || []
    });

    res.created(role, 'Role created successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update role
 */
export const updateRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role_name, description, permissions } = req.body;

    const role = await UserRole.findByPk(id);

    if (!role) {
      throw ApiError.notFound('Role not found');
    }

    // Check for duplicate name if changing
    if (role_name && role_name !== role.role_name) {
      const existing = await UserRole.findOne({
        where: { role_name }
      });

      if (existing) {
        throw ApiError.conflict('Role with this name already exists');
      }
    }

    await role.update({
      role_name: role_name ?? role.role_name,
      description: description ?? role.description,
      permissions: permissions ?? role.permissions
    });

    res.success(role, 'Role updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete role
 */
export const deleteRole = async (req, res, next) => {
  try {
    const { id } = req.params;

    const role = await UserRole.findByPk(id);

    if (!role) {
      throw ApiError.notFound('Role not found');
    }

    // Check if role is in use
    const [usersWithRole] = await sequelize.query(
      'SELECT COUNT(*) as count FROM user WHERE user_role_id = ?',
      { replacements: [id] }
    );

    if (usersWithRole[0]?.count > 0) {
      throw ApiError.badRequest('Cannot delete role that is assigned to users');
    }

    await role.destroy();

    res.success(null, 'Role deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get role permissions
 */
export const getRolePermissions = async (req, res, next) => {
  try {
    const { id } = req.params;

    const role = await UserRole.findByPk(id, {
      attributes: ['id', 'role_name', 'permissions']
    });

    if (!role) {
      throw ApiError.notFound('Role not found');
    }

    res.success({
      role_id: role.id,
      role_name: role.role_name,
      permissions: role.permissions || []
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update role permissions
 */
export const updateRolePermissions = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { permissions } = req.body;

    if (!Array.isArray(permissions)) {
      throw ApiError.badRequest('permissions must be an array');
    }

    const role = await UserRole.findByPk(id);

    if (!role) {
      throw ApiError.notFound('Role not found');
    }

    await role.update({ permissions });

    res.success(role, 'Role permissions updated successfully');
  } catch (error) {
    next(error);
  }
};
