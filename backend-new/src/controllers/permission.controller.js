/**
 * Permission Controller
 * Handles permission management
 */
import { sequelize } from '../models/index.js';
import { ApiError } from '../utils/api-error.js';
import { v4 as uuidv4 } from 'uuid';
import logger from '../config/logger.js';

/**
 * Get all permissions
 */
export const getAllPermissions = async (req, res, next) => {
  try {
    const [permissions] = await sequelize.query(
      'SELECT * FROM permission ORDER BY category, name ASC'
    );

    res.success(permissions);
  } catch (error) {
    next(error);
  }
};

/**
 * Get permission by ID
 */
export const getPermissionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [permissions] = await sequelize.query(
      'SELECT * FROM permission WHERE id = ?',
      { replacements: [id] }
    );

    if (!permissions || permissions.length === 0) {
      throw ApiError.notFound('Permission not found');
    }

    res.success(permissions[0]);
  } catch (error) {
    next(error);
  }
};

/**
 * Get permissions by category
 */
export const getPermissionsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;

    const [permissions] = await sequelize.query(
      'SELECT * FROM permission WHERE category = ? ORDER BY name ASC',
      { replacements: [category] }
    );

    res.success(permissions);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all permission categories
 */
export const getPermissionCategories = async (req, res, next) => {
  try {
    const [categories] = await sequelize.query(
      'SELECT DISTINCT category FROM permission ORDER BY category ASC'
    );

    res.success(categories.map(c => c.category));
  } catch (error) {
    next(error);
  }
};

/**
 * Create permission
 */
export const createPermission = async (req, res, next) => {
  try {
    const { name, description, category } = req.body;

    if (!name) {
      throw ApiError.badRequest('Permission name is required');
    }

    // Check for duplicate
    const [existing] = await sequelize.query(
      'SELECT id FROM permission WHERE name = ?',
      { replacements: [name] }
    );

    if (existing && existing.length > 0) {
      throw ApiError.conflict('Permission with this name already exists');
    }

    const id = uuidv4();

    await sequelize.query(
      'INSERT INTO permission (id, name, description, category, created_at) VALUES (?, ?, ?, ?, NOW())',
      { replacements: [id, name, description || null, category || null] }
    );

    res.created({ id, name, description, category }, 'Permission created successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update permission
 */
export const updatePermission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, category } = req.body;

    // Check if permission exists
    const [existing] = await sequelize.query(
      'SELECT * FROM permission WHERE id = ?',
      { replacements: [id] }
    );

    if (!existing || existing.length === 0) {
      throw ApiError.notFound('Permission not found');
    }

    // Check for duplicate name if changing
    if (name && name !== existing[0].name) {
      const [duplicate] = await sequelize.query(
        'SELECT id FROM permission WHERE name = ? AND id != ?',
        { replacements: [name, id] }
      );

      if (duplicate && duplicate.length > 0) {
        throw ApiError.conflict('Permission with this name already exists');
      }
    }

    await sequelize.query(
      `UPDATE permission
       SET name = COALESCE(?, name),
           description = COALESCE(?, description),
           category = COALESCE(?, category),
           updated_at = NOW()
       WHERE id = ?`,
      { replacements: [name, description, category, id] }
    );

    res.success({ id, name, description, category }, 'Permission updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete permission
 */
export const deletePermission = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [result] = await sequelize.query(
      'DELETE FROM permission WHERE id = ?',
      { replacements: [id] }
    );

    res.success(null, 'Permission deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get role permissions (junction table)
 */
export const getRolePermissionsMap = async (req, res, next) => {
  try {
    const { roleId } = req.params;

    const [permissions] = await sequelize.query(
      `SELECT p.*
       FROM permission p
       INNER JOIN role_permission rp ON p.id = rp.permission_id
       WHERE rp.role_id = ?
       ORDER BY p.category, p.name ASC`,
      { replacements: [roleId] }
    );

    res.success(permissions);
  } catch (error) {
    next(error);
  }
};

/**
 * Assign permission to role
 */
export const assignPermissionToRole = async (req, res, next) => {
  try {
    const { role_id, permission_id } = req.body;

    if (!role_id || !permission_id) {
      throw ApiError.badRequest('role_id and permission_id are required');
    }

    // Check if already assigned
    const [existing] = await sequelize.query(
      'SELECT * FROM role_permission WHERE role_id = ? AND permission_id = ?',
      { replacements: [role_id, permission_id] }
    );

    if (existing && existing.length > 0) {
      throw ApiError.conflict('Permission already assigned to this role');
    }

    await sequelize.query(
      'INSERT INTO role_permission (role_id, permission_id, created_at) VALUES (?, ?, NOW())',
      { replacements: [role_id, permission_id] }
    );

    res.created({ role_id, permission_id }, 'Permission assigned to role successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Remove permission from role
 */
export const removePermissionFromRole = async (req, res, next) => {
  try {
    const { role_id, permission_id } = req.params;

    await sequelize.query(
      'DELETE FROM role_permission WHERE role_id = ? AND permission_id = ?',
      { replacements: [role_id, permission_id] }
    );

    res.success(null, 'Permission removed from role successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Bulk assign permissions to role
 */
export const bulkAssignPermissionsToRole = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { role_id, permission_ids } = req.body;

    if (!role_id || !permission_ids || !Array.isArray(permission_ids)) {
      throw ApiError.badRequest('role_id and permission_ids array are required');
    }

    // Remove existing permissions
    await sequelize.query(
      'DELETE FROM role_permission WHERE role_id = ?',
      { replacements: [role_id], transaction }
    );

    // Add new permissions
    for (const permission_id of permission_ids) {
      await sequelize.query(
        'INSERT INTO role_permission (role_id, permission_id, created_at) VALUES (?, ?, NOW())',
        { replacements: [role_id, permission_id], transaction }
      );
    }

    await transaction.commit();

    res.success({ role_id, permission_ids }, 'Permissions assigned to role successfully');
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};
