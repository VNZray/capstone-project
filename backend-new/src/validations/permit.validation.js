/**
 * Permit Validation Schemas
 * Joi validation for permit management endpoints
 */
import Joi from 'joi';
import { commonValidations } from '../middlewares/validate-request.js';

export const permitValidation = {
  getAllPermits: {
    query: Joi.object({
      page: commonValidations.pagination.page,
      limit: commonValidations.pagination.limit,
      status: Joi.string().valid('pending', 'approved', 'expired', 'rejected'),
      type: Joi.string().max(100),
      business_id: commonValidations.uuid
    })
  },

  getExpiringPermits: {
    query: Joi.object({
      days: Joi.number().integer().min(1).max(90).default(30)
    })
  },

  createPermit: {
    body: Joi.object({
      business_id: commonValidations.uuid.required(),
      permit_type: Joi.string().max(100).required(),
      permit_number: Joi.string().max(100).required(),
      issue_date: Joi.date().iso().required(),
      expiry_date: Joi.date().iso().greater(Joi.ref('issue_date')).required(),
      document_url: Joi.string().uri().allow(null, ''),
      notes: Joi.string().max(1000).allow(null, '')
    })
  },

  updatePermit: {
    params: Joi.object({
      id: commonValidations.uuid.required()
    }),
    body: Joi.object({
      permit_type: Joi.string().max(100),
      permit_number: Joi.string().max(100),
      issue_date: Joi.date().iso(),
      expiry_date: Joi.date().iso(),
      document_url: Joi.string().uri().allow(null, ''),
      notes: Joi.string().max(1000).allow(null, '')
    }).min(1)
  },

  updateStatus: {
    params: Joi.object({
      id: commonValidations.uuid.required()
    }),
    body: Joi.object({
      status: Joi.string().valid('pending', 'approved', 'expired', 'rejected').required(),
      review_notes: Joi.string().max(1000).allow(null, '')
    })
  }
};

export default permitValidation;
