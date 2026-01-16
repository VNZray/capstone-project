import db from '../db.js';

// Simple in-memory cache with TTL to reduce DB lookups
const cache = new Map(); // key: userId, value: { perms: Set<string>, expires: number }
const TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Get user permissions using simplified RBAC system
 *
 * Permission sources:
 * - System roles (Admin, Tourist, etc.): permissions from role_permissions table
 * - Business roles (Staff): permissions from user_permissions table (per-user)
 *
 * @param {string} userId - User ID
 * @returns {Promise<Set<string>>} Set of permission names
 */
export async function getUserPermissions(userId) {
  if (!userId) return new Set();
  const now = Date.now();
  const cached = cache.get(userId);
  if (cached && cached.expires > now) return cached.perms;

  try {
    // Try the simplified stored procedure first
    const [rows] = await db.query('CALL GetUserPermissions(?)', [userId]);
    const perms = new Set((rows[0] || []).map((r) => r.name));
    cache.set(userId, { perms, expires: now + TTL_MS });
    return perms;
  } catch (error) {
    // Fallback to direct query if procedure doesn't exist
    if (error.code === 'ER_SP_DOES_NOT_EXIST') {
      // Get role type first
      const [roleRows] = await db.query(
        `SELECT ur.role_type, ur.id as role_id
         FROM user u
         JOIN user_role ur ON ur.id = u.user_role_id
         WHERE u.id = ?`,
        [userId]
      );

      if (!roleRows || roleRows.length === 0) {
        cache.set(userId, { perms: new Set(), expires: now + TTL_MS });
        return new Set();
      }

      const { role_type, role_id } = roleRows[0];
      let perms;

      if (role_type === 'system') {
        // System roles: get from role_permissions
        const [permRows] = await db.query(
          `SELECT p.name
           FROM role_permissions rp
           JOIN permissions p ON p.id = rp.permission_id
           WHERE rp.user_role_id = ?`,
          [role_id]
        );
        perms = new Set(permRows.map((r) => r.name));
      } else {
        // Business roles: get from user_permissions
        const [permRows] = await db.query(
          `SELECT p.name
           FROM user_permissions up
           JOIN permissions p ON p.id = up.permission_id
           WHERE up.user_id = ?`,
          [userId]
        );
        perms = new Set(permRows.map((r) => r.name));
      }

      cache.set(userId, { perms, expires: now + TTL_MS });
      return perms;
    }
    throw error;
  }
}

/**
 * Clear permission cache for a user or all users
 * @param {string|null} userId - User ID to clear, or null for all
 */
export function clearPermissionCache(userId) {
  if (userId) cache.delete(userId);
  else cache.clear();
}

/**
 * Check if a user has a specific permission
 * @param {string} userId - User ID
 * @param {string} permissionName - Permission name to check
 * @returns {Promise<boolean>} Whether user has the permission
 */
export async function hasPermission(userId, permissionName) {
  const perms = await getUserPermissions(userId);
  return perms.has(permissionName);
}

/**
 * Check if a user has all specified permissions
 * @param {string} userId - User ID
 * @param {string[]} permissionNames - Permission names to check
 * @returns {Promise<boolean>} Whether user has all permissions
 */
export async function hasAllPermissions(userId, permissionNames) {
  const perms = await getUserPermissions(userId);
  return permissionNames.every(p => perms.has(p));
}

/**
 * Check if a user has any of the specified permissions
 * @param {string} userId - User ID
 * @param {string[]} permissionNames - Permission names to check
 * @returns {Promise<boolean>} Whether user has any permission
 */
export async function hasAnyPermission(userId, permissionNames) {
  const perms = await getUserPermissions(userId);
  return permissionNames.some(p => perms.has(p));
}

// ============================================================
// USER PERMISSION MANAGEMENT (for Staff members)
// ============================================================

/**
 * Grant a permission to a user (staff member)
 * @param {string} userId - User ID to grant permission to
 * @param {number} permissionId - Permission ID to grant
 * @param {string} grantedBy - User ID of the granter (business owner)
 * @returns {Promise<Object>} The granted permission
 */
export async function grantUserPermission(userId, permissionId, grantedBy) {
  clearPermissionCache(userId);

  try {
    const [rows] = await db.query('CALL GrantUserPermission(?, ?, ?)', [userId, permissionId, grantedBy]);
    return rows[0]?.[0] || null;
  } catch (error) {
    if (error.code === 'ER_SP_DOES_NOT_EXIST') {
      // Fallback to direct query
      await db.query(
        `INSERT INTO user_permissions (user_id, permission_id, granted_by)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE granted_by = ?`,
        [userId, permissionId, grantedBy, grantedBy]
      );
      const [rows] = await db.query(
        `SELECT up.*, p.name AS permission_name
         FROM user_permissions up
         JOIN permissions p ON p.id = up.permission_id
         WHERE up.user_id = ? AND up.permission_id = ?`,
        [userId, permissionId]
      );
      return rows[0] || null;
    }
    throw error;
  }
}

/**
 * Revoke a permission from a user (staff member)
 * @param {string} userId - User ID to revoke permission from
 * @param {number} permissionId - Permission ID to revoke
 * @returns {Promise<boolean>} Whether the permission was revoked
 */
export async function revokeUserPermission(userId, permissionId) {
  clearPermissionCache(userId);

  try {
    const [rows] = await db.query('CALL RevokeUserPermission(?, ?)', [userId, permissionId]);
    return (rows[0]?.[0]?.revoked_count || 0) > 0;
  } catch (error) {
    if (error.code === 'ER_SP_DOES_NOT_EXIST') {
      const [result] = await db.query(
        `DELETE FROM user_permissions WHERE user_id = ? AND permission_id = ?`,
        [userId, permissionId]
      );
      return result.affectedRows > 0;
    }
    throw error;
  }
}

/**
 * Set all permissions for a user (replaces existing permissions)
 * @param {string} userId - User ID to set permissions for
 * @param {number[]} permissionIds - Array of permission IDs to set
 * @param {string} grantedBy - User ID of the granter (business owner)
 * @returns {Promise<Object[]>} The user's new permissions
 */
export async function setUserPermissions(userId, permissionIds, grantedBy) {
  clearPermissionCache(userId);

  try {
    const [rows] = await db.query('CALL SetUserPermissions(?, ?, ?)', [
      userId,
      JSON.stringify(permissionIds),
      grantedBy
    ]);
    return rows[0] || [];
  } catch (error) {
    if (error.code === 'ER_SP_DOES_NOT_EXIST') {
      // Fallback: delete all and insert new
      await db.query('DELETE FROM user_permissions WHERE user_id = ?', [userId]);

      if (permissionIds.length > 0) {
        const values = permissionIds.map(pid => [userId, pid, grantedBy]);
        await db.query(
          `INSERT INTO user_permissions (user_id, permission_id, granted_by) VALUES ?`,
          [values]
        );
      }

      const [rows] = await db.query(
        `SELECT up.*, p.name AS permission_name
         FROM user_permissions up
         JOIN permissions p ON p.id = up.permission_id
         WHERE up.user_id = ?`,
        [userId]
      );
      return rows;
    }
    throw error;
  }
}

/**
 * Get all permissions for a specific user
 * @param {string} userId - User ID
 * @returns {Promise<Object[]>} Array of permission objects
 */
export async function getUserPermissionsList(userId) {
  const [rows] = await db.query(
    `SELECT up.permission_id AS id, p.name, p.description, p.scope, pc.name AS category_name
     FROM user_permissions up
     JOIN permissions p ON p.id = up.permission_id
     LEFT JOIN permission_categories pc ON pc.id = p.category_id
     WHERE up.user_id = ?
     ORDER BY pc.sort_order, p.name`,
    [userId]
  );
  return rows;
}

/**
 * Get all available permissions (for UI selection)
 * @param {string} scope - Optional scope filter ('system', 'business', 'all')
 * @param {string} portal - Optional portal filter ('business', 'tourism')
 * @returns {Promise<Object[]>} Array of permission objects grouped by category
 */
export async function getAvailablePermissions(scope = null, portal = null) {
  let query = `
    SELECT p.id, p.name, p.description, p.scope,
           pc.id AS category_id, pc.name AS category_name, pc.sort_order, pc.portal
    FROM permissions p
    LEFT JOIN permission_categories pc ON pc.id = p.category_id
  `;

  const params = [];
  const conditions = [];

  if (scope && scope !== 'all') {
    conditions.push(`(p.scope = ? OR p.scope = 'all')`);
    params.push(scope);
  }

  if (portal) {
    conditions.push(`(pc.portal = ? OR pc.portal = 'shared')`);
    params.push(portal);
  }

  if (conditions.length > 0) {
    query += ` WHERE ` + conditions.join(' AND ');
  }

  query += ` ORDER BY pc.sort_order, p.name`;

  const [rows] = await db.query(query, params);
  return rows;
}
