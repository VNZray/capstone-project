/**
 * Staff Validation Schemas
 * Joi validation for staff management endpoints
 */
import Joi from 'joi';
import { commonValidations } from '../middlewares/validate-request.js';

export const staffValidation = {
  getBusinessStaff: {
    params: Joi.object({
      businessId: commonValidations.uuid.required()
    }),
    query: Joi.object({
      page: commonValidations.pagination.page,
      limit: commonValidations.pagination.limit,
      role: Joi.string().valid('Manager', 'Receptionist', 'Sales Associate', 'Room Manager'),
      status: Joi.string().valid('active', 'inactive', 'pending')
    })
  },

  createStaff: {
    body: Joi.object({
      business_id: commonValidations.uuid.required(),
      user_id: commonValidations.uuid.required(),
      role: Joi.string().valid('Manager', 'Receptionist', 'Sales Associate', 'Room Manager').required(),
      permissions: Joi.array().items(Joi.string()).default([])
    })
  },

  inviteStaff: {
    body: Joi.object({
      business_id: commonValidations.uuid.required(),
      email: Joi.string().email().required(),
      role: Joi.string().valid('Manager', 'Receptionist', 'Sales Associate', 'Room Manager').required(),
      message: Joi.string().max(500).allow(null, '')
    })
  },

  updateStaff: {
    params: Joi.object({
      id: commonValidations.uuid.required()
    }),
    body: Joi.object({
      role: Joi.string().valid('Manager', 'Receptionist', 'Sales Associate', 'Room Manager'),
      permissions: Joi.array().items(Joi.string())
    }).min(1)
  },

  updateStaffStatus: {
    params: Joi.object({
      id: commonValidations.uuid.required()
    }),
    body: Joi.object({
      status: Joi.string().valid('active', 'inactive').required()
    })
  }
};

export default staffValidation;
