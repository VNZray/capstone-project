/**
 * Shop Category Stored Procedures
 * CRUD operations for shop_category table
 */

/**
 * Create all shop category stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function createShopCategoryProcedures(sequelize) {
  // InsertShopCategory - Create a new shop category
  await sequelize.query(`
    CREATE PROCEDURE InsertShopCategory(
      IN p_name VARCHAR(100),
      IN p_description TEXT,
      IN p_icon VARCHAR(50),
      IN p_parent_id CHAR(64)
    )
    BEGIN
      DECLARE new_id CHAR(64);
      SET new_id = UUID();
      INSERT INTO shop_category (id, name, description, icon, parent_id)
      VALUES (new_id, p_name, p_description, p_icon, p_parent_id);
      SELECT * FROM shop_category WHERE id = new_id;
    END;
  `);

  // GetAllShopCategories - Get all shop categories
  await sequelize.query(`
    CREATE PROCEDURE GetAllShopCategories()
    BEGIN
      SELECT * FROM shop_category ORDER BY name ASC;
    END;
  `);

  // GetShopCategoryById - Get shop category by ID
  await sequelize.query(`
    CREATE PROCEDURE GetShopCategoryById(IN p_id CHAR(64))
    BEGIN
      SELECT * FROM shop_category WHERE id = p_id;
    END;
  `);

  // GetShopCategoriesByParentId - Get child categories
  await sequelize.query(`
    CREATE PROCEDURE GetShopCategoriesByParentId(IN p_parent_id CHAR(64))
    BEGIN
      SELECT * FROM shop_category WHERE parent_id = p_parent_id ORDER BY name ASC;
    END;
  `);

  // GetRootShopCategories - Get top-level categories
  await sequelize.query(`
    CREATE PROCEDURE GetRootShopCategories()
    BEGIN
      SELECT * FROM shop_category WHERE parent_id IS NULL ORDER BY name ASC;
    END;
  `);

  // UpdateShopCategory - Update shop category details
  await sequelize.query(`
    CREATE PROCEDURE UpdateShopCategory(
      IN p_id CHAR(64),
      IN p_name VARCHAR(100),
      IN p_description TEXT,
      IN p_icon VARCHAR(50),
      IN p_parent_id CHAR(64)
    )
    BEGIN
      UPDATE shop_category SET
        name = IFNULL(p_name, name),
        description = IFNULL(p_description, description),
        icon = IFNULL(p_icon, icon),
        parent_id = p_parent_id
      WHERE id = p_id;
      SELECT * FROM shop_category WHERE id = p_id;
    END;
  `);

  // DeleteShopCategory - Delete a shop category
  await sequelize.query(`
    CREATE PROCEDURE DeleteShopCategory(IN p_id CHAR(64))
    BEGIN
      DELETE FROM shop_category WHERE id = p_id;
    END;
  `);
}

/**
 * Drop all shop category stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function dropShopCategoryProcedures(sequelize) {
  await sequelize.query('DROP PROCEDURE IF EXISTS InsertShopCategory;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetAllShopCategories;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetShopCategoryById;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetShopCategoriesByParentId;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetRootShopCategories;');
  await sequelize.query('DROP PROCEDURE IF EXISTS UpdateShopCategory;');
  await sequelize.query('DROP PROCEDURE IF EXISTS DeleteShopCategory;');
}
