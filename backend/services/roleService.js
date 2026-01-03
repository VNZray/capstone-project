/**
 * Role Service - Enhanced RBAC Business Logic
 * 
 * Implements a two-tier RBAC system:
 * - System roles: Platform-wide, immutable (Tourist, Admin, Tourism Officer, Business Owner)
 * - Business roles: Custom roles created by Business Owners or Tourism Admins/Officers
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

export const SYSTEM_ROLES = {
  ADMIN: 'Admin',
  TOURISM_OFFICER: 'Tourism Officer',
  BUSINESS_OWNER: 'Business Owner',
  TOURIST: 'Tourist'
};

// In-memory cache for role permissions with TTL
const rolePermissionCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// ============================================================
// CACHE MANAGEMENT
// ============================================================

/**
 * Clear the role permission cache
 * @param {number|null} roleId - Specific role ID to clear, or null for all
 */
export function clearRoleCache(roleId = null) {
  if (roleId) {
    rolePermissionCache.delete(roleId);
    // Also clear any user-level caches that might reference this role
  } else {
    rolePermissionCache.clear();
  }
}

// ============================================================
// ROLE RETRIEVAL
// ============================================================

/**
 * Get all roles by type
 * @param {string} roleType - 'system' or 'business'
 * @returns {Promise<Array>} List of roles
 */
export async function getRolesByType(roleType) {
  if (!Object.values(ROLE_TYPES).includes(roleType)) {
    throw new Error(`Invalid role type: ${roleType}`);
  }
  
  const [rows] = await db.query('CALL GetRolesByType(?)', [roleType]);
  return rows[0] || [];
}

/**
 * Get all roles for a specific business
 * @param {string} businessId - Business ID
 * @returns {Promise<Array>} List of business roles
 */
export async function getBusinessRoles(businessId) {
  if (!businessId) {
    throw new Error('Business ID is required');
  }
  
  const [rows] = await db.query('CALL GetBusinessRoles(?)', [businessId]);
  return rows[0] || [];
}

/**
 * Get role with full permission details
 * @param {number} roleId - Role ID
 * @returns {Promise<Object>} Role with permissions
 */
export async function getRoleWithPermissions(roleId) {
  const [results] = await db.query('CALL GetRoleWithPermissions(?)', [roleId]);
  
  // SP returns multiple result sets
  const role = results[0]?.[0] || null;
  const permissions = results[1] || [];
  const overrides = results[2] || [];
  
  if (!role) {
    return null;
  }
  
  return {
    ...role,
    permissions,
    overrides
  };
}

/**
 * Get a role by ID (basic info)
 * @param {number} roleId - Role ID
 * @returns {Promise<Object|null>} Role or null
 */
export async function getRoleById(roleId) {
  const [rows] = await db.query('CALL GetUserRoleById(?)', [roleId]);
  return rows[0]?.[0] || null;
}

// ============================================================
// ROLE CREATION
// ============================================================

/**
 * Create a new system role (admin only)
 * @param {Object} params - Role parameters
 * @param {string} params.roleName - Role name
 * @param {string} params.roleDescription - Role description
 * @param {boolean} params.isImmutable - Whether role is immutable
 * @param {string} params.createdBy - User ID of creator
 * @returns {Promise<Object>} Created role
 */
export async function createSystemRole({ roleName, roleDescription, isImmutable = true, createdBy }) {
  const [rows] = await db.query(
    'CALL CreateSystemRole(?, ?, ?)',
    [roleName, roleDescription, isImmutable]
  );
  
  const role = rows[0]?.[0];
  
  if (role && createdBy) {
    await logRoleAction(role.id, 'created', null, role, createdBy);
  }
  
  return role;
}

/**
 * Create a fully custom business role
 * @param {Object} params - Role parameters
 * @param {string} params.businessId - Business ID
 * @param {string} params.roleName - Role name
 * @param {string} params.roleDescription - Role description
 * @param {number[]} params.permissionIds - Array of permission IDs to assign
 * @param {string} params.createdBy - User ID of creator
 * @returns {Promise<Object>} Created role
 */
export async function createCustomBusinessRole({ businessId, roleName, roleDescription, permissionIds = [], createdBy }) {
  if (!businessId || !roleName) {
    throw new Error('Business ID and role name are required');
  }
  
  // Validate role name length
  if (roleName.length > 20) {
    throw new Error('Role name must be 20 characters or less');
  }
  
  // Create the role
  const [rows] = await db.query(
    'CALL CreateCustomBusinessRole(?, ?, ?)',
    [businessId, roleName, roleDescription]
  );
  
  const role = rows[0]?.[0];
  
  if (!role) {
    throw new Error('Failed to create custom role');
  }
  
  // Assign permissions if provided
  if (permissionIds.length > 0) {
    await assignPermissionsToRole(role.id, permissionIds);
  }
  
  if (createdBy) {
    await logRoleAction(role.id, 'created', null, { ...role, permissions: permissionIds }, createdBy);
  }
  
  return role;
}

// ============================================================
// ROLE UPDATE
// ============================================================

/**
 * Update a business role
 * @param {Object} params - Update parameters
 * @param {number} params.roleId - Role ID
 * @param {string} params.businessId - Business ID (for ownership verification)
 * @param {string} params.roleName - New role name
 * @param {string} params.roleDescription - New role description
 * @param {string} params.updatedBy - User ID of updater
 * @returns {Promise<Object>} Updated role
 */
export async function updateBusinessRole({ roleId, businessId, roleName, roleDescription, updatedBy }) {
  // Get current state for audit
  const oldRole = await getRoleById(roleId);
  
  if (!oldRole) {
    throw new Error('Role not found');
  }
  
  const [rows] = await db.query(
    'CALL UpdateBusinessRole(?, ?, ?, ?)',
    [roleId, roleName, roleDescription, businessId]
  );
  
  const role = rows[0]?.[0];
  
  if (role && updatedBy) {
    await logRoleAction(roleId, 'updated', oldRole, role, updatedBy);
  }
  
  // Clear cache
  clearRoleCache(roleId);
  
  return role;
}

// ============================================================
// ROLE DELETION
// ============================================================

/**
 * Delete a business role
 * @param {Object} params - Delete parameters
 * @param {number} params.roleId - Role ID
 * @param {string} params.businessId - Business ID (for ownership verification)
 * @param {string} params.deletedBy - User ID of deleter
 * @returns {Promise<boolean>} Success status
 */
export async function deleteBusinessRole({ roleId, businessId, deletedBy }) {
  // Get current state for audit
  const oldRole = await getRoleWithPermissions(roleId);
  
  if (!oldRole) {
    throw new Error('Role not found');
  }
  
  const [rows] = await db.query(
    'CALL DeleteBusinessRole(?, ?)',
    [roleId, businessId]
  );
  
  const deleted = rows[0]?.[0]?.deleted_count > 0;
  
  if (deleted && deletedBy) {
    // Note: Can't log to role_audit_log since role is deleted
    // Could log to a separate deletion audit table if needed
    console.log(`[RoleService] Role ${roleId} deleted by ${deletedBy}`);
  }
  
  // Clear cache
  clearRoleCache(roleId);
  
  return deleted;
}

// ============================================================
// PERMISSION MANAGEMENT
// ============================================================

/**
 * Assign permissions to a role
 * @param {number} roleId - Role ID
 * @param {number[]} permissionIds - Array of permission IDs
 * @returns {Promise<void>}
 */
export async function assignPermissionsToRole(roleId, permissionIds) {
  if (!permissionIds || permissionIds.length === 0) {
    return;
  }
  
  // Batch insert, ignore duplicates
  const values = permissionIds.map(permId => `(${roleId}, ${permId})`).join(',');
  
  await db.query(`
    INSERT IGNORE INTO role_permissions (user_role_id, permission_id)
    VALUES ${values}
  `);
  
  // Clear cache
  clearRoleCache(roleId);
}

/**
 * Remove permissions from a role
 * @param {number} roleId - Role ID
 * @param {number[]} permissionIds - Array of permission IDs to remove
 * @returns {Promise<void>}
 */
export async function removePermissionsFromRole(roleId, permissionIds) {
  if (!permissionIds || permissionIds.length === 0) {
    return;
  }
  
  const placeholders = permissionIds.map(() => '?').join(',');
  
  await db.query(
    `DELETE FROM role_permissions WHERE user_role_id = ? AND permission_id IN (${placeholders})`,
    [roleId, ...permissionIds]
  );
  
  // Clear cache
  clearRoleCache(roleId);
}

/**
 * Set permissions for a role (replace all existing)
 * @param {number} roleId - Role ID
 * @param {number[]} permissionIds - Array of permission IDs
 * @param {string} updatedBy - User ID of updater
 * @returns {Promise<void>}
 */
export async function setRolePermissions(roleId, permissionIds, updatedBy) {
  // Get old permissions for audit
  const oldPerms = await getRoleWithPermissions(roleId);
  
  // Delete all existing permissions
  await db.query('DELETE FROM role_permissions WHERE user_role_id = ?', [roleId]);
  
  // Add new permissions
  if (permissionIds && permissionIds.length > 0) {
    await assignPermissionsToRole(roleId, permissionIds);
  }
  
  if (updatedBy) {
    await logRoleAction(
      roleId,
      'updated',
      { permissions: oldPerms?.permissions?.map(p => p.id) },
      { permissions: permissionIds },
      updatedBy
    );
  }
  
  // Clear cache
  clearRoleCache(roleId);
}

// ============================================================
// PERMISSION OVERRIDES
// ============================================================

/**
 * Add a permission override for a role
 * @param {Object} params - Override parameters
 * @param {number} params.roleId - Role ID
 * @param {number} params.permissionId - Permission ID
 * @param {boolean} params.isGranted - true to grant, false to revoke
 * @param {string} params.createdBy - User ID of creator
 * @returns {Promise<Object>} Created override
 */
export async function addPermissionOverride({ roleId, permissionId, isGranted, createdBy }) {
  const [rows] = await db.query(
    'CALL AddPermissionOverride(?, ?, ?, ?)',
    [roleId, permissionId, isGranted, createdBy]
  );
  
  const override = rows[0]?.[0];
  
  if (override && createdBy) {
    await logRoleAction(
      roleId,
      isGranted ? 'override_added' : 'override_removed',
      null,
      { permission_id: permissionId, is_granted: isGranted },
      createdBy
    );
  }
  
  // Clear cache
  clearRoleCache(roleId);
  
  return override;
}

/**
 * Remove a permission override
 * @param {number} roleId - Role ID
 * @param {number} permissionId - Permission ID
 * @returns {Promise<boolean>} Success status
 */
export async function removePermissionOverride(roleId, permissionId) {
  const [rows] = await db.query(
    'CALL RemovePermissionOverride(?, ?)',
    [roleId, permissionId]
  );
  
  // Clear cache
  clearRoleCache(roleId);
  
  return rows[0]?.[0]?.deleted_count > 0;
}

// ============================================================
// EFFECTIVE PERMISSIONS
// ============================================================

/**
 * Get effective permissions for a role (with inheritance and overrides)
 * @param {number} roleId - Role ID
 * @returns {Promise<Array>} List of effective permissions
 */
export async function getEffectivePermissions(roleId) {
  const now = Date.now();
  const cached = rolePermissionCache.get(roleId);
  
  if (cached && cached.expires > now) {
    return cached.permissions;
  }
  
  const [rows] = await db.query('CALL GetEffectivePermissions(?)', [roleId]);
  const permissions = rows[0] || [];
  
  rolePermissionCache.set(roleId, {
    permissions,
    expires: now + CACHE_TTL_MS
  });
  
  return permissions;
}

/**
 * Get effective permissions for a user
 * @param {string} userId - User ID
 * @returns {Promise<Set<string>>} Set of permission names
 */
export async function getUserEffectivePermissions(userId) {
  if (!userId) {
    return new Set();
  }
  
  const [rows] = await db.query('CALL GetUserEffectivePermissions(?)', [userId]);
  const permissions = rows[0] || [];
  
  return new Set(permissions.map(p => p.name));
}

/**
 * Check if a user has a specific permission
 * @param {string} userId - User ID
 * @param {string} permissionName - Permission name to check
 * @returns {Promise<boolean>} Whether user has the permission
 */
export async function userHasPermission(userId, permissionName) {
  const permissions = await getUserEffectivePermissions(userId);
  return permissions.has(permissionName);
}

/**
 * Check if a user has all specified permissions
 * @param {string} userId - User ID
 * @param {string[]} permissionNames - Permission names to check
 * @returns {Promise<boolean>} Whether user has all permissions
 */
export async function userHasAllPermissions(userId, permissionNames) {
  const permissions = await getUserEffectivePermissions(userId);
  return permissionNames.every(p => permissions.has(p));
}

/**
 * Check if a user has any of the specified permissions
 * @param {string} userId - User ID
 * @param {string[]} permissionNames - Permission names to check
 * @returns {Promise<boolean>} Whether user has any permission
 */
export async function userHasAnyPermission(userId, permissionNames) {
  const permissions = await getUserEffectivePermissions(userId);
  return permissionNames.some(p => permissions.has(p));
}

// ============================================================
// PERMISSION CATEGORIES
// ============================================================

/**
 * Get all permission categories
 * @returns {Promise<Array>} List of categories
 */
export async function getPermissionCategories() {
  const [rows] = await db.query('CALL GetPermissionCategories()');
  return rows[0] || [];
}

/**
 * Get permissions grouped by category
 * @param {string|null} scope - Filter by scope ('system', 'business', 'all', or null for all)
 * @returns {Promise<Array>} Permissions with category info
 */
export async function getPermissionsGroupedByCategory(scope = null) {
  const [rows] = await db.query('CALL GetPermissionsGroupedByCategory(?)', [scope]);
  return rows[0] || [];
}

// ============================================================
// AUDIT LOGGING
// ============================================================

/**
 * Log a role action to the audit log
 * @param {number} roleId - Role ID
 * @param {string} action - Action type
 * @param {Object|null} oldValues - Previous values
 * @param {Object|null} newValues - New values
 * @param {string} performedBy - User ID who performed the action
 * @returns {Promise<number>} Audit log ID
 */
export async function logRoleAction(roleId, action, oldValues, newValues, performedBy) {
  try {
    const [rows] = await db.query(
      'CALL LogRoleAction(?, ?, ?, ?, ?)',
      [
        roleId,
        action,
        oldValues ? JSON.stringify(oldValues) : null,
        newValues ? JSON.stringify(newValues) : null,
        performedBy
      ]
    );
    return rows[0]?.[0]?.audit_id;
  } catch (error) {
    // Log but don't fail the main operation
    console.error('[RoleService] Failed to log audit:', error.message);
    return null;
  }
}

/**
 * Get audit log for a role
 * @param {number} roleId - Role ID
 * @param {number} limit - Max records to return
 * @returns {Promise<Array>} Audit log entries
 */
export async function getRoleAuditLog(roleId, limit = 50) {
  const [rows] = await db.query('CALL GetRoleAuditLog(?, ?)', [roleId, limit]);
  return rows[0] || [];
}

// ============================================================
// VALIDATION HELPERS
// ============================================================

/**
 * Check if a business can manage a specific role
 * @param {number} roleId - Role ID
 * @param {string} businessId - Business ID
 * @returns {Promise<boolean>} Whether business can manage the role
 */
export async function canBusinessManageRole(roleId, businessId) {
  const role = await getRoleById(roleId);
  
  if (!role) {
    return false;
  }
  
  // Can only manage business-type roles that belong to this business
  return role.role_type === ROLE_TYPES.BUSINESS && role.role_for === businessId;
}

/**
 * Validate that a role name is unique within a business
 * @param {string} roleName - Role name to check
 * @param {string} businessId - Business ID
 * @param {number|null} excludeRoleId - Role ID to exclude (for updates)
 * @returns {Promise<boolean>} Whether name is available
 */
export async function isRoleNameAvailable(roleName, businessId, excludeRoleId = null) {
  let query = `
    SELECT COUNT(*) as count FROM user_role 
    WHERE role_name = ? AND role_for = ?
  `;
  const params = [roleName, businessId];
  
  if (excludeRoleId) {
    query += ' AND id != ?';
    params.push(excludeRoleId);
  }
  
  const [rows] = await db.query(query, params);
  return rows[0].count === 0;
}

export default {
  ROLE_TYPES,
  SYSTEM_ROLES,
  clearRoleCache,
  getRolesByType,
  getBusinessRoles,
  getRoleWithPermissions,
  getRoleById,
  createSystemRole,
  createCustomBusinessRole,
  updateBusinessRole,
  deleteBusinessRole,
  assignPermissionsToRole,
  removePermissionsFromRole,
  setRolePermissions,
  addPermissionOverride,
  removePermissionOverride,
  getEffectivePermissions,
  getUserEffectivePermissions,
  userHasPermission,
  userHasAllPermissions,
  userHasAnyPermission,
  getPermissionCategories,
  getPermissionsGroupedByCategory,
  logRoleAction,
  getRoleAuditLog,
  canBusinessManageRole,
  isRoleNameAvailable
};
