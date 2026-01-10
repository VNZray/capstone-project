// Categories-related procedures
// Procedures for managing tourist spot categories using new hierarchical categories system.

async function createCategoriesProcedures(knex) {

  // Note: GetCategoryTreeDepth function is created in the main hierarchical_categories migration
  // It's used to compute tree depth dynamically

  // Retrieves all categories for a given tourist spot ID using entity_categories.
  await knex.raw(`
    CREATE PROCEDURE GetTouristSpotCategories(IN p_id CHAR(36))
    BEGIN
      SELECT
        c.id,
        c.title AS category,
        c.alias,
        c.parent_category,
        GetCategoryTreeDepth(c.id) AS level,
        ec.is_primary
      FROM entity_categories ec
      JOIN categories c ON ec.category_id = c.id
      WHERE ec.entity_id = p_id AND ec.entity_type = 'tourist_spot'
      ORDER BY ec.is_primary DESC, c.sort_order, c.title ASC;
    END;
  `);

  // Retrieves all categories applicable to tourist spots from the new hierarchical system.
  await knex.raw(`
    CREATE PROCEDURE GetTouristSpotCategoriesAndTypes()
    BEGIN
      -- Return all root categories (level 1 = no parent) applicable to tourist spots
      SELECT id, alias, title, description, applicable_to, status, sort_order, 1 AS level
      FROM categories
      WHERE parent_category IS NULL
        AND status = 'active'
        AND (applicable_to LIKE '%tourist_spot%' OR applicable_to = 'all')
      ORDER BY sort_order, title ASC;

      -- Return all subcategories (has parent) applicable to tourist spots
      SELECT c.id, c.alias, c.title, c.description, c.parent_category, c.applicable_to, c.status, c.sort_order,
             GetCategoryTreeDepth(c.id) AS level,
             pc.title AS parent_title
      FROM categories c
      LEFT JOIN categories pc ON c.parent_category = pc.id
      WHERE c.parent_category IS NOT NULL
        AND c.status = 'active'
        AND (c.applicable_to LIKE '%tourist_spot%' OR c.applicable_to = 'all')
      ORDER BY GetCategoryTreeDepth(c.id), c.sort_order, c.title ASC;
    END;
  `);

  // Retrieves only the category IDs for a given tourist spot ID using entity_categories.
  await knex.raw(`
    CREATE PROCEDURE GetTouristSpotCategoryIds(IN p_id CHAR(36))
    BEGIN
      SELECT category_id
      FROM entity_categories
      WHERE entity_id = p_id AND entity_type = 'tourist_spot';
    END;
  `);

  // Deletes all categories associated with a given tourist spot ID from entity_categories.
  await knex.raw(`
    CREATE PROCEDURE DeleteCategoriesByTouristSpot(IN p_id CHAR(36))
    BEGIN
      DELETE FROM entity_categories
      WHERE entity_id = p_id AND entity_type = 'tourist_spot';
    END;
  `);

  // Inserts a new category for a given tourist spot using entity_categories.
  await knex.raw(`
    CREATE PROCEDURE InsertTouristSpotCategory(
      IN p_id CHAR(36),
      IN p_category_id INT,
      IN p_is_primary BOOLEAN
    )
    BEGIN
      INSERT INTO entity_categories (entity_id, entity_type, category_id, level, is_primary)
      VALUES (p_id, 'tourist_spot', p_category_id, 1, COALESCE(p_is_primary, false))
      ON DUPLICATE KEY UPDATE
        is_primary = COALESCE(p_is_primary, is_primary),
        updated_at = CURRENT_TIMESTAMP;
    END;
  `);

  // Updates direct fields of a tourist spot
  await knex.raw(`
    CREATE PROCEDURE UpdateTouristSpotDirectFields(
      IN p_spot_id CHAR(36),
      IN p_latitude DECIMAL(10,8),
      IN p_longitude DECIMAL(11,8),
      IN p_contact_phone VARCHAR(32),
      IN p_contact_email VARCHAR(128),
      IN p_website VARCHAR(255),
      IN p_entry_fee DECIMAL(10,2),
      IN p_spot_status VARCHAR(32)
      )
      BEGIN
          UPDATE tourist_spots
          SET
        latitude = IFNULL(NULLIF(p_latitude, 0), latitude),
        longitude = IFNULL(NULLIF(p_longitude, 0), longitude),
        contact_phone = IFNULL(NULLIF(p_contact_phone, ''), contact_phone),
        contact_email = IFNULL(NULLIF(p_contact_email, ''), contact_email),
        website = IFNULL(NULLIF(p_website, ''), website),
        entry_fee = IFNULL(p_entry_fee, entry_fee),
        spot_status = IFNULL(NULLIF(p_spot_status, ''), spot_status)
      WHERE id = p_spot_id;
      END;
    `);
}

async function dropCategoriesProcedures(knex) {
  const procedures = [
    'GetTouristSpotCategoriesAndTypes', 'GetTouristSpotCategories', 'GetTouristSpotCategoryIds', 'DeleteCategoriesByTouristSpot', 'InsertTouristSpotCategory', 'UpdateTouristSpotDirectFields'
  ];
  for (const n of procedures) {
    await knex.raw(`DROP PROCEDURE IF EXISTS ${n};`);
  }
  // Note: GetCategoryTreeDepth function is managed by the main hierarchical_categories migration
}

module.exports = { createCategoriesProcedures, dropCategoriesProcedures };
