/**
 * Discount Validation Schemas
 * Joi validation for discount management endpoints
 */
import Joi from 'joi';
import { commonValidations } from '../middlewares/validate-request.js';

export const discountValidation = {
  getBusinessDiscounts: {
    params: Joi.object({
      businessId: commonValidations.uuid.required()
    }),
    query: Joi.object({
      page: commonValidations.pagination.page,
      limit: commonValidations.pagination.limit,
      is_active: Joi.boolean(),
      type: Joi.string().valid('percentage', 'fixed')
    })
  },

  createDiscount: {
    body: Joi.object({
      business_id: commonValidations.uuid.required(),
      code: Joi.string().min(3).max(50).uppercase().required(),
      name: Joi.string().min(2).max(100).required(),
      description: Joi.string().max(500).allow(null, ''),
      type: Joi.string().valid('percentage', 'fixed').required(),
      value: Joi.number().min(0).required(),
      min_order_amount: Joi.number().min(0),
      max_discount_amount: Joi.number().min(0).when('type', {
        is: 'percentage',
        then: Joi.optional(),
        otherwise: Joi.forbidden()
      }),
      usage_limit: Joi.number().integer().min(1),
      usage_limit_per_user: Joi.number().integer().min(1),
      start_date: Joi.date().iso(),
      end_date: Joi.date().iso().greater(Joi.ref('start_date')),
      applicable_to: Joi.string().valid('all', 'products', 'services', 'bookings').default('all'),
      is_active: Joi.boolean().default(true)
    })
  },

  updateDiscount: {
    params: Joi.object({
      id: commonValidations.uuid.required()
    }),
    body: Joi.object({
      name: Joi.string().min(2).max(100),
      description: Joi.string().max(500).allow(null, ''),
      type: Joi.string().valid('percentage', 'fixed'),
      value: Joi.number().min(0),
      min_order_amount: Joi.number().min(0),
      max_discount_amount: Joi.number().min(0),
      usage_limit: Joi.number().integer().min(1),
      usage_limit_per_user: Joi.number().integer().min(1),
      start_date: Joi.date().iso(),
      end_date: Joi.date().iso(),
      applicable_to: Joi.string().valid('all', 'products', 'services', 'bookings'),
      is_active: Joi.boolean()
    }).min(1)
  },

  validateDiscount: {
    body: Joi.object({
      code: Joi.string().required(),
      business_id: commonValidations.uuid.required(),
      order_amount: Joi.number().min(0),
      applicable_to: Joi.string().valid('all', 'products', 'services', 'bookings')
    })
  },

  applyDiscount: {
    body: Joi.object({
      code: Joi.string().required(),
      business_id: commonValidations.uuid.required(),
      order_id: commonValidations.uuid,
      booking_id: commonValidations.uuid,
      order_amount: Joi.number().min(0).required()
    }).or('order_id', 'booking_id')
  }
};

export default discountValidation;
