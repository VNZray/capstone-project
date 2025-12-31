/**
 * Approval Validation Schemas
 * Joi validation for approval workflow endpoints
 */
import Joi from 'joi';
import { commonValidations } from '../middlewares/validate-request.js';

export const approvalValidation = {
  getPendingApprovals: {
    query: Joi.object({
      page: commonValidations.pagination.page,
      limit: commonValidations.pagination.limit,
      entityType: Joi.string().valid('business', 'tourist_spot', 'event')
    })
  },

  approveEntity: {
    params: Joi.object({
      entityType: Joi.string().valid('business', 'tourist_spot', 'event').required(),
      entityId: commonValidations.uuid.required()
    }),
    body: Joi.object({
      comments: Joi.string().max(1000).allow(null, '')
    })
  },

  rejectEntity: {
    params: Joi.object({
      entityType: Joi.string().valid('business', 'tourist_spot', 'event').required(),
      entityId: commonValidations.uuid.required()
    }),
    body: Joi.object({
      comments: Joi.string().max(1000).required()
    })
  },

  requestChanges: {
    params: Joi.object({
      entityType: Joi.string().valid('business', 'tourist_spot', 'event').required(),
      entityId: commonValidations.uuid.required()
    }),
    body: Joi.object({
      comments: Joi.string().max(2000).required()
    })
  }
};

export default approvalValidation;
