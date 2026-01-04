import db from '../db.js';

// ============================================================
// ROLE CONTEXT HELPERS
// ============================================================

/**
 * Fetch complete role context for a user (role properties + permissions)
 * This is the foundation for property-based authorization without hardcoded role names
 * @param {string} userId 
 * @returns {Promise<Object|null>} Role context with properties and permissions
 */
async function getRoleContext(userId) {
  if (!userId) return null;

  // Get role properties
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

  // Get permissions for this role
  const [permRows] = await db.query(
    `SELECT p.name, p.scope
     FROM role_permissions rp
     JOIN permissions p ON p.id = rp.permission_id
     WHERE rp.user_role_id = ?`,
    [role.role_id]
  );

  const permissions = new Set(permRows.map(r => r.name));
  const permissionScopes = new Set(permRows.map(r => r.scope));

  return {
    roleId: role.role_id,
    roleName: role.role_name,
    roleType: role.role_type,        // 'system' or 'business'
    roleFor: role.role_for,          // business_id if business role, null otherwise
    isCustom: role.is_custom,
    isImmutable: role.is_immutable,
    permissions,
    permissionScopes,
    // Derived scope indicators (no hardcoded role names!)
    isSystemRole: role.role_type === 'system',
    isBusinessRole: role.role_type === 'business',
    hasPlatformScope: role.role_type === 'system' && !role.role_for,
    hasBusinessScope: role.role_type === 'business' || !!role.role_for,
  };
}

/**
 * Attach role context to request if not already present
 * @param {Object} req Express request
 * @returns {Promise<Object|null>} Role context
 */
async function ensureRoleContext(req) {
  if (req.roleContext) return req.roleContext;
  
  const context = await getRoleContext(req.user?.id);
  if (context) {
    req.roleContext = context;
    // Backward compatibility
    req.user.role = context.roleName;
    req.user.roleType = context.roleType;
    req.user.roleFor = context.roleFor;
    req.user.permissions = context.permissions;
  }
  return context;
}

// ============================================================
// PERMISSION-BASED AUTHORIZATION (RECOMMENDED)
// ============================================================

/**
 * Middleware: Require user to have ALL specified permissions
 * Use this for feature-level access control
 * @param {...string} requiredPermissions - Permission names required (AND logic)
 * @returns {Function} Express middleware
 * 
 * @example
 * router.post('/staff', authenticate, authorize('add_staff', 'view_staff'), addStaff)
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

      // Check if user has ALL required permissions
      const missing = requiredPermissions.filter(p => !context.permissions.has(p));
      
      if (missing.length > 0) {
        return res.status(403).json({
          message: 'Forbidden: missing required permissions',
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
 * Middleware: Require user to have ANY of the specified permissions
 * Use for routes accessible by multiple capability sets
 * @param {...string} requiredPermissions - Permission names (OR logic)
 * @returns {Function} Express middleware
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

      // Check if user has ANY of the required permissions
      const hasAny = requiredPermissions.some(p => context.permissions.has(p));
      
      if (!hasAny) {
        return res.status(403).json({
          message: 'Forbidden: requires at least one of the specified permissions',
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
// SCOPE-BASED AUTHORIZATION (FOR ROUTE-LEVEL ACCESS)
// ============================================================

/**
 * Middleware: Require user's role to match a specific scope
 * Scope is determined by role properties, NOT role names
 * 
 * @param {'platform'|'business'|'any'} scope - Required scope
 * @returns {Function} Express middleware
 * 
 * Scope definitions (no hardcoded role names!):
 * - 'platform': System roles without business binding (Admin, Tourism Officer, etc.)
 * - 'business': Business-specific roles OR system roles with business binding
 * - 'any': Any authenticated user
 * 
 * @example
 * // Tourism admin routes - only platform-level system roles
 * router.get('/admin/users', authenticate, authorizeScope('platform'), getUsers)
 * 
 * // Business routes - any role with business access
 * router.get('/store/:businessId', authenticate, authorizeScope('business'), getStore)
 */
export function authorizeScope(scope) {
  return async function (req, res, next) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const context = await ensureRoleContext(req);
      if (!context) {
        return res.status(403).json({ message: 'User role not found' });
      }

      let authorized = false;

      switch (scope) {
        case 'platform':
          // System roles without business binding that have platform-level permissions
          authorized = context.isSystemRole && context.hasPlatformScope;
          break;
        case 'business':
          // Business roles OR roles with business scope
          authorized = context.isBusinessRole || context.hasBusinessScope;
          break;
        case 'any':
          authorized = true;
          break;
        default:
          console.error(`[authorizeScope] Unknown scope: ${scope}`);
          return res.status(500).json({ message: 'Invalid scope configuration' });
      }

      if (!authorized) {
        return res.status(403).json({
          message: `Forbidden: requires ${scope} scope`,
          currentScope: context.isBusinessRole ? 'business' : (context.hasPlatformScope ? 'platform' : 'unknown'),
        });
      }

      return next();
    } catch (err) {
      console.error('[authorizeScope] Error:', err);
      return res.status(500).json({ message: 'Authorization error' });
    }
  };
}

// ============================================================
// BUSINESS ACCESS AUTHORIZATION
// ============================================================

/**
 * Middleware: Verify user has access to a specific business
 * Works for: Business owners, staff assigned to that business, or platform admins
 * 
 * @param {string} [businessIdParam='businessId'] - Request param name containing business ID
 * @param {Object} [options={}] - Additional options
 * @param {string[]} [options.requiredPermissions=[]] - Permissions also required
 * @returns {Function} Express middleware
 * 
 * @example
 * // Basic business access check
 * router.get('/store/:businessId', authenticate, authorizeBusinessAccess(), getStore)
 * 
 * // With permission requirement
 * router.post('/store/:businessId/products', authenticate, authorizeBusinessAccess('businessId', { requiredPermissions: ['manage_products'] }), addProduct)
 */
export function authorizeBusinessAccess(businessIdParam = 'businessId', options = {}) {
  const { requiredPermissions = [] } = options;
  
  return async function (req, res, next) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const businessId = req.params[businessIdParam] || req.body[businessIdParam] || req.query[businessIdParam];
      
      if (!businessId) {
        return res.status(400).json({ message: `Business ID required (param: ${businessIdParam})` });
      }

      const context = await ensureRoleContext(req);
      if (!context) {
        return res.status(403).json({ message: 'User role not found' });
      }

      // Check required permissions first
      if (requiredPermissions.length > 0) {
        const missing = requiredPermissions.filter(p => !context.permissions.has(p));
        if (missing.length > 0) {
          return res.status(403).json({
            message: 'Forbidden: missing required permissions',
            required: requiredPermissions,
            missing,
          });
        }
      }

      // Platform-scope system roles with appropriate permissions can access any business
      // (e.g., Admin reviewing a business)
      if (context.isSystemRole && context.hasPlatformScope) {
        // Check if they have any business-viewing permission
        const platformBusinessPerms = ['view_all_profiles', 'approve_business', 'manage_services'];
        const hasPlatformAccess = platformBusinessPerms.some(p => context.permissions.has(p));
        if (hasPlatformAccess) {
          req.businessId = businessId;
          return next();
        }
      }

      // Business roles: check if role_for matches the business
      if (context.isBusinessRole && context.roleFor === businessId) {
        req.businessId = businessId;
        return next();
      }

      // System roles with business permissions: check ownership or staff membership
      // Check if user is owner of this business
      const [ownerRows] = await db.query(
        `SELECT b.id
         FROM business b
         JOIN owner o ON b.owner_id = o.id
         WHERE b.id = ? AND o.user_id = ?`,
        [businessId, req.user.id]
      );

      if (ownerRows && ownerRows.length > 0) {
        req.businessId = businessId;
        req.isBusinessOwner = true;
        return next();
      }

      // Check if user is staff of this business
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
        businessId,
      });
    } catch (err) {
      console.error('[authorizeBusinessAccess] Error:', err);
      return res.status(500).json({ message: 'Authorization error' });
    }
  };
}

// ============================================================
// LEGACY SUPPORT (DEPRECATED - Use permission-based auth)
// ============================================================

const normalizeRole = (role) => (role || '').toLowerCase();

/**
 * @deprecated Use authorize() or authorizeAny() with permissions instead
 * Middleware: Require user to have one of the specified roles
 * @param {...string} allowedRoles - Role names that are allowed
 * @returns {Function} Express middleware
 */
export function authorizeRole(...allowedRoles) {
  console.warn('[DEPRECATED] authorizeRole() is deprecated. Use authorize() with permissions instead.');
  
  return async function (req, res, next) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const context = await ensureRoleContext(req);
      if (!context) {
        return res.status(403).json({ message: 'User role not found' });
      }

      const userRole = normalizeRole(context.roleName);
      const allowed = allowedRoles.map(normalizeRole);

      // Check if user's role is in the allowed list
      let roleOk = allowed.includes(userRole);

      // RBAC Enhancement: Custom business roles should be treated as having business access
      // If route allows staff-like roles and user has a business role, allow access
      if (!roleOk && context.isBusinessRole) {
        const staffLikeRoles = ['manager', 'room manager', 'receptionist', 'sales associate', 'staff', 'business owner'];
        const requiresStaffAccess = allowed.some(r => staffLikeRoles.includes(r) || r.includes('staff'));
        
        if (requiresStaffAccess) {
          roleOk = true;
          console.log('[authorizeRole] Custom business role granted staff access:', context.roleName);
        }
      }

      if (!roleOk) {
        return res.status(403).json({ 
          message: 'Forbidden: insufficient role permissions',
          required: allowedRoles,
          current: context.roleName
        });
      }

      // Attach role to request for downstream use
      req.user.role = context.roleName;
      req.user.roleNormalized = userRole;
      return next();
    } catch (err) {
      console.error('[authorizeRole] Error:', err);
      return res.status(500).json({ message: 'Authorization error' });
    }
  };
}

/**
 * @deprecated Use authorizeAny() with permissions instead
 * Middleware: Require user to have ANY of the specified roles OR permissions
 * Provides flexible RBAC with fallback to permission-based access
 * @param {Object} options
 * @param {string[]} options.roles - Allowed role names
 * @param {string[]} options.permissions - Allowed permission names (OR semantics)
 * @returns {Function} Express middleware
 */
export function authorizeRoleOrPermission({ roles = [], permissions = [] }) {
  console.warn('[DEPRECATED] authorizeRoleOrPermission() is deprecated. Use authorizeAny() with permissions instead.');
  
  return async function (req, res, next) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const context = await ensureRoleContext(req);
      if (!context) {
        return res.status(403).json({ message: 'User role not found' });
      }

      const userRoleNorm = normalizeRole(context.roleName);

      // Check role first (fastest) - for backward compatibility
      if (roles.length > 0 && roles.map(normalizeRole).includes(userRoleNorm)) {
        req.user.role = context.roleName;
        req.user.roleNormalized = userRoleNorm;
        return next();
      }

      // Check business roles for staff-like access
      if (roles.length > 0 && context.isBusinessRole) {
        const staffLikeRoles = ['manager', 'room manager', 'receptionist', 'sales associate', 'staff', 'business owner'];
        const requiresStaffAccess = roles.map(normalizeRole).some(r => staffLikeRoles.includes(r) || r.includes('staff'));
        
        if (requiresStaffAccess) {
          req.user.role = context.roleName;
          req.user.roleNormalized = userRoleNorm;
          console.log('[authorizeRoleOrPermission] Custom business role granted staff access:', context.roleName);
          return next();
        }
      }

      // If roles don't match, check permissions
      if (permissions.length > 0) {
        const hasPermission = permissions.some(p => context.permissions.has(p));

        if (hasPermission) {
          req.user.role = context.roleName;
          req.user.roleNormalized = userRoleNorm;
          req.user.matchedPermissions = permissions.filter(p => context.permissions.has(p));
          return next();
        }
      }

      return res.status(403).json({ 
        message: 'Forbidden: insufficient role or permissions',
        requiredRoles: roles,
        requiredPermissions: permissions,
        currentRole: context.roleName
      });
    } catch (err) {
      console.error('[authorizeRoleOrPermission] Error:', err);
      return res.status(500).json({ message: 'Authorization error' });
    }
  };
}

// ============================================================
// EXPORTS & UTILITIES
// ============================================================

/**
 * Get role context for a user - useful for controllers that need role info
 * @param {string} userId 
 * @returns {Promise<Object|null>}
 */
export { getRoleContext, ensureRoleContext };
