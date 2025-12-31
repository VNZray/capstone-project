/**
 * Booking Controller
 * Room booking management via stored procedures
 */
import { sequelize } from '../models/index.js';
import { ApiError } from '../utils/api-error.js';
import { extractProcedureResult, extractSingleResult } from '../utils/helpers.js';
import logger from '../config/logger.js';
import { v4 as uuidv4 } from 'uuid';

// Booking fields in order expected by stored procedures
const BOOKING_FIELDS = [
  'pax',
  'num_children',
  'num_adults',
  'num_infants',
  'foreign_counts',
  'domestic_counts',
  'overseas_counts',
  'local_counts',
  'trip_purpose',
  'booking_type',
  'check_in_date',
  'check_out_date',
  'check_in_time',
  'check_out_time',
  'total_price',
  'balance',
  'booking_status',
  'room_id',
  'tourist_id',
  'business_id',
  'booking_source',
  'guest_name',
  'guest_phone',
  'guest_email'
];

const buildBookingParams = (id, body, options = {}) => {
  return [
    id,
    ...BOOKING_FIELDS.map(f => {
      if (Object.prototype.hasOwnProperty.call(body, f)) return body[f];
      if (options.defaultBalanceFor === f) return options.defaultBalanceValue;
      if (options.defaultStatusFor === f) return options.defaultStatusValue;
      return null;
    })
  ];
};

/**
 * Get all bookings
 */
export const getAllBookings = async (req, res, next) => {
  try {
    const queryResult = await sequelize.query('CALL GetAllBookings()');
    const results = extractProcedureResult(queryResult);
    res.success(results);
  } catch (error) {
    logger.error('Error fetching bookings:', error);
    next(error);
  }
};

/**
 * Get booking by ID
 */
export const getBookingById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const queryResult = await sequelize.query('CALL GetBookingById(?)', {
      replacements: [id]
    });
    const result = extractSingleResult(queryResult);

    if (!result) {
      throw ApiError.notFound('Booking not found');
    }

    res.success(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get bookings by room ID
 */
export const getBookingsByRoomId = async (req, res, next) => {
  const { room_id } = req.params;
  try {
    const queryResult = await sequelize.query('CALL GetBookingsByRoomId(?)', {
      replacements: [room_id]
    });
    const results = extractProcedureResult(queryResult);
    res.success(results);
  } catch (error) {
    next(error);
  }
};

/**
 * Get bookings by tourist ID
 */
export const getBookingsByTouristId = async (req, res, next) => {
  const { tourist_id } = req.params;
  try {
    const queryResult = await sequelize.query('CALL GetBookingsByTouristId(?)', {
      replacements: [tourist_id]
    });
    const results = extractProcedureResult(queryResult);
    res.success(results);
  } catch (error) {
    next(error);
  }
};

/**
 * Get bookings by business ID
 */
export const getBookingsByBusinessId = async (req, res, next) => {
  const { business_id } = req.params;
  try {
    const queryResult = await sequelize.query('CALL GetBookingsByBusinessId(?)', {
      replacements: [business_id]
    });
    const results = extractProcedureResult(queryResult);
    res.success(results);
  } catch (error) {
    next(error);
  }
};

/**
 * Get available rooms by date range
 */
export const getAvailableRoomsByDateRange = async (req, res, next) => {
  const { business_id } = req.params;
  const { start_date, end_date } = req.query;

  if (!start_date || !end_date) {
    throw ApiError.badRequest('start_date and end_date are required');
  }

  try {
    const queryResult = await sequelize.query(
      'CALL GetAvailableRoomsByDateRange(?, ?, ?)',
      { replacements: [business_id, start_date, end_date] }
    );
    const results = extractProcedureResult(queryResult);
    res.success(results);
  } catch (error) {
    next(error);
  }
};

/**
 * Insert booking
 */
export const insertBooking = async (req, res, next) => {
  try {
    const id = req.body.id || uuidv4();
    const {
      pax,
      num_children = 0,
      num_adults = 0,
      num_infants = 0,
      foreign_counts = 0,
      domestic_counts = 0,
      overseas_counts = 0,
      local_counts = 0,
      trip_purpose,
      booking_type = 'overnight',
      check_in_date,
      check_out_date,
      check_in_time = '14:00:00',
      check_out_time = '12:00:00',
      total_price,
      balance,
      booking_status,
      room_id,
      tourist_id,
      business_id,
      booking_source,
      guest_name,
      guest_phone,
      guest_email
    } = req.body;

    // Validate required fields
    const missing = [];
    if (pax === undefined) missing.push('pax');
    if (!trip_purpose) missing.push('trip_purpose');
    if (!check_in_date) missing.push('check_in_date');
    if (!check_out_date) missing.push('check_out_date');
    if (!room_id) missing.push('room_id');
    if (!tourist_id) missing.push('tourist_id');
    if (total_price === undefined) missing.push('total_price');

    if (missing.length) {
      throw ApiError.badRequest(`Missing required fields: ${missing.join(', ')}`);
    }

    // Validate short-stay bookings
    if (booking_type === 'short-stay') {
      if (!req.body.check_in_time) {
        throw ApiError.badRequest('check_in_time is required for short-stay bookings');
      }
      if (!req.body.check_out_time) {
        throw ApiError.badRequest('check_out_time is required for short-stay bookings');
      }
    }

    const effectiveBalance = balance ?? total_price;
    const effectiveStatus = booking_status ?? 'Pending';

    const bodyWithDefaults = {
      ...req.body,
      balance: effectiveBalance,
      booking_status: effectiveStatus,
      check_in_time: req.body.check_in_time || check_in_time,
      check_out_time: req.body.check_out_time || check_out_time
    };

    const params = buildBookingParams(id, bodyWithDefaults);

    const queryResult = await sequelize.query(
      `CALL InsertBooking(${params.map(() => '?').join(', ')})`,
      { replacements: params }
    );
    const result = extractSingleResult(queryResult);

    if (!result) {
      throw ApiError.internalError('Failed to create booking');
    }

    logger.info(`Booking created: ${id}`);

    res.created({
      message: 'Booking created successfully',
      ...result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update booking
 */
export const updateBooking = async (req, res, next) => {
  const { id } = req.params;
  try {
    // Check if booking exists
    const existingQuery = await sequelize.query('CALL GetBookingById(?)', {
      replacements: [id]
    });
    const existing = extractSingleResult(existingQuery);

    if (!existing) {
      throw ApiError.notFound('Booking not found');
    }

    const params = buildBookingParams(id, req.body);

    const queryResult = await sequelize.query(
      `CALL UpdateBooking(${params.map(() => '?').join(', ')})`,
      { replacements: params }
    );
    const result = extractSingleResult(queryResult);

    if (!result) {
      throw ApiError.notFound('Booking not found after update');
    }

    logger.info(`Booking updated: ${id}`);

    res.success({
      message: 'Booking updated successfully',
      ...result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update booking status
 */
export const updateBookingStatus = async (req, res, next) => {
  const { id } = req.params;
  const { booking_status, cancellation_reason } = req.body;

  try {
    const queryResult = await sequelize.query(
      'CALL UpdateBookingStatus(?, ?, ?)',
      { replacements: [id, booking_status, cancellation_reason || null] }
    );
    const result = extractSingleResult(queryResult);

    if (!result) {
      throw ApiError.notFound('Booking not found');
    }

    logger.info(`Booking ${id} status updated to ${booking_status}`);

    res.success({
      message: 'Booking status updated successfully',
      ...result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete booking
 */
export const deleteBooking = async (req, res, next) => {
  const { id } = req.params;
  try {
    await sequelize.query('CALL DeleteBooking(?)', {
      replacements: [id]
    });

    logger.info(`Booking deleted: ${id}`);

    res.success({ message: 'Booking deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Get bookings by status
 */
export const getBookingsByStatus = async (req, res, next) => {
  const { status } = req.params;
  try {
    const queryResult = await sequelize.query('CALL GetBookingsByStatus(?)', {
      replacements: [status]
    });
    const results = extractProcedureResult(queryResult);
    res.success(results);
  } catch (error) {
    next(error);
  }
};

// ============================================================
// WALK-IN BOOKING MANAGEMENT
// ============================================================

/**
 * Create a walk-in booking (onsite check-in)
 * This endpoint allows staff to create a booking for guests who arrive without prior reservation
 */
export const createWalkInBooking = async (req, res, next) => {
  try {
    const {
      id = uuidv4(),
      pax,
      num_children = 0,
      num_adults = 0,
      num_infants = 0,
      foreign_counts = 0,
      domestic_counts = 0,
      overseas_counts = 0,
      local_counts = 0,
      trip_purpose = 'Leisure',
      booking_type = 'overnight',
      check_in_date,
      check_out_date,
      check_in_time = '14:00:00',
      check_out_time = '12:00:00',
      total_price,
      balance = 0,
      room_id,
      business_id,
      // Walk-in specific fields
      guest_name,
      guest_phone,
      guest_email,
      tourist_id = null, // Optional - if guest has an existing account
      immediate_checkin = true // Default to immediate check-in for walk-ins
    } = req.body;

    // Validation
    const missing = [];
    if (pax === undefined) missing.push('pax');
    if (!check_in_date) missing.push('check_in_date');
    if (!check_out_date) missing.push('check_out_date');
    if (!room_id) missing.push('room_id');
    if (!business_id) missing.push('business_id');
    if (total_price === undefined) missing.push('total_price');
    // For walk-ins without tourist_id, require guest_name
    if (!tourist_id && !guest_name) missing.push('guest_name (required for walk-in without tourist account)');

    if (missing.length) {
      throw ApiError.badRequest(`Missing required fields: ${missing.join(', ')}`);
    }

    // Check room availability
    const availCheckQuery = await sequelize.query('CALL CheckRoomAvailability(?, ?, ?)', {
      replacements: [room_id, check_in_date, check_out_date]
    });
    const availCheckResult = extractSingleResult(availCheckQuery);
    const availStatus = availCheckResult?.availability_status;
    if (availStatus && availStatus !== 'AVAILABLE') {
      throw ApiError.conflict(`Room is not available for the selected dates. Status: ${availStatus}`);
    }

    // Set booking status based on immediate_checkin flag
    const booking_status = immediate_checkin ? 'Checked-In' : 'Reserved';
    const booking_source = 'walk-in';

    const bodyWithDefaults = {
      pax,
      num_children,
      num_adults,
      num_infants,
      foreign_counts,
      domestic_counts,
      overseas_counts,
      local_counts,
      trip_purpose,
      booking_type,
      check_in_date,
      check_out_date,
      check_in_time,
      check_out_time,
      total_price,
      balance,
      booking_status,
      room_id,
      tourist_id,
      business_id,
      booking_source,
      guest_name,
      guest_phone,
      guest_email
    };

    const params = buildBookingParams(id, bodyWithDefaults);

    const queryResult = await sequelize.query(
      `CALL InsertBooking(${params.map(() => '?').join(', ')})`,
      { replacements: params }
    );
    const createdBooking = extractSingleResult(queryResult);

    // Update room status to Occupied if immediate check-in
    if (immediate_checkin && createdBooking) {
      await sequelize.query("UPDATE room SET status = 'Occupied' WHERE id = ?", {
        replacements: [room_id]
      });
    }

    logger.info(`Walk-in booking created: ${id} (immediate_checkin: ${immediate_checkin})`);

    res.created({
      ...createdBooking,
      message: immediate_checkin
        ? 'Walk-in guest checked in successfully'
        : 'Walk-in booking created successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Search for guests (tourists) by name, phone, or email
 * Used for walk-in bookings to find existing guest accounts
 */
export const searchGuests = async (req, res, next) => {
  try {
    const { query, business_id } = req.query;

    if (!query || query.length < 2) {
      throw ApiError.badRequest('Search query must be at least 2 characters');
    }

    const searchTerm = `%${query}%`;

    // Search in tourist and user tables
    const [rows] = await sequelize.query(`
      SELECT
        t.id as tourist_id,
        t.user_id,
        t.first_name,
        t.last_name,
        CONCAT(t.first_name, ' ', t.last_name) as full_name,
        u.email,
        u.phone_number,
        u.user_profile
      FROM tourist t
      JOIN user u ON t.user_id = u.id
      WHERE
        CONCAT(t.first_name, ' ', t.last_name) LIKE ?
        OR t.first_name LIKE ?
        OR t.last_name LIKE ?
        OR u.email LIKE ?
        OR u.phone_number LIKE ?
      ORDER BY t.first_name, t.last_name
      LIMIT 20
    `, {
      replacements: [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm]
    });

    // Optionally get booking history for each guest at this business
    if (business_id) {
      for (const guest of rows) {
        const [bookings] = await sequelize.query(`
          SELECT COUNT(*) as total_bookings, MAX(created_at) as last_booking
          FROM booking
          WHERE tourist_id = ? AND business_id = ?
        `, {
          replacements: [guest.tourist_id, business_id]
        });
        guest.booking_history = bookings[0];
      }
    }

    res.success(rows);
  } catch (error) {
    next(error);
  }
};

/**
 * Get today's arrivals (bookings with check-in date today)
 */
export const getTodaysArrivals = async (req, res, next) => {
  try {
    const { business_id } = req.params;

    if (!business_id) {
      throw ApiError.badRequest('business_id is required');
    }

    const today = new Date().toISOString().split('T')[0];

    const [rows] = await sequelize.query(`
      SELECT
        b.*,
        r.room_number,
        r.room_type,
        t.first_name as tourist_first_name,
        t.last_name as tourist_last_name,
        u.email as tourist_email,
        u.phone_number as tourist_phone
      FROM booking b
      LEFT JOIN room r ON b.room_id = r.id
      LEFT JOIN tourist t ON b.tourist_id = t.id
      LEFT JOIN user u ON t.user_id = u.id
      WHERE b.business_id = ?
        AND b.check_in_date = ?
        AND b.booking_status IN ('Pending', 'Reserved')
      ORDER BY b.check_in_time ASC
    `, {
      replacements: [business_id, today]
    });

    res.success({
      date: today,
      total: rows.length,
      arrivals: rows
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get today's departures (bookings with check-out date today)
 */
export const getTodaysDepartures = async (req, res, next) => {
  try {
    const { business_id } = req.params;

    if (!business_id) {
      throw ApiError.badRequest('business_id is required');
    }

    const today = new Date().toISOString().split('T')[0];

    const [rows] = await sequelize.query(`
      SELECT
        b.*,
        r.room_number,
        r.room_type,
        t.first_name as tourist_first_name,
        t.last_name as tourist_last_name,
        u.email as tourist_email,
        u.phone_number as tourist_phone
      FROM booking b
      LEFT JOIN room r ON b.room_id = r.id
      LEFT JOIN tourist t ON b.tourist_id = t.id
      LEFT JOIN user u ON t.user_id = u.id
      WHERE b.business_id = ?
        AND b.check_out_date = ?
        AND b.booking_status = 'Checked-In'
      ORDER BY b.check_out_time ASC
    `, {
      replacements: [business_id, today]
    });

    res.success({
      date: today,
      total: rows.length,
      departures: rows
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get currently occupied rooms for a business
 */
export const getCurrentlyOccupied = async (req, res, next) => {
  try {
    const { business_id } = req.params;

    if (!business_id) {
      throw ApiError.badRequest('business_id is required');
    }

    const [rows] = await sequelize.query(`
      SELECT
        b.*,
        r.room_number,
        r.room_type,
        r.floor,
        COALESCE(CONCAT(t.first_name, ' ', t.last_name), b.guest_name) as guest_name,
        COALESCE(u.phone_number, b.guest_phone) as guest_phone,
        DATEDIFF(b.check_out_date, CURDATE()) as nights_remaining
      FROM booking b
      LEFT JOIN room r ON b.room_id = r.id
      LEFT JOIN tourist t ON b.tourist_id = t.id
      LEFT JOIN user u ON t.user_id = u.id
      WHERE b.business_id = ?
        AND b.booking_status = 'Checked-In'
      ORDER BY r.room_number ASC
    `, {
      replacements: [business_id]
    });

    res.success({
      total: rows.length,
      occupied: rows
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getAllBookings,
  getBookingById,
  getBookingsByRoomId,
  getBookingsByTouristId,
  getBookingsByBusinessId,
  getAvailableRoomsByDateRange,
  insertBooking,
  updateBooking,
  updateBookingStatus,
  deleteBooking,
  getBookingsByStatus,
  createWalkInBooking,
  searchGuests,
  getTodaysArrivals,
  getTodaysDepartures,
  getCurrentlyOccupied
};
