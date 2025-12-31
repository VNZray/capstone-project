/**
 * Business Category Stored Procedures
 * Extracted from 20251014000001-business-category-table.cjs
 */

/**
 * Create business category stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function createBusinessCategoryProcedures(sequelize) {
  // InsertBusinessCategory - Insert a new business category
  await sequelize.query(`
    CREATE PROCEDURE InsertBusinessCategory(
      IN p_name VARCHAR(100),
      IN p_slug VARCHAR(100),
      IN p_description TEXT,
      IN p_icon VARCHAR(50),
      IN p_sort_order INT
    )
    BEGIN
      DECLARE new_id CHAR(64);
      SET new_id = UUID();
      INSERT INTO business_category (id, name, slug, description, icon, sort_order)
      VALUES (new_id, p_name, p_slug, p_description, p_icon, IFNULL(p_sort_order, 0));
      SELECT * FROM business_category WHERE id = new_id;
    END;
  `);

  // GetAllBusinessCategories - Get all active business categories
  await sequelize.query(`
    CREATE PROCEDURE GetAllBusinessCategories()
    BEGIN
      SELECT * FROM business_category WHERE is_active = true ORDER BY sort_order, name;
    END;
  `);

  // GetBusinessCategoryById - Get a business category by ID
  await sequelize.query(`
    CREATE PROCEDURE GetBusinessCategoryById(IN p_id CHAR(64))
    BEGIN
      SELECT * FROM business_category WHERE id = p_id;
    END;
  `);

  // GetBusinessCategoryBySlug - Get a business category by slug
  await sequelize.query(`
    CREATE PROCEDURE GetBusinessCategoryBySlug(IN p_slug VARCHAR(100))
    BEGIN
      SELECT * FROM business_category WHERE slug = p_slug;
    END;
  `);

  // UpdateBusinessCategory - Update a business category
  await sequelize.query(`
    CREATE PROCEDURE UpdateBusinessCategory(
      IN p_id CHAR(64),
      IN p_name VARCHAR(100),
      IN p_description TEXT,
      IN p_icon VARCHAR(50),
      IN p_is_active BOOLEAN,
      IN p_sort_order INT
    )
    BEGIN
      UPDATE business_category SET
        name = IFNULL(p_name, name),
        description = IFNULL(p_description, description),
        icon = IFNULL(p_icon, icon),
        is_active = IFNULL(p_is_active, is_active),
        sort_order = IFNULL(p_sort_order, sort_order)
      WHERE id = p_id;
      SELECT * FROM business_category WHERE id = p_id;
    END;
  `);

  // DeleteBusinessCategory - Delete a business category
  await sequelize.query(`
    CREATE PROCEDURE DeleteBusinessCategory(IN p_id CHAR(64))
    BEGIN
      DELETE FROM business_category WHERE id = p_id;
    END;
  `);

  // AddBusinessToCategory - Add a business to a category
  await sequelize.query(`
    CREATE PROCEDURE AddBusinessToCategory(IN p_business_id CHAR(64), IN p_category_id CHAR(64))
    BEGIN
      INSERT IGNORE INTO business_category_mapping (business_id, category_id)
      VALUES (p_business_id, p_category_id);
      SELECT * FROM business_category_mapping WHERE business_id = p_business_id AND category_id = p_category_id;
    END;
  `);

  // RemoveBusinessFromCategory - Remove a business from a category
  await sequelize.query(`
    CREATE PROCEDURE RemoveBusinessFromCategory(IN p_business_id CHAR(64), IN p_category_id CHAR(64))
    BEGIN
      DELETE FROM business_category_mapping WHERE business_id = p_business_id AND category_id = p_category_id;
    END;
  `);

  // GetCategoriesByBusinessId - Get all categories for a business
  await sequelize.query(`
    CREATE PROCEDURE GetCategoriesByBusinessId(IN p_business_id CHAR(64))
    BEGIN
      SELECT bc.*
      FROM business_category bc
      JOIN business_category_mapping bcm ON bc.id = bcm.category_id
      WHERE bcm.business_id = p_business_id AND bc.is_active = true;
    END;
  `);

  // GetBusinessesByCategoryId - Get all businesses in a category
  await sequelize.query(`
    CREATE PROCEDURE GetBusinessesByCategoryId(IN p_category_id CHAR(64))
    BEGIN
      SELECT b.*
      FROM business b
      JOIN business_category_mapping bcm ON b.id = bcm.business_id
      WHERE bcm.category_id = p_category_id AND b.is_approved = true;
    END;
  `);
}

/**
 * Drop business category stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function dropBusinessCategoryProcedures(sequelize) {
  await sequelize.query('DROP PROCEDURE IF EXISTS InsertBusinessCategory;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetAllBusinessCategories;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetBusinessCategoryById;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetBusinessCategoryBySlug;');
  await sequelize.query('DROP PROCEDURE IF EXISTS UpdateBusinessCategory;');
  await sequelize.query('DROP PROCEDURE IF EXISTS DeleteBusinessCategory;');
  await sequelize.query('DROP PROCEDURE IF EXISTS AddBusinessToCategory;');
  await sequelize.query('DROP PROCEDURE IF EXISTS RemoveBusinessFromCategory;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetCategoriesByBusinessId;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetBusinessesByCategoryId;');
}
