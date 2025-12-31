/**
 * Notification Preferences Controller
 * Handles user notification preferences and push token management
 */
import { NotificationPreferences, User, sequelize } from '../models/index.js';
import { ApiError } from '../utils/api-error.js';
import logger from '../config/logger.js';

/**
 * Get notification preferences for current user
 */
export const getMyNotificationPreferences = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const preferences = await NotificationPreferences.findOne({
      where: { user_id: userId }
    });

    if (!preferences) {
      // Return default preferences
      return res.success({
        user_id: userId,
        email_notifications: true,
        push_notifications: true,
        sms_notifications: false,
        booking_updates: true,
        order_updates: true,
        promotional: true,
        system_updates: true
      });
    }

    res.success(preferences);
  } catch (error) {
    next(error);
  }
};

/**
 * Get notification preferences by user ID (admin)
 */
export const getNotificationPreferencesByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const preferences = await NotificationPreferences.findOne({
      where: { user_id: userId }
    });

    if (!preferences) {
      throw ApiError.notFound('Notification preferences not found');
    }

    res.success(preferences);
  } catch (error) {
    next(error);
  }
};

/**
 * Update notification preferences
 */
export const updateNotificationPreferences = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      email_notifications,
      push_notifications,
      sms_notifications,
      booking_updates,
      order_updates,
      promotional,
      system_updates
    } = req.body;

    const [preferences, created] = await NotificationPreferences.findOrCreate({
      where: { user_id: userId },
      defaults: {
        user_id: userId,
        email_notifications: email_notifications ?? true,
        push_notifications: push_notifications ?? true,
        sms_notifications: sms_notifications ?? false,
        booking_updates: booking_updates ?? true,
        order_updates: order_updates ?? true,
        promotional: promotional ?? true,
        system_updates: system_updates ?? true
      }
    });

    if (!created) {
      await preferences.update({
        email_notifications: email_notifications ?? preferences.email_notifications,
        push_notifications: push_notifications ?? preferences.push_notifications,
        sms_notifications: sms_notifications ?? preferences.sms_notifications,
        booking_updates: booking_updates ?? preferences.booking_updates,
        order_updates: order_updates ?? preferences.order_updates,
        promotional: promotional ?? preferences.promotional,
        system_updates: system_updates ?? preferences.system_updates
      });
    }

    res.success(preferences, 'Notification preferences updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Register push token
 */
export const registerPushToken = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { push_token, device_type, device_id } = req.body;

    if (!push_token) {
      throw ApiError.badRequest('push_token is required');
    }

    const [preferences, created] = await NotificationPreferences.findOrCreate({
      where: { user_id: userId },
      defaults: {
        user_id: userId,
        push_token,
        device_type,
        device_id,
        push_notifications: true
      }
    });

    if (!created) {
      await preferences.update({
        push_token,
        device_type: device_type ?? preferences.device_type,
        device_id: device_id ?? preferences.device_id
      });
    }

    res.success(preferences, 'Push token registered successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Unregister push token
 */
export const unregisterPushToken = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const preferences = await NotificationPreferences.findOne({
      where: { user_id: userId }
    });

    if (preferences) {
      await preferences.update({
        push_token: null,
        device_type: null,
        device_id: null
      });
    }

    res.success(null, 'Push token unregistered successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get push token by user ID (for sending notifications)
 */
export const getPushTokenByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const preferences = await NotificationPreferences.findOne({
      where: { user_id: userId },
      attributes: ['push_token', 'push_notifications']
    });

    if (!preferences || !preferences.push_token) {
      throw ApiError.notFound('Push token not found for user');
    }

    if (!preferences.push_notifications) {
      throw ApiError.badRequest('User has disabled push notifications');
    }

    res.success({ push_token: preferences.push_token });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete notification preferences
 */
export const deleteNotificationPreferences = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const deleted = await NotificationPreferences.destroy({
      where: { user_id: userId }
    });

    if (deleted === 0) {
      throw ApiError.notFound('Notification preferences not found');
    }

    res.success(null, 'Notification preferences deleted successfully');
  } catch (error) {
    next(error);
  }
};
