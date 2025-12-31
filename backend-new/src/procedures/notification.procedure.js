/**
 * Notification Stored Procedures
 * Extracted from 20250922000001-notification-table.cjs
 */

/**
 * Create all notification-related stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function createNotificationProcedures(sequelize) {
  await sequelize.query(`
    CREATE PROCEDURE GetNotificationsByUserId(IN p_userId CHAR(64))
    BEGIN
      SELECT * FROM notification
      WHERE user_id = p_userId
      ORDER BY created_at DESC;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetUnreadNotificationsByUserId(IN p_userId CHAR(64))
    BEGIN
      SELECT * FROM notification
      WHERE user_id = p_userId
        AND is_read = false
      ORDER BY created_at DESC;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetNotificationById(IN p_notificationId CHAR(64))
    BEGIN
      SELECT * FROM notification WHERE id = p_notificationId;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE InsertNotification(
      IN p_id CHAR(64),
      IN p_user_id CHAR(64),
      IN p_notification_type VARCHAR(50),
      IN p_related_id CHAR(64),
      IN p_related_type VARCHAR(50),
      IN p_title VARCHAR(255),
      IN p_message TEXT,
      IN p_metadata JSON,
      IN p_delivery_method VARCHAR(50)
    )
    BEGIN
      INSERT INTO notification (
        id, user_id, notification_type, related_id, related_type,
        title, message, metadata, delivery_method
      ) VALUES (
        p_id, p_user_id, p_notification_type, p_related_id, p_related_type,
        p_title, p_message, p_metadata, IFNULL(p_delivery_method, 'in_app')
      );
      SELECT * FROM notification WHERE id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE MarkNotificationAsRead(IN p_notificationId CHAR(64))
    BEGIN
      UPDATE notification
      SET is_read = true,
          read_at = NOW()
      WHERE id = p_notificationId;
      SELECT * FROM notification WHERE id = p_notificationId;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE MarkAllNotificationsAsRead(IN p_userId CHAR(64))
    BEGIN
      UPDATE notification
      SET is_read = true,
          read_at = NOW()
      WHERE user_id = p_userId
        AND is_read = false;
      SELECT ROW_COUNT() as updated_count;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE UpdateNotificationDeliveryStatus(
      IN p_notificationId CHAR(64),
      IN p_delivery_status VARCHAR(50)
    )
    BEGIN
      UPDATE notification
      SET delivery_status = p_delivery_status,
          sent_at = IF(p_delivery_status IN ('sent', 'delivered'), NOW(), sent_at)
      WHERE id = p_notificationId;
      SELECT * FROM notification WHERE id = p_notificationId;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE DeleteNotification(IN p_notificationId CHAR(64))
    BEGIN
      DELETE FROM notification WHERE id = p_notificationId;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetUnreadNotificationCount(IN p_userId CHAR(64))
    BEGIN
      SELECT COUNT(*) as unread_count
      FROM notification
      WHERE user_id = p_userId
        AND is_read = false;
    END;
  `);
}

/**
 * Drop all notification-related stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function dropNotificationProcedures(sequelize) {
  await sequelize.query('DROP PROCEDURE IF EXISTS GetNotificationsByUserId;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetUnreadNotificationsByUserId;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetNotificationById;');
  await sequelize.query('DROP PROCEDURE IF EXISTS InsertNotification;');
  await sequelize.query('DROP PROCEDURE IF EXISTS MarkNotificationAsRead;');
  await sequelize.query('DROP PROCEDURE IF EXISTS MarkAllNotificationsAsRead;');
  await sequelize.query('DROP PROCEDURE IF EXISTS UpdateNotificationDeliveryStatus;');
  await sequelize.query('DROP PROCEDURE IF EXISTS DeleteNotification;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetUnreadNotificationCount;');
}
