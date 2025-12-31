/**
 * Room Controller
 * Handles room CRUD operations using Sequelize models
 */
import { sequelize, Room, RoomPhoto, RoomAmenity, Amenity, Booking } from '../models/index.js';
import { ApiError } from '../utils/api-error.js';
import { v4 as uuidv4 } from 'uuid';
import logger from '../config/logger.js';
import { Op } from 'sequelize';

/**
 * Get all rooms
 */
export const getAllRooms = async (req, res, next) => {
  try {
    const rooms = await Room.findAll({
      include: [
        { model: RoomPhoto, as: 'photos' },
        { model: Amenity, as: 'amenities', through: { attributes: [] } }
      ],
      order: [['created_at', 'DESC']]
    });
    res.success(rooms);
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
    const room = await Room.findByPk(id, {
      include: [
        { model: RoomPhoto, as: 'photos' },
        { model: Amenity, as: 'amenities', through: { attributes: [] } }
      ]
    });

    if (!room) {
      throw ApiError.notFound('Room not found');
    }

    res.success(room);
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
    const rooms = await Room.findAll({
      where: { business_id: businessIdParam },
      include: [
        { model: RoomPhoto, as: 'photos' },
        { model: Amenity, as: 'amenities', through: { attributes: [] } }
      ],
      order: [['room_name', 'ASC']]
    });
    res.success(rooms);
  } catch (error) {
    next(error);
  }
};

/**
 * Create new room
 */
export const createRoom = async (req, res, next) => {
  try {
    const roomData = {
      id: uuidv4(),
      business_id: req.body.business_id,
      room_name: req.body.room_name,
      room_number: req.body.room_number,
      room_type: req.body.room_type || 'Standard',
      description: req.body.description,
      base_price: req.body.base_price || req.body.room_price,
      extra_person_fee: req.body.extra_person_fee || req.body.per_hour_rate,
      room_image: req.body.room_image,
      status: req.body.status || 'Available',
      max_occupancy: req.body.max_occupancy || req.body.capacity || 2,
      floor_number: req.body.floor_number || req.body.floor,
      size_sqm: req.body.size_sqm || req.body.room_size,
      bed_count: req.body.bed_count,
      bed_type: req.body.bed_type,
      bathroom_count: req.body.bathroom_count
    };

    const room = await Room.create(roomData);

    logger.info(`Room created: ${room.id}`);

    res.created(room, 'Room created successfully');
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
    const room = await Room.findByPk(id);

    if (!room) {
      throw ApiError.notFound('Room not found');
    }

    const updateData = {
      room_name: req.body.room_name,
      room_number: req.body.room_number,
      room_type: req.body.room_type,
      description: req.body.description,
      base_price: req.body.base_price || req.body.room_price,
      extra_person_fee: req.body.extra_person_fee || req.body.per_hour_rate,
      room_image: req.body.room_image,
      status: req.body.status,
      max_occupancy: req.body.max_occupancy || req.body.capacity,
      floor_number: req.body.floor_number || req.body.floor,
      size_sqm: req.body.size_sqm || req.body.room_size,
      bed_count: req.body.bed_count,
      bed_type: req.body.bed_type,
      bathroom_count: req.body.bathroom_count
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key =>
      updateData[key] === undefined && delete updateData[key]
    );

    await room.update(updateData);

    logger.info(`Room updated: ${id}`);

    res.success({
      message: 'Room updated successfully',
      ...room.toJSON()
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
    const room = await Room.findByPk(id);

    if (!room) {
      throw ApiError.notFound('Room not found');
    }

    await room.destroy();

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
    const room = await Room.findByPk(id);

    if (!room) {
      throw ApiError.notFound('Room not found');
    }

    await room.update({ status });

    logger.info(`Room ${id} status updated to ${status}`);

    res.success({
      message: 'Room status updated successfully',
      ...room.toJSON()
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
    // Get all rooms for the business that are not occupied
    const rooms = await Room.findAll({
      where: {
        business_id: businessId,
        status: { [Op.ne]: 'Unavailable' }
      },
      include: [
        { model: RoomPhoto, as: 'photos' },
        { model: Amenity, as: 'amenities', through: { attributes: [] } }
      ]
    });

    // If check_in and check_out provided, filter out rooms with conflicting bookings
    if (check_in && check_out) {
      const bookedRoomIds = await Booking.findAll({
        where: {
          check_in_date: { [Op.lt]: new Date(check_out) },
          check_out_date: { [Op.gt]: new Date(check_in) },
          status: { [Op.in]: ['Confirmed', 'Checked-In'] }
        },
        attributes: ['room_id']
      });

      const bookedIds = new Set(bookedRoomIds.map(b => b.room_id));
      const availableRooms = rooms.filter(r => !bookedIds.has(r.id));
      return res.success(availableRooms);
    }

    res.success(rooms);
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
