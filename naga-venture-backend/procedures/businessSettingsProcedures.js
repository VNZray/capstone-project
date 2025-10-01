async function createBusinessSettingsProcedures(knex) {
  // ==================== BUSINESS SETTINGS ====================
  
  // Get business settings by business ID
  await knex.raw(`
    CREATE PROCEDURE GetBusinessSettings(IN p_businessId CHAR(36))
    BEGIN
      SELECT * FROM business_settings WHERE business_id = p_businessId;
    END;
  `);

  // Insert or update business settings (upsert)
  await knex.raw(`
    CREATE PROCEDURE UpsertBusinessSettings(
      IN p_business_id CHAR(36),
      IN p_minimum_preparation_time_minutes INT,
      IN p_order_advance_notice_hours INT,
      IN p_accepts_product_orders BOOLEAN,
      IN p_accepts_service_bookings BOOLEAN,
      IN p_cancellation_deadline_hours INT,
      IN p_cancellation_penalty_percentage DECIMAL(5,2),
      IN p_cancellation_penalty_fixed DECIMAL(10,2),
      IN p_allow_customer_cancellation BOOLEAN,
      IN p_service_booking_advance_notice_hours INT,
      IN p_service_default_duration_minutes INT,
      IN p_auto_confirm_orders BOOLEAN,
      IN p_auto_confirm_bookings BOOLEAN,
      IN p_send_notifications BOOLEAN
    )
    BEGIN
      INSERT INTO business_settings (
        id, business_id, minimum_preparation_time_minutes, order_advance_notice_hours,
        accepts_product_orders, accepts_service_bookings, cancellation_deadline_hours,
        cancellation_penalty_percentage, cancellation_penalty_fixed, allow_customer_cancellation,
        service_booking_advance_notice_hours, service_default_duration_minutes,
        auto_confirm_orders, auto_confirm_bookings, send_notifications
      ) VALUES (
        UUID(), p_business_id, p_minimum_preparation_time_minutes, p_order_advance_notice_hours,
        p_accepts_product_orders, p_accepts_service_bookings, p_cancellation_deadline_hours,
        p_cancellation_penalty_percentage, p_cancellation_penalty_fixed, p_allow_customer_cancellation,
        p_service_booking_advance_notice_hours, p_service_default_duration_minutes,
        p_auto_confirm_orders, p_auto_confirm_bookings, p_send_notifications
      )
      ON DUPLICATE KEY UPDATE
        minimum_preparation_time_minutes = IFNULL(p_minimum_preparation_time_minutes, minimum_preparation_time_minutes),
        order_advance_notice_hours = IFNULL(p_order_advance_notice_hours, order_advance_notice_hours),
        accepts_product_orders = IFNULL(p_accepts_product_orders, accepts_product_orders),
        accepts_service_bookings = IFNULL(p_accepts_service_bookings, accepts_service_bookings),
        cancellation_deadline_hours = p_cancellation_deadline_hours,
        cancellation_penalty_percentage = IFNULL(p_cancellation_penalty_percentage, cancellation_penalty_percentage),
        cancellation_penalty_fixed = IFNULL(p_cancellation_penalty_fixed, cancellation_penalty_fixed),
        allow_customer_cancellation = IFNULL(p_allow_customer_cancellation, allow_customer_cancellation),
        service_booking_advance_notice_hours = IFNULL(p_service_booking_advance_notice_hours, service_booking_advance_notice_hours),
        service_default_duration_minutes = IFNULL(p_service_default_duration_minutes, service_default_duration_minutes),
        auto_confirm_orders = IFNULL(p_auto_confirm_orders, auto_confirm_orders),
        auto_confirm_bookings = IFNULL(p_auto_confirm_bookings, auto_confirm_bookings),
        send_notifications = IFNULL(p_send_notifications, send_notifications),
        updated_at = NOW();
      
      SELECT * FROM business_settings WHERE business_id = p_business_id;
    END;
  `);

  // Update specific setting fields
  await knex.raw(`
    CREATE PROCEDURE UpdateBusinessSettings(
      IN p_business_id CHAR(36),
      IN p_field VARCHAR(100),
      IN p_value VARCHAR(255)
    )
    BEGIN
      SET @sql = CONCAT('UPDATE business_settings SET ', p_field, ' = ?, updated_at = NOW() WHERE business_id = ?');
      PREPARE stmt FROM @sql;
      SET @val = p_value;
      SET @bid = p_business_id;
      EXECUTE stmt USING @val, @bid;
      DEALLOCATE PREPARE stmt;
      
      SELECT * FROM business_settings WHERE business_id = p_business_id;
    END;
  `);
}

async function dropBusinessSettingsProcedures(knex) {
  const procedures = [
    "GetBusinessSettings",
    "UpsertBusinessSettings",
    "UpdateBusinessSettings"
  ];

  for (const procedure of procedures) {
    await knex.raw(`DROP PROCEDURE IF EXISTS ${procedure}`);
  }
}

export { createBusinessSettingsProcedures, dropBusinessSettingsProcedures };
