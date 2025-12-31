/**
 * Order Validation Schemas
 * Joi validation for order management endpoints
 */
import Joi from 'joi';
import { commonValidations } from '../middlewares/validate-request.js';

export const orderValidation = {
  getMyOrders: {
    query: Joi.object({
      page: commonValidations.pagination.page,
      limit: commonValidations.pagination.limit,
      status: Joi.string().valid(
        'Pending', 'Confirmed', 'Preparing', 'Ready',
        'Completed', 'Cancelled', 'Refunded'
      )
    })
  },

  getBusinessOrders: {
    params: Joi.object({
      businessId: commonValidations.uuid.required()
    }),
    query: Joi.object({
      page: commonValidations.pagination.page,
      limit: commonValidations.pagination.limit,
      status: Joi.string().valid(
        'Pending', 'Confirmed', 'Preparing', 'Ready',
        'Completed', 'Cancelled', 'Refunded'
      ),
      from_date: Joi.date().iso(),
      to_date: Joi.date().iso().greater(Joi.ref('from_date'))
    })
  },

  createOrder: {
    body: Joi.object({
      business_id: commonValidations.uuid.required(),
      items: Joi.array().items(
        Joi.object({
          product_id: commonValidations.uuid.required(),
          quantity: Joi.number().integer().min(1).required()
        })
      ).min(1).required(),
      discount_code: Joi.string().max(50).allow(null, ''),
      notes: Joi.string().max(500).allow(null, ''),
      pickup_date: Joi.date().iso().min('now'),
      pickup_time: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    })
  },

  updateStatus: {
    params: Joi.object({
      id: commonValidations.uuid.required()
    }),
    body: Joi.object({
      status: Joi.string().valid(
        'Pending', 'Confirmed', 'Preparing', 'Ready',
        'Completed', 'Cancelled', 'Refunded'
      ).required()
    })
  },

  cancelOrder: {
    params: Joi.object({
      id: commonValidations.uuid.required()
    }),
    body: Joi.object({
      reason: Joi.string().max(500).allow(null, '')
    })
  },

  validateArrivalCode: {
    params: Joi.object({
      id: commonValidations.uuid.required()
    }),
    body: Joi.object({
      code: Joi.string().length(6).required()
    })
  }
};

export default orderValidation;
