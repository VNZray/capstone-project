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
 * GET /api/roles/permission-categories
 * Get all permission categories
 */
export async function getPermissionCategories(req, res) {
  try {
    const categories = await roleService.getPermissionCategories();
    return res.json(categories);
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * GET /api/roles/permissions/grouped
 * Get permissions grouped by category
 */
export async function getPermissionsGrouped(req, res) {
  const { scope } = req.query;
  
  try {
    const grouped = await roleService.getPermissionsGroupedByCategory(scope || null);
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
