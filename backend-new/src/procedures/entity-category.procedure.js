/**
 * Entity Category Stored Procedures
 * CRUD operations for entity_categories junction table
 */

/**
 * Create entity category stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function createEntityCategoryProcedures(sequelize) {
  // GetEntityCategories - Get all categories for an entity
  await sequelize.query('DROP PROCEDURE IF EXISTS GetEntityCategories;');
  await sequelize.query(`
    CREATE PROCEDURE GetEntityCategories(
      IN p_entity_id CHAR(36),
      IN p_entity_type VARCHAR(20)
    )
    BEGIN
      SELECT
        ec.id,
        ec.entity_id,
        ec.entity_type,
        ec.category_id,
        ec.level,
        ec.is_primary,
        ec.created_at,
        ec.updated_at,
        c.title AS category_title,
        c.alias AS category_alias,
        c.parent_category,
        pc.title AS parent_title
      FROM entity_categories ec
      JOIN categories c ON ec.category_id = c.id
      LEFT JOIN categories pc ON c.parent_category = pc.id
      WHERE ec.entity_id = p_entity_id
        AND ec.entity_type = p_entity_type
      ORDER BY ec.is_primary DESC, ec.level, c.sort_order;
    END;
  `);

  // AddEntityCategory - Add a category to an entity
  await sequelize.query('DROP PROCEDURE IF EXISTS AddEntityCategory;');
  await sequelize.query(`
    CREATE PROCEDURE AddEntityCategory(
      IN p_entity_id CHAR(36),
      IN p_entity_type VARCHAR(20),
      IN p_category_id INT,
      IN p_level INT,
      IN p_is_primary BOOLEAN
    )
    BEGIN
      INSERT INTO entity_categories (entity_id, entity_type, category_id, level, is_primary)
      VALUES (p_entity_id, p_entity_type, p_category_id, COALESCE(p_level, 1), COALESCE(p_is_primary, false))
      ON DUPLICATE KEY UPDATE
        level = COALESCE(p_level, level),
        is_primary = COALESCE(p_is_primary, is_primary),
        updated_at = CURRENT_TIMESTAMP;

      SELECT LAST_INSERT_ID() AS id;
    END;
  `);

  // RemoveEntityCategory - Remove a category from an entity
  await sequelize.query('DROP PROCEDURE IF EXISTS RemoveEntityCategory;');
  await sequelize.query(`
    CREATE PROCEDURE RemoveEntityCategory(
      IN p_entity_id CHAR(36),
      IN p_entity_type VARCHAR(20),
      IN p_category_id INT
    )
    BEGIN
      DELETE FROM entity_categories
      WHERE entity_id = p_entity_id
        AND entity_type = p_entity_type
        AND category_id = p_category_id;

      SELECT ROW_COUNT() AS affected_rows;
    END;
  `);

  // SetEntityPrimaryCategory - Set primary category for an entity
  await sequelize.query('DROP PROCEDURE IF EXISTS SetEntityPrimaryCategory;');
  await sequelize.query(`
    CREATE PROCEDURE SetEntityPrimaryCategory(
      IN p_entity_id CHAR(36),
      IN p_entity_type VARCHAR(20),
      IN p_category_id INT
    )
    BEGIN
      UPDATE entity_categories SET is_primary = false
      WHERE entity_id = p_entity_id AND entity_type = p_entity_type;

      UPDATE entity_categories SET is_primary = true, updated_at = CURRENT_TIMESTAMP
      WHERE entity_id = p_entity_id
        AND entity_type = p_entity_type
        AND category_id = p_category_id;

      SELECT ROW_COUNT() AS affected_rows;
    END;
  `);

  // GetEntitiesByCategory - Get all entities in a category
  await sequelize.query('DROP PROCEDURE IF EXISTS GetEntitiesByCategory;');
  await sequelize.query(`
    CREATE PROCEDURE GetEntitiesByCategory(
      IN p_category_id INT,
      IN p_entity_type VARCHAR(20),
      IN p_include_children BOOLEAN
    )
    BEGIN
      IF p_include_children THEN
        SELECT DISTINCT ec.entity_id, ec.entity_type, ec.is_primary, ec.level
        FROM entity_categories ec
        WHERE ec.category_id IN (
          SELECT id FROM categories WHERE id = p_category_id OR parent_category = p_category_id
          UNION
          SELECT c2.id FROM categories c1
          JOIN categories c2 ON c2.parent_category = c1.id
          WHERE c1.parent_category = p_category_id
        )
        AND (p_entity_type IS NULL OR ec.entity_type = p_entity_type);
      ELSE
        SELECT DISTINCT ec.entity_id, ec.entity_type, ec.is_primary, ec.level
        FROM entity_categories ec
        WHERE ec.category_id = p_category_id
        AND (p_entity_type IS NULL OR ec.entity_type = p_entity_type);
      END IF;
    END;
  `);

  // GetAllEntityCategories - Get all entity categories with pagination
  await sequelize.query('DROP PROCEDURE IF EXISTS GetAllEntityCategories;');
  await sequelize.query(`
    CREATE PROCEDURE GetAllEntityCategories(
      IN p_entity_type VARCHAR(20),
      IN p_limit INT,
      IN p_offset INT
    )
    BEGIN
      DECLARE v_limit INT DEFAULT 100;
      DECLARE v_offset INT DEFAULT 0;

      IF p_limit IS NOT NULL THEN SET v_limit = p_limit; END IF;
      IF p_offset IS NOT NULL THEN SET v_offset = p_offset; END IF;

      SELECT
        ec.id,
        ec.entity_id,
        ec.entity_type,
        ec.category_id,
        ec.level,
        ec.is_primary,
        ec.created_at,
        ec.updated_at,
        c.title AS category_title,
        c.alias AS category_alias
      FROM entity_categories ec
      JOIN categories c ON ec.category_id = c.id
      WHERE (p_entity_type IS NULL OR ec.entity_type = p_entity_type)
      ORDER BY ec.created_at DESC
      LIMIT v_limit OFFSET v_offset;
    END;
  `);

  // UpdateEntityCategory - Update an entity category by ID
  await sequelize.query('DROP PROCEDURE IF EXISTS UpdateEntityCategory;');
  await sequelize.query(`
    CREATE PROCEDURE UpdateEntityCategory(
      IN p_id INT,
      IN p_level INT,
      IN p_is_primary BOOLEAN
    )
    BEGIN
      UPDATE entity_categories SET
        level = COALESCE(p_level, level),
        is_primary = COALESCE(p_is_primary, is_primary),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = p_id;

      SELECT ROW_COUNT() AS affected_rows;
    END;
  `);

  // DeleteEntityCategoryById - Delete an entity category by ID
  await sequelize.query('DROP PROCEDURE IF EXISTS DeleteEntityCategoryById;');
  await sequelize.query(`
    CREATE PROCEDURE DeleteEntityCategoryById(IN p_id INT)
    BEGIN
      DELETE FROM entity_categories WHERE id = p_id;
      SELECT ROW_COUNT() AS affected_rows;
    END;
  `);
}

/**
 * Drop entity category stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function dropEntityCategoryProcedures(sequelize) {
  await sequelize.query('DROP PROCEDURE IF EXISTS GetEntityCategories;');
  await sequelize.query('DROP PROCEDURE IF EXISTS AddEntityCategory;');
  await sequelize.query('DROP PROCEDURE IF EXISTS RemoveEntityCategory;');
  await sequelize.query('DROP PROCEDURE IF EXISTS SetEntityPrimaryCategory;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetEntitiesByCategory;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetAllEntityCategories;');
  await sequelize.query('DROP PROCEDURE IF EXISTS UpdateEntityCategory;');
  await sequelize.query('DROP PROCEDURE IF EXISTS DeleteEntityCategoryById;');
}
