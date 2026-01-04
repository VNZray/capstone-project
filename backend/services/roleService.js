/**
 * Role Service - Simplified RBAC
 * 
 * Two-tier RBAC system:
 * - System roles: Platform-wide roles (Admin, Tourist, Business Owner, etc.)
 * - Business roles: Single "Staff" role per business with per-user permissions
 * 
 * Staff permissions are managed at the USER level, not role level.
 * See permissionService.js for user permission management.
 * 
 * @module services/roleService
 */

import db from '../db.js';

// ============================================================
// CONSTANTS
// ============================================================

export const ROLE_TYPES = {
  SYSTEM: 'system',
  BUSINESS: 'business'
};

// ============================================================
// ROLE SCOPE HELPERS
// ============================================================

/**
 * Determine if a role has platform-level scope
 * @param {Object} role - Role object with role_type and role_for properties
 * @returns {boolean}
 */
export function hasPlatformScope(role) {
  return role?.role_type === 'system' && !role?.role_for;
}

/**
 * Determine if a role has business-level scope
 * @param {Object} role - Role object
 * @returns {boolean}
 */
export function hasBusinessScope(role) {
  return role?.role_type === 'business' || !!role?.role_for;
}

/**
 * Check if a role is a system role
 * @param {Object} role - Role object
 * @returns {boolean}
 */
export function isSystemRole(role) {
  return role?.role_type === 'system';
}

/**
 * Check if a role is a business-specific role
 * @param {Object} role - Role object
 * @returns {boolean}
 */
export function isBusinessRole(role) {
  return role?.role_type === 'business';
}

/**
 * Get the business ID a role is associated with
 * @param {Object} role - Role object
 * @returns {string|null}
 */
export function getRoleBusinessId(role) {
  return role?.role_for || null;
}

// ============================================================
// ROLE RETRIEVAL
// ============================================================

/**
 * Get all roles by type
 * @param {string} roleType - 'system' or 'business'
 * @returns {Promise<Array>}
 */
export async function getRolesByType(roleType) {
  if (!Object.values(ROLE_TYPES).includes(roleType)) {
    throw new Error(`Invalid role type: ${roleType}`);
  }
  
  const [rows] = await db.query(
    `SELECT * FROM user_role WHERE role_type = ? ORDER BY role_name`,
    [roleType]
  );
  return rows || [];
}

/**
 * Get all system roles
 * @returns {Promise<Array>}
 */
export async function getSystemRoles() {
  return getRolesByType(ROLE_TYPES.SYSTEM);
}

/**
 * Get the Staff role for a business (creates if doesn't exist)
 * @param {string} businessId - Business ID
 * @returns {Promise<Object>} Staff role
 */
export async function getOrCreateBusinessStaffRole(businessId) {
  if (!businessId) {
    throw new Error('Business ID is required');
  }
  
  // Check if Staff role exists
  const [existing] = await db.query(
    `SELECT * FROM user_role WHERE role_for = ? AND role_type = 'business' LIMIT 1`,
    [businessId]
  );
  
  if (existing && existing.length > 0) {
    return existing[0];
  }
  
  // Create new Staff role for this business
  const [result] = await db.query(
    `INSERT INTO user_role (role_name, role_description, role_for, role_type, is_immutable)
     VALUES ('Staff', 'Staff member of this business', ?, 'business', FALSE)`,
    [businessId]
  );
  
  const [newRole] = await db.query(`SELECT * FROM user_role WHERE id = ?`, [result.insertId]);
  return newRole[0];
}

/**
 * Get a role by ID
 * @param {number} roleId - Role ID
 * @returns {Promise<Object|null>}
 */
export async function getRoleById(roleId) {
  const [rows] = await db.query(`SELECT * FROM user_role WHERE id = ?`, [roleId]);
  return rows?.[0] || null;
}

/**
 * Get role with its permissions (for system roles)
 * @param {number} roleId - Role ID
 * @returns {Promise<Object|null>}
 */
export async function getRoleWithPermissions(roleId) {
  const role = await getRoleById(roleId);
  if (!role) return null;
  
  const [permissions] = await db.query(
    `SELECT p.id, p.name, p.description, p.scope, pc.name AS category_name
     FROM role_permissions rp
     JOIN permissions p ON p.id = rp.permission_id
     LEFT JOIN permission_categories pc ON pc.id = p.category_id
     WHERE rp.user_role_id = ?
     ORDER BY pc.sort_order, p.name`,
    [roleId]
  );
  
  return {
    ...role,
    permissions: permissions || []
  };
}

// ============================================================
// PERMISSION CATEGORIES (for UI)
// ============================================================

/**
 * Get all permission categories
 * @returns {Promise<Array>}
 */
export async function getPermissionCategories() {
  const [rows] = await db.query(
    `SELECT * FROM permission_categories ORDER BY sort_order`
  );
  return rows || [];
}

/**
 * Get permissions grouped by category
 * @param {string|null} scope - Filter by scope ('system', 'business', or null for all)
 * @returns {Promise<Array>}
 */
export async function getPermissionsGroupedByCategory(scope = null) {
  let query = `
    SELECT p.id, p.name, p.description, p.scope,
           pc.id AS category_id, pc.name AS category_name, pc.sort_order
    FROM permissions p
    LEFT JOIN permission_categories pc ON pc.id = p.category_id
  `;
  
  const params = [];
  if (scope && scope !== 'all') {
    query += ` WHERE p.scope = ? OR p.scope = 'all'`;
    params.push(scope);
  }
  
  query += ` ORDER BY pc.sort_order, p.name`;
  
  const [rows] = await db.query(query, params);
  
  // Group by category
  const grouped = {};
  for (const row of rows) {
    const catName = row.category_name || 'Other';
    if (!grouped[catName]) {
      grouped[catName] = {
        category_id: row.category_id,
        category_name: catName,
        sort_order: row.sort_order || 999,
        permissions: []
      };
    }
    grouped[catName].permissions.push({
      id: row.id,
      name: row.name,
      description: row.description,
      scope: row.scope
    });
  }
  
  return Object.values(grouped).sort((a, b) => a.sort_order - b.sort_order);
}

// ============================================================
// ROLE PERMISSION MANAGEMENT (for system roles only)
// ============================================================

/**
 * Assign permissions to a system role
 * Note: Staff permissions are managed per-user via permissionService
 * @param {number} roleId - Role ID
 * @param {number[]} permissionIds - Array of permission IDs
 */
export async function assignPermissionsToRole(roleId, permissionIds) {
  if (!permissionIds || permissionIds.length === 0) return;
  
  const values = permissionIds.map(pid => [roleId, pid]);
  await db.query(
    `INSERT IGNORE INTO role_permissions (user_role_id, permission_id) VALUES ?`,
    [values]
  );
}

/**
 * Remove permissions from a role
 * @param {number} roleId - Role ID
 * @param {number[]} permissionIds - Permission IDs to remove
 */
export async function removePermissionsFromRole(roleId, permissionIds) {
  if (!permissionIds || permissionIds.length === 0) return;
  
  const placeholders = permissionIds.map(() => '?').join(',');
  await db.query(
    `DELETE FROM role_permissions WHERE user_role_id = ? AND permission_id IN (${placeholders})`,
    [roleId, ...permissionIds]
  );
}

/**
 * Set all permissions for a role (replaces existing)
 * @param {number} roleId - Role ID
 * @param {number[]} permissionIds - Permission IDs to set
 */
export async function setRolePermissions(roleId, permissionIds) {
  await db.query(`DELETE FROM role_permissions WHERE user_role_id = ?`, [roleId]);
  
  if (permissionIds && permissionIds.length > 0) {
    await assignPermissionsToRole(roleId, permissionIds);
  }
}

// ============================================================
// EXPORTS
// ============================================================

export default {
  // Constants
  ROLE_TYPES,
  
  // Role scope helpers
  hasPlatformScope,
  hasBusinessScope,
  isSystemRole,
  isBusinessRole,
  getRoleBusinessId,
  
  // Role retrieval
  getRolesByType,
  getSystemRoles,
  getOrCreateBusinessStaffRole,
  getRoleById,
  getRoleWithPermissions,
  
  // Permission categories
  getPermissionCategories,
  getPermissionsGroupedByCategory,
  
  // Role permission management (system roles only)
  assignPermissionsToRole,
  removePermissionsFromRole,
  setRolePermissions,
};
