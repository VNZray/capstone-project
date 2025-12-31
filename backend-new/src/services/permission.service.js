/**
 * Permission Service
 * Handles permission caching and checking
 */
import { User, UserRole } from '../models/index.js';
import logger from '../config/logger.js';

// In-memory cache with TTL
const cache = new Map();
const TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Get user permissions with caching
 * @param {string} userId - User ID
 * @returns {Promise<Set<string>>} Set of permission names
 */
export async function getUserPermissions(userId) {
  if (!userId) return new Set();

  const now = Date.now();
  const cached = cache.get(userId);

  if (cached && cached.expires > now) {
    return cached.perms;
  }

  try {
    const user = await User.findByPk(userId, {
      include: [{
        model: UserRole,
        as: 'role',
        attributes: ['id', 'permissions'],
      }],
    });

    if (!user || !user.role) {
      return new Set();
    }

    // Parse permissions from role
    const permissions = user.role.permissions || [];
    const perms = new Set(Array.isArray(permissions) ? permissions : []);

    // Cache the result
    cache.set(userId, { perms, expires: now + TTL_MS });

    return perms;
  } catch (error) {
    logger.error(`Error fetching permissions for user ${userId}:`, error);
    return new Set();
  }
}

/**
 * Clear permission cache for a user or all users
 * @param {string|null} userId - User ID to clear, or null for all
 */
export function clearPermissionCache(userId = null) {
  if (userId) {
    cache.delete(userId);
    logger.debug(`Permission cache cleared for user ${userId}`);
  } else {
    cache.clear();
    logger.debug('Permission cache cleared for all users');
  }
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

export default {
  getUserPermissions,
  clearPermissionCache,
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
};
