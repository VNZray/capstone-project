import db from '../db.js';

const normalizeRole = (role) => (role || '').toLowerCase();

/**
 * Middleware: Require user to have one of the specified roles
 * @param {...string} allowedRoles - Role names that are allowed
 * @returns {Function} Express middleware
 */
export function authorizeRole(...allowedRoles) {
  return async function (req, res, next) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      // Fetch user's role
      const [rows] = await db.query(
        `SELECT ur.role_name 
         FROM user u
         JOIN user_role ur ON ur.id = u.user_role_id
         WHERE u.id = ?`,
        [req.user.id]
      );

      if (!rows || rows.length === 0) {
        return res.status(403).json({ message: 'User role not found' });
      }

      const userRoleRaw = rows[0].role_name;
      const userRole = normalizeRole(userRoleRaw);
      const allowed = allowedRoles.map(normalizeRole);

      // Check if user's role is in the allowed list
      if (!allowed.includes(userRole)) {
        return res.status(403).json({ 
          message: 'Forbidden: insufficient role permissions',
          required: allowedRoles,
          current: userRoleRaw
        });
      }

      // Attach role to request for downstream use
      req.user.role = userRoleRaw;
      req.user.roleNormalized = userRole;
      return next();
    } catch (err) {
      console.error('[authorizeRole] Error:', err);
      return res.status(500).json({ message: 'Authorization error' });
    }
  };
}

/**
 * Middleware: Require user to have ANY of the specified roles OR permissions
 * Provides flexible RBAC with fallback to permission-based access
 * @param {Object} options
 * @param {string[]} options.roles - Allowed role names
 * @param {string[]} options.permissions - Allowed permission names (OR semantics)
 * @returns {Function} Express middleware
 */
export function authorizeRoleOrPermission({ roles = [], permissions = [] }) {
  return async function (req, res, next) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      // Fetch user's role and permissions
      const [roleRows] = await db.query(
        `SELECT ur.role_name 
         FROM user u
         JOIN user_role ur ON ur.id = u.user_role_id
         WHERE u.id = ?`,
        [req.user.id]
      );

      if (!roleRows || roleRows.length === 0) {
        return res.status(403).json({ message: 'User role not found' });
      }

      const userRole = roleRows[0].role_name;
      const userRoleNorm = normalizeRole(userRole);

      // Check role first (fastest)
      if (roles.length > 0 && roles.map(normalizeRole).includes(userRoleNorm)) {
        req.user.role = userRole;
        req.user.roleNormalized = userRoleNorm;
        return next();
      }

      // If roles don't match, check permissions
      if (permissions.length > 0) {
        const [permRows] = await db.query(
          `SELECT p.name
           FROM user u
           JOIN role_permissions rp ON rp.user_role_id = u.user_role_id
           JOIN permissions p ON p.id = rp.permission_id
           WHERE u.id = ?`,
          [req.user.id]
        );

        const userPerms = new Set(permRows.map((r) => r.name));
        const hasPermission = permissions.some((p) => userPerms.has(p));

        if (hasPermission) {
          req.user.role = userRole;
          req.user.roleNormalized = userRoleNorm;
          req.user.matchedPermissions = permissions.filter((p) => userPerms.has(p));
          return next();
        }
      }

      return res.status(403).json({ 
        message: 'Forbidden: insufficient role or permissions',
        requiredRoles: roles,
        requiredPermissions: permissions,
        currentRole: userRole
      });
    } catch (err) {
      console.error('[authorizeRoleOrPermission] Error:', err);
      return res.status(500).json({ message: 'Authorization error' });
    }
  };
}
