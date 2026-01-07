import { sendPushNotification } from "../services/expoPushService.js";
import { handleDbError } from "../utils/errorHandler.js";

/**
 * Test push notification endpoint
 * POST /api/test/push-notification
 * Body: { userId, title, body, data }
 */
export async function testPushNotification(req, res) {
  try {
    const { userId, title, body, data = {}, notificationType } = req.body;

    if (!userId || !title || !body) {
      return res.status(400).json({
        success: false,
        message: "userId, title, and body are required"
      });
    }

    const result = await sendPushNotification(
      userId,
      title,
      body,
      data,
      notificationType
    );

    res.json({
      success: result.success,
      message: result.success ? "Push notification sent successfully" : "Failed to send push notification",
      data: result
    });
  } catch (error) {
    console.error("Test push notification error:", error);
    return handleDbError(error, res);
  }
}

/**
 * Test notification creation
 * POST /api/test/notification
 * Body: { userId, notificationType, title, message, metadata }
 */
export async function testNotification(req, res) {
  try {
    const { userId, notificationType, title, message, metadata = {} } = req.body;

    if (!userId || !notificationType || !title || !message) {
      return res.status(400).json({
        success: false,
        message: "userId, notificationType, title, and message are required"
      });
    }

    const { sendNotification } = await import("../services/notificationHelper.js");

    await sendNotification(userId, title, message, notificationType, metadata);

    res.json({
      success: true,
      message: "Notification created and push sent successfully"
    });
  } catch (error) {
    console.error("Test notification error:", error);
    return handleDbError(error, res);
  }
}
