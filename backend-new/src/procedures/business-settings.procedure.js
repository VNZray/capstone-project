/**
 * Business Settings Stored Procedures
 * Extracted from 20250923000001-business-settings-table.cjs
 */

/**
 * Create all business settings-related stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function createBusinessSettingsProcedures(sequelize) {
  await sequelize.query(`
    CREATE PROCEDURE GetBusinessSettings(IN p_businessId CHAR(64))
    BEGIN
      SELECT * FROM business_settings WHERE business_id = p_businessId;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE UpsertBusinessSettings(
      IN p_business_id CHAR(64),
      IN p_minimum_preparation_time_minutes INT,
      IN p_order_advance_notice_hours INT,
      IN p_accepts_product_orders BOOLEAN,
      IN p_cancellation_deadline_hours INT,
      IN p_cancellation_penalty_percentage DECIMAL(5,2),
      IN p_cancellation_penalty_fixed DECIMAL(10,2),
      IN p_allow_customer_cancellation BOOLEAN,
      IN p_auto_confirm_orders BOOLEAN,
      IN p_send_notifications BOOLEAN
    )
    BEGIN
      INSERT INTO business_settings (
        id, business_id, minimum_preparation_time_minutes, order_advance_notice_hours,
        accepts_product_orders, cancellation_deadline_hours,
        cancellation_penalty_percentage, cancellation_penalty_fixed, allow_customer_cancellation,
        auto_confirm_orders, send_notifications
      ) VALUES (
        UUID(), p_business_id, p_minimum_preparation_time_minutes, p_order_advance_notice_hours,
        p_accepts_product_orders, p_cancellation_deadline_hours,
        p_cancellation_penalty_percentage, p_cancellation_penalty_fixed, p_allow_customer_cancellation,
        p_auto_confirm_orders, p_send_notifications
      )
      ON DUPLICATE KEY UPDATE
        minimum_preparation_time_minutes = IFNULL(p_minimum_preparation_time_minutes, minimum_preparation_time_minutes),
        order_advance_notice_hours = IFNULL(p_order_advance_notice_hours, order_advance_notice_hours),
        accepts_product_orders = IFNULL(p_accepts_product_orders, accepts_product_orders),
        cancellation_deadline_hours = p_cancellation_deadline_hours,
        cancellation_penalty_percentage = IFNULL(p_cancellation_penalty_percentage, cancellation_penalty_percentage),
        cancellation_penalty_fixed = IFNULL(p_cancellation_penalty_fixed, cancellation_penalty_fixed),
        allow_customer_cancellation = IFNULL(p_allow_customer_cancellation, allow_customer_cancellation),
        auto_confirm_orders = IFNULL(p_auto_confirm_orders, auto_confirm_orders),
        send_notifications = IFNULL(p_send_notifications, send_notifications),
        updated_at = NOW();

      SELECT * FROM business_settings WHERE business_id = p_business_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE UpdateBusinessSettings(
      IN p_business_id CHAR(64),
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

/**
 * Drop all business settings-related stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function dropBusinessSettingsProcedures(sequelize) {
  await sequelize.query('DROP PROCEDURE IF EXISTS GetBusinessSettings;');
  await sequelize.query('DROP PROCEDURE IF EXISTS UpsertBusinessSettings;');
  await sequelize.query('DROP PROCEDURE IF EXISTS UpdateBusinessSettings;');
}
