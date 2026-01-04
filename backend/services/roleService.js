/**
 * Role Service - Simplified RBAC
 * 
 * Simple role system with 5 fixed roles:
 * - Admin, Tourism Officer, Business Owner, Tourist, Staff
 * 
 * All roles are system roles. Staff permissions are managed at the USER level,
 * not role level. Business access is determined by staff.business_id.
 * 
 * See permissionService.js for user permission management.
 * 
 * @module services/roleService
 */

import db from '../db.js';

// ============================================================
// CONSTANTS
// ============================================================

export const STAFF_ROLE_ID = 6; // ID of the single Staff role

export const ROLE_NAMES = {
  ADMIN: 'Admin',
  TOURISM_OFFICER: 'Tourism Officer',
  BUSINESS_OWNER: 'Business Owner',
  TOURIST: 'Tourist',
  STAFF: 'Staff',
};

// ============================================================
// ROLE HELPERS
// ============================================================

/**
 * Check if a role is a platform role (Admin or Tourism Officer)
 * @param {Object|string} role - Role object or role name
 * @returns {boolean}
 */
export function isPlatformRole(role) {
  const roleName = typeof role === 'string' ? role : role?.role_name;
  return [ROLE_NAMES.ADMIN, ROLE_NAMES.TOURISM_OFFICER].includes(roleName);
}

/**
 * Check if a role is Staff
 * @param {Object|string} role - Role object or role name
 * @returns {boolean}
 */
export function isStaffRole(role) {
  const roleName = typeof role === 'string' ? role : role?.role_name;
  return roleName === ROLE_NAMES.STAFF;
}

/**
 * Get the Staff role ID (constant)
 * @returns {number}
 */
export function getStaffRoleId() {
  return STAFF_ROLE_ID;
}

// ============================================================
// ROLE RETRIEVAL
// ============================================================

/**
 * Get all system roles
 * @returns {Promise<Array>}
 */
export async function getSystemRoles() {
  const [rows] = await db.query(
    `SELECT * FROM user_role ORDER BY role_name`
  );
  return rows || [];
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
 * Get role with its permissions (for system roles - not Staff)
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
  STAFF_ROLE_ID,
  ROLE_NAMES,
  
  // Role helpers
  isPlatformRole,
  isStaffRole,
  getStaffRoleId,
  
  // Role retrieval
  getSystemRoles,
  getRoleById,
  getRoleWithPermissions,
  
  // Permission categories
  getPermissionCategories,
  getPermissionsGroupedByCategory,
  
  // Role permission management (system roles only - not Staff)
  assignPermissionsToRole,
  removePermissionsFromRole,
  setRolePermissions,
};
