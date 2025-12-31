/**
 * Business Settings Controller
 * Handles business settings, policies, and hours operations
 */
import { sequelize } from '../models/index.js';
import { ApiError } from '../utils/api-error.js';
import { extractProcedureResult, extractSingleResult } from '../utils/helpers.js';
import logger from '../config/logger.js';

/**
 * Get business settings
 */
export const getSettings = async (req, res, next) => {
  try {
    const { businessId } = req.params;

    const queryResult = await sequelize.query('CALL GetBusinessSettingsByBusinessId(?)', {
      replacements: [businessId]
    });
    const result = extractSingleResult(queryResult);

    if (!result) {
      throw ApiError.notFound('Business settings not found');
    }

    res.success(result);
  } catch (error) {
    logger.error('Error fetching business settings:', error);
    next(error);
  }
};

/**
 * Update business settings
 */
export const updateSettings = async (req, res, next) => {
  try {
    const { businessId } = req.params;
    const {
      booking_lead_time_hours,
      max_advance_booking_days,
      auto_confirm_bookings,
      require_deposit,
      deposit_percentage,
      cancellation_policy,
      cancellation_deadline_hours,
      check_in_time,
      check_out_time,
      allow_hourly_booking,
      min_hours,
      max_guests_per_room,
      notification_email,
      sms_notifications,
      email_notifications
    } = req.body;

    const queryResult = await sequelize.query(
      'CALL UpdateBusinessSettings(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      {
        replacements: [
          businessId,
          booking_lead_time_hours || null,
          max_advance_booking_days || null,
          auto_confirm_bookings ?? null,
          require_deposit ?? null,
          deposit_percentage || null,
          cancellation_policy || null,
          cancellation_deadline_hours || null,
          check_in_time || null,
          check_out_time || null,
          allow_hourly_booking ?? null,
          min_hours || null,
          max_guests_per_room || null,
          notification_email || null,
          sms_notifications ?? null,
          email_notifications ?? null
        ]
      }
    );
    const result = extractSingleResult(queryResult);

    res.success(result, 'Settings updated successfully');
  } catch (error) {
    logger.error('Error updating business settings:', error);
    next(error);
  }
};

/**
 * Get business policies
 */
export const getPolicies = async (req, res, next) => {
  try {
    const { businessId } = req.params;

    const queryResult = await sequelize.query('CALL GetBusinessPoliciesByBusinessId(?)', {
      replacements: [businessId]
    });
    const results = extractProcedureResult(queryResult);

    res.success(results || []);
  } catch (error) {
    logger.error('Error fetching business policies:', error);
    next(error);
  }
};

/**
 * Create business policy
 */
export const createPolicy = async (req, res, next) => {
  try {
    const { businessId } = req.params;
    const { policy_type, title, content } = req.body;

    const queryResult = await sequelize.query(
      'CALL InsertBusinessPolicy(?, ?, ?, ?)',
      {
        replacements: [businessId, policy_type, title, content]
      }
    );
    const result = extractSingleResult(queryResult);

    res.status(201).success(result, 'Policy created successfully');
  } catch (error) {
    logger.error('Error creating business policy:', error);
    next(error);
  }
};

/**
 * Update business policy
 */
export const updatePolicy = async (req, res, next) => {
  try {
    const { policyId } = req.params;
    const { title, content } = req.body;

    const queryResult = await sequelize.query(
      'CALL UpdateBusinessPolicy(?, ?, ?)',
      {
        replacements: [policyId, title, content]
      }
    );
    const result = extractSingleResult(queryResult);

    if (!result) {
      throw ApiError.notFound('Policy not found');
    }

    res.success(result, 'Policy updated successfully');
  } catch (error) {
    logger.error('Error updating business policy:', error);
    next(error);
  }
};

/**
 * Delete business policy
 */
export const deletePolicy = async (req, res, next) => {
  try {
    const { policyId } = req.params;

    await sequelize.query('CALL DeleteBusinessPolicy(?)', {
      replacements: [policyId]
    });

    res.success(null, 'Policy deleted successfully');
  } catch (error) {
    logger.error('Error deleting business policy:', error);
    next(error);
  }
};

/**
 * Get business hours
 */
export const getHours = async (req, res, next) => {
  try {
    const { businessId } = req.params;

    // Query business hours directly (no stored procedure for this table)
    const [results] = await sequelize.query(
      'SELECT * FROM business_hours WHERE business_id = ? ORDER BY FIELD(day_of_week, "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday")',
      {
        replacements: [businessId]
      }
    );

    res.success(results || []);
  } catch (error) {
    logger.error('Error fetching business hours:', error);
    next(error);
  }
};

/**
 * Update business hours
 */
export const updateHours = async (req, res, next) => {
  try {
    const { businessId } = req.params;
    const { hours } = req.body;

    // Use transaction for bulk update
    await sequelize.transaction(async (t) => {
      for (const hour of hours) {
        const { day_of_week, open_time, close_time, is_open } = hour;

        // Upsert each day's hours
        await sequelize.query(
          `INSERT INTO business_hours (business_id, day_of_week, open_time, close_time, is_open)
           VALUES (?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE open_time = VALUES(open_time), close_time = VALUES(close_time), is_open = VALUES(is_open)`,
          {
            replacements: [businessId, day_of_week, open_time, close_time, is_open ?? true],
            transaction: t
          }
        );
      }
    });

    // Fetch updated hours
    const [updatedHours] = await sequelize.query(
      'SELECT * FROM business_hours WHERE business_id = ? ORDER BY FIELD(day_of_week, "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday")',
      {
        replacements: [businessId]
      }
    );

    res.success(updatedHours, 'Business hours updated successfully');
  } catch (error) {
    logger.error('Error updating business hours:', error);
    next(error);
  }
};

/**
 * Update single day hours
 */
export const updateDayHours = async (req, res, next) => {
  try {
    const { businessId, day } = req.params;
    const { open_time, close_time, is_open } = req.body;

    await sequelize.query(
      `INSERT INTO business_hours (business_id, day_of_week, open_time, close_time, is_open)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE open_time = VALUES(open_time), close_time = VALUES(close_time), is_open = VALUES(is_open)`,
      {
        replacements: [businessId, day, open_time, close_time, is_open ?? true]
      }
    );

    // Fetch updated day
    const [result] = await sequelize.query(
      'SELECT * FROM business_hours WHERE business_id = ? AND day_of_week = ?',
      {
        replacements: [businessId, day]
      }
    );

    res.success(result[0], `${day} hours updated`);
  } catch (error) {
    logger.error('Error updating day hours:', error);
    next(error);
  }
};

/**
 * Get full business configuration (settings + policies + hours)
 */
export const getFullConfiguration = async (req, res, next) => {
  try {
    const { businessId } = req.params;

    // Fetch settings
    const settingsQuery = await sequelize.query('CALL GetBusinessSettingsByBusinessId(?)', {
      replacements: [businessId]
    });
    const settings = extractSingleResult(settingsQuery);

    // Fetch policies
    const policiesQuery = await sequelize.query('CALL GetBusinessPoliciesByBusinessId(?)', {
      replacements: [businessId]
    });
    const policies = extractProcedureResult(policiesQuery);

    // Fetch hours
    const [hoursResults] = await sequelize.query(
      'SELECT * FROM business_hours WHERE business_id = ? ORDER BY FIELD(day_of_week, "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday")',
      {
        replacements: [businessId]
      }
    );

    res.success({
      settings: settings || null,
      policies: policies || [],
      hours: hoursResults || []
    });
  } catch (error) {
    logger.error('Error fetching full configuration:', error);
    next(error);
  }
};

/**
 * Initialize default configuration for a business
 */
export const initializeConfiguration = async (req, res, next) => {
  try {
    const { businessId } = req.params;

    // Check if settings already exist
    const existingQuery = await sequelize.query('CALL GetBusinessSettingsByBusinessId(?)', {
      replacements: [businessId]
    });
    const existingSettings = extractSingleResult(existingQuery);

    if (existingSettings) {
      throw ApiError.conflict('Business configuration already exists');
    }

    // Create default settings
    const settingsQuery = await sequelize.query(
      'CALL InsertBusinessSettings(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      {
        replacements: [
          businessId,
          24,     // booking_lead_time_hours
          90,     // max_advance_booking_days
          false,  // auto_confirm_bookings
          false,  // require_deposit
          0,      // deposit_percentage
          'moderate', // cancellation_policy
          48,     // cancellation_deadline_hours
          '14:00:00', // check_in_time
          '12:00:00', // check_out_time
          false,  // allow_hourly_booking
          3       // min_hours
        ]
      }
    );
    const settingsResult = extractSingleResult(settingsQuery);

    // Create default hours for all days
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    for (const day of days) {
      await sequelize.query(
        'INSERT INTO business_hours (business_id, day_of_week, open_time, close_time, is_open) VALUES (?, ?, ?, ?, ?)',
        {
          replacements: [businessId, day, '09:00:00', '18:00:00', true]
        }
      );
    }

    res.status(201).success(settingsResult, 'Business configuration initialized');
  } catch (error) {
    logger.error('Error initializing configuration:', error);
    next(error);
  }
};

/**
 * Check if business is currently open
 */
export const checkIfOpen = async (req, res, next) => {
  try {
    const { businessId } = req.params;

    // Get current day and time in PHP timezone
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = days[now.getDay()];
    const currentTime = now.toTimeString().slice(0, 8);

    // Fetch today's hours
    const [results] = await sequelize.query(
      'SELECT * FROM business_hours WHERE business_id = ? AND day_of_week = ?',
      {
        replacements: [businessId, currentDay]
      }
    );

    if (!results || results.length === 0) {
      res.success({ is_open: false, message: 'No hours configured for today' });
      return;
    }

    const todayHours = results[0];

    if (!todayHours.is_open) {
      res.success({ is_open: false, message: 'Closed today' });
      return;
    }

    const isOpen = currentTime >= todayHours.open_time && currentTime <= todayHours.close_time;

    res.success({
      is_open: isOpen,
      current_day: currentDay,
      open_time: todayHours.open_time,
      close_time: todayHours.close_time,
      message: isOpen ? 'Currently open' : 'Currently closed'
    });
  } catch (error) {
    logger.error('Error checking if business is open:', error);
    next(error);
  }
};

export default {
  getSettings,
  updateSettings,
  getPolicies,
  createPolicy,
  updatePolicy,
  deletePolicy,
  getHours,
  updateHours,
  updateDayHours,
  getFullConfiguration,
  initializeConfiguration,
  checkIfOpen
};
