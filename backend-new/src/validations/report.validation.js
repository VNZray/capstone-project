/**
 * Report Validation Schemas
 * Joi validation for report management endpoints
 */
import Joi from 'joi';
import { commonValidations } from '../middlewares/validate-request.js';

export const reportValidation = {
  getReports: {
    query: Joi.object({
      page: commonValidations.pagination.page,
      limit: commonValidations.pagination.limit,
      status: Joi.string().valid('pending', 'investigating', 'resolved', 'dismissed'),
      type: Joi.string().max(50),
      target_type: Joi.string().valid('business', 'review', 'user', 'tourist_spot')
    })
  },

  createReport: {
    body: Joi.object({
      target_type: Joi.string().valid('business', 'review', 'user', 'tourist_spot').required(),
      target_id: commonValidations.uuid.required(),
      type: Joi.string().max(50).required(),
      description: Joi.string().min(10).max(2000).required(),
      attachments: Joi.array().items(
        Joi.object({
          url: Joi.string().uri().required(),
          type: Joi.string().valid('image', 'document').required()
        })
      ).max(5)
    })
  },

  updateStatus: {
    params: Joi.object({
      id: commonValidations.uuid.required()
    }),
    body: Joi.object({
      status: Joi.string().valid('pending', 'investigating', 'resolved', 'dismissed').required(),
      resolution_notes: Joi.string().max(2000).when('status', {
        is: Joi.valid('resolved', 'dismissed'),
        then: Joi.required(),
        otherwise: Joi.optional()
      })
    })
  },

  addAttachment: {
    params: Joi.object({
      id: commonValidations.uuid.required()
    }),
    body: Joi.object({
      url: Joi.string().uri().required(),
      type: Joi.string().valid('image', 'document').required(),
      description: Joi.string().max(200).allow(null, '')
    })
  }
};

export default reportValidation;
