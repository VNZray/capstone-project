/**
 * Favorite Validation Schemas
 * Joi validation for favorite management endpoints
 */
import Joi from 'joi';
import { commonValidations } from '../middlewares/validate-request.js';

export const favoriteValidation = {
  getFavoritesByType: {
    params: Joi.object({
      type: Joi.string().valid('business', 'tourist_spot', 'product', 'event').required()
    }),
    query: Joi.object({
      page: commonValidations.pagination.page,
      limit: commonValidations.pagination.limit
    })
  },

  checkFavorite: {
    query: Joi.object({
      type: Joi.string().valid('business', 'tourist_spot', 'product', 'event').required(),
      entity_id: commonValidations.uuid.required()
    })
  },

  addFavorite: {
    body: Joi.object({
      type: Joi.string().valid('business', 'tourist_spot', 'product', 'event').required(),
      entity_id: commonValidations.uuid.required()
    })
  },

  toggleFavorite: {
    body: Joi.object({
      type: Joi.string().valid('business', 'tourist_spot', 'product', 'event').required(),
      entity_id: commonValidations.uuid.required()
    })
  },

  removeFavorite: {
    query: Joi.object({
      type: Joi.string().valid('business', 'tourist_spot', 'product', 'event').required(),
      entity_id: commonValidations.uuid.required()
    })
  }
};

export default favoriteValidation;
