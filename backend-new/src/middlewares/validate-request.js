/**
 * Request Validation Middleware
 * Validates request body, params, and query using Joi schemas
 */
import Joi from 'joi';
import { ApiError } from '../utils/api-error.js';

/**
 * Validate request against Joi schema
 * @param {Object} schema - Joi validation schema { body?, params?, query? }
 */
export const validateRequest = (schema) => {
  return (req, res, next) => {
    const validationErrors = [];

    // Validate body
    if (schema.body) {
      const { error } = schema.body.validate(req.body, {
        abortEarly: false,
        stripUnknown: true
      });
      if (error) {
        validationErrors.push(
          ...error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message,
            location: 'body'
          }))
        );
      }
    }

    // Validate params
    if (schema.params) {
      const { error } = schema.params.validate(req.params, {
        abortEarly: false
      });
      if (error) {
        validationErrors.push(
          ...error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message,
            location: 'params'
          }))
        );
      }
    }

    // Validate query
    if (schema.query) {
      const { error } = schema.query.validate(req.query, {
        abortEarly: false,
        stripUnknown: true
      });
      if (error) {
        validationErrors.push(
          ...error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message,
            location: 'query'
          }))
        );
      }
    }

    if (validationErrors.length > 0) {
      const errorMessages = validationErrors.map(e => `${e.field}: ${e.message}`);
      return next(new ApiError(400, 'Validation failed', errorMessages));
    }

    next();
  };
};

/**
 * Common Joi validation patterns
 */
export const commonValidations = {
  uuid: Joi.string().uuid({ version: 'uuidv4' }),
  email: Joi.string().email().lowercase().trim(),
  phone: Joi.string().pattern(/^(\+63|0)?[0-9]{10,11}$/),
  password: Joi.string().min(8).max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .messages({
      'string.pattern.base': 'Password must contain at least one uppercase, one lowercase, one number, and one special character'
    }),
  pagination: {
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string(),
    sortOrder: Joi.string().valid('asc', 'desc').default('asc')
  },
  dateRange: {
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso().greater(Joi.ref('startDate'))
  }
};

export default { validateRequest, commonValidations };
