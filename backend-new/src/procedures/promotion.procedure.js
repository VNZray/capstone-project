/**
 * Promotion Stored Procedures
 * CRUD operations for promotion and promo_type tables
 */

/**
 * Create all promotion stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function createPromotionProcedures(sequelize) {
  // InsertPromotion - Create a new promotion
  await sequelize.query(`
    CREATE PROCEDURE InsertPromotion(
      IN p_id CHAR(64),
      IN p_business_id CHAR(64),
      IN p_title VARCHAR(255),
      IN p_description TEXT,
      IN p_image_url VARCHAR(500),
      IN p_external_link VARCHAR(500),
      IN p_promo_code VARCHAR(50),
      IN p_discount_percentage INT,
      IN p_fixed_discount_amount DECIMAL(10, 2),
      IN p_usage_limit INT,
      IN p_start_date TIMESTAMP,
      IN p_end_date TIMESTAMP,
      IN p_is_active BOOLEAN,
      IN p_promo_type INT
    )
    BEGIN
      INSERT INTO promotion (
        id, business_id, title, description, image_url, external_link, promo_code,
        discount_percentage, fixed_discount_amount, usage_limit, start_date, end_date, is_active, promo_type
      ) VALUES (
        p_id, p_business_id, p_title, p_description, p_image_url, p_external_link, p_promo_code,
        p_discount_percentage, p_fixed_discount_amount, p_usage_limit, p_start_date, p_end_date, IFNULL(p_is_active, TRUE), p_promo_type
      );
      SELECT * FROM promotion WHERE id = p_id;
    END;
  `);

  // GetPromotionById - Get promotion by ID with promo type and business info
  await sequelize.query(`
    CREATE PROCEDURE GetPromotionById(IN p_id CHAR(64))
    BEGIN
      SELECT p.*, pt.promo_name, b.business_name
      FROM promotion p
      LEFT JOIN promo_type pt ON p.promo_type = pt.id
      LEFT JOIN business b ON p.business_id = b.id
      WHERE p.id = p_id;
    END;
  `);

  // GetPromotionsByBusinessId - Get all promotions for a business
  await sequelize.query(`
    CREATE PROCEDURE GetPromotionsByBusinessId(IN p_business_id CHAR(64))
    BEGIN
      SELECT p.*, pt.promo_name
      FROM promotion p
      LEFT JOIN promo_type pt ON p.promo_type = pt.id
      WHERE p.business_id = p_business_id
      ORDER BY p.created_at DESC;
    END;
  `);

  // GetActivePromotions - Get all active promotions
  await sequelize.query(`
    CREATE PROCEDURE GetActivePromotions()
    BEGIN
      SELECT p.*, pt.promo_name, b.business_name
      FROM promotion p
      LEFT JOIN promo_type pt ON p.promo_type = pt.id
      LEFT JOIN business b ON p.business_id = b.id
      WHERE p.is_active = TRUE AND (p.end_date IS NULL OR p.end_date >= CURRENT_TIMESTAMP)
      ORDER BY p.start_date DESC;
    END;
  `);

  // UpdatePromotion - Update promotion details
  await sequelize.query(`
    CREATE PROCEDURE UpdatePromotion(
      IN p_id CHAR(64),
      IN p_title VARCHAR(255),
      IN p_description TEXT,
      IN p_image_url VARCHAR(500),
      IN p_external_link VARCHAR(500),
      IN p_promo_code VARCHAR(50),
      IN p_discount_percentage INT,
      IN p_fixed_discount_amount DECIMAL(10, 2),
      IN p_usage_limit INT,
      IN p_start_date TIMESTAMP,
      IN p_end_date TIMESTAMP,
      IN p_is_active BOOLEAN,
      IN p_promo_type INT
    )
    BEGIN
      UPDATE promotion SET
        title = IFNULL(p_title, title),
        description = IFNULL(p_description, description),
        image_url = IFNULL(p_image_url, image_url),
        external_link = IFNULL(p_external_link, external_link),
        promo_code = IFNULL(p_promo_code, promo_code),
        discount_percentage = IFNULL(p_discount_percentage, discount_percentage),
        fixed_discount_amount = IFNULL(p_fixed_discount_amount, fixed_discount_amount),
        usage_limit = IFNULL(p_usage_limit, usage_limit),
        start_date = IFNULL(p_start_date, start_date),
        end_date = IFNULL(p_end_date, end_date),
        is_active = IFNULL(p_is_active, is_active),
        promo_type = IFNULL(p_promo_type, promo_type),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = p_id;
      SELECT * FROM promotion WHERE id = p_id;
    END;
  `);

  // DeletePromotion - Delete a promotion
  await sequelize.query(`
    CREATE PROCEDURE DeletePromotion(IN p_id CHAR(64))
    BEGIN
      DELETE FROM promotion WHERE id = p_id;
    END;
  `);

  // IncrementPromotionUsage - Increment the usage count
  await sequelize.query(`
    CREATE PROCEDURE IncrementPromotionUsage(IN p_id CHAR(64))
    BEGIN
      UPDATE promotion SET used_count = used_count + 1 WHERE id = p_id;
      SELECT * FROM promotion WHERE id = p_id;
    END;
  `);
}

/**
 * Drop all promotion stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function dropPromotionProcedures(sequelize) {
  await sequelize.query('DROP PROCEDURE IF EXISTS InsertPromotion;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetPromotionById;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetPromotionsByBusinessId;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetActivePromotions;');
  await sequelize.query('DROP PROCEDURE IF EXISTS UpdatePromotion;');
  await sequelize.query('DROP PROCEDURE IF EXISTS DeletePromotion;');
  await sequelize.query('DROP PROCEDURE IF EXISTS IncrementPromotionUsage;');
}
