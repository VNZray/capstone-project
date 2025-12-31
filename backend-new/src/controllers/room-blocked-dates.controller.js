/**
 * Room Blocked Dates Controller
 * Handles room availability blocking for maintenance, reservations, etc.
 */
import { RoomBlockedDates, Room, Business, sequelize } from '../models/index.js';
import { ApiError } from '../utils/api-error.js';
import { v4 as uuidv4 } from 'uuid';
import logger from '../config/logger.js';

/**
 * Get all room blocked dates
 */
export const getAllBlockedDates = async (req, res, next) => {
  try {
    const blockedDates = await RoomBlockedDates.findAll({
      include: [
        {
          model: Room,
          as: 'room',
          attributes: ['id', 'room_number']
        },
        {
          model: Business,
          as: 'business',
          attributes: ['id', 'business_name']
        }
      ],
      order: [['start_date', 'ASC']]
    });

    res.success(blockedDates);
  } catch (error) {
    next(error);
  }
};

/**
 * Get blocked date by ID
 */
export const getBlockedDateById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const blockedDate = await RoomBlockedDates.findByPk(id, {
      include: [
        {
          model: Room,
          as: 'room',
          attributes: ['id', 'room_number']
        }
      ]
    });

    if (!blockedDate) {
      throw ApiError.notFound('Blocked date not found');
    }

    res.success(blockedDate);
  } catch (error) {
    next(error);
  }
};

/**
 * Get blocked dates by room ID
 */
export const getBlockedDatesByRoomId = async (req, res, next) => {
  try {
    const { roomId } = req.params;

    const blockedDates = await RoomBlockedDates.findAll({
      where: { room_id: roomId },
      order: [['start_date', 'ASC']]
    });

    res.success(blockedDates);
  } catch (error) {
    next(error);
  }
};

/**
 * Get blocked dates by business ID
 */
export const getBlockedDatesByBusinessId = async (req, res, next) => {
  try {
    const { businessId } = req.params;

    const blockedDates = await RoomBlockedDates.findAll({
      where: { business_id: businessId },
      include: [{
        model: Room,
        as: 'room',
        attributes: ['id', 'room_number']
      }],
      order: [['start_date', 'ASC']]
    });

    res.success(blockedDates);
  } catch (error) {
    next(error);
  }
};

/**
 * Get blocked dates within a date range for a room
 */
export const getBlockedDatesInRange = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      throw ApiError.badRequest('start_date and end_date are required');
    }

    const blockedDates = await RoomBlockedDates.findAll({
      where: {
        room_id: roomId,
        [sequelize.Sequelize.Op.or]: [
          {
            start_date: {
              [sequelize.Sequelize.Op.between]: [start_date, end_date]
            }
          },
          {
            end_date: {
              [sequelize.Sequelize.Op.between]: [start_date, end_date]
            }
          },
          {
            [sequelize.Sequelize.Op.and]: [
              { start_date: { [sequelize.Sequelize.Op.lte]: start_date } },
              { end_date: { [sequelize.Sequelize.Op.gte]: end_date } }
            ]
          }
        ]
      },
      order: [['start_date', 'ASC']]
    });

    res.success(blockedDates);
  } catch (error) {
    next(error);
  }
};

/**
 * Check room availability for a date range
 */
export const checkRoomAvailability = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      throw ApiError.badRequest('start_date and end_date are required');
    }

    // Check for overlapping blocked dates
    const overlapping = await RoomBlockedDates.findOne({
      where: {
        room_id: roomId,
        [sequelize.Sequelize.Op.or]: [
          {
            start_date: {
              [sequelize.Sequelize.Op.between]: [start_date, end_date]
            }
          },
          {
            end_date: {
              [sequelize.Sequelize.Op.between]: [start_date, end_date]
            }
          },
          {
            [sequelize.Sequelize.Op.and]: [
              { start_date: { [sequelize.Sequelize.Op.lte]: start_date } },
              { end_date: { [sequelize.Sequelize.Op.gte]: end_date } }
            ]
          }
        ]
      }
    });

    res.success({
      room_id: roomId,
      start_date,
      end_date,
      available: !overlapping,
      status: overlapping ? 'BLOCKED' : 'AVAILABLE',
      blocking_reason: overlapping?.block_reason || null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create blocked date range
 */
export const createBlockedDate = async (req, res, next) => {
  try {
    const {
      room_id,
      business_id,
      start_date,
      end_date,
      block_reason = 'Other',
      notes
    } = req.body;

    // Validation
    if (!room_id || !business_id || !start_date || !end_date) {
      throw ApiError.badRequest('room_id, business_id, start_date, and end_date are required');
    }

    // Validate dates
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    if (startDate >= endDate) {
      throw ApiError.badRequest('end_date must be after start_date');
    }

    const created_by = req.user?.id || null;

    const blockedDate = await RoomBlockedDates.create({
      id: uuidv4(),
      room_id,
      business_id,
      start_date,
      end_date,
      block_reason,
      notes,
      created_by
    });

    res.created(blockedDate, 'Blocked date created successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update blocked date
 */
export const updateBlockedDate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { start_date, end_date, block_reason, notes } = req.body;

    const blockedDate = await RoomBlockedDates.findByPk(id);

    if (!blockedDate) {
      throw ApiError.notFound('Blocked date not found');
    }

    // Validate dates if both provided
    if (start_date && end_date) {
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);

      if (startDate >= endDate) {
        throw ApiError.badRequest('end_date must be after start_date');
      }
    }

    await blockedDate.update({
      start_date: start_date ?? blockedDate.start_date,
      end_date: end_date ?? blockedDate.end_date,
      block_reason: block_reason ?? blockedDate.block_reason,
      notes: notes ?? blockedDate.notes
    });

    res.success(blockedDate, 'Blocked date updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete blocked date
 */
export const deleteBlockedDate = async (req, res, next) => {
  try {
    const { id } = req.params;

    const blockedDate = await RoomBlockedDates.findByPk(id);

    if (!blockedDate) {
      throw ApiError.notFound('Blocked date not found');
    }

    await blockedDate.destroy();

    res.success(null, 'Blocked date deleted successfully');
  } catch (error) {
    next(error);
  }
};
