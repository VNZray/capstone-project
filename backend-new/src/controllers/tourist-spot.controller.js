/**
 * Tourist Spot Controller
 * Handles tourist spot operations
 */
import { sequelize } from '../models/index.js';
import { ApiError } from '../utils/api-error.js';
import logger from '../config/logger.js';
import { extractProcedureResult, extractSingleResult } from '../utils/helpers.js';

/**
 * Create a new tourist spot
 */
export const createTouristSpot = async (req, res, next) => {
  try {
    const {
      name,
      description,
      location,
      latitude,
      longitude,
      category,
      entrance_fee,
      contact_number,
      email,
      website,
      is_featured = false
    } = req.body;

    const id = crypto.randomUUID();
    await sequelize.query(
      'CALL InsertTouristSpot(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      {
        replacements: [
          id, name, description, location, latitude, longitude,
          category, entrance_fee, contact_number, email, website, is_featured
        ]
      }
    );

    const queryResult = await sequelize.query('CALL GetTouristSpotById(?)', {
      replacements: [id]
    });
    const result = extractSingleResult(queryResult);

    res.status(201).success(result, 'Tourist spot created successfully');
  } catch (error) {
    logger.error('Error creating tourist spot:', error);
    next(error);
  }
};

/**
 * Get tourist spot by ID
 */
export const getTouristSpot = async (req, res, next) => {
  try {
    const { id } = req.params;

    const queryResult = await sequelize.query('CALL GetTouristSpotById(?)', {
      replacements: [id]
    });
    const result = extractSingleResult(queryResult);

    if (!result) {
      throw ApiError.notFound('Tourist spot not found');
    }

    res.success(result);
  } catch (error) {
    logger.error('Error fetching tourist spot:', error);
    next(error);
  }
};

/**
 * Get all tourist spots with filters
 */
export const getAllTouristSpots = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      search,
      isFeatured
    } = req.query;

    let queryResult;
    if (status === 'active') {
      queryResult = await sequelize.query('CALL GetActiveTouristSpots()');
    } else if (isFeatured === 'true') {
      queryResult = await sequelize.query('CALL GetFeaturedTouristSpots()');
    } else {
      queryResult = await sequelize.query('CALL GetAllTouristSpots()');
    }
    const results = extractProcedureResult(queryResult);

    // Apply filters
    let filtered = results;
    if (category) {
      filtered = filtered.filter(spot => spot.category === category);
    }
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(spot =>
        spot.name.toLowerCase().includes(searchLower) ||
        spot.description?.toLowerCase().includes(searchLower)
      );
    }

    // Apply pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const paginatedResults = filtered.slice(offset, offset + parseInt(limit));

    res.success({
      data: paginatedResults,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filtered.length
      }
    });
  } catch (error) {
    logger.error('Error fetching tourist spots:', error);
    next(error);
  }
};

/**
 * Update tourist spot
 */
export const updateTouristSpot = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      location,
      latitude,
      longitude,
      category,
      entrance_fee,
      contact_number,
      email,
      website,
      is_featured
    } = req.body;

    await sequelize.query(
      'CALL UpdateTouristSpot(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      {
        replacements: [
          id, name, description, location, latitude, longitude,
          category, entrance_fee, contact_number, email, website, is_featured
        ]
      }
    );

    const queryResult = await sequelize.query('CALL GetTouristSpotById(?)', {
      replacements: [id]
    });
    const result = extractSingleResult(queryResult);

    res.success(result, 'Tourist spot updated successfully');
  } catch (error) {
    logger.error('Error updating tourist spot:', error);
    next(error);
  }
};

/**
 * Delete tourist spot
 */
export const deleteTouristSpot = async (req, res, next) => {
  try {
    const { id } = req.params;

    await sequelize.query('CALL DeleteTouristSpot(?)', {
      replacements: [id]
    });

    res.success(null, 'Tourist spot deleted successfully');
  } catch (error) {
    logger.error('Error deleting tourist spot:', error);
    next(error);
  }
};

/**
 * Add image to tourist spot
 */
export const addImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { image_url, caption, is_primary = false } = req.body;

    const imageId = crypto.randomUUID();
    await sequelize.query(
      'INSERT INTO tourist_spot_images (id, tourist_spot_id, image_url, caption, is_primary, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      { replacements: [imageId, id, image_url, caption, is_primary] }
    );

    res.status(201).success({ id: imageId, image_url, caption, is_primary }, 'Image added successfully');
  } catch (error) {
    logger.error('Error adding image:', error);
    next(error);
  }
};

/**
 * Remove image from tourist spot
 */
export const removeImage = async (req, res, next) => {
  try {
    const { imageId } = req.params;

    await sequelize.query(
      'DELETE FROM tourist_spot_images WHERE id = ?',
      { replacements: [imageId] }
    );

    res.success(null, 'Image removed successfully');
  } catch (error) {
    logger.error('Error removing image:', error);
    next(error);
  }
};

/**
 * Update spot schedule
 */
export const updateSchedule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { schedules } = req.body;

    // Delete existing schedules
    await sequelize.query(
      'DELETE FROM tourist_spot_schedules WHERE tourist_spot_id = ?',
      { replacements: [id] }
    );

    // Insert new schedules
    for (const schedule of schedules) {
      const scheduleId = crypto.randomUUID();
      await sequelize.query(
        'INSERT INTO tourist_spot_schedules (id, tourist_spot_id, day_of_week, open_time, close_time) VALUES (?, ?, ?, ?, ?)',
        { replacements: [scheduleId, id, schedule.day_of_week, schedule.open_time, schedule.close_time] }
      );
    }

    // Fetch updated schedules
    const [results] = await sequelize.query(
      'SELECT * FROM tourist_spot_schedules WHERE tourist_spot_id = ? ORDER BY FIELD(day_of_week, "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday")',
      { replacements: [id] }
    );

    res.success(results, 'Schedule updated successfully');
  } catch (error) {
    logger.error('Error updating schedule:', error);
    next(error);
  }
};

/**
 * Get featured tourist spots
 */
export const getFeaturedSpots = async (req, res, next) => {
  try {
    const { limit = 5 } = req.query;

    const queryResult = await sequelize.query('CALL GetFeaturedTouristSpots()');
    const results = extractProcedureResult(queryResult);

    res.success(results.slice(0, parseInt(limit)));
  } catch (error) {
    logger.error('Error fetching featured spots:', error);
    next(error);
  }
};

/**
 * Get spots by category
 */
export const getSpotsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const queryResult = await sequelize.query('CALL GetActiveTouristSpots()');
    const results = extractProcedureResult(queryResult);

    const filtered = results.filter(spot => spot.category === category);

    // Apply pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const paginatedResults = filtered.slice(offset, offset + parseInt(limit));

    res.success({
      data: paginatedResults,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filtered.length
      }
    });
  } catch (error) {
    logger.error('Error fetching spots by category:', error);
    next(error);
  }
};

/**
 * Update tourist spot status (admin)
 */
export const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, comments } = req.body;
    const reviewedBy = req.user.id;

    await sequelize.query('CALL UpdateTouristSpotStatus(?, ?)', {
      replacements: [id, status]
    });

    // Log the approval action
    await sequelize.query(
      'INSERT INTO approval_records (entity_type, entity_id, action, reason, approved_by, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      { replacements: ['tourist_spot', id, status === 'active' ? 'approve' : 'reject', comments, reviewedBy] }
    );

    const queryResult = await sequelize.query('CALL GetTouristSpotById(?)', {
      replacements: [id]
    });
    const result = extractSingleResult(queryResult);

    res.success(result, `Tourist spot status updated to ${status}`);
  } catch (error) {
    logger.error('Error updating spot status:', error);
    next(error);
  }
};

export default {
  createTouristSpot,
  getTouristSpot,
  getAllTouristSpots,
  updateTouristSpot,
  deleteTouristSpot,
  addImage,
  removeImage,
  updateSchedule,
  getFeaturedSpots,
  getSpotsByCategory,
  updateStatus
};
