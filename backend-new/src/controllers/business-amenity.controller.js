/**
 * Business Amenity Controller
 * Handles business-specific amenity assignments
 */
import { BusinessAmenity, Amenity, Business, sequelize } from '../models/index.js';
import { ApiError } from '../utils/api-error.js';
import logger from '../config/logger.js';

/**
 * Get all business amenities
 */
export const getAllBusinessAmenities = async (req, res, next) => {
  try {
    const businessAmenities = await BusinessAmenity.findAll({
      include: [
        {
          model: Amenity,
          as: 'amenity',
          attributes: ['id', 'name', 'icon', 'category']
        },
        {
          model: Business,
          as: 'business',
          attributes: ['id', 'business_name']
        }
      ]
    });

    res.success(businessAmenities);
  } catch (error) {
    next(error);
  }
};

/**
 * Get business amenities by business ID
 */
export const getBusinessAmenitiesByBusinessId = async (req, res, next) => {
  try {
    const { businessId } = req.params;

    const businessAmenities = await BusinessAmenity.findAll({
      where: { business_id: businessId },
      include: [{
        model: Amenity,
        as: 'amenity',
        attributes: ['id', 'name', 'icon', 'category']
      }]
    });

    // Return just the amenity details
    const amenities = businessAmenities.map(ba => ba.amenity);
    res.success(amenities);
  } catch (error) {
    next(error);
  }
};

/**
 * Get business amenity by ID
 */
export const getBusinessAmenityById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const businessAmenity = await BusinessAmenity.findByPk(id, {
      include: [{
        model: Amenity,
        as: 'amenity',
        attributes: ['id', 'name', 'icon', 'category']
      }]
    });

    if (!businessAmenity) {
      throw ApiError.notFound('Business amenity not found');
    }

    res.success(businessAmenity);
  } catch (error) {
    next(error);
  }
};

/**
 * Add amenity to business
 */
export const addBusinessAmenity = async (req, res, next) => {
  try {
    const { business_id, amenity_id } = req.body;

    if (!business_id || !amenity_id) {
      throw ApiError.badRequest('business_id and amenity_id are required');
    }

    // Check if already exists
    const existing = await BusinessAmenity.findOne({
      where: { business_id, amenity_id }
    });

    if (existing) {
      throw ApiError.conflict('This amenity is already assigned to the business');
    }

    const businessAmenity = await BusinessAmenity.create({
      business_id,
      amenity_id
    });

    res.created(businessAmenity, 'Business amenity added successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Add multiple amenities to business
 */
export const addBulkBusinessAmenities = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { business_id, amenity_ids } = req.body;

    if (!business_id || !amenity_ids || !Array.isArray(amenity_ids)) {
      throw ApiError.badRequest('business_id and amenity_ids array are required');
    }

    // Remove existing amenities first
    await BusinessAmenity.destroy({
      where: { business_id },
      transaction
    });

    // Add new amenities
    const businessAmenities = await Promise.all(
      amenity_ids.map(amenity_id =>
        BusinessAmenity.create({ business_id, amenity_id }, { transaction })
      )
    );

    await transaction.commit();

    res.success(businessAmenities, 'Business amenities updated successfully');
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

/**
 * Remove amenity from business
 */
export const removeBusinessAmenity = async (req, res, next) => {
  try {
    const { id } = req.params;

    const businessAmenity = await BusinessAmenity.findByPk(id);

    if (!businessAmenity) {
      throw ApiError.notFound('Business amenity not found');
    }

    await businessAmenity.destroy();

    res.success(null, 'Business amenity removed successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Remove amenity from business by business_id and amenity_id
 */
export const removeBusinessAmenityByIds = async (req, res, next) => {
  try {
    const { business_id, amenity_id } = req.params;

    const deleted = await BusinessAmenity.destroy({
      where: { business_id, amenity_id }
    });

    if (deleted === 0) {
      throw ApiError.notFound('Business amenity not found');
    }

    res.success(null, 'Business amenity removed successfully');
  } catch (error) {
    next(error);
  }
};
