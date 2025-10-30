async function createPromotionProcedures(knex) {
  // Get all promotions
  await knex.raw(`
    CREATE PROCEDURE GetAllPromotions()
    BEGIN
      SELECT p.*, b.business_name 
      FROM promotion p 
      JOIN business b ON p.business_id = b.id 
      ORDER BY p.created_at DESC;
    END;
  `);

  // Get promotions by business ID
  await knex.raw(`
    CREATE PROCEDURE GetPromotionsByBusinessId(IN p_businessId CHAR(64))
    BEGIN
      SELECT * FROM promotion 
      WHERE business_id = p_businessId 
      ORDER BY created_at DESC;
    END;
  `);

  // Get active promotions by business ID
  await knex.raw(`
    CREATE PROCEDURE GetActivePromotionsByBusinessId(IN p_businessId CHAR(64))
    BEGIN
      SELECT * FROM promotion 
      WHERE business_id = p_businessId 
        AND is_active = 1
        AND start_date <= NOW() 
        AND (end_date IS NULL OR end_date >= NOW())
      ORDER BY start_date ASC;
    END;
  `);

  // Get all active promotions
  await knex.raw(`
    CREATE PROCEDURE GetAllActivePromotions()
    BEGIN
      SELECT p.*, b.business_name 
      FROM promotion p 
      JOIN business b ON p.business_id = b.id 
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
      SELECT p.*, b.business_name 
      FROM promotion p 
      JOIN business b ON p.business_id = b.id 
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
      IN p_start_date TIMESTAMP,
      IN p_end_date TIMESTAMP
    )
    BEGIN
      INSERT INTO promotion (
        id, business_id, title, description, 
        image_url, external_link, start_date, end_date
      ) VALUES (
        p_id, p_business_id, p_title, p_description,
        p_image_url, p_external_link, p_start_date, p_end_date
      );

      SELECT p.*, b.business_name 
      FROM promotion p 
      JOIN business b ON p.business_id = b.id 
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
      IN p_start_date TIMESTAMP,
      IN p_end_date TIMESTAMP,
      IN p_is_active BOOLEAN
    )
    BEGIN
      UPDATE promotion SET
        title = IFNULL(p_title, title),
        description = p_description,
        image_url = p_image_url,
        external_link = p_external_link,
        start_date = IFNULL(p_start_date, start_date),
        end_date = p_end_date,
        is_active = IFNULL(p_is_active, is_active),
        updated_at = NOW()
      WHERE id = p_id;

      SELECT p.*, b.business_name 
      FROM promotion p 
      JOIN business b ON p.business_id = b.id 
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
}

export { createPromotionProcedures, dropPromotionProcedures };
