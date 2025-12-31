/**
 * Event Validation Schemas
 * Joi validation for event management endpoints
 */
import Joi from 'joi';
import { commonValidations } from '../middlewares/validate-request.js';

export const eventValidation = {
  getAllEvents: {
    query: Joi.object({
      page: commonValidations.pagination.page,
      limit: commonValidations.pagination.limit,
      status: Joi.string().valid('draft', 'active', 'cancelled', 'completed'),
      startDate: Joi.date().iso(),
      endDate: Joi.date().iso().greater(Joi.ref('startDate'))
    })
  },

  getEventsByDateRange: {
    query: Joi.object({
      startDate: Joi.date().iso().required(),
      endDate: Joi.date().iso().greater(Joi.ref('startDate')).required()
    })
  },

  createEvent: {
    body: Joi.object({
      title: Joi.string().min(2).max(200).required(),
      description: Joi.string().max(5000).required(),
      location: Joi.string().max(500).required(),
      latitude: Joi.number().min(-90).max(90),
      longitude: Joi.number().min(-180).max(180),
      start_date: Joi.date().iso().required(),
      end_date: Joi.date().iso().greater(Joi.ref('start_date')).required(),
      image_url: Joi.string().uri().allow(null, ''),
      category: Joi.string().max(50),
      organizer: Joi.string().max(200),
      contact_email: Joi.string().email().allow(null, ''),
      contact_phone: Joi.string().max(20).allow(null, ''),
      website: Joi.string().uri().allow(null, ''),
      is_featured: Joi.boolean().default(false),
      is_free: Joi.boolean().default(true),
      ticket_price: Joi.number().min(0).when('is_free', {
        is: false,
        then: Joi.required(),
        otherwise: Joi.optional()
      }),
      max_attendees: Joi.number().integer().min(0),
      status: Joi.string().valid('draft', 'active', 'cancelled', 'completed').default('draft')
    })
  },

  updateEvent: {
    params: Joi.object({
      id: commonValidations.uuid.required()
    }),
    body: Joi.object({
      title: Joi.string().min(2).max(200),
      description: Joi.string().max(5000),
      location: Joi.string().max(500),
      latitude: Joi.number().min(-90).max(90),
      longitude: Joi.number().min(-180).max(180),
      start_date: Joi.date().iso(),
      end_date: Joi.date().iso(),
      image_url: Joi.string().uri().allow(null, ''),
      category: Joi.string().max(50),
      organizer: Joi.string().max(200),
      contact_email: Joi.string().email().allow(null, ''),
      contact_phone: Joi.string().max(20).allow(null, ''),
      website: Joi.string().uri().allow(null, ''),
      is_featured: Joi.boolean(),
      is_free: Joi.boolean(),
      ticket_price: Joi.number().min(0),
      max_attendees: Joi.number().integer().min(0)
    }).min(1)
  },

  updateStatus: {
    params: Joi.object({
      id: commonValidations.uuid.required()
    }),
    body: Joi.object({
      status: Joi.string().valid('draft', 'active', 'cancelled', 'completed').required()
    })
  }
};

export default eventValidation;
