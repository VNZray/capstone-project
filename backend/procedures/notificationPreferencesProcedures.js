/**
 * Notification Preferences Stored Procedures
 * Manages user notification preferences and push tokens
 */

async function createNotificationPreferencesProcedures(knex) {
  // ==================== NOTIFICATION PREFERENCES ====================

  // Get user notification preferences
  await knex.raw(`
    CREATE PROCEDURE GetNotificationPreferences(IN p_userId CHAR(36))
    BEGIN
      SELECT * FROM notification_preferences WHERE user_id = p_userId;
    END;
  `);

  // Create or update notification preferences
  await knex.raw(`
    CREATE PROCEDURE UpsertNotificationPreferences(
      IN p_userId CHAR(36),
      IN p_push_enabled BOOLEAN,
      IN p_push_bookings BOOLEAN,
      IN p_push_orders BOOLEAN,
      IN p_push_payments BOOLEAN,
      IN p_push_promotions BOOLEAN,
      IN p_email_enabled BOOLEAN,
      IN p_email_bookings BOOLEAN,
      IN p_email_orders BOOLEAN,
      IN p_email_payments BOOLEAN,
      IN p_sms_enabled BOOLEAN,
      IN p_sms_bookings BOOLEAN,
      IN p_sms_payments BOOLEAN
    )
    BEGIN
      INSERT INTO notification_preferences (
        id, user_id, push_enabled, push_bookings, push_orders, push_payments, push_promotions,
        email_enabled, email_bookings, email_orders, email_payments,
        sms_enabled, sms_bookings, sms_payments, created_at, updated_at
      ) VALUES (
        UUID(), p_userId,
        IFNULL(p_push_enabled, TRUE),
        IFNULL(p_push_bookings, TRUE),
        IFNULL(p_push_orders, TRUE),
        IFNULL(p_push_payments, TRUE),
        IFNULL(p_push_promotions, TRUE),
        IFNULL(p_email_enabled, FALSE),
        IFNULL(p_email_bookings, FALSE),
        IFNULL(p_email_orders, FALSE),
        IFNULL(p_email_payments, FALSE),
        IFNULL(p_sms_enabled, FALSE),
        IFNULL(p_sms_bookings, FALSE),
        IFNULL(p_sms_payments, FALSE),
        NOW(), NOW()
      )
      ON DUPLICATE KEY UPDATE
        push_enabled = IFNULL(p_push_enabled, push_enabled),
        push_bookings = IFNULL(p_push_bookings, push_bookings),
        push_orders = IFNULL(p_push_orders, push_orders),
        push_payments = IFNULL(p_push_payments, push_payments),
        push_promotions = IFNULL(p_push_promotions, push_promotions),
        email_enabled = IFNULL(p_email_enabled, email_enabled),
        email_bookings = IFNULL(p_email_bookings, email_bookings),
        email_orders = IFNULL(p_email_orders, email_orders),
        email_payments = IFNULL(p_email_payments, email_payments),
        sms_enabled = IFNULL(p_sms_enabled, sms_enabled),
        sms_bookings = IFNULL(p_sms_bookings, sms_bookings),
        sms_payments = IFNULL(p_sms_payments, sms_payments),
        updated_at = NOW();

      SELECT * FROM notification_preferences WHERE user_id = p_userId;
    END;
  `);

  // ==================== PUSH TOKENS ====================

  // Register or update push token
  await knex.raw(`
    CREATE PROCEDURE UpsertPushToken(
      IN p_userId CHAR(36),
      IN p_token VARCHAR(255),
      IN p_deviceId VARCHAR(255),
      IN p_platform VARCHAR(20)
    )
    BEGIN
      INSERT INTO push_tokens (
        id, user_id, token, device_id, platform, is_active, last_used_at, created_at
      ) VALUES (
        UUID(), p_userId, p_token, p_deviceId, p_platform, TRUE, NOW(), NOW()
      )
      ON DUPLICATE KEY UPDATE
        device_id = IFNULL(p_deviceId, device_id),
        platform = IFNULL(p_platform, platform),
        is_active = TRUE,
        last_used_at = NOW();

      SELECT * FROM push_tokens WHERE user_id = p_userId AND token = p_token;
    END;
  `);

  // Get active push tokens for user
  await knex.raw(`
    CREATE PROCEDURE GetActivePushTokens(IN p_userId CHAR(36))
    BEGIN
      SELECT * FROM push_tokens
      WHERE user_id = p_userId AND is_active = TRUE
      ORDER BY last_used_at DESC;
    END;
  `);

  // Deactivate push token
  await knex.raw(`
    CREATE PROCEDURE DeactivatePushToken(IN p_token VARCHAR(255))
    BEGIN
      UPDATE push_tokens
      SET is_active = FALSE
      WHERE token = p_token;
    END;
  `);

  // Delete push token
  await knex.raw(`
    CREATE PROCEDURE DeletePushToken(IN p_token VARCHAR(255))
    BEGIN
      DELETE FROM push_tokens WHERE token = p_token;
    END;
  `);

  // Get push tokens for notification type
  await knex.raw(`
    CREATE PROCEDURE GetPushTokensForNotification(
      IN p_userId CHAR(36),
      IN p_notificationType VARCHAR(50)
    )
    BEGIN
      DECLARE v_category VARCHAR(20);

      -- Determine category from notification type
      SET v_category = CASE
        WHEN p_notificationType LIKE 'booking_%' THEN 'bookings'
        WHEN p_notificationType LIKE 'order_%' THEN 'orders'
        WHEN p_notificationType LIKE 'payment_%' OR p_notificationType LIKE 'refund_%' THEN 'payments'
        ELSE 'orders'
      END;

      -- Get active tokens if user has enabled notifications for this category
      SELECT pt.*
      FROM push_tokens pt
      JOIN notification_preferences np ON np.user_id = pt.user_id
      WHERE pt.user_id = p_userId
        AND pt.is_active = TRUE
        AND np.push_enabled = TRUE
        AND (
          (v_category = 'bookings' AND np.push_bookings = TRUE) OR
          (v_category = 'orders' AND np.push_orders = TRUE) OR
          (v_category = 'payments' AND np.push_payments = TRUE)
        )
      ORDER BY pt.last_used_at DESC;
    END;
  `);
}

async function dropNotificationPreferencesProcedures(knex) {
  const procedures = [
    "GetNotificationPreferences",
    "UpsertNotificationPreferences",
    "UpsertPushToken",
    "GetActivePushTokens",
    "DeactivatePushToken",
    "DeletePushToken",
    "GetPushTokensForNotification"
  ];

  for (const procedure of procedures) {
    await knex.raw(`DROP PROCEDURE IF EXISTS ${procedure}`);
  }
}

export { createNotificationPreferencesProcedures, dropNotificationPreferencesProcedures };
