import db from "../db.js";

// ============================================================
// ROLE CONTEXT (import from middleware for consistency)
// ============================================================

/**
 * Fetch complete role context for a user (role properties + permissions)
 * @param {string} userId 
 * @returns {Promise<Object|null>} Role context
 */
async function getRoleContext(userId) {
  if (!userId) return null;

  const [roleRows] = await db.query(
    `SELECT 
       ur.id AS role_id,
       ur.role_name,
       ur.role_type,
       ur.role_for,
       ur.is_custom,
       ur.is_immutable
     FROM user u
     JOIN user_role ur ON ur.id = u.user_role_id
     WHERE u.id = ?`,
    [userId]
  );

  if (!roleRows || roleRows.length === 0) return null;

  const role = roleRows[0];

  const [permRows] = await db.query(
    `SELECT p.name
     FROM role_permissions rp
     JOIN permissions p ON p.id = rp.permission_id
     WHERE rp.user_role_id = ?`,
    [role.role_id]
  );

  const permissions = new Set(permRows.map(r => r.name));

  return {
    roleId: role.role_id,
    roleName: role.role_name,
    roleType: role.role_type,
    roleFor: role.role_for,
    isCustom: role.is_custom,
    isImmutable: role.is_immutable,
    permissions,
    isSystemRole: role.role_type === 'system',
    isBusinessRole: role.role_type === 'business',
    hasPlatformScope: role.role_type === 'system' && !role.role_for,
    hasBusinessScope: role.role_type === 'business' || !!role.role_for,
  };
}

/**
 * Fetch the role name for a user.
 * @param {string} userId
 * @returns {Promise<string|null>}
 */
export async function getUserRole(userId) {
  if (!userId) return null;

  const [rows] = await db.query(
    `SELECT ur.role_name
     FROM user u
     JOIN user_role ur ON ur.id = u.user_role_id
     WHERE u.id = ?`,
    [userId]
  );

  return rows && rows.length > 0 ? rows[0].role_name : null;
}

/**
 * Get full role context for a user including properties and permissions
 * @param {string} userId
 * @returns {Promise<Object|null>}
 */
export async function getUserRoleContext(userId) {
  return getRoleContext(userId);
}

/**
 * Ensure req.user has role context attached; fetch from DB when missing.
 * @param {import("express").Request} req
 * @returns {Promise<Object|null>} Role context
 */
export async function ensureUserRole(req) {
  if (!req?.user?.id) {
    console.error('[ensureUserRole] No user ID in request');
    return null;
  }

  // If we already have full context, return it
  if (req.roleContext) {
    return req.roleContext;
  }

  try {
    const context = await getRoleContext(req.user.id);
    if (context) {
      req.roleContext = context;
      req.user.role = context.roleName;
      req.user.roleRaw = context.roleName;
      req.user.roleType = context.roleType;
      req.user.roleFor = context.roleFor;
      req.user.permissions = context.permissions;
      console.log('[ensureUserRole] Role context resolved for user', req.user.id, ':', context.roleName, `(${context.roleType})`);
    } else {
      console.error('[ensureUserRole] No role found in DB for user:', req.user.id);
    }
    return context;
  } catch (error) {
    console.error('[ensureUserRole] Database error fetching role for user', req.user.id, ':', error);
    return null;
  }
}

/**
 * Check if a user has access to a business.
 * Uses role properties and permissions instead of hardcoded role names.
 * 
 * Access is granted if:
 * 1. User has platform scope with business viewing permissions (e.g., Admin)
 * 2. User is the owner of the business
 * 3. User is staff assigned to the business
 * 4. User has a business role (role_for) matching the business
 * 
 * @param {string} businessId
 * @param {Object} user - User object with id property
 * @param {Object} [roleContext] - Pre-fetched role context (optional)
 * @returns {Promise<boolean>}
 */
export async function hasBusinessAccess(businessId, user, roleContext = null) {
  if (!businessId || !user?.id) return false;

  // Get role context if not provided
  const context = roleContext || await getRoleContext(user.id);
  if (!context) return false;

  // Platform-scope system roles with appropriate permissions can access any business
  if (context.isSystemRole && context.hasPlatformScope) {
    const platformBusinessPerms = ['view_all_profiles', 'approve_business', 'manage_services', 'manage_users'];
    const hasPlatformAccess = platformBusinessPerms.some(p => context.permissions.has(p));
    if (hasPlatformAccess) {
      return true;
    }
  }

  // Business roles: check if role_for matches the business
  if (context.isBusinessRole && context.roleFor === businessId) {
    return true;
  }

  // Check if user is owner of this business
  const [ownerRows] = await db.query(
    `SELECT b.id
     FROM business b
     JOIN owner o ON b.owner_id = o.id
     WHERE b.id = ? AND o.user_id = ?`,
    [businessId, user.id]
  );

  if (ownerRows && ownerRows.length > 0) {
    return true;
  }

  // Check if user is staff of this business
  const [staffRows] = await db.query(
    `SELECT id FROM staff WHERE business_id = ? AND user_id = ?`,
    [businessId, user.id]
  );

  if (staffRows && staffRows.length > 0) {
    return true;
  }

  return false;
}

/**
 * Check if user has a specific permission
 * @param {string} userId
 * @param {string} permission - Permission name to check
 * @returns {Promise<boolean>}
 */
export async function hasPermission(userId, permission) {
  if (!userId || !permission) return false;
  
  const context = await getRoleContext(userId);
  if (!context) return false;
  
  return context.permissions.has(permission);
}

/**
 * Check if user has any of the specified permissions
 * @param {string} userId
 * @param {string[]} permissions - Permission names to check (OR logic)
 * @returns {Promise<boolean>}
 */
export async function hasAnyPermission(userId, permissions) {
  if (!userId || !permissions?.length) return false;
  
  const context = await getRoleContext(userId);
  if (!context) return false;
  
  return permissions.some(p => context.permissions.has(p));
}

/**
 * Check if user has all of the specified permissions
 * @param {string} userId
 * @param {string[]} permissions - Permission names to check (AND logic)
 * @returns {Promise<boolean>}
 */
export async function hasAllPermissions(userId, permissions) {
  if (!userId || !permissions?.length) return false;
  
  const context = await getRoleContext(userId);
  if (!context) return false;
  
  return permissions.every(p => context.permissions.has(p));
}

export default {
  getUserRole,
  getUserRoleContext,
  ensureUserRole,
  hasBusinessAccess,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
};
