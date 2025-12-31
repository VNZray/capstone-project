/**
 * External Booking Controller
 * Handles external booking integrations (OTAs, etc.)
 */
import { ExternalBooking, Room, Business, sequelize } from '../models/index.js';
import { ApiError } from '../utils/api-error.js';
import { calculateOffset, formatPagination } from '../utils/helpers.js';
import { v4 as uuidv4 } from 'uuid';
import logger from '../config/logger.js';

/**
 * Get all external bookings with pagination
 */
export const getAllExternalBookings = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, business_id, source } = req.query;

    const whereClause = {};

    if (status) {
      whereClause.status = status;
    }

    if (business_id) {
      whereClause.business_id = business_id;
    }

    if (source) {
      whereClause.source = source;
    }

    const offset = calculateOffset(page, limit);

    const { count, rows: bookings } = await ExternalBooking.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Room,
          as: 'room',
          attributes: ['id', 'room_number', 'room_type']
        },
        {
          model: Business,
          as: 'business',
          attributes: ['id', 'business_name']
        }
      ],
      limit: parseInt(limit),
      offset,
      order: [['created_at', 'DESC']]
    });

    const pagination = formatPagination(count, parseInt(page), parseInt(limit));
    res.paginated(bookings, pagination);
  } catch (error) {
    next(error);
  }
};

/**
 * Get external booking by ID
 */
export const getExternalBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await ExternalBooking.findByPk(id, {
      include: [
        {
          model: Room,
          as: 'room'
        },
        {
          model: Business,
          as: 'business'
        }
      ]
    });

    if (!booking) {
      throw ApiError.notFound('External booking not found');
    }

    res.success(booking);
  } catch (error) {
    next(error);
  }
};

/**
 * Get external bookings by business ID
 */
export const getExternalBookingsByBusinessId = async (req, res, next) => {
  try {
    const { businessId } = req.params;
    const { status } = req.query;

    const whereClause = { business_id: businessId };

    if (status) {
      whereClause.status = status;
    }

    const bookings = await ExternalBooking.findAll({
      where: whereClause,
      include: [{
        model: Room,
        as: 'room',
        attributes: ['id', 'room_number', 'room_type']
      }],
      order: [['check_in_date', 'DESC']]
    });

    res.success(bookings);
  } catch (error) {
    next(error);
  }
};

/**
 * Get external bookings by room ID
 */
export const getExternalBookingsByRoomId = async (req, res, next) => {
  try {
    const { roomId } = req.params;

    const bookings = await ExternalBooking.findAll({
      where: { room_id: roomId },
      order: [['check_in_date', 'DESC']]
    });

    res.success(bookings);
  } catch (error) {
    next(error);
  }
};

/**
 * Create external booking
 */
export const createExternalBooking = async (req, res, next) => {
  try {
    const {
      business_id,
      room_id,
      source,
      external_reference,
      guest_name,
      guest_email,
      guest_phone,
      check_in_date,
      check_out_date,
      number_of_guests,
      total_amount,
      status = 'confirmed',
      notes
    } = req.body;

    if (!business_id || !room_id || !check_in_date || !check_out_date) {
      throw ApiError.badRequest('business_id, room_id, check_in_date, and check_out_date are required');
    }

    // Check for duplicate external reference if provided
    if (external_reference) {
      const existing = await ExternalBooking.findOne({
        where: { external_reference, source }
      });

      if (existing) {
        throw ApiError.conflict('External booking with this reference already exists');
      }
    }

    const booking = await ExternalBooking.create({
      id: uuidv4(),
      business_id,
      room_id,
      source,
      external_reference,
      guest_name,
      guest_email,
      guest_phone,
      check_in_date,
      check_out_date,
      number_of_guests,
      total_amount,
      status,
      notes,
      created_by: req.user?.id || null
    });

    res.created(booking, 'External booking created successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update external booking
 */
export const updateExternalBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const booking = await ExternalBooking.findByPk(id);

    if (!booking) {
      throw ApiError.notFound('External booking not found');
    }

    await booking.update(updateData);

    res.success(booking, 'External booking updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update external booking status
 */
export const updateExternalBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show'];

    if (!validStatuses.includes(status)) {
      throw ApiError.badRequest(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const booking = await ExternalBooking.findByPk(id);

    if (!booking) {
      throw ApiError.notFound('External booking not found');
    }

    await booking.update({ status });

    res.success(booking, 'External booking status updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete external booking
 */
export const deleteExternalBooking = async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await ExternalBooking.findByPk(id);

    if (!booking) {
      throw ApiError.notFound('External booking not found');
    }

    await booking.destroy();

    res.success(null, 'External booking deleted successfully');
  } catch (error) {
    next(error);
  }
};
