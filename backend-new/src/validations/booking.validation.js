/**
 * Booking Validation Schemas
 * Joi validation for booking management endpoints
 */
import Joi from 'joi';
import { commonValidations } from '../middlewares/validate-request.js';

export const bookingValidation = {
  getBookings: {
    query: Joi.object({
      page: commonValidations.pagination.page,
      limit: commonValidations.pagination.limit,
      status: Joi.string().valid(
        'Pending', 'Confirmed', 'CheckedIn', 'CheckedOut',
        'Cancelled', 'NoShow', 'Refunded'
      ),
      business_id: commonValidations.uuid,
      tourist_id: commonValidations.uuid,
      from_date: Joi.date().iso(),
      to_date: Joi.date().iso().greater(Joi.ref('from_date'))
    })
  },

  getBookingById: {
    params: Joi.object({
      id: commonValidations.uuid.required()
    })
  },

  createBooking: {
    body: Joi.object({
      room_id: commonValidations.uuid.required(),
      check_in_date: Joi.date().iso().min('now').required()
        .messages({
          'date.min': 'Check-in date cannot be in the past'
        }),
      check_out_date: Joi.date().iso().greater(Joi.ref('check_in_date')).required()
        .messages({
          'date.greater': 'Check-out date must be after check-in date'
        }),
      guest_count: Joi.number().integer().min(1).max(20).required(),
      special_requests: Joi.string().max(1000).allow(null, '')
    })
  },

  updateStatus: {
    params: Joi.object({
      id: commonValidations.uuid.required()
    }),
    body: Joi.object({
      status: Joi.string()
        .valid('Pending', 'Confirmed', 'CheckedIn', 'CheckedOut', 'Cancelled', 'NoShow', 'Refunded')
        .required(),
      cancellation_reason: Joi.string().max(500).when('status', {
        is: 'Cancelled',
        then: Joi.optional(),
        otherwise: Joi.forbidden()
      })
    })
  },

  cancelBooking: {
    params: Joi.object({
      id: commonValidations.uuid.required()
    }),
    body: Joi.object({
      reason: Joi.string().max(500).allow(null, '')
    })
  }
};

export default bookingValidation;
