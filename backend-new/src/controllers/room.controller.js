/**
 * Room Controller
 * Handles room CRUD operations via stored procedures
 */
import { sequelize } from '../models/index.js';
import { ApiError } from '../utils/api-error.js';
import { extractProcedureResult, extractSingleResult } from '../utils/helpers.js';
import { v4 as uuidv4 } from 'uuid';
import logger from '../config/logger.js';

const ROOM_FIELDS = [
  'business_id',
  'room_number',
  'room_type',
  'description',
  'room_price',
  'per_hour_rate',
  'room_image',
  'status',
  'capacity',
  'floor',
  'room_size'
];

const buildRoomParams = (id, body) => [
  id,
  ...ROOM_FIELDS.map(f => body?.[f] ?? null)
];

/**
 * Get all rooms
 */
export const getAllRooms = async (req, res, next) => {
  try {
    const queryResult = await sequelize.query('CALL GetAllRooms()');
    const results = extractProcedureResult(queryResult);
    res.success(results);
  } catch (error) {
    logger.error('Error fetching rooms:', error);
    next(error);
  }
};

/**
 * Get room by ID
 */
export const getRoomById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const queryResult = await sequelize.query('CALL GetRoomById(?)', {
      replacements: [id]
    });
    const result = extractSingleResult(queryResult);

    if (!result) {
      throw ApiError.notFound('Room not found');
    }

    res.success(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get rooms by business ID
 */
export const getRoomsByBusinessId = async (req, res, next) => {
  const { businessId, id } = req.params;
  const businessIdParam = businessId || id;

  if (!businessIdParam) {
    throw ApiError.badRequest('business_id is required');
  }

  try {
    const queryResult = await sequelize.query('CALL GetRoomByBusinessId(?)', {
      replacements: [businessIdParam]
    });
    const results = extractProcedureResult(queryResult);
    res.success(results);
  } catch (error) {
    next(error);
  }
};

/**
 * Create new room
 */
export const createRoom = async (req, res, next) => {
  try {
    const id = uuidv4();
    const params = buildRoomParams(id, req.body);

    const queryResult = await sequelize.query(
      'CALL InsertRoom(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      { replacements: params }
    );
    const result = extractSingleResult(queryResult);

    if (!result) {
      throw ApiError.internalError('Failed to create room');
    }

    logger.info(`Room created: ${id}`);

    res.created(result, 'Room created successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update room
 */
export const updateRoom = async (req, res, next) => {
  const { id } = req.params;
  try {
    // Check if room exists
    const existingQuery = await sequelize.query('CALL GetRoomById(?)', {
      replacements: [id]
    });
    const existing = extractSingleResult(existingQuery);

    if (!existing) {
      throw ApiError.notFound('Room not found');
    }

    const params = buildRoomParams(id, req.body);

    const queryResult = await sequelize.query(
      'CALL UpdateRoom(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      { replacements: params }
    );
    const result = extractSingleResult(queryResult);

    if (!result) {
      throw ApiError.notFound('Room not found after update');
    }

    logger.info(`Room updated: ${id}`);

    res.success({
      message: 'Room updated successfully',
      ...result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete room
 */
export const deleteRoom = async (req, res, next) => {
  const { id } = req.params;
  try {
    await sequelize.query('CALL DeleteRoom(?)', {
      replacements: [id]
    });

    logger.info(`Room deleted: ${id}`);

    res.success({ message: 'Room deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Update room status
 */
export const updateRoomStatus = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const queryResult = await sequelize.query('CALL UpdateRoomStatus(?, ?)', {
      replacements: [id, status]
    });
    const result = extractSingleResult(queryResult);

    if (!result) {
      throw ApiError.notFound('Room not found');
    }

    logger.info(`Room ${id} status updated to ${status}`);

    res.success({
      message: 'Room status updated successfully',
      ...result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get available rooms by date range
 */
export const getAvailableRooms = async (req, res, next) => {
  const { businessId } = req.params;
  const { check_in, check_out } = req.query;

  try {
    const queryResult = await sequelize.query(
      'CALL GetAvailableRooms(?, ?, ?)',
      { replacements: [businessId, check_in, check_out] }
    );
    const results = extractProcedureResult(queryResult);
    res.success(results);
  } catch (error) {
    next(error);
  }
};

export default {
  getAllRooms,
  getRoomById,
  getRoomsByBusinessId,
  createRoom,
  updateRoom,
  deleteRoom,
  updateRoomStatus,
  getAvailableRooms
};
