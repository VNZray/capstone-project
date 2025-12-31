/**
 * Promotion Validation Schemas
 * Joi validation for promotion management endpoints
 */
import Joi from 'joi';
import { commonValidations } from '../middlewares/validate-request.js';

export const promotionValidation = {
  getBusinessPromotions: {
    params: Joi.object({
      businessId: commonValidations.uuid.required()
    }),
    query: Joi.object({
      page: commonValidations.pagination.page,
      limit: commonValidations.pagination.limit,
      isActive: Joi.boolean()
    })
  },

  createPromotion: {
    body: Joi.object({
      business_id: commonValidations.uuid.required(),
      title: Joi.string().min(2).max(200).required(),
      description: Joi.string().max(2000).required(),
      image_url: Joi.string().uri().allow(null, ''),
      start_date: Joi.date().iso().required(),
      end_date: Joi.date().iso().greater(Joi.ref('start_date')).required(),
      is_active: Joi.boolean().default(true),
      is_featured: Joi.boolean().default(false),
      terms_and_conditions: Joi.string().max(2000).allow(null, ''),
      applicable_products: Joi.array().items(commonValidations.uuid),
      applicable_services: Joi.array().items(commonValidations.uuid),
      discount_id: commonValidations.uuid
    })
  },

  updatePromotion: {
    params: Joi.object({
      id: commonValidations.uuid.required()
    }),
    body: Joi.object({
      title: Joi.string().min(2).max(200),
      description: Joi.string().max(2000),
      image_url: Joi.string().uri().allow(null, ''),
      start_date: Joi.date().iso(),
      end_date: Joi.date().iso(),
      is_active: Joi.boolean(),
      is_featured: Joi.boolean(),
      terms_and_conditions: Joi.string().max(2000).allow(null, ''),
      applicable_products: Joi.array().items(commonValidations.uuid),
      applicable_services: Joi.array().items(commonValidations.uuid),
      discount_id: commonValidations.uuid
    }).min(1)
  }
};

export default promotionValidation;
