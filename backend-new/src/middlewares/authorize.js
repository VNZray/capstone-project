/**
 * Authorization Middleware
 * Role and permission-based access control
 */
import { ApiError } from '../utils/api-error.js';
import logger from '../config/logger.js';

/**
 * Authorize based on specific permissions
 * @param {...string} requiredPermissions - Required permission strings
 */
export const authorize = (...requiredPermissions) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication required');
      }

      const userPermissions = req.user.permissions || [];

      // Check if user has all required permissions
      const hasAllPermissions = requiredPermissions.every(
        permission => userPermissions.includes(permission)
      );

      if (!hasAllPermissions) {
        logger.warn(`Authorization failed for user ${req.user.id}. Required: [${requiredPermissions.join(', ')}], Has: [${userPermissions.join(', ')}]`);
        throw new ApiError(403, 'Insufficient permissions');
      }

      logger.debug(`User ${req.user.id} authorized for: [${requiredPermissions.join(', ')}]`);
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Authorize based on user roles
 * @param {...string} allowedRoles - Allowed role names
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication required');
      }

      const userRole = req.user.role;

      if (!userRole) {
        throw new ApiError(403, 'User has no assigned role');
      }

      if (!allowedRoles.includes(userRole)) {
        logger.warn(`Role authorization failed for user ${req.user.id}. Required: [${allowedRoles.join(', ')}], Has: ${userRole}`);
        throw new ApiError(403, `Access denied. Required roles: ${allowedRoles.join(', ')}`);
      }

      logger.debug(`User ${req.user.id} with role ${userRole} authorized`);
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Check if user has any of the specified permissions
 * @param {...string} permissions - Permission strings (any one required)
 */
export const authorizeAny = (...permissions) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication required');
      }

      const userPermissions = req.user.permissions || [];

      const hasAnyPermission = permissions.some(
        permission => userPermissions.includes(permission)
      );

      if (!hasAnyPermission) {
        throw new ApiError(403, 'Insufficient permissions');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Verify user owns the resource or has admin privileges
 * @param {Function} getResourceOwnerId - Function to extract owner ID from request
 */
export const authorizeOwnerOrAdmin = (getResourceOwnerId) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication required');
      }

      const adminRoles = ['Admin', 'Tourism Admin'];

      // Admins can access any resource
      if (adminRoles.includes(req.user.role)) {
        return next();
      }

      const resourceOwnerId = await getResourceOwnerId(req);

      if (req.user.id !== resourceOwnerId) {
        throw new ApiError(403, 'You can only access your own resources');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default { authorize, authorizeRoles, authorizeAny, authorizeOwnerOrAdmin };
