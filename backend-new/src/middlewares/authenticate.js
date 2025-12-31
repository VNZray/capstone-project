/**
 * Authentication Middleware
 * JWT token verification and user context attachment
 */
import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import logger from '../config/logger.js';
import { User, UserRole } from '../models/index.js';
import { ApiError } from '../utils/api-error.js';

const { jwt: jwtConfig } = config;

/**
 * Required authentication middleware
 * Validates JWT access token and attaches user to request
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new ApiError(401, 'Authorization header required');
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Invalid token format (Bearer required)');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new ApiError(401, 'Access token required');
    }

    // Verify token with explicit algorithm pinning (security best practice)
    const payload = jwt.verify(token, jwtConfig.accessSecret, {
      algorithms: [jwtConfig.algorithm]
    });

    // Fetch user with role to ensure they still exist and are active
    const user = await User.findByPk(payload.id, {
      include: [{
        model: UserRole,
        as: 'role',
        attributes: ['id', 'role_name', 'permissions']
      }]
    });

    if (!user) {
      throw new ApiError(401, 'User not found');
    }

    if (!user.is_active) {
      throw new ApiError(401, 'Account is deactivated');
    }

    // Check if password was changed after token was issued
    if (user.password_changed_at) {
      const passwordChangedTime = Math.floor(new Date(user.password_changed_at).getTime() / 1000);
      if (payload.iat < passwordChangedTime) {
        throw new ApiError(401, 'Password recently changed. Please login again.');
      }
    }

    // Attach user context to request
    req.user = {
      id: user.id,
      email: user.email,
      user_role_id: user.user_role_id,
      role: user.role?.role_name || null,
      permissions: user.role?.permissions || [],
      is_verified: user.is_verified
    };

    logger.debug(`Authenticated user: ${user.id} (${user.role?.role_name})`);
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Token expired'));
    }
    if (error.name === 'JsonWebTokenError') {
      return next(new ApiError(401, 'Invalid token'));
    }
    next(error);
  }
};

/**
 * Optional authentication middleware
 * Attaches user if token is valid, but allows request to proceed without auth
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      req.user = null;
      return next();
    }

    const payload = jwt.verify(token, jwtConfig.accessSecret, {
      algorithms: [jwtConfig.algorithm]
    });

    const user = await User.findByPk(payload.id, {
      include: [{
        model: UserRole,
        as: 'role',
        attributes: ['id', 'role_name', 'permissions']
      }]
    });

    if (user && user.is_active) {
      req.user = {
        id: user.id,
        email: user.email,
        user_role_id: user.user_role_id,
        role: user.role?.role_name || null,
        permissions: user.role?.permissions || [],
        is_verified: user.is_verified
      };
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    // Silent fail for optional auth - just continue without user
    req.user = null;
    next();
  }
};

export default { authenticate, optionalAuth };
