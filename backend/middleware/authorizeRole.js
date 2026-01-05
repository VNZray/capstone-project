/**
 * Authorization Middleware - Simplified RBAC
 * 
 * Simple authorization using:
 * 1. Role names (for route-level access: Admin, Business Owner, Staff, etc.)
 * 2. Permissions (for feature-level access)
 * 
 * Roles: Admin, Tourism Officer, Business Owner, Tourist, Staff
 * Business access is determined by staff.business_id, not role_for.
 * 
 * @module middleware/authorizeRole
 */

import db from '../db.js';

// ============================================================
// ROLE CONTEXT HELPERS
// ============================================================

/**
 * Fetch complete role context for a user (role + permissions)
 * 
 * Permission sources:
 * - Most roles: role_permissions table
 * - Staff role: user_permissions table (per-user)
 * 
 * @param {string} userId 
 * @returns {Promise<Object|null>} Role context
 */
async function getRoleContext(userId) {
  if (!userId) return null;

  // Get role properties
  const [roleRows] = await db.query(
    `SELECT 
       ur.id AS role_id,
       ur.role_name
     FROM user u
     JOIN user_role ur ON ur.id = u.user_role_id
     WHERE u.id = ?`,
    [userId]
  );

  if (!roleRows || roleRows.length === 0) return null;

  const role = roleRows[0];
  let permissions;

  if (role.role_name === 'Staff') {
    // Staff: permissions from user_permissions (per-user)
    const [permRows] = await db.query(
      `SELECT p.name FROM user_permissions up
       JOIN permissions p ON p.id = up.permission_id
       WHERE up.user_id = ?`,
      [userId]
    );
    permissions = new Set(permRows.map(r => r.name));
  } else {
    // All other roles: permissions from role_permissions
    const [permRows] = await db.query(
      `SELECT p.name FROM role_permissions rp
       JOIN permissions p ON p.id = rp.permission_id
       WHERE rp.user_role_id = ?`,
      [role.role_id]
    );
    permissions = new Set(permRows.map(r => r.name));
  }

  return {
    roleId: role.role_id,
    roleName: role.role_name,
    isStaff: role.role_name === 'Staff',
    permissions,
  };
}

/**
 * Attach role context to request if not already present
 */
async function ensureRoleContext(req) {
  if (req.roleContext) return req.roleContext;
  
  const context = await getRoleContext(req.user?.id);
  if (context) {
    req.roleContext = context;
    req.user.role = context.roleName;
    req.user.permissions = context.permissions;
  }
  return context;
}

// ============================================================
// PERMISSION-BASED AUTHORIZATION
// ============================================================

/**
 * Require user to have ALL specified permissions
 * @param {...string} requiredPermissions - Permission names (AND logic)
 * 
 * @example
 * router.post('/staff', authenticate, authorize('add_staff'), addStaff)
 */
export function authorize(...requiredPermissions) {
  return async function (req, res, next) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const context = await ensureRoleContext(req);
      if (!context) {
        return res.status(403).json({ message: 'User role not found' });
      }

      const missing = requiredPermissions.filter(p => !context.permissions.has(p));
      
      if (missing.length > 0) {
        return res.status(403).json({
          message: 'Forbidden: missing permissions',
          required: requiredPermissions,
          missing,
        });
      }

      return next();
    } catch (err) {
      console.error('[authorize] Error:', err);
      return res.status(500).json({ message: 'Authorization error' });
    }
  };
}

/**
 * Require user to have ANY of the specified permissions
 * @param {...string} requiredPermissions - Permission names (OR logic)
 * 
 * @example
 * router.get('/dashboard', authenticate, authorizeAny('view_dashboard', 'view_reports'), getDashboard)
 */
export function authorizeAny(...requiredPermissions) {
  return async function (req, res, next) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const context = await ensureRoleContext(req);
      if (!context) {
        return res.status(403).json({ message: 'User role not found' });
      }

      const hasAny = requiredPermissions.some(p => context.permissions.has(p));
      
      if (!hasAny) {
        return res.status(403).json({
          message: 'Forbidden: requires one of these permissions',
          required: requiredPermissions,
        });
      }

      return next();
    } catch (err) {
      console.error('[authorizeAny] Error:', err);
      return res.status(500).json({ message: 'Authorization error' });
    }
  };
}

// ============================================================
// ROLE-BASED AUTHORIZATION (Simple, hardcoded roles)
// ============================================================

/**
 * Require user to have one of the specified roles
 * @param {...string} allowedRoles - Role names (e.g., "Admin", "Business Owner")
 * 
 * @example
 * router.get('/admin', authenticate, authorizeRole('Admin', 'Tourism Officer'), adminDashboard)
 */
export function authorizeRole(...allowedRoles) {
  return async function (req, res, next) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const context = await ensureRoleContext(req);
      if (!context) {
        return res.status(403).json({ message: 'User role not found' });
      }

      const userRole = context.roleName?.toLowerCase() || '';
      const allowed = allowedRoles.map(r => r.toLowerCase());

      // Direct role match
      let roleOk = allowed.includes(userRole);

      // Staff can access routes that allow Business Owner (for business management)
      if (!roleOk && context.isStaff) {
        if (allowed.includes('business owner') || allowed.includes('staff')) {
          roleOk = true;
        }
      }

      if (!roleOk) {
        return res.status(403).json({ 
          message: 'Forbidden: role not allowed',
          required: allowedRoles,
          current: context.roleName
        });
      }

      return next();
    } catch (err) {
      console.error('[authorizeRole] Error:', err);
      return res.status(500).json({ message: 'Authorization error' });
    }
  };
}

// ============================================================
// BUSINESS ACCESS AUTHORIZATION
// ============================================================

/**
 * Verify user has access to a specific business
 * Allows: Business owners, staff of that business, or Admins
 * 
 * Business access is determined by:
 * - Admin role (can access any business)
 * - Owner of the business (via owner.user_id)
 * - Staff of the business (via staff.business_id)
 * 
 * @param {string} [businessIdParam='businessId'] - Request param name
 * 
 * @example
 * router.get('/store/:businessId', authenticate, authorizeBusinessAccess(), getStore)
 */
export function authorizeBusinessAccess(businessIdParam = 'businessId') {
  return async function (req, res, next) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const businessId = req.params[businessIdParam] || req.body[businessIdParam] || req.query[businessIdParam];
      
      if (!businessId) {
        return res.status(400).json({ message: `Business ID required` });
      }

      const context = await ensureRoleContext(req);
      if (!context) {
        return res.status(403).json({ message: 'User role not found' });
      }

      // Admin can access any business
      if (context.roleName === 'Admin') {
        req.businessId = businessId;
        return next();
      }

      // Check if user is owner of this business
      const [ownerRows] = await db.query(
        `SELECT b.id FROM business b
         JOIN owner o ON b.owner_id = o.id
         WHERE b.id = ? AND o.user_id = ?`,
        [businessId, req.user.id]
      );

      if (ownerRows && ownerRows.length > 0) {
        req.businessId = businessId;
        req.isBusinessOwner = true;
        return next();
      }

      // Check if user is staff of this business (via staff.business_id)
      const [staffRows] = await db.query(
        `SELECT id FROM staff WHERE business_id = ? AND user_id = ?`,
        [businessId, req.user.id]
      );

      if (staffRows && staffRows.length > 0) {
        req.businessId = businessId;
        req.isStaff = true;
        return next();
      }

      return res.status(403).json({
        message: 'Forbidden: no access to this business',
      });
    } catch (err) {
      console.error('[authorizeBusinessAccess] Error:', err);
      return res.status(500).json({ message: 'Authorization error' });
    }
  };
}

// ============================================================
// EXPORTS
// ============================================================

export { getRoleContext, ensureRoleContext };
