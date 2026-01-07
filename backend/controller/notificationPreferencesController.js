import db from "../db.js";
import { handleDbError } from "../utils/errorHandler.js";

// ==================== NOTIFICATION PREFERENCES ====================

/**
 * Get user notification preferences
 * GET /api/notification-preferences/:userId
 */
export async function getNotificationPreferences(req, res) {
  const { userId } = req.params;

  try {
    const [data] = await db.query("CALL GetNotificationPreferences(?)", [userId]);

    // If no preferences exist, return defaults
    if (!data || data.length === 0 || !data[0] || data[0].length === 0) {
      return res.json({
        user_id: userId,
        push_enabled: true,
        push_bookings: true,
        push_orders: true,
        push_payments: true,
        push_promotions: true,
        email_enabled: false,
        email_bookings: false,
        email_orders: false,
        email_payments: false,
        sms_enabled: false,
        sms_bookings: false,
        sms_payments: false
      });
    }

    // Convert MySQL boolean (0/1) to JavaScript boolean
    const prefs = data[0][0];
    const response = {
      ...prefs,
      push_enabled: Boolean(prefs.push_enabled),
      push_bookings: Boolean(prefs.push_bookings),
      push_orders: Boolean(prefs.push_orders),
      push_payments: Boolean(prefs.push_payments),
      push_promotions: Boolean(prefs.push_promotions),
      email_enabled: Boolean(prefs.email_enabled),
      email_bookings: Boolean(prefs.email_bookings),
      email_orders: Boolean(prefs.email_orders),
      email_payments: Boolean(prefs.email_payments),
      sms_enabled: Boolean(prefs.sms_enabled),
      sms_bookings: Boolean(prefs.sms_bookings),
      sms_payments: Boolean(prefs.sms_payments)
    };

    res.json(response);
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * Update user notification preferences
 * PUT /api/notification-preferences/:userId
 */
export async function updateNotificationPreferences(req, res) {
  const { userId } = req.params;
  const {
    push_enabled,
    push_bookings,
    push_orders,
    push_payments,
    push_promotions,
    email_enabled,
    email_bookings,
    email_orders,
    email_payments,
    sms_enabled,
    sms_bookings,
    sms_payments
  } = req.body;

  try {
    const [data] = await db.query(
      "CALL UpsertNotificationPreferences(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        userId,
        push_enabled,
        push_bookings,
        push_orders,
        push_payments,
        push_promotions,
        email_enabled,
        email_bookings,
        email_orders,
        email_payments,
        sms_enabled,
        sms_bookings,
        sms_payments
      ]
    );

    // Convert MySQL boolean (0/1) to JavaScript boolean
    const prefs = data[0][0];
    const response = {
      ...prefs,
      push_enabled: Boolean(prefs.push_enabled),
      push_bookings: Boolean(prefs.push_bookings),
      push_orders: Boolean(prefs.push_orders),
      push_payments: Boolean(prefs.push_payments),
      push_promotions: Boolean(prefs.push_promotions),
      email_enabled: Boolean(prefs.email_enabled),
      email_bookings: Boolean(prefs.email_bookings),
      email_orders: Boolean(prefs.email_orders),
      email_payments: Boolean(prefs.email_payments),
      sms_enabled: Boolean(prefs.sms_enabled),
      sms_bookings: Boolean(prefs.sms_bookings),
      sms_payments: Boolean(prefs.sms_payments)
    };

    res.json({
      message: "Notification preferences updated successfully",
      data: response
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// ==================== PUSH TOKENS ====================

/**
 * Register or update push token
 * POST /api/push-tokens
 */
export async function registerPushToken(req, res) {
  const { user_id, token, device_id, platform } = req.body;

  if (!user_id || !token) {
    return res.status(400).json({ message: "user_id and token are required" });
  }

  try {
    const [data] = await db.query(
      "CALL UpsertPushToken(?, ?, ?, ?)",
      [user_id, token, device_id, platform]
    );

    res.status(201).json({
      message: "Push token registered successfully",
      data: data[0]
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * Get active push tokens for user
 * GET /api/push-tokens/:userId
 */
export async function getActivePushTokens(req, res) {
  const { userId } = req.params;

  try {
    const [data] = await db.query("CALL GetActivePushTokens(?)", [userId]);
    res.json(data || []);
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * Deactivate push token
 * PUT /api/push-tokens/:token/deactivate
 */
export async function deactivatePushToken(req, res) {
  const { token } = req.params;

  try {
    await db.query("CALL DeactivatePushToken(?)", [token]);
    res.json({ message: "Push token deactivated successfully" });
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * Delete push token
 * DELETE /api/push-tokens/:token
 */
export async function deletePushToken(req, res) {
  const { token } = req.params;

  try {
    await db.query("CALL DeletePushToken(?)", [token]);
    res.json({ message: "Push token deleted successfully" });
  } catch (error) {
    return handleDbError(error, res);
  }
}
