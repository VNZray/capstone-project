// Categories-related procedures
export async function createCategoriesProcedures(knex) {
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
  await knex.raw(`
    CREATE PROCEDURE GetTouristSpotCategoryIds(IN p_id CHAR(36))
    BEGIN
      SELECT category_id
      FROM tourist_spot_categories
      WHERE tourist_spot_id = p_id;
    END;
  `);
  await knex.raw(`
    CREATE PROCEDURE DeleteCategoriesByTouristSpot(IN p_id CHAR(36))
    BEGIN
      DELETE FROM tourist_spot_categories WHERE tourist_spot_id = p_id;
    END;
  `);
  await knex.raw(`
    CREATE PROCEDURE InsertTouristSpotCategory(IN p_id CHAR(36), IN p_category_id INT)
    BEGIN
      INSERT INTO tourist_spot_categories (id, tourist_spot_id, category_id)
      VALUES (UUID(), p_id, p_category_id);
    END;
  `);
    await knex.raw(`
      CREATE PROCEDURE UpdateTouristSpotDirectFields(
          IN spot_id CHAR(36),
          IN latitude DECIMAL(10,8),
          IN longitude DECIMAL(11,8),
          IN contact_phone VARCHAR(32),
          IN contact_email VARCHAR(128),
          IN website VARCHAR(255),
          IN entry_fee DECIMAL(10,2),
          IN spot_status VARCHAR(32)
      )
      BEGIN
          UPDATE tourist_spots
          SET
              latitude = IFNULL(latitude, latitude),
              longitude = IFNULL(longitude, longitude),
              contact_phone = IFNULL(NULLIF(contact_phone, ''), contact_phone),
              contact_email = IFNULL(NULLIF(contact_email, ''), contact_email),
              website = IFNULL(NULLIF(website, ''), website),
              entry_fee = IFNULL(entry_fee, entry_fee),
              spot_status = IFNULL(NULLIF(spot_status, ''), spot_status)
          WHERE id = spot_id;
      END;
    `);
}

export async function dropCategoriesProcedures(knex) {
  const names = [
    'GetTouristSpotCategoriesAndTypes', 'GetTouristSpotCategories', 'DeleteCategoriesByTouristSpot', 'InsertTouristSpotCategory'
  ];
  for (const n of names) {
    await knex.raw(`DROP PROCEDURE IF EXISTS ${n};`);
  }
}
