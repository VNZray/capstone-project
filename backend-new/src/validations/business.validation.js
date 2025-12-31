/**
 * Business Validation Schemas
 * Joi validation for business management endpoints
 */
import Joi from 'joi';
import { commonValidations } from '../middlewares/validate-request.js';

export const businessValidation = {
  getBusinesses: {
    query: Joi.object({
      page: commonValidations.pagination.page,
      limit: commonValidations.pagination.limit,
      status: Joi.string().valid('Pending', 'Active', 'Inactive', 'Maintenance', 'Rejected'),
      has_booking: Joi.string().valid('true', 'false'),
      has_store: Joi.string().valid('true', 'false'),
      search: Joi.string().max(100),
      barangay_id: Joi.number().integer().positive()
    })
  },

  getBusinessById: {
    params: Joi.object({
      id: commonValidations.uuid.required()
    })
  },

  createBusiness: {
    body: Joi.object({
      business_name: Joi.string().min(2).max(50).required(),
      description: Joi.string().max(2000).allow(null, ''),
      min_price: Joi.number().min(0).allow(null),
      max_price: Joi.number().min(0).greater(Joi.ref('min_price')).allow(null),
      email: commonValidations.email.required(),
      phone_number: commonValidations.phone.required(),
      address: Joi.string().max(500).required(),
      barangay_id: Joi.number().integer().positive().allow(null),
      owner_id: commonValidations.uuid.required(),
      latitude: Joi.string().max(30).required(),
      longitude: Joi.string().max(30).required(),
      website_url: Joi.string().uri().max(500).allow(null, ''),
      facebook_url: Joi.string().max(500).allow(null, ''),
      instagram_url: Joi.string().max(500).allow(null, ''),
      has_booking: Joi.boolean().default(false),
      has_store: Joi.boolean().default(false),
      has_services: Joi.boolean().default(false),
      business_image: Joi.string().max(500).allow(null, ''),
      amenity_ids: Joi.array().items(Joi.number().integer().positive())
    })
  },

  updateBusiness: {
    params: Joi.object({
      id: commonValidations.uuid.required()
    }),
    body: Joi.object({
      business_name: Joi.string().min(2).max(50),
      description: Joi.string().max(2000).allow(null, ''),
      min_price: Joi.number().min(0).allow(null),
      max_price: Joi.number().min(0).allow(null),
      email: commonValidations.email,
      phone_number: commonValidations.phone,
      address: Joi.string().max(500),
      barangay_id: Joi.number().integer().positive().allow(null),
      latitude: Joi.string().max(30),
      longitude: Joi.string().max(30),
      website_url: Joi.string().uri().max(500).allow(null, ''),
      facebook_url: Joi.string().max(500).allow(null, ''),
      instagram_url: Joi.string().max(500).allow(null, ''),
      has_booking: Joi.boolean(),
      has_store: Joi.boolean(),
      has_services: Joi.boolean(),
      business_image: Joi.string().max(500).allow(null, ''),
      amenity_ids: Joi.array().items(Joi.number().integer().positive())
    }).min(1)
  },

  updateStatus: {
    params: Joi.object({
      id: commonValidations.uuid.required()
    }),
    body: Joi.object({
      status: Joi.string()
        .valid('Pending', 'Active', 'Inactive', 'Maintenance', 'Rejected')
        .required()
    })
  },

  deleteBusiness: {
    params: Joi.object({
      id: commonValidations.uuid.required()
    })
  }
};

export default businessValidation;
