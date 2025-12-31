/**
 * Payment Validation Schemas
 * Joi validation for payment management endpoints
 */
import Joi from 'joi';
import { commonValidations } from '../middlewares/validate-request.js';

export const paymentValidation = {
  getPayments: {
    query: Joi.object({
      page: commonValidations.pagination.page,
      limit: commonValidations.pagination.limit,
      status: Joi.string().valid('pending', 'processing', 'completed', 'failed', 'refunded', 'expired'),
      payment_method: Joi.string().valid('gcash', 'paymaya', 'card', 'cash'),
      business_id: commonValidations.uuid,
      from_date: Joi.date().iso(),
      to_date: Joi.date().iso().greater(Joi.ref('from_date'))
    })
  },

  createPayment: {
    body: Joi.object({
      booking_id: commonValidations.uuid,
      order_id: commonValidations.uuid,
      amount: Joi.number().min(0).required(),
      payment_method: Joi.string().valid('gcash', 'paymaya', 'card', 'cash').required(),
      return_url: Joi.string().uri(),
      metadata: Joi.object()
    }).or('booking_id', 'order_id')
  },

  updateStatus: {
    params: Joi.object({
      id: commonValidations.uuid.required()
    }),
    body: Joi.object({
      status: Joi.string().valid('pending', 'processing', 'completed', 'failed', 'refunded', 'expired').required(),
      transaction_id: Joi.string().max(200),
      notes: Joi.string().max(500).allow(null, '')
    })
  },

  createRefund: {
    params: Joi.object({
      id: commonValidations.uuid.required()
    }),
    body: Joi.object({
      amount: Joi.number().min(0).required(),
      reason: Joi.string().max(500).required()
    })
  },

  updateRefundStatus: {
    params: Joi.object({
      refundId: commonValidations.uuid.required()
    }),
    body: Joi.object({
      status: Joi.string().valid('pending', 'processing', 'completed', 'failed').required(),
      notes: Joi.string().max(500).allow(null, '')
    })
  }
};

export default paymentValidation;
