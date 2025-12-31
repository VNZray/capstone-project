/**
 * Business Settings Validation Schemas
 * Joi validation for business settings management endpoints
 */
import Joi from 'joi';
import { commonValidations } from '../middlewares/validate-request.js';

const timePattern = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

const dayHoursSchema = Joi.object({
  open_time: Joi.string().pattern(timePattern).required(),
  close_time: Joi.string().pattern(timePattern).required(),
  is_closed: Joi.boolean().default(false)
});

export const businessSettingsValidation = {
  updateSettings: {
    params: Joi.object({
      businessId: commonValidations.uuid.required()
    }),
    body: Joi.object({
      auto_confirm_bookings: Joi.boolean(),
      auto_confirm_orders: Joi.boolean(),
      allow_cancellations: Joi.boolean(),
      cancellation_hours_before: Joi.number().integer().min(0),
      require_payment_upfront: Joi.boolean(),
      notification_email: Joi.string().email().allow(null, ''),
      notification_phone: Joi.string().max(20).allow(null, ''),
      timezone: Joi.string().max(50),
      currency: Joi.string().length(3).default('PHP'),
      tax_rate: Joi.number().min(0).max(100)
    }).min(1)
  },

  updatePolicies: {
    params: Joi.object({
      businessId: commonValidations.uuid.required()
    }),
    body: Joi.object({
      cancellation_policy: Joi.string().max(5000).allow(null, ''),
      refund_policy: Joi.string().max(5000).allow(null, ''),
      check_in_policy: Joi.string().max(5000).allow(null, ''),
      check_out_policy: Joi.string().max(5000).allow(null, ''),
      house_rules: Joi.string().max(5000).allow(null, ''),
      terms_and_conditions: Joi.string().max(10000).allow(null, ''),
      privacy_policy: Joi.string().max(10000).allow(null, '')
    }).min(1)
  },

  updateHours: {
    params: Joi.object({
      businessId: commonValidations.uuid.required()
    }),
    body: Joi.object({
      hours: Joi.array().items(
        Joi.object({
          day_of_week: Joi.number().integer().min(0).max(6).required(),
          open_time: Joi.string().pattern(timePattern).required(),
          close_time: Joi.string().pattern(timePattern).required(),
          is_closed: Joi.boolean().default(false)
        })
      ).length(7).required()
    })
  },

  updateDayHours: {
    params: Joi.object({
      businessId: commonValidations.uuid.required(),
      day: Joi.string().valid(
        'sunday', 'monday', 'tuesday', 'wednesday',
        'thursday', 'friday', 'saturday'
      ).required()
    }),
    body: dayHoursSchema
  }
};

export default businessSettingsValidation;
