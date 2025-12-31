/**
 * Tourist Spot Validation Schemas
 * Joi validation for tourist spot management endpoints
 */
import Joi from 'joi';
import { commonValidations } from '../middlewares/validate-request.js';

export const touristSpotValidation = {
  getAllTouristSpots: {
    query: Joi.object({
      page: commonValidations.pagination.page,
      limit: commonValidations.pagination.limit,
      category: Joi.string().max(50),
      search: Joi.string().max(100),
      status: Joi.string().valid('active', 'inactive', 'pending'),
      isFeatured: Joi.boolean()
    })
  },

  createTouristSpot: {
    body: Joi.object({
      name: Joi.string().min(2).max(200).required(),
      description: Joi.string().min(10).max(5000).required(),
      category: Joi.string().max(50).required(),
      address: Joi.string().max(500).required(),
      latitude: Joi.number().min(-90).max(90),
      longitude: Joi.number().min(-180).max(180),
      contact_number: Joi.string().max(20),
      entrance_fee: Joi.number().min(0),
      is_featured: Joi.boolean().default(false)
    })
  },

  updateTouristSpot: {
    params: Joi.object({
      id: commonValidations.uuid.required()
    }),
    body: Joi.object({
      name: Joi.string().min(2).max(200),
      description: Joi.string().min(10).max(5000),
      category: Joi.string().max(50),
      address: Joi.string().max(500),
      latitude: Joi.number().min(-90).max(90),
      longitude: Joi.number().min(-180).max(180),
      contact_number: Joi.string().max(20),
      entrance_fee: Joi.number().min(0),
      is_featured: Joi.boolean()
    }).min(1)
  },

  addImage: {
    params: Joi.object({
      id: commonValidations.uuid.required()
    }),
    body: Joi.object({
      image_url: Joi.string().uri().required(),
      caption: Joi.string().max(200).allow(null, ''),
      is_primary: Joi.boolean().default(false)
    })
  },

  updateSchedule: {
    params: Joi.object({
      id: commonValidations.uuid.required()
    }),
    body: Joi.object({
      schedule: Joi.array().items(
        Joi.object({
          day_of_week: Joi.number().integer().min(0).max(6).required(),
          open_time: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
          close_time: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
          is_closed: Joi.boolean().default(false)
        })
      ).required()
    })
  },

  updateStatus: {
    params: Joi.object({
      id: commonValidations.uuid.required()
    }),
    body: Joi.object({
      status: Joi.string().valid('active', 'inactive', 'pending').required()
    })
  }
};

export default touristSpotValidation;
