/**
 * Room Amenity Controller
 * Handles room-specific amenity assignments
 */
import { RoomAmenity, Room, Amenity, sequelize } from '../models/index.js';
import { ApiError } from '../utils/api-error.js';
import logger from '../config/logger.js';

/**
 * Get all room amenities
 */
export const getAllRoomAmenities = async (req, res, next) => {
  try {
    const roomAmenities = await RoomAmenity.findAll({
      include: [
        {
          model: Amenity,
          as: 'amenity',
          attributes: ['id', 'name', 'icon', 'category']
        },
        {
          model: Room,
          as: 'room',
          attributes: ['id', 'room_number']
        }
      ]
    });

    res.success(roomAmenities);
  } catch (error) {
    next(error);
  }
};

/**
 * Get room amenities by room ID
 */
export const getRoomAmenitiesByRoomId = async (req, res, next) => {
  try {
    const { roomId } = req.params;

    const roomAmenities = await RoomAmenity.findAll({
      where: { room_id: roomId },
      include: [{
        model: Amenity,
        as: 'amenity',
        attributes: ['id', 'name', 'icon', 'category']
      }]
    });

    // Return just the amenity details
    const amenities = roomAmenities.map(ra => ra.amenity);
    res.success(amenities);
  } catch (error) {
    next(error);
  }
};

/**
 * Get room amenity by ID
 */
export const getRoomAmenityById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const roomAmenity = await RoomAmenity.findByPk(id, {
      include: [{
        model: Amenity,
        as: 'amenity',
        attributes: ['id', 'name', 'icon', 'category']
      }]
    });

    if (!roomAmenity) {
      throw ApiError.notFound('Room amenity not found');
    }

    res.success(roomAmenity);
  } catch (error) {
    next(error);
  }
};

/**
 * Add amenity to room
 */
export const addRoomAmenity = async (req, res, next) => {
  try {
    const { room_id, amenity_id } = req.body;

    if (!room_id || !amenity_id) {
      throw ApiError.badRequest('room_id and amenity_id are required');
    }

    // Check if already exists
    const existing = await RoomAmenity.findOne({
      where: { room_id, amenity_id }
    });

    if (existing) {
      throw ApiError.conflict('This amenity is already assigned to the room');
    }

    const roomAmenity = await RoomAmenity.create({
      room_id,
      amenity_id
    });

    res.created(roomAmenity, 'Room amenity added successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Add multiple amenities to room
 */
export const addBulkRoomAmenities = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { room_id, amenity_ids } = req.body;

    if (!room_id || !amenity_ids || !Array.isArray(amenity_ids)) {
      throw ApiError.badRequest('room_id and amenity_ids array are required');
    }

    // Remove existing amenities first
    await RoomAmenity.destroy({
      where: { room_id },
      transaction
    });

    // Add new amenities
    const roomAmenities = await Promise.all(
      amenity_ids.map(amenity_id =>
        RoomAmenity.create({ room_id, amenity_id }, { transaction })
      )
    );

    await transaction.commit();

    res.success(roomAmenities, 'Room amenities updated successfully');
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

/**
 * Remove amenity from room
 */
export const removeRoomAmenity = async (req, res, next) => {
  try {
    const { id } = req.params;

    const roomAmenity = await RoomAmenity.findByPk(id);

    if (!roomAmenity) {
      throw ApiError.notFound('Room amenity not found');
    }

    await roomAmenity.destroy();

    res.success(null, 'Room amenity removed successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Remove amenity from room by room_id and amenity_id
 */
export const removeRoomAmenityByIds = async (req, res, next) => {
  try {
    const { room_id, amenity_id } = req.params;

    const deleted = await RoomAmenity.destroy({
      where: { room_id, amenity_id }
    });

    if (deleted === 0) {
      throw ApiError.notFound('Room amenity not found');
    }

    res.success(null, 'Room amenity removed successfully');
  } catch (error) {
    next(error);
  }
};
