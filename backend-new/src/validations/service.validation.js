/**
 * Service Validation Schemas
 * Joi validation for service management endpoints
 */
import Joi from 'joi';
import { commonValidations } from '../middlewares/validate-request.js';

export const serviceValidation = {
  getBusinessServices: {
    params: Joi.object({
      businessId: commonValidations.uuid.required()
    }),
    query: Joi.object({
      page: commonValidations.pagination.page,
      limit: commonValidations.pagination.limit,
      category_id: commonValidations.uuid,
      search: Joi.string().max(100),
      is_available: Joi.boolean()
    })
  },

  createService: {
    body: Joi.object({
      business_id: commonValidations.uuid.required(),
      category_id: commonValidations.uuid,
      name: Joi.string().min(2).max(200).required(),
      description: Joi.string().max(2000).allow(null, ''),
      price: Joi.number().min(0).required(),
      duration_minutes: Joi.number().integer().min(1),
      image_url: Joi.string().uri().allow(null, ''),
      is_available: Joi.boolean().default(true)
    })
  },

  updateService: {
    params: Joi.object({
      id: commonValidations.uuid.required()
    }),
    body: Joi.object({
      category_id: commonValidations.uuid,
      name: Joi.string().min(2).max(200),
      description: Joi.string().max(2000).allow(null, ''),
      price: Joi.number().min(0),
      duration_minutes: Joi.number().integer().min(1),
      image_url: Joi.string().uri().allow(null, ''),
      is_available: Joi.boolean()
    }).min(1)
  },

  createInquiry: {
    params: Joi.object({
      id: commonValidations.uuid.required()
    }),
    body: Joi.object({
      message: Joi.string().min(10).max(2000).required(),
      preferred_date: Joi.date().iso().min('now'),
      contact_number: Joi.string().max(20)
    })
  },

  updateInquiryStatus: {
    params: Joi.object({
      inquiryId: commonValidations.uuid.required()
    }),
    body: Joi.object({
      status: Joi.string().valid('pending', 'responded', 'resolved', 'cancelled').required(),
      response: Joi.string().max(2000).when('status', {
        is: 'responded',
        then: Joi.required(),
        otherwise: Joi.optional()
      })
    })
  }
};

export default serviceValidation;
