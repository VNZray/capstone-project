/**
 * Notification Preferences Stored Procedures
 * Extracted from 20251005000001-notification-preferences-table.cjs
 */

/**
 * Create all notification preferences-related stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function createNotificationPreferencesProcedures(sequelize) {
  await sequelize.query(`
    CREATE PROCEDURE InsertNotificationPreferences(IN p_user_id CHAR(64))
    BEGIN
      DECLARE new_id CHAR(64);
      SET new_id = UUID();
      INSERT INTO notification_preferences (id, user_id)
      VALUES (new_id, p_user_id);
      SELECT * FROM notification_preferences WHERE id = new_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetNotificationPreferencesByUserId(IN p_user_id CHAR(64))
    BEGIN
      SELECT * FROM notification_preferences WHERE user_id = p_user_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE UpdateNotificationPreferences(
      IN p_user_id CHAR(64),
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
      UPDATE notification_preferences SET
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
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = p_user_id;
      SELECT * FROM notification_preferences WHERE user_id = p_user_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetOrCreateNotificationPreferences(IN p_user_id CHAR(64))
    BEGIN
      DECLARE existing_id CHAR(64);
      DECLARE new_id CHAR(64);

      SELECT id INTO existing_id FROM notification_preferences WHERE user_id = p_user_id;

      IF existing_id IS NULL THEN
        SET new_id = UUID();
        INSERT INTO notification_preferences (id, user_id)
        VALUES (new_id, p_user_id);
        SELECT * FROM notification_preferences WHERE id = new_id;
      ELSE
        SELECT * FROM notification_preferences WHERE id = existing_id;
      END IF;
    END;
  `);

  // Push token procedures
  await sequelize.query(`
    CREATE PROCEDURE InsertPushToken(
      IN p_user_id CHAR(64),
      IN p_token VARCHAR(255),
      IN p_device_id VARCHAR(255),
      IN p_platform ENUM('ios', 'android', 'web')
    )
    BEGIN
      DECLARE new_id CHAR(64);
      SET new_id = UUID();
      INSERT INTO push_tokens (id, user_id, token, device_id, platform)
      VALUES (new_id, p_user_id, p_token, p_device_id, p_platform)
      ON DUPLICATE KEY UPDATE
        is_active = TRUE,
        last_used_at = CURRENT_TIMESTAMP,
        device_id = IFNULL(p_device_id, device_id),
        platform = IFNULL(p_platform, platform);
      SELECT * FROM push_tokens WHERE user_id = p_user_id AND token = p_token;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetPushTokensByUserId(IN p_user_id CHAR(64))
    BEGIN
      SELECT * FROM push_tokens WHERE user_id = p_user_id AND is_active = TRUE;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE DeactivatePushToken(IN p_user_id CHAR(64), IN p_token VARCHAR(255))
    BEGIN
      UPDATE push_tokens SET is_active = FALSE WHERE user_id = p_user_id AND token = p_token;
    END;
  `);
}

/**
 * Drop all notification preferences-related stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function dropNotificationPreferencesProcedures(sequelize) {
  await sequelize.query('DROP PROCEDURE IF EXISTS InsertNotificationPreferences;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetNotificationPreferencesByUserId;');
  await sequelize.query('DROP PROCEDURE IF EXISTS UpdateNotificationPreferences;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetOrCreateNotificationPreferences;');
  await sequelize.query('DROP PROCEDURE IF EXISTS InsertPushToken;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetPushTokensByUserId;');
  await sequelize.query('DROP PROCEDURE IF EXISTS DeactivatePushToken;');
}
