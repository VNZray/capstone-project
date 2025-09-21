// Categories-related procedures
// Procedures for managing tourist spot categories.

export async function createCategoriesProcedures(knex) {
  
  // Retrieves all categories for a given tourist spot ID.
  await knex.raw(`
    CREATE PROCEDURE GetTouristSpotCategories(IN p_id CHAR(36))
    BEGIN
      SELECT 
        c.id,
        c.category,
        c.type_id
      FROM tourist_spot_categories tsc
      JOIN category c ON tsc.category_id = c.id
      WHERE tsc.tourist_spot_id = p_id
      ORDER BY c.category ASC;
    END;
  `);

  // Retrieves all types and categories (filtered by type_id = 4) for tourist spots.
  await knex.raw(`
    CREATE PROCEDURE GetTouristSpotCategoriesAndTypes()
    BEGIN
      SELECT * FROM type ORDER BY type ASC;
      SELECT c.* 
      FROM category c 
      INNER JOIN type t ON c.type_id = t.id 
      WHERE t.id = 4 
      ORDER BY c.category ASC;
    END;
  `);

  // Retrieves only the category IDs for a given tourist spot ID.
  await knex.raw(`
    CREATE PROCEDURE GetTouristSpotCategoryIds(IN p_id CHAR(36))
    BEGIN
      SELECT category_id
      FROM tourist_spot_categories
      WHERE tourist_spot_id = p_id;
    END;
  `);

  // Deletes all categories associated with a given tourist spot ID.
  await knex.raw(`
    CREATE PROCEDURE DeleteCategoriesByTouristSpot(IN p_id CHAR(36))
    BEGIN
      DELETE FROM tourist_spot_categories WHERE tourist_spot_id = p_id;
    END;
  `);

  // Inserts a new category for a given tourist spot ID and category ID.
  await knex.raw(`
    CREATE PROCEDURE InsertTouristSpotCategory(IN p_id CHAR(36), IN p_category_id INT)
    BEGIN
      INSERT INTO tourist_spot_categories (id, tourist_spot_id, category_id)
      VALUES (UUID(), p_id, p_category_id);
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

export async function dropCategoriesProcedures(knex) {
  const names = [
    'GetTouristSpotCategoriesAndTypes', 'GetTouristSpotCategories', 'GetTouristSpotCategoryIds', 'DeleteCategoriesByTouristSpot', 'InsertTouristSpotCategory', 'UpdateTouristSpotDirectFields'
  ];
  for (const n of names) {
    await knex.raw(`DROP PROCEDURE IF EXISTS ${n};`);
  }
}
