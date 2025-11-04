import { getUserPermissions } from '../services/permissionService.js';

// Authorization middleware: require ALL listed permissions (AND semantics)
export function authorize(...required) {
  return async function (req, res, next) {
    try {
      if (!req.user?.id) return res.status(401).json({ message: 'Not authenticated' });
      const perms = await getUserPermissions(req.user.id);
      const ok = required.every((p) => perms.has(p));
      if (!ok) return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
      return next();
    } catch (err) {
      return res.status(500).json({ message: 'Authorization error' });
    }
  };
}

// Authorization middleware: require ANY of the listed permissions (OR semantics)
export function authorizeAny(...options) {
  return async function (req, res, next) {
    try {
      if (!req.user?.id) return res.status(401).json({ message: 'Not authenticated' });
      const perms = await getUserPermissions(req.user.id);
      const ok = options.some((p) => perms.has(p));
      if (!ok) return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
      return next();
    } catch (err) {
      return res.status(500).json({ message: 'Authorization error' });
    }
  };
}
