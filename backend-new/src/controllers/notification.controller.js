/**
 * Notification Controller
 * Handles notification operations
 */
import { sequelize } from '../models/index.js';
import { ApiError } from '../utils/api-error.js';
import { extractProcedureResult, extractSingleResult } from '../utils/helpers.js';
import logger from '../config/logger.js';

/**
 * Create notification
 */
export const createNotification = async (req, res, next) => {
  try {
    const { user_id, title, body, type, data = null } = req.body;

    const id = crypto.randomUUID();
    await sequelize.query(
      'CALL InsertNotification(?, ?, ?, ?, ?, ?)',
      { replacements: [id, user_id, title, body, type, JSON.stringify(data)] }
    );

    const queryResult = await sequelize.query('CALL GetNotificationById(?)', {
      replacements: [id]
    });
    const result = extractSingleResult(queryResult);

    res.status(201).success(result, 'Notification created');
  } catch (error) {
    logger.error('Error creating notification:', error);
    next(error);
  }
};

/**
 * Get notifications for current user
 */
export const getMyNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, unreadOnly = 'false' } = req.query;

    let results;
    if (unreadOnly === 'true') {
      const queryResult = await sequelize.query('CALL GetUnreadNotificationsByUserId(?)', {
        replacements: [userId]
      });
      results = extractProcedureResult(queryResult);
    } else {
      const queryResult = await sequelize.query('CALL GetNotificationsByUserId(?)', {
        replacements: [userId]
      });
      results = extractProcedureResult(queryResult);
    }

    // Apply pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const paginatedResults = results.slice(offset, offset + parseInt(limit));

    res.success({
      data: paginatedResults,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: results.length
      }
    });
  } catch (error) {
    logger.error('Error fetching notifications:', error);
    next(error);
  }
};

/**
 * Get unread notification count
 */
export const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const queryResult = await sequelize.query('CALL GetUnreadNotificationCount(?)', {
      replacements: [userId]
    });
    const result = extractSingleResult(queryResult);

    const count = result?.count || result?.unread_count || 0;

    res.success({ count });
  } catch (error) {
    logger.error('Error fetching unread count:', error);
    next(error);
  }
};

/**
 * Mark notification as read
 */
export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    await sequelize.query('CALL MarkNotificationAsRead(?)', {
      replacements: [id]
    });

    res.success(null, 'Notification marked as read');
  } catch (error) {
    logger.error('Error marking notification as read:', error);
    next(error);
  }
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;

    await sequelize.query('CALL MarkAllNotificationsAsRead(?)', {
      replacements: [userId]
    });

    res.success(null, 'All notifications marked as read');
  } catch (error) {
    logger.error('Error marking all notifications as read:', error);
    next(error);
  }
};

/**
 * Delete notification
 */
export const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;

    await sequelize.query('CALL DeleteNotification(?)', {
      replacements: [id]
    });

    res.success(null, 'Notification deleted');
  } catch (error) {
    logger.error('Error deleting notification:', error);
    next(error);
  }
};

/**
 * Clear all notifications
 */
export const clearAllNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;

    await sequelize.query(
      'DELETE FROM notifications WHERE user_id = ?',
      { replacements: [userId] }
    );

    res.success(null, 'All notifications cleared');
  } catch (error) {
    logger.error('Error clearing notifications:', error);
    next(error);
  }
};

/**
 * Get notification preferences
 */
export const getPreferences = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const queryResult = await sequelize.query('CALL GetNotificationPreferencesByUserId(?)', {
      replacements: [userId]
    });
    const result = extractSingleResult(queryResult);

    if (!result) {
      // Return default preferences
      res.success({
        push_enabled: true,
        email_enabled: true,
        sms_enabled: false,
        booking_updates: true,
        promotional: true,
        order_updates: true,
        review_notifications: true
      });
      return;
    }

    res.success(result);
  } catch (error) {
    logger.error('Error fetching notification preferences:', error);
    next(error);
  }
};

/**
 * Update notification preferences
 */
export const updatePreferences = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const preferences = req.body;

    await sequelize.query(
      'CALL UpdateNotificationPreferences(?, ?, ?, ?, ?, ?, ?, ?)',
      {
        replacements: [
          userId,
          preferences.push_enabled ?? true,
          preferences.email_enabled ?? true,
          preferences.sms_enabled ?? false,
          preferences.booking_updates ?? true,
          preferences.promotional ?? true,
          preferences.order_updates ?? true,
          preferences.review_notifications ?? true
        ]
      }
    );

    const queryResult = await sequelize.query('CALL GetNotificationPreferencesByUserId(?)', {
      replacements: [userId]
    });
    const result = extractSingleResult(queryResult);

    res.success(result, 'Preferences updated');
  } catch (error) {
    logger.error('Error updating notification preferences:', error);
    next(error);
  }
};

/**
 * Send notification (internal use)
 */
export const sendNotification = async (userId, title, body, type, data = null) => {
  try {
    const id = crypto.randomUUID();
    await sequelize.query(
      'CALL InsertNotification(?, ?, ?, ?, ?, ?)',
      { replacements: [id, userId, title, body, type, JSON.stringify(data)] }
    );

    return id;
  } catch (error) {
    logger.error('Error sending notification:', error);
    throw error;
  }
};

/**
 * Send bulk notifications
 */
export const sendBulkNotifications = async (req, res, next) => {
  try {
    const { userIds, title, body, type, data = null } = req.body;

    const notificationIds = [];
    for (const userId of userIds) {
      const id = crypto.randomUUID();
      await sequelize.query(
        'CALL InsertNotification(?, ?, ?, ?, ?, ?)',
        { replacements: [id, userId, title, body, type, JSON.stringify(data)] }
      );
      notificationIds.push(id);
    }

    res.success({ sent: notificationIds.length }, `${notificationIds.length} notifications sent`);
  } catch (error) {
    logger.error('Error sending bulk notifications:', error);
    next(error);
  }
};

export default {
  createNotification,
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  getPreferences,
  updatePreferences,
  sendNotification,
  sendBulkNotifications
};
