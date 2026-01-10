/**
 * Seasonal Pricing Stored Procedures
 *
 * Handles CRUD operations and price calculations for seasonal pricing
 */

const createSeasonalPricingProcedures = async (knex) => {
  // Insert seasonal pricing configuration
  await knex.raw(`
    CREATE PROCEDURE InsertSeasonalPricing(
      IN p_id CHAR(36),
      IN p_business_id CHAR(36),
      IN p_room_id CHAR(36),
      IN p_base_price DECIMAL(10,2),
      IN p_weekend_price DECIMAL(10,2),
      IN p_weekend_days JSON,
      IN p_peak_season_price DECIMAL(10,2),
      IN p_peak_season_months JSON,
      IN p_high_season_price DECIMAL(10,2),
      IN p_high_season_months JSON,
      IN p_low_season_price DECIMAL(10,2),
      IN p_low_season_months JSON,
      IN p_is_active BOOLEAN
    )
    BEGIN
      INSERT INTO seasonal_pricing (
        id, business_id, room_id, base_price, weekend_price, weekend_days,
        peak_season_price, peak_season_months, high_season_price, high_season_months,
        low_season_price, low_season_months, is_active, created_at, updated_at
      ) VALUES (
        p_id, p_business_id, p_room_id, p_base_price, p_weekend_price, p_weekend_days,
        p_peak_season_price, p_peak_season_months, p_high_season_price, p_high_season_months,
        p_low_season_price, p_low_season_months, COALESCE(p_is_active, TRUE), NOW(), NOW()
      );
      SELECT * FROM seasonal_pricing WHERE id = p_id;
    END
  `);

  // Get all seasonal pricing configurations
  await knex.raw(`
    CREATE PROCEDURE GetAllSeasonalPricing()
    BEGIN
      SELECT sp.*, b.business_name, r.room_number, r.room_type
      FROM seasonal_pricing sp
      LEFT JOIN business b ON sp.business_id = b.id
      LEFT JOIN room r ON sp.room_id = r.id
      ORDER BY sp.created_at DESC;
    END
  `);

  // Get seasonal pricing by ID
  await knex.raw(`
    CREATE PROCEDURE GetSeasonalPricingById(IN p_id CHAR(36))
    BEGIN
      SELECT sp.*, b.business_name, r.room_number, r.room_type
      FROM seasonal_pricing sp
      LEFT JOIN business b ON sp.business_id = b.id
      LEFT JOIN room r ON sp.room_id = r.id
      WHERE sp.id = p_id;
    END
  `);

  // Get seasonal pricing by business ID
  await knex.raw(`
    CREATE PROCEDURE GetSeasonalPricingByBusinessId(IN p_business_id CHAR(36))
    BEGIN
      SELECT sp.*, r.room_number, r.room_type
      FROM seasonal_pricing sp
      LEFT JOIN room r ON sp.room_id = r.id
      WHERE sp.business_id = p_business_id AND sp.is_active = TRUE
      ORDER BY sp.created_at DESC;
    END
  `);

  // Get seasonal pricing by room ID
  await knex.raw(`
    CREATE PROCEDURE GetSeasonalPricingByRoomId(IN p_room_id CHAR(36))
    BEGIN
      SELECT sp.*, r.room_number, r.room_type, r.room_price as default_price
      FROM seasonal_pricing sp
      LEFT JOIN room r ON sp.room_id = r.id
      WHERE sp.room_id = p_room_id AND sp.is_active = TRUE
      LIMIT 1;
    END
  `);

  // Update seasonal pricing
  await knex.raw(`
    CREATE PROCEDURE UpdateSeasonalPricing(
      IN p_id CHAR(36),
      IN p_base_price DECIMAL(10,2),
      IN p_weekend_price DECIMAL(10,2),
      IN p_weekend_days JSON,
      IN p_peak_season_price DECIMAL(10,2),
      IN p_peak_season_months JSON,
      IN p_high_season_price DECIMAL(10,2),
      IN p_high_season_months JSON,
      IN p_low_season_price DECIMAL(10,2),
      IN p_low_season_months JSON,
      IN p_is_active BOOLEAN
    )
    BEGIN
      UPDATE seasonal_pricing SET
        base_price = COALESCE(p_base_price, base_price),
        weekend_price = COALESCE(p_weekend_price, weekend_price),
        weekend_days = COALESCE(p_weekend_days, weekend_days),
        peak_season_price = COALESCE(p_peak_season_price, peak_season_price),
        peak_season_months = COALESCE(p_peak_season_months, peak_season_months),
        high_season_price = COALESCE(p_high_season_price, high_season_price),
        high_season_months = COALESCE(p_high_season_months, high_season_months),
        low_season_price = COALESCE(p_low_season_price, low_season_price),
        low_season_months = COALESCE(p_low_season_months, low_season_months),
        is_active = COALESCE(p_is_active, is_active),
        updated_at = NOW()
      WHERE id = p_id;
      SELECT * FROM seasonal_pricing WHERE id = p_id;
    END
  `);

  // Delete seasonal pricing
  await knex.raw(`
    CREATE PROCEDURE DeleteSeasonalPricing(IN p_id CHAR(36))
    BEGIN
      DELETE FROM seasonal_pricing WHERE id = p_id;
      SELECT ROW_COUNT() as affected_rows;
    END
  `);

  // Calculate price for a specific date based on seasonal pricing
  await knex.raw(`
    CREATE PROCEDURE CalculatePriceForDate(
      IN p_room_id CHAR(36),
      IN p_date DATE
    )
    BEGIN
      DECLARE v_day_of_week INT;
      DECLARE v_month INT;
      DECLARE v_base_price DECIMAL(10,2);
      DECLARE v_weekend_price DECIMAL(10,2);
      DECLARE v_weekend_days JSON;
      DECLARE v_peak_price DECIMAL(10,2);
      DECLARE v_peak_months JSON;
      DECLARE v_high_price DECIMAL(10,2);
      DECLARE v_high_months JSON;
      DECLARE v_low_price DECIMAL(10,2);
      DECLARE v_low_months JSON;
      DECLARE v_room_default_price DECIMAL(10,2);
      DECLARE v_final_price DECIMAL(10,2);
      DECLARE v_price_type VARCHAR(20);
      DECLARE v_day_name VARCHAR(10);

      SET v_day_of_week = DAYOFWEEK(p_date);
      SET v_month = MONTH(p_date);
      SET v_day_name = DAYNAME(p_date);

      -- Get room default price
      SELECT room_price INTO v_room_default_price FROM room WHERE id = p_room_id;

      -- Get seasonal pricing config
      SELECT base_price, weekend_price, weekend_days,
             peak_season_price, peak_season_months,
             high_season_price, high_season_months,
             low_season_price, low_season_months
      INTO v_base_price, v_weekend_price, v_weekend_days,
           v_peak_price, v_peak_months,
           v_high_price, v_high_months,
           v_low_price, v_low_months
      FROM seasonal_pricing
      WHERE room_id = p_room_id AND is_active = TRUE
      LIMIT 1;

      -- Default to room price if no seasonal pricing configured
      IF v_base_price IS NULL THEN
        SET v_final_price = v_room_default_price;
        SET v_price_type = 'default';
      ELSE
        -- Start with base price
        SET v_final_price = v_base_price;
        SET v_price_type = 'base';

        -- Check seasonal pricing (priority: peak > high > low)
        IF v_peak_months IS NOT NULL AND JSON_CONTAINS(v_peak_months, CAST(v_month AS CHAR)) THEN
          SET v_final_price = COALESCE(v_peak_price, v_base_price);
          SET v_price_type = 'peak_season';
        ELSEIF v_high_months IS NOT NULL AND JSON_CONTAINS(v_high_months, CAST(v_month AS CHAR)) THEN
          SET v_final_price = COALESCE(v_high_price, v_base_price);
          SET v_price_type = 'high_season';
        ELSEIF v_low_months IS NOT NULL AND JSON_CONTAINS(v_low_months, CAST(v_month AS CHAR)) THEN
          SET v_final_price = COALESCE(v_low_price, v_base_price);
          SET v_price_type = 'low_season';
        END IF;

        -- Check weekend pricing (overrides seasonal if weekend_price is higher)
        IF v_weekend_days IS NOT NULL AND JSON_CONTAINS(v_weekend_days, JSON_QUOTE(v_day_name)) THEN
          IF v_weekend_price IS NOT NULL AND v_weekend_price > v_final_price THEN
            SET v_final_price = v_weekend_price;
            SET v_price_type = 'weekend';
          END IF;
        END IF;
      END IF;

      SELECT v_final_price as price, v_price_type as price_type, p_date as date, v_day_name as day_name;
    END
  `);

  // Calculate total price for a date range
  await knex.raw(`
    CREATE PROCEDURE CalculatePriceForDateRange(
      IN p_room_id CHAR(36),
      IN p_start_date DATE,
      IN p_end_date DATE
    )
    BEGIN
      DECLARE v_current_date DATE;
      DECLARE v_total_price DECIMAL(10,2) DEFAULT 0;
      DECLARE v_night_count INT DEFAULT 0;

      -- Create temporary table for breakdown
      DROP TEMPORARY TABLE IF EXISTS temp_price_breakdown;
      CREATE TEMPORARY TABLE temp_price_breakdown (
        date DATE,
        day_name VARCHAR(10),
        price DECIMAL(10,2),
        price_type VARCHAR(20)
      );

      SET v_current_date = p_start_date;

      -- Loop through each night (excluding checkout date)
      WHILE v_current_date < p_end_date DO
        -- Calculate price for this date
        INSERT INTO temp_price_breakdown (date, day_name, price, price_type)
        SELECT
          v_current_date,
          DAYNAME(v_current_date),
          CASE
            WHEN sp.id IS NULL THEN r.room_price
            WHEN sp.weekend_days IS NOT NULL
                 AND JSON_CONTAINS(sp.weekend_days, JSON_QUOTE(DAYNAME(v_current_date)))
                 AND sp.weekend_price > COALESCE(
                   CASE
                     WHEN sp.peak_season_months IS NOT NULL AND JSON_CONTAINS(sp.peak_season_months, CAST(MONTH(v_current_date) AS CHAR)) THEN sp.peak_season_price
                     WHEN sp.high_season_months IS NOT NULL AND JSON_CONTAINS(sp.high_season_months, CAST(MONTH(v_current_date) AS CHAR)) THEN sp.high_season_price
                     WHEN sp.low_season_months IS NOT NULL AND JSON_CONTAINS(sp.low_season_months, CAST(MONTH(v_current_date) AS CHAR)) THEN sp.low_season_price
                     ELSE sp.base_price
                   END, sp.base_price)
            THEN sp.weekend_price
            WHEN sp.peak_season_months IS NOT NULL AND JSON_CONTAINS(sp.peak_season_months, CAST(MONTH(v_current_date) AS CHAR)) THEN COALESCE(sp.peak_season_price, sp.base_price)
            WHEN sp.high_season_months IS NOT NULL AND JSON_CONTAINS(sp.high_season_months, CAST(MONTH(v_current_date) AS CHAR)) THEN COALESCE(sp.high_season_price, sp.base_price)
            WHEN sp.low_season_months IS NOT NULL AND JSON_CONTAINS(sp.low_season_months, CAST(MONTH(v_current_date) AS CHAR)) THEN COALESCE(sp.low_season_price, sp.base_price)
            ELSE COALESCE(sp.base_price, r.room_price)
          END,
          CASE
            WHEN sp.id IS NULL THEN 'default'
            WHEN sp.weekend_days IS NOT NULL
                 AND JSON_CONTAINS(sp.weekend_days, JSON_QUOTE(DAYNAME(v_current_date)))
                 AND sp.weekend_price > COALESCE(
                   CASE
                     WHEN sp.peak_season_months IS NOT NULL AND JSON_CONTAINS(sp.peak_season_months, CAST(MONTH(v_current_date) AS CHAR)) THEN sp.peak_season_price
                     WHEN sp.high_season_months IS NOT NULL AND JSON_CONTAINS(sp.high_season_months, CAST(MONTH(v_current_date) AS CHAR)) THEN sp.high_season_price
                     WHEN sp.low_season_months IS NOT NULL AND JSON_CONTAINS(sp.low_season_months, CAST(MONTH(v_current_date) AS CHAR)) THEN sp.low_season_price
                     ELSE sp.base_price
                   END, sp.base_price)
            THEN 'weekend'
            WHEN sp.peak_season_months IS NOT NULL AND JSON_CONTAINS(sp.peak_season_months, CAST(MONTH(v_current_date) AS CHAR)) THEN 'peak_season'
            WHEN sp.high_season_months IS NOT NULL AND JSON_CONTAINS(sp.high_season_months, CAST(MONTH(v_current_date) AS CHAR)) THEN 'high_season'
            WHEN sp.low_season_months IS NOT NULL AND JSON_CONTAINS(sp.low_season_months, CAST(MONTH(v_current_date) AS CHAR)) THEN 'low_season'
            ELSE 'base'
          END
        FROM room r
        LEFT JOIN seasonal_pricing sp ON sp.room_id = r.id AND sp.is_active = TRUE
        WHERE r.id = p_room_id;

        SET v_night_count = v_night_count + 1;
        SET v_current_date = DATE_ADD(v_current_date, INTERVAL 1 DAY);
      END WHILE;

      -- Calculate total
      SELECT SUM(price) INTO v_total_price FROM temp_price_breakdown;

      -- Return breakdown and summary
      SELECT * FROM temp_price_breakdown ORDER BY date;
      SELECT v_total_price as total_price, v_night_count as nights, p_start_date as check_in, p_end_date as check_out;

      DROP TEMPORARY TABLE IF EXISTS temp_price_breakdown;
    END
  `);

  console.log("✅ Seasonal pricing stored procedures created successfully");
};

const dropSeasonalPricingProcedures = async (knex) => {
  await knex.raw("DROP PROCEDURE IF EXISTS InsertSeasonalPricing");
  await knex.raw("DROP PROCEDURE IF EXISTS GetAllSeasonalPricing");
  await knex.raw("DROP PROCEDURE IF EXISTS GetSeasonalPricingById");
  await knex.raw("DROP PROCEDURE IF EXISTS GetSeasonalPricingByBusinessId");
  await knex.raw("DROP PROCEDURE IF EXISTS GetSeasonalPricingByRoomId");
  await knex.raw("DROP PROCEDURE IF EXISTS UpdateSeasonalPricing");
  await knex.raw("DROP PROCEDURE IF EXISTS DeleteSeasonalPricing");
  await knex.raw("DROP PROCEDURE IF EXISTS CalculatePriceForDate");
  await knex.raw("DROP PROCEDURE IF EXISTS CalculatePriceForDateRange");
  console.log("✅ Seasonal pricing stored procedures dropped successfully");
};

module.exports = {
  createSeasonalPricingProcedures,
  dropSeasonalPricingProcedures,
};
