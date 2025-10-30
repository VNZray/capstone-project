async function createNotificationProcedures(knex) {
  // ==================== NOTIFICATIONS ====================
  
  // Get all notifications for a user
  await knex.raw(`
    CREATE PROCEDURE GetNotificationsByUserId(IN p_userId CHAR(36))
    BEGIN
      SELECT * FROM notification
      WHERE user_id = p_userId
      ORDER BY created_at DESC;
    END;
  `);

  // Get unread notifications for a user
  await knex.raw(`
    CREATE PROCEDURE GetUnreadNotificationsByUserId(IN p_userId CHAR(36))
    BEGIN
      SELECT * FROM notification
      WHERE user_id = p_userId
        AND is_read = false
      ORDER BY created_at DESC;
    END;
  `);

  // Get notification by ID
  await knex.raw(`
    CREATE PROCEDURE GetNotificationById(IN p_notificationId CHAR(36))
    BEGIN
      SELECT * FROM notification WHERE id = p_notificationId;
    END;
  `);

  // Insert notification
  await knex.raw(`
    CREATE PROCEDURE InsertNotification(
      IN p_id CHAR(36),
      IN p_user_id CHAR(36),
      IN p_notification_type VARCHAR(50),
      IN p_related_id CHAR(36),
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

  // Mark notification as read
  await knex.raw(`
    CREATE PROCEDURE MarkNotificationAsRead(IN p_notificationId CHAR(36))
    BEGIN
      UPDATE notification 
      SET is_read = true,
          read_at = NOW()
      WHERE id = p_notificationId;
      
      SELECT * FROM notification WHERE id = p_notificationId;
    END;
  `);

  // Mark all notifications as read for a user
  await knex.raw(`
    CREATE PROCEDURE MarkAllNotificationsAsRead(IN p_userId CHAR(36))
    BEGIN
      UPDATE notification 
      SET is_read = true,
          read_at = NOW()
      WHERE user_id = p_userId
        AND is_read = false;
      
      SELECT ROW_COUNT() as updated_count;
    END;
  `);

  // Update notification delivery status
  await knex.raw(`
    CREATE PROCEDURE UpdateNotificationDeliveryStatus(
      IN p_notificationId CHAR(36),
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

  // Delete notification
  await knex.raw(`
    CREATE PROCEDURE DeleteNotification(IN p_notificationId CHAR(36))
    BEGIN
      DELETE FROM notification WHERE id = p_notificationId;
    END;
  `);

  // Get unread count for user
  await knex.raw(`
    CREATE PROCEDURE GetUnreadNotificationCount(IN p_userId CHAR(36))
    BEGIN
      SELECT COUNT(*) as unread_count 
      FROM notification
      WHERE user_id = p_userId
        AND is_read = false;
    END;
  `);
}

async function dropNotificationProcedures(knex) {
  const procedures = [
    "GetNotificationsByUserId",
    "GetUnreadNotificationsByUserId",
    "GetNotificationById",
    "InsertNotification",
    "MarkNotificationAsRead",
    "MarkAllNotificationsAsRead",
    "UpdateNotificationDeliveryStatus",
    "DeleteNotification",
    "GetUnreadNotificationCount"
  ];

  for (const procedure of procedures) {
    await knex.raw(`DROP PROCEDURE IF EXISTS ${procedure}`);
  }
}

export { createNotificationProcedures, dropNotificationProcedures };
