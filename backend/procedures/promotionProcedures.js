async function createPromotionProcedures(knex) {
  // Get all promotions
  await knex.raw(`
    CREATE PROCEDURE GetAllPromotions()
    BEGIN
      SELECT p.*, b.business_name, pt.promo_name
      FROM promotion p
      JOIN business b ON p.business_id = b.id
      LEFT JOIN promo_type pt ON p.promo_type = pt.id
      ORDER BY p.created_at DESC;
    END;
  `);

  // Get promotions by business ID
  await knex.raw(`
    CREATE PROCEDURE GetPromotionsByBusinessId(IN p_businessId CHAR(64))
    BEGIN
      SELECT p.*, b.business_name, pt.promo_name
      FROM promotion p
      JOIN business b ON p.business_id = b.id
      LEFT JOIN promo_type pt ON p.promo_type = pt.id
      WHERE p.business_id = p_businessId
      ORDER BY p.created_at DESC;
    END;
  `);

  // Get active promotions by business ID
  await knex.raw(`
    CREATE PROCEDURE GetActivePromotionsByBusinessId(IN p_businessId CHAR(64))
    BEGIN
      SELECT p.*, b.business_name, pt.promo_name
      FROM promotion p
      JOIN business b ON p.business_id = b.id
      LEFT JOIN promo_type pt ON p.promo_type = pt.id
      WHERE p.business_id = p_businessId
        AND p.is_active = 1
        AND p.start_date <= NOW()
        AND (p.end_date IS NULL OR p.end_date >= NOW())
      ORDER BY p.start_date ASC;
    END;
  `);

  // Get all active promotions
  await knex.raw(`
    CREATE PROCEDURE GetAllActivePromotions()
    BEGIN
      SELECT p.*, b.business_name, pt.promo_name
      FROM promotion p
      JOIN business b ON p.business_id = b.id
      LEFT JOIN promo_type pt ON p.promo_type = pt.id
      WHERE p.is_active = 1
        AND p.start_date <= NOW()
        AND (p.end_date IS NULL OR p.end_date >= NOW())
      ORDER BY p.created_at DESC;
    END;
  `);

  // Get promotion by ID
  await knex.raw(`
    CREATE PROCEDURE GetPromotionById(IN p_promotionId CHAR(64))
    BEGIN
      SELECT p.*, b.business_name, pt.promo_name
      FROM promotion p
      JOIN business b ON p.business_id = b.id
      LEFT JOIN promo_type pt ON p.promo_type = pt.id
      WHERE p.id = p_promotionId;
    END;
  `);

  // Insert promotion
  await knex.raw(`
    CREATE PROCEDURE InsertPromotion(
      IN p_id CHAR(64),
      IN p_business_id CHAR(64),
      IN p_title VARCHAR(255),
      IN p_description TEXT,
      IN p_image_url VARCHAR(500),
      IN p_external_link VARCHAR(500),
      IN p_promo_code VARCHAR(50),
      IN p_discount_percentage INT,
      IN p_fixed_discount_amount DECIMAL(10,2),
      IN p_usage_limit INT,
      IN p_start_date TIMESTAMP,
      IN p_end_date TIMESTAMP,
      IN p_promo_type INT
    )
    BEGIN
      INSERT INTO promotion (
        id, business_id, title, description,
        image_url, external_link, promo_code,
        discount_percentage, fixed_discount_amount, usage_limit,
        start_date, end_date, promo_type
      ) VALUES (
        p_id, p_business_id, p_title, p_description,
        p_image_url, p_external_link, p_promo_code,
        p_discount_percentage, p_fixed_discount_amount, p_usage_limit,
        p_start_date, p_end_date, p_promo_type
      );

      SELECT p.*, b.business_name, pt.promo_name
      FROM promotion p
      JOIN business b ON p.business_id = b.id
      LEFT JOIN promo_type pt ON p.promo_type = pt.id
      WHERE p.id = p_id;
    END;
  `);

  // Update promotion
  await knex.raw(`
    CREATE PROCEDURE UpdatePromotion(
      IN p_id CHAR(64),
      IN p_title VARCHAR(255),
      IN p_description TEXT,
      IN p_image_url VARCHAR(500),
      IN p_external_link VARCHAR(500),
      IN p_promo_code VARCHAR(50),
      IN p_discount_percentage INT,
      IN p_fixed_discount_amount DECIMAL(10,2),
      IN p_usage_limit INT,
      IN p_start_date TIMESTAMP,
      IN p_end_date TIMESTAMP,
      IN p_is_active BOOLEAN,
      IN p_promo_type INT
    )
    BEGIN
      UPDATE promotion SET
        title = IFNULL(p_title, title),
        description = p_description,
        image_url = p_image_url,
        external_link = p_external_link,
        promo_code = p_promo_code,
        discount_percentage = p_discount_percentage,
        fixed_discount_amount = p_fixed_discount_amount,
        usage_limit = p_usage_limit,
        start_date = IFNULL(p_start_date, start_date),
        end_date = p_end_date,
        is_active = IFNULL(p_is_active, is_active),
        promo_type = IFNULL(p_promo_type, promo_type),
        updated_at = NOW()
      WHERE id = p_id;

      SELECT p.*, b.business_name, pt.promo_name
      FROM promotion p
      JOIN business b ON p.business_id = b.id
      LEFT JOIN promo_type pt ON p.promo_type = pt.id
      WHERE p.id = p_id;
    END;
  `);

  // Delete promotion
  await knex.raw(`
    CREATE PROCEDURE DeletePromotion(IN p_promotionId CHAR(64))
    BEGIN
      DELETE FROM promotion WHERE id = p_promotionId;
    END;
  `);

  // Update expired promotions
  await knex.raw(`
    CREATE PROCEDURE UpdateExpiredPromotions()
    BEGIN
      UPDATE promotion
      SET is_active = 0, updated_at = NOW()
      WHERE is_active = 1
        AND end_date IS NOT NULL
        AND end_date < NOW();

      SELECT ROW_COUNT() as updated_count;
    END;
  `);

  // Increment promotion usage count
  await knex.raw(`
    CREATE PROCEDURE IncrementPromotionUsage(IN p_promotionId CHAR(64))
    BEGIN
      UPDATE promotion
      SET used_count = used_count + 1,
          updated_at = NOW()
      WHERE id = p_promotionId;
    END;
  `);
}

async function dropPromotionProcedures(knex) {
  await knex.raw("DROP PROCEDURE IF EXISTS GetAllPromotions;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetPromotionsByBusinessId;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetActivePromotionsByBusinessId;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetAllActivePromotions;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetPromotionById;");
  await knex.raw("DROP PROCEDURE IF EXISTS InsertPromotion;");
  await knex.raw("DROP PROCEDURE IF EXISTS UpdatePromotion;");
  await knex.raw("DROP PROCEDURE IF EXISTS DeletePromotion;");
  await knex.raw("DROP PROCEDURE IF EXISTS UpdateExpiredPromotions;");
  await knex.raw("DROP PROCEDURE IF EXISTS IncrementPromotionUsage;");
}

export { createPromotionProcedures, dropPromotionProcedures };
