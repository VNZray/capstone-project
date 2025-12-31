/**
 * Review Validation Schemas
 * Joi validation for review management endpoints
 */
import Joi from 'joi';
import { commonValidations } from '../middlewares/validate-request.js';

export const reviewValidation = {
  getBusinessReviews: {
    params: Joi.object({
      businessId: commonValidations.uuid.required()
    }),
    query: Joi.object({
      page: commonValidations.pagination.page,
      limit: commonValidations.pagination.limit,
      rating: Joi.number().integer().min(1).max(5),
      sort: Joi.string().valid('newest', 'oldest', 'highest', 'lowest')
    })
  },

  createReview: {
    body: Joi.object({
      business_id: commonValidations.uuid.required(),
      booking_id: commonValidations.uuid,
      order_id: commonValidations.uuid,
      rating: Joi.number().integer().min(1).max(5).required(),
      comment: Joi.string().min(10).max(2000).required()
    })
  },

  updateReview: {
    params: Joi.object({
      id: commonValidations.uuid.required()
    }),
    body: Joi.object({
      rating: Joi.number().integer().min(1).max(5),
      comment: Joi.string().min(10).max(2000)
    }).min(1)
  },

  addReply: {
    params: Joi.object({
      id: commonValidations.uuid.required()
    }),
    body: Joi.object({
      content: Joi.string().min(1).max(1000).required()
    })
  },

  addPhoto: {
    params: Joi.object({
      id: commonValidations.uuid.required()
    }),
    body: Joi.object({
      photo_url: Joi.string().uri().required(),
      caption: Joi.string().max(200).allow(null, '')
    })
  }
};

export default reviewValidation;
