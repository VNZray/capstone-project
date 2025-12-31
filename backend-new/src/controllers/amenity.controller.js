/**
 * Amenity Controller
 * Handles amenity CRUD operations
 */
import { Amenity, sequelize } from '../models/index.js';
import { ApiError } from '../utils/api-error.js';
import { calculateOffset, formatPagination } from '../utils/helpers.js';
import logger from '../config/logger.js';

/**
 * Get all amenities
 */
export const getAmenities = async (req, res, next) => {
  try {
    const { page = 1, limit = 100, search } = req.query;

    const whereClause = {};

    if (search) {
      whereClause.name = {
        [sequelize.Sequelize.Op.like]: `%${search}%`
      };
    }

    const offset = calculateOffset(page, limit);

    const { count, rows: amenities } = await Amenity.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset,
      order: [['name', 'ASC']]
    });

    const pagination = formatPagination(count, parseInt(page), parseInt(limit));
    res.paginated(amenities, pagination);
  } catch (error) {
    next(error);
  }
};

/**
 * Get amenity by ID
 */
export const getAmenityById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const amenity = await Amenity.findByPk(id);

    if (!amenity) {
      throw ApiError.notFound('Amenity not found');
    }

    res.success(amenity);
  } catch (error) {
    next(error);
  }
};

/**
 * Create new amenity
 */
export const createAmenity = async (req, res, next) => {
  try {
    const { name, icon, description, category } = req.body;

    if (!name) {
      throw ApiError.badRequest('Amenity name is required');
    }

    // Check for duplicate
    const existing = await Amenity.findOne({ where: { name } });
    if (existing) {
      throw ApiError.conflict('Amenity with this name already exists');
    }

    const amenity = await Amenity.create({
      name,
      icon,
      description,
      category
    });

    res.created(amenity, 'Amenity created successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update amenity
 */
export const updateAmenity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, icon, description, category } = req.body;

    const amenity = await Amenity.findByPk(id);

    if (!amenity) {
      throw ApiError.notFound('Amenity not found');
    }

    // Check for duplicate name if changing
    if (name && name !== amenity.name) {
      const existing = await Amenity.findOne({ where: { name } });
      if (existing) {
        throw ApiError.conflict('Amenity with this name already exists');
      }
    }

    await amenity.update({
      name: name ?? amenity.name,
      icon: icon ?? amenity.icon,
      description: description ?? amenity.description,
      category: category ?? amenity.category
    });

    res.success(amenity, 'Amenity updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete amenity
 */
export const deleteAmenity = async (req, res, next) => {
  try {
    const { id } = req.params;

    const amenity = await Amenity.findByPk(id);

    if (!amenity) {
      throw ApiError.notFound('Amenity not found');
    }

    await amenity.destroy();

    res.success(null, 'Amenity deleted successfully');
  } catch (error) {
    next(error);
  }
};
