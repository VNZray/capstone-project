/**
 * Product Validation Schemas
 * Joi validation for product management endpoints
 */
import Joi from 'joi';
import { commonValidations } from '../middlewares/validate-request.js';

export const productValidation = {
  getBusinessProducts: {
    params: Joi.object({
      businessId: commonValidations.uuid.required()
    }),
    query: Joi.object({
      page: commonValidations.pagination.page,
      limit: commonValidations.pagination.limit,
      category_id: commonValidations.uuid,
      search: Joi.string().max(100),
      is_available: Joi.boolean(),
      minPrice: Joi.number().min(0),
      maxPrice: Joi.number().min(0).greater(Joi.ref('minPrice'))
    })
  },

  createProduct: {
    body: Joi.object({
      business_id: commonValidations.uuid.required(),
      category_id: commonValidations.uuid,
      name: Joi.string().min(2).max(200).required(),
      description: Joi.string().max(2000).allow(null, ''),
      price: Joi.number().min(0).required(),
      image_url: Joi.string().uri().allow(null, ''),
      is_available: Joi.boolean().default(true),
      stock_quantity: Joi.number().integer().min(0),
      low_stock_threshold: Joi.number().integer().min(0)
    })
  },

  updateProduct: {
    params: Joi.object({
      id: commonValidations.uuid.required()
    }),
    body: Joi.object({
      category_id: commonValidations.uuid,
      name: Joi.string().min(2).max(200),
      description: Joi.string().max(2000).allow(null, ''),
      price: Joi.number().min(0),
      image_url: Joi.string().uri().allow(null, ''),
      is_available: Joi.boolean()
    }).min(1)
  },

  updateStock: {
    params: Joi.object({
      id: commonValidations.uuid.required()
    }),
    body: Joi.object({
      quantity: Joi.number().integer().required(),
      action: Joi.string().valid('add', 'subtract', 'set').required(),
      reason: Joi.string().max(200).allow(null, '')
    })
  },

  checkAvailability: {
    params: Joi.object({
      id: commonValidations.uuid.required()
    }),
    query: Joi.object({
      quantity: Joi.number().integer().min(1).required()
    })
  }
};

export default productValidation;
