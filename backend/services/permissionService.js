import db from '../db.js';

// Simple in-memory cache with TTL to reduce DB lookups
const cache = new Map(); // key: userId, value: { perms: Set<string>, expires: number }
const TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Get user permissions using the enhanced RBAC system
 * Supports:
 * - Direct permissions assigned to user's role
 * - Inherited permissions from preset-based roles
 * - Permission overrides (grants and revokes)
 * 
 * @param {string} userId - User ID
 * @returns {Promise<Set<string>>} Set of permission names
 */
export async function getUserPermissions(userId) {
  if (!userId) return new Set();
  const now = Date.now();
  const cached = cache.get(userId);
  if (cached && cached.expires > now) return cached.perms;

  // Use the enhanced stored procedure if available, fallback to legacy
  try {
    const [rows] = await db.query('CALL GetUserEffectivePermissions(?)', [userId]);
    const perms = new Set((rows[0] || []).map((r) => r.name));
    cache.set(userId, { perms, expires: now + TTL_MS });
    return perms;
  } catch (error) {
    // Fallback to legacy query if procedure doesn't exist yet
    if (error.code === 'ER_SP_DOES_NOT_EXIST') {
      const [rows] = await db.query(
        `SELECT p.name
         FROM user u
         JOIN role_permissions rp ON rp.user_role_id = u.user_role_id
         JOIN permissions p ON p.id = rp.permission_id
         WHERE u.id = ?`,
        [userId]
      );
      const perms = new Set(rows.map((r) => r.name));
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

