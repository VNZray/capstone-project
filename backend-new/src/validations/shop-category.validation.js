/**
 * Shop Category Validation Schemas
 * Joi validation for shop category management endpoints
 */
import Joi from 'joi';
import { commonValidations } from '../middlewares/validate-request.js';

export const shopCategoryValidation = {
  createCategory: {
    body: Joi.object({
      business_id: commonValidations.uuid.required(),
      name: Joi.string().min(2).max(100).required(),
      description: Joi.string().max(500).allow(null, ''),
      display_order: Joi.number().integer().min(0),
      is_active: Joi.boolean().default(true)
    })
  },

  updateCategory: {
    params: Joi.object({
      id: commonValidations.uuid.required()
    }),
    body: Joi.object({
      name: Joi.string().min(2).max(100),
      description: Joi.string().max(500).allow(null, ''),
      display_order: Joi.number().integer().min(0),
      is_active: Joi.boolean()
    }).min(1)
  },

  reorderCategories: {
    params: Joi.object({
      businessId: commonValidations.uuid.required()
    }),
    body: Joi.object({
      orderMap: Joi.object().pattern(
        commonValidations.uuid,
        Joi.number().integer().min(0)
      ).required()
    })
  }
};

export default shopCategoryValidation;
