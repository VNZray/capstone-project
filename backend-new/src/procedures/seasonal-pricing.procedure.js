/**
 * Seasonal Pricing Stored Procedures
 * Extracted from 20251010000001-seasonal-pricing-table.cjs
 */

/**
 * Create all seasonal pricing-related stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function createSeasonalPricingProcedures(sequelize) {
  await sequelize.query(`
    CREATE PROCEDURE InsertSeasonalPricing(
      IN p_room_id CHAR(64),
      IN p_name VARCHAR(100),
      IN p_start_date DATE,
      IN p_end_date DATE,
      IN p_price_per_night DECIMAL(10, 2),
      IN p_price_per_hour DECIMAL(10, 2),
      IN p_min_stay_nights INT
    )
    BEGIN
      DECLARE new_id CHAR(64);
      SET new_id = UUID();
      INSERT INTO seasonal_pricing (id, room_id, name, start_date, end_date, price_per_night, price_per_hour, min_stay_nights)
      VALUES (new_id, p_room_id, p_name, p_start_date, p_end_date, p_price_per_night, p_price_per_hour, IFNULL(p_min_stay_nights, 1));
      SELECT * FROM seasonal_pricing WHERE id = new_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetSeasonalPricingById(IN p_id CHAR(64))
    BEGIN
      SELECT * FROM seasonal_pricing WHERE id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetSeasonalPricingByRoomId(IN p_room_id CHAR(64))
    BEGIN
      SELECT * FROM seasonal_pricing
      WHERE room_id = p_room_id AND is_active = true AND end_date >= CURDATE()
      ORDER BY start_date ASC;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetSeasonalPricingForDate(IN p_room_id CHAR(64), IN p_date DATE)
    BEGIN
      SELECT * FROM seasonal_pricing
      WHERE room_id = p_room_id
      AND is_active = true
      AND p_date BETWEEN start_date AND end_date
      ORDER BY created_at DESC
      LIMIT 1;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetRoomPriceForDateRange(
      IN p_room_id CHAR(64),
      IN p_start_date DATE,
      IN p_end_date DATE
    )
    BEGIN
      SELECT
        sp.id,
        sp.name,
        sp.price_per_night,
        sp.price_per_hour,
        sp.start_date,
        sp.end_date,
        DATEDIFF(
          LEAST(sp.end_date, p_end_date),
          GREATEST(sp.start_date, p_start_date)
        ) + 1 AS applicable_nights
      FROM seasonal_pricing sp
      WHERE sp.room_id = p_room_id
      AND sp.is_active = true
      AND NOT (sp.end_date < p_start_date OR sp.start_date > p_end_date)
      ORDER BY sp.start_date;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE UpdateSeasonalPricing(
      IN p_id CHAR(64),
      IN p_name VARCHAR(100),
      IN p_start_date DATE,
      IN p_end_date DATE,
      IN p_price_per_night DECIMAL(10, 2),
      IN p_price_per_hour DECIMAL(10, 2),
      IN p_min_stay_nights INT,
      IN p_is_active BOOLEAN
    )
    BEGIN
      UPDATE seasonal_pricing SET
        name = IFNULL(p_name, name),
        start_date = IFNULL(p_start_date, start_date),
        end_date = IFNULL(p_end_date, end_date),
        price_per_night = IFNULL(p_price_per_night, price_per_night),
        price_per_hour = IFNULL(p_price_per_hour, price_per_hour),
        min_stay_nights = IFNULL(p_min_stay_nights, min_stay_nights),
        is_active = IFNULL(p_is_active, is_active)
      WHERE id = p_id;
      SELECT * FROM seasonal_pricing WHERE id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE DeleteSeasonalPricing(IN p_id CHAR(64))
    BEGIN
      DELETE FROM seasonal_pricing WHERE id = p_id;
    END;
  `);
}

/**
 * Drop all seasonal pricing-related stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function dropSeasonalPricingProcedures(sequelize) {
  await sequelize.query('DROP PROCEDURE IF EXISTS InsertSeasonalPricing;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetSeasonalPricingById;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetSeasonalPricingByRoomId;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetSeasonalPricingForDate;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetRoomPriceForDateRange;');
  await sequelize.query('DROP PROCEDURE IF EXISTS UpdateSeasonalPricing;');
  await sequelize.query('DROP PROCEDURE IF EXISTS DeleteSeasonalPricing;');
}
