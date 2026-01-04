import db from "../db.js";

// ============================================================
// ROLE CONTEXT (Simplified RBAC)
// ============================================================

/**
 * Fetch complete role context for a user (role properties + permissions)
 * 
 * Simplified model:
 * - System roles: permissions from role_permissions table
 * - Staff role: permissions from user_permissions table (per-user)
 * - Business access determined by staff.business_id (not role_for)
 * 
 * @param {string} userId 
 * @returns {Promise<Object|null>} Role context
 */
async function getRoleContext(userId) {
  if (!userId) return null;

  const [roleRows] = await db.query(
    `SELECT 
       ur.id AS role_id,
       ur.role_name,
       ur.is_immutable
     FROM user u
     JOIN user_role ur ON ur.id = u.user_role_id
     WHERE u.id = ?`,
    [userId]
  );

  if (!roleRows || roleRows.length === 0) return null;

  const role = roleRows[0];
  let permissions;

  if (role.role_name === 'Staff') {
    // Staff: get permissions from user_permissions (per-user)
    const [permRows] = await db.query(
      `SELECT p.name
       FROM user_permissions up
       JOIN permissions p ON p.id = up.permission_id
       WHERE up.user_id = ?`,
      [userId]
    );
    permissions = new Set(permRows.map(r => r.name));
  } else {
    // System roles: get permissions from role_permissions
    const [permRows] = await db.query(
      `SELECT p.name
       FROM role_permissions rp
       JOIN permissions p ON p.id = rp.permission_id
       WHERE rp.user_role_id = ?`,
      [role.role_id]
    );
    permissions = new Set(permRows.map(r => r.name));
  }

  const isStaff = role.role_name === 'Staff';
  const isPlatformRole = ['Admin', 'Tourism Officer'].includes(role.role_name);

  return {
    roleId: role.role_id,
    roleName: role.role_name,
    isImmutable: role.is_immutable,
    permissions,
    isStaff,
    isPlatformRole,
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
      req.user.permissions = context.permissions;
      console.log('[ensureUserRole] Role context resolved for user', req.user.id, ':', context.roleName);
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
 * 
 * Access is granted if:
 * 1. User is Admin (can access any business)
 * 2. User is the owner of the business
 * 3. User is staff assigned to the business (via staff.business_id)
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

  // Admin can access any business
  if (context.roleName === 'Admin') {
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
