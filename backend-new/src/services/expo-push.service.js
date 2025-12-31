/**
 * Expo Push Notification Service
 * Handles push notifications via Expo
 */
import { Expo } from 'expo-server-sdk';
import { sequelize } from '../models/index.js';
import logger from '../config/logger.js';

// Create Expo SDK client
const expo = new Expo();

/**
 * Send push notification to a user
 * @param {string} userId - User ID
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {Object} data - Additional data
 * @param {string} notificationType - Type of notification
 * @returns {Promise<Object>} Send results
 */
export async function sendPushNotification(userId, title, body, data = {}, notificationType = null) {
  try {
    logger.debug(`Sending push notification to user ${userId}: ${title}`);

    // Get active push tokens for this user
    const [tokens] = await sequelize.query(
      `SELECT token FROM push_tokens
       WHERE user_id = ? AND is_active = 1`,
      { replacements: [userId], type: sequelize.QueryTypes.SELECT }
    );

    if (!tokens || tokens.length === 0) {
      logger.debug(`No active tokens found for user ${userId}`);
      return { success: false, reason: 'no_tokens' };
    }

    // Create messages for each token
    const messages = [];
    for (const tokenData of tokens) {
      const pushToken = tokenData.token;

      if (!Expo.isExpoPushToken(pushToken)) {
        logger.warn(`Invalid push token: ${pushToken}`);
        // Deactivate invalid token
        await sequelize.query(
          `UPDATE push_tokens SET is_active = 0 WHERE token = ?`,
          { replacements: [pushToken] }
        );
        continue;
      }

      messages.push({
        to: pushToken,
        sound: 'default',
        title,
        body,
        data: {
          ...data,
          userId,
          timestamp: new Date().toISOString(),
        },
        priority: 'high',
        channelId: 'default',
      });
    }

    if (messages.length === 0) {
      return { success: false, reason: 'no_valid_tokens' };
    }

    // Send notifications in chunks
    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        logger.error('Error sending push notification chunk:', error);
      }
    }

    // Check for errors
    const errors = tickets.filter(ticket => ticket.status === 'error');
    if (errors.length > 0) {
      logger.warn(`${errors.length} notifications failed:`, errors);
    }

    logger.debug(`Sent ${tickets.length - errors.length}/${tickets.length} notifications`);

    return {
      success: true,
      sent: tickets.length - errors.length,
      failed: errors.length,
      tickets,
    };
  } catch (error) {
    logger.error('Push notification error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send push notifications to multiple users
 * @param {string[]} userIds - Array of user IDs
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {Object} data - Additional data
 * @param {string} notificationType - Type of notification
 * @returns {Promise<Object>} Send results
 */
export async function sendBulkPushNotifications(userIds, title, body, data = {}, notificationType = null) {
  const results = [];

  for (const userId of userIds) {
    const result = await sendPushNotification(userId, title, body, data, notificationType);
    results.push({ userId, ...result });
  }

  const successful = results.filter(r => r.success).length;
  logger.debug(`Bulk push: sent to ${successful}/${userIds.length} users`);

  return {
    total: userIds.length,
    successful,
    failed: userIds.length - successful,
    results,
  };
}

/**
 * Register a push token for a user
 * @param {string} userId - User ID
 * @param {string} token - Expo push token
 * @param {string} deviceId - Device identifier
 * @param {string} platform - Platform (ios, android)
 * @returns {Promise<Object>} Registration result
 */
export async function registerPushToken(userId, token, deviceId, platform) {
  try {
    if (!Expo.isExpoPushToken(token)) {
      return { success: false, reason: 'invalid_token' };
    }

    // Upsert the token
    await sequelize.query(
      `INSERT INTO push_tokens (id, user_id, token, device_id, platform, is_active, created_at, updated_at)
       VALUES (UUID(), ?, ?, ?, ?, 1, NOW(), NOW())
       ON DUPLICATE KEY UPDATE user_id = ?, is_active = 1, updated_at = NOW()`,
      { replacements: [userId, token, deviceId, platform, userId] }
    );

    logger.debug(`Registered push token for user ${userId}`);
    return { success: true };
  } catch (error) {
    logger.error('Error registering push token:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Deactivate push token
 * @param {string} token - Push token
 */
export async function deactivatePushToken(token) {
  await sequelize.query(
    `UPDATE push_tokens SET is_active = 0 WHERE token = ?`,
    { replacements: [token] }
  );
}

export default {
  sendPushNotification,
  sendBulkPushNotifications,
  registerPushToken,
  deactivatePushToken,
};
