/**
 * User Validation Schemas
 * Joi validation for user management endpoints
 */
import Joi from 'joi';
import { commonValidations } from '../middlewares/validate-request.js';

export const userValidation = {
  getUsers: {
    query: Joi.object({
      page: commonValidations.pagination.page,
      limit: commonValidations.pagination.limit,
      role: Joi.string().valid('Tourist', 'Business Owner', 'Manager', 'Staff', 'Tourism Admin'),
      status: Joi.string().valid('active', 'inactive'),
      search: Joi.string().max(100)
    })
  },

  getUserById: {
    params: Joi.object({
      id: commonValidations.uuid.required()
    })
  },

  updateUser: {
    params: Joi.object({
      id: commonValidations.uuid.required()
    }),
    body: Joi.object({
      email: commonValidations.email,
      phone_number: commonValidations.phone,
      is_active: Joi.boolean(),
      user_role_id: Joi.number().integer().positive(),
      first_name: Joi.string().min(2).max(25),
      last_name: Joi.string().min(2).max(25),
      middle_name: Joi.string().max(25).allow(null, ''),
      suffix: Joi.string().max(10).allow(null, ''),
      birthdate: Joi.date().iso().max('now'),
      gender: Joi.string().valid('Male', 'Female', 'Other')
    }).min(1) // At least one field required
  },

  deleteUser: {
    params: Joi.object({
      id: commonValidations.uuid.required()
    })
  }
};

export default userValidation;
