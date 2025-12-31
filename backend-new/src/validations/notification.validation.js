/**
 * Notification Validation Schemas
 * Joi validation for notification management endpoints
 */
import Joi from 'joi';
import { commonValidations } from '../middlewares/validate-request.js';

export const notificationValidation = {
  getNotifications: {
    query: Joi.object({
      page: commonValidations.pagination.page,
      limit: commonValidations.pagination.limit,
      type: Joi.string().max(50),
      is_read: Joi.boolean()
    })
  },

  updatePreferences: {
    body: Joi.object({
      push_enabled: Joi.boolean(),
      email_enabled: Joi.boolean(),
      sms_enabled: Joi.boolean(),
      booking_notifications: Joi.boolean(),
      order_notifications: Joi.boolean(),
      review_notifications: Joi.boolean(),
      promotion_notifications: Joi.boolean(),
      marketing_notifications: Joi.boolean()
    }).min(1)
  }
};

export default notificationValidation;
