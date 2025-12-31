/**
 * Business Hours Controller
 * Handles business operating hours management
 */
import { BusinessHours, Business, sequelize } from '../models/index.js';
import { ApiError } from '../utils/api-error.js';
import logger from '../config/logger.js';

/**
 * Get business hours by business ID
 */
export const getBusinessHours = async (req, res, next) => {
  try {
    const { businessId } = req.params;

    const hours = await BusinessHours.findAll({
      where: { business_id: businessId },
      order: [['day_of_week', 'ASC']]
    });

    res.success(hours);
  } catch (error) {
    next(error);
  }
};

/**
 * Get business hours by ID
 */
export const getBusinessHoursById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const hours = await BusinessHours.findByPk(id);

    if (!hours) {
      throw ApiError.notFound('Business hours not found');
    }

    res.success(hours);
  } catch (error) {
    next(error);
  }
};

/**
 * Create or update business hours
 */
export const upsertBusinessHours = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { business_id, hours } = req.body;

    if (!business_id || !hours || !Array.isArray(hours)) {
      throw ApiError.badRequest('business_id and hours array are required');
    }

    // Validate hours format
    const validDays = [0, 1, 2, 3, 4, 5, 6]; // Sunday = 0, Saturday = 6
    for (const hour of hours) {
      if (!validDays.includes(hour.day_of_week)) {
        throw ApiError.badRequest(`Invalid day_of_week: ${hour.day_of_week}`);
      }
    }

    // Delete existing hours
    await BusinessHours.destroy({
      where: { business_id },
      transaction
    });

    // Create new hours
    const createdHours = await Promise.all(
      hours.map(hour =>
        BusinessHours.create({
          business_id,
          day_of_week: hour.day_of_week,
          open_time: hour.open_time,
          close_time: hour.close_time,
          is_closed: hour.is_closed ?? false,
          is_24_hours: hour.is_24_hours ?? false
        }, { transaction })
      )
    );

    await transaction.commit();

    res.success(createdHours, 'Business hours updated successfully');
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

/**
 * Update single business hours entry
 */
export const updateBusinessHours = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { open_time, close_time, is_closed, is_24_hours } = req.body;

    const hours = await BusinessHours.findByPk(id);

    if (!hours) {
      throw ApiError.notFound('Business hours not found');
    }

    await hours.update({
      open_time: open_time ?? hours.open_time,
      close_time: close_time ?? hours.close_time,
      is_closed: is_closed ?? hours.is_closed,
      is_24_hours: is_24_hours ?? hours.is_24_hours
    });

    res.success(hours, 'Business hours updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete business hours by ID
 */
export const deleteBusinessHours = async (req, res, next) => {
  try {
    const { id } = req.params;

    const hours = await BusinessHours.findByPk(id);

    if (!hours) {
      throw ApiError.notFound('Business hours not found');
    }

    await hours.destroy();

    res.success(null, 'Business hours deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete all business hours for a business
 */
export const deleteAllBusinessHours = async (req, res, next) => {
  try {
    const { businessId } = req.params;

    await BusinessHours.destroy({
      where: { business_id: businessId }
    });

    res.success(null, 'All business hours deleted successfully');
  } catch (error) {
    next(error);
  }
};
