/**
 * Error Handler Middleware
 * Centralized error handling with proper logging
 */
import logger from '../config/logger.js';
import config from '../config/config.js';
import { ApiError } from '../utils/api-error.js';

/**
 * Async handler wrapper to catch errors in async route handlers
 * @param {Function} fn - Async route handler function
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Convert Sequelize validation errors to ApiError
 */
const handleSequelizeError = (error) => {
  if (error.name === 'SequelizeValidationError') {
    const messages = error.errors.map(err => err.message);
    return new ApiError(400, 'Validation Error', messages);
  }

  if (error.name === 'SequelizeUniqueConstraintError') {
    const field = error.errors[0]?.path || 'field';
    return new ApiError(409, `${field} already exists`);
  }

  if (error.name === 'SequelizeForeignKeyConstraintError') {
    return new ApiError(400, 'Referenced record not found');
  }

  if (error.name === 'SequelizeDatabaseError') {
    logger.error('Database Error:', error);
    return new ApiError(500, 'Database operation failed');
  }

  return null;
};

/**
 * Convert MySQL/MariaDB errors
 */
const handleDatabaseError = (error) => {
  const dbErrors = {
    'ER_DUP_ENTRY': new ApiError(409, 'Duplicate entry. This record already exists.'),
    'ER_NO_REFERENCED_ROW_2': new ApiError(400, 'Referenced record not found.'),
    'ER_ROW_IS_REFERENCED_2': new ApiError(400, 'Cannot delete. Record is referenced by other data.'),
    'ER_BAD_FIELD_ERROR': new ApiError(400, 'Invalid field specified.'),
    'ER_PARSE_ERROR': new ApiError(400, 'Database query syntax error.'),
    'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD': new ApiError(400, 'Invalid value for field.'),
    'PROTOCOL_CONNECTION_LOST': new ApiError(503, 'Database connection lost.'),
    'ECONNREFUSED': new ApiError(503, 'Database connection refused.')
  };

  return dbErrors[error.code] || null;
};

/**
 * Global error handler middleware
 */
export const errorHandler = (error, req, res, next) => {
  // Default error values
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal Server Error';
  let errors = error.errors || [];

  // Handle Sequelize errors
  const sequelizeError = handleSequelizeError(error);
  if (sequelizeError) {
    statusCode = sequelizeError.statusCode;
    message = sequelizeError.message;
    errors = sequelizeError.errors;
  }

  // Handle database errors
  const dbError = handleDatabaseError(error);
  if (dbError) {
    statusCode = dbError.statusCode;
    message = dbError.message;
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Log error
  const logData = {
    method: req.method,
    url: req.originalUrl,
    statusCode,
    message,
    userId: req.user?.id,
    ip: req.ip
  };

  if (statusCode >= 500) {
    logger.error('Server Error:', { ...logData, stack: error.stack });
  } else if (statusCode >= 400) {
    logger.warn('Client Error:', logData);
  }

  // Send response
  const response = {
    success: false,
    message,
    ...(errors.length > 0 && { errors }),
    ...(config.isDev && { stack: error.stack })
  };

  res.status(statusCode).json(response);
};

export default { errorHandler, asyncHandler };
