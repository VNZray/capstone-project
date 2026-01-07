import { Expo } from "expo-server-sdk";
import db from "../db.js";

// Create Expo SDK client
const expo = new Expo();

/**
 * Send push notification to user via Expo
 * @param {string} userId - User ID to send notification to
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Additional data to send with notification
 * @param {string} notificationType - Type of notification (booking_created, order_confirmed, etc.)
 * @returns {Promise<object>} Send results
 */
export async function sendPushNotification(userId, title, body, data = {}, notificationType = null) {
  try {
    console.log(`[Push Notification] Sending to user ${userId}: ${title}`);

    // Get active push tokens for this user and notification type
    const [result] = await db.query(
      notificationType
        ? "CALL GetPushTokensForNotification(?, ?)"
        : "CALL GetActivePushTokens(?)",
      notificationType ? [userId, notificationType] : [userId]
    );

    // Stored procedures return nested arrays - extract the actual token data
    const tokens = result[0] || [];

    console.log(`[Push Notification] Retrieved ${tokens.length} tokens for user ${userId}`);

    if (!tokens || tokens.length === 0) {
      console.log(`[Push Notification] No active tokens found for user ${userId}`);
      return { success: false, reason: "no_tokens" };
    }

    // Create messages for each token
    const messages = [];
    for (const tokenData of tokens) {
      const pushToken = tokenData.token;
      console.log(`[Push Notification] Processing token: ${pushToken ? pushToken.substring(0, 20) + '...' : 'undefined'}`);

      // Check if token is valid Expo push token
      if (!Expo.isExpoPushToken(pushToken)) {
        console.warn(`[Push Notification] Invalid push token: ${pushToken}`);
        // Deactivate invalid token
        await db.query("CALL DeactivatePushToken(?)", [pushToken]);
        continue;
      }

      messages.push({
        to: pushToken,
        sound: "default",
        title: title,
        body: body,
        data: {
          ...data,
          userId: userId,
          timestamp: new Date().toISOString()
        },
        priority: "high",
        channelId: "default"
      });
    }

    if (messages.length === 0) {
      console.log(`[Push Notification] No valid tokens for user ${userId}`);
      return { success: false, reason: "no_valid_tokens" };
    }

    // Send notifications in chunks
    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error("[Push Notification] Error sending chunk:", error);
      }
    }

    // Check for errors in tickets
    const errors = tickets.filter(ticket => ticket.status === "error");
    if (errors.length > 0) {
      console.warn(`[Push Notification] ${errors.length} notifications failed:`, errors);
    }

    console.log(`[Push Notification] ✅ Sent ${tickets.length - errors.length}/${tickets.length} notifications to user ${userId}`);

    return {
      success: true,
      sent: tickets.length - errors.length,
      failed: errors.length,
      tickets: tickets
    };
  } catch (error) {
    console.error("[Push Notification] Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Send push notifications to multiple users
 * @param {string[]} userIds - Array of user IDs
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Additional data
 * @param {string} notificationType - Type of notification
 * @returns {Promise<object>} Send results
 */
export async function sendBulkPushNotifications(userIds, title, body, data = {}, notificationType = null) {
  const results = [];

  for (const userId of userIds) {
    const result = await sendPushNotification(userId, title, body, data, notificationType);
    results.push({ userId, ...result });
  }

  const successful = results.filter(r => r.success).length;
  console.log(`[Bulk Push Notification] Sent to ${successful}/${userIds.length} users`);

  return {
    total: userIds.length,
    successful: successful,
    failed: userIds.length - successful,
    results: results
  };
}

/**
 * Handle receipt checking (optional - for delivery confirmation)
 * This can be run periodically to check if notifications were delivered
 * @param {string[]} receiptIds - Array of receipt IDs from tickets
 * @returns {Promise<object>} Receipt results
 */
export async function checkPushNotificationReceipts(receiptIds) {
  try {
    const receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
    const receipts = [];

    for (const chunk of receiptIdChunks) {
      try {
        const receiptChunk = await expo.getPushNotificationReceiptsAsync(chunk);
        receipts.push(receiptChunk);
      } catch (error) {
        console.error("[Receipt Check] Error:", error);
      }
    }

    return { success: true, receipts };
  } catch (error) {
    console.error("[Receipt Check] Error:", error);
    return { success: false, error: error.message };
  }
}

export default {
  sendPushNotification,
  sendBulkPushNotifications,
  checkPushNotificationReceipts
};
