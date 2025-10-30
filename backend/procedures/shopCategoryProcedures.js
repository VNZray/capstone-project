async function createShopCategoryProcedures(knex) {
  // ==================== SHOP CATEGORIES ====================
  
  // Get all shop categories
  await knex.raw(`
    CREATE PROCEDURE GetAllShopCategories()
    BEGIN
      SELECT * FROM shop_category ORDER BY display_order, name;
    END;
  `);

  // Get shop categories by business ID
  await knex.raw(`
    CREATE PROCEDURE GetShopCategoriesByBusinessId(IN p_businessId CHAR(64))
    BEGIN
      SELECT * FROM shop_category 
      WHERE business_id = p_businessId AND status = 'active' 
      ORDER BY display_order, name;
    END;
  `);

  // Get shop categories by business ID and type
  await knex.raw(`
    CREATE PROCEDURE GetShopCategoriesByBusinessIdAndType(
      IN p_businessId CHAR(64),
      IN p_categoryType ENUM('product', 'service', 'both')
    )
    BEGIN
      SELECT * FROM shop_category 
      WHERE business_id = p_businessId 
        AND status = 'active' 
        AND (category_type = p_categoryType OR category_type = 'both')
      ORDER BY display_order, name;
    END;
  `);

  // Get shop category by ID
  await knex.raw(`
    CREATE PROCEDURE GetShopCategoryById(IN p_categoryId CHAR(64))
    BEGIN
      SELECT * FROM shop_category WHERE id = p_categoryId;
    END;
  `);

  // Insert shop category
  await knex.raw(`
    CREATE PROCEDURE InsertShopCategory(
      IN p_id CHAR(64),
      IN p_business_id CHAR(64),
      IN p_name VARCHAR(255),
      IN p_description TEXT,
      IN p_category_type ENUM('product', 'service', 'both'),
      IN p_display_order INT,
      IN p_status ENUM('active', 'inactive')
    )
    BEGIN
      INSERT INTO shop_category (id, business_id, name, description, category_type, display_order, status)
      VALUES (p_id, p_business_id, p_name, p_description, IFNULL(p_category_type, 'both'), IFNULL(p_display_order, 0), IFNULL(p_status, 'active'));
      
      SELECT * FROM shop_category WHERE id = p_id;
    END;
  `);

  // Update shop category
  await knex.raw(`
    CREATE PROCEDURE UpdateShopCategory(
      IN p_id CHAR(64),
      IN p_name VARCHAR(255),
      IN p_description TEXT,
      IN p_category_type ENUM('product', 'service', 'both'),
      IN p_display_order INT,
      IN p_status ENUM('active', 'inactive')
    )
    BEGIN
      UPDATE shop_category SET
        name = IFNULL(p_name, name),
        description = IFNULL(p_description, description),
        category_type = IFNULL(p_category_type, category_type),
        display_order = IFNULL(p_display_order, display_order),
        status = IFNULL(p_status, status),
        updated_at = NOW()
      WHERE id = p_id;

      SELECT * FROM shop_category WHERE id = p_id;
    END;
  `);

  // Delete shop category
  await knex.raw(`
    CREATE PROCEDURE DeleteShopCategory(IN p_categoryId CHAR(64))
    BEGIN
      DECLARE product_count INT DEFAULT 0;
      DECLARE service_count INT DEFAULT 0;
      
      SELECT COUNT(*) INTO product_count 
      FROM product_category_map 
      WHERE category_id = p_categoryId;
      
      SELECT COUNT(*) INTO service_count 
      FROM service_category_map 
      WHERE category_id = p_categoryId;
      
      IF product_count > 0 OR service_count > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot delete category that is assigned to products or services';
      ELSE
        DELETE FROM shop_category WHERE id = p_categoryId;
      END IF;
    END;
  `);

  // Get category statistics
  await knex.raw(`
    CREATE PROCEDURE GetShopCategoryStats(IN p_businessId CHAR(64))
    BEGIN
      SELECT 
        sc.*,
        (SELECT COUNT(*) FROM product_category_map pcm WHERE pcm.category_id = sc.id) as product_count,
        (SELECT COUNT(*) FROM service_category_map scm WHERE scm.category_id = sc.id) as service_count
      FROM shop_category sc
      WHERE sc.business_id = p_businessId
      ORDER BY sc.display_order, sc.name;
    END;
  `);
}

async function dropShopCategoryProcedures(knex) {
  await knex.raw("DROP PROCEDURE IF EXISTS GetAllShopCategories;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetShopCategoriesByBusinessId;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetShopCategoriesByBusinessIdAndType;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetShopCategoryById;");
  await knex.raw("DROP PROCEDURE IF EXISTS InsertShopCategory;");
  await knex.raw("DROP PROCEDURE IF EXISTS UpdateShopCategory;");
  await knex.raw("DROP PROCEDURE IF EXISTS DeleteShopCategory;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetShopCategoryStats;");
}

export { createShopCategoryProcedures, dropShopCategoryProcedures };
