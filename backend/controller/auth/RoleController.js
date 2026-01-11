/**
 * Role Controller - Simplified RBAC HTTP Endpoints
 *
 * After RBAC simplification, this controller only handles:
 * - System role retrieval (for admin UI)
 * - Permission category listing (for permission assignment UI)
 *
 * Staff permission management is now in StaffController.js
 * using per-user permissions instead of role-based permissions.
 *
 * @module controller/auth/RoleController
 */

import { handleDbError } from "../../utils/errorHandler.js";
import * as roleService from "../../services/roleService.js";

// ============================================================
// SYSTEM ROLES (read-only for most users)
// ============================================================

/**
 * GET /api/roles/system
 * Get all system roles
 */
export async function getSystemRoles(req, res) {
  try {
    const roles = await roleService.getSystemRoles();
    return res.json(roles);
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * GET /api/roles/types/:type
 * Get all roles of a specific type
 */
export async function getRolesByType(req, res) {
  const { type } = req.params;

  try {
    const roles = await roleService.getRolesByType(type);
    return res.json(roles);
  } catch (error) {
    if (error.message.includes('Invalid role type')) {
      return res.status(400).json({ message: error.message });
    }
    return handleDbError(error, res);
  }
}

/**
 * GET /api/roles/:id
 * Get a single role with permissions
 */
export async function getRoleById(req, res) {
  const { id } = req.params;

  try {
    const role = await roleService.getRoleWithPermissions(parseInt(id, 10));

    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    return res.json(role);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// ============================================================
// PERMISSION CATEGORIES (for UI building)
// ============================================================

/**
 * GET /api/roles/permission-categories?portal=business|tourism
 * Get all permission categories
 * @query {string} portal - Optional portal filter ('business', 'tourism')
 */
export async function getPermissionCategories(req, res) {
  const { portal } = req.query;

  try {
    const categories = await roleService.getPermissionCategories(portal || null);
    return res.json(categories);
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * GET /api/roles/permissions/grouped?scope=system|business&portal=business|tourism
 * Get permissions grouped by category
 * @query {string} scope - Optional scope filter ('system', 'business', 'all')
 * @query {string} portal - Optional portal filter ('business', 'tourism')
 */
export async function getPermissionsGrouped(req, res) {
  const { scope, portal } = req.query;

  try {
    const grouped = await roleService.getPermissionsGroupedByCategory(
      scope || null,
      portal || null
    );
    return res.json(grouped);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// ============================================================
// EXPORTS
// ============================================================

export default {
  getSystemRoles,
  getRolesByType,
  getRoleById,
  getPermissionCategories,
  getPermissionsGrouped
};
