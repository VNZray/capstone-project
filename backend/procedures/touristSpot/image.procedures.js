// Procedures for managing images related to tourist spots.

async function createImageProcedures(knex) {
  // Retrieves all images for a given tourist spot ID.
  await knex.raw(`
    CREATE PROCEDURE GetTouristSpotImages(IN p_tourist_spot_id CHAR(36))
    BEGIN
      SELECT
        id, tourist_spot_id, file_url, file_format, file_size,
        is_primary, alt_text, uploaded_at, updated_at
      FROM tourist_spot_images
      WHERE tourist_spot_id = p_tourist_spot_id
      ORDER BY is_primary DESC, uploaded_at ASC;
    END;
  `);

  // Adds a new image for a tourist spot. If is_primary is true, sets all other images to non-primary.
  await knex.raw(`
    CREATE PROCEDURE AddTouristSpotImage(
      IN p_tourist_spot_id CHAR(36),
      IN p_file_url TEXT,
      IN p_file_format VARCHAR(10),
      IN p_file_size BIGINT,
      IN p_is_primary BOOLEAN,
      IN p_alt_text VARCHAR(255)
    )
    BEGIN
      IF p_is_primary THEN
        UPDATE tourist_spot_images SET is_primary = FALSE WHERE tourist_spot_id = p_tourist_spot_id;
      END IF;
      SET @imgId = UUID();
      INSERT INTO tourist_spot_images (id, tourist_spot_id, file_url, file_format, file_size, is_primary, alt_text)
      VALUES (@imgId, p_tourist_spot_id, p_file_url, p_file_format, p_file_size, p_is_primary, p_alt_text);
      SELECT * FROM tourist_spot_images WHERE id = @imgId;
    END;
  `);

  // Updates an image's primary status and alt text for a tourist spot.
  await knex.raw(`
    CREATE PROCEDURE UpdateTouristSpotImage(
      IN p_tourist_spot_id CHAR(36),
      IN p_image_id CHAR(36),
      IN p_is_primary BOOLEAN,
      IN p_alt_text VARCHAR(255)
    )
    BEGIN
      IF p_is_primary THEN
        UPDATE tourist_spot_images SET is_primary = FALSE WHERE tourist_spot_id = p_tourist_spot_id;
      END IF;
      UPDATE tourist_spot_images
      SET
        is_primary = IFNULL(p_is_primary, is_primary),
        alt_text = IFNULL(p_alt_text, alt_text)
      WHERE id = p_image_id AND tourist_spot_id = p_tourist_spot_id;
      SELECT * FROM tourist_spot_images WHERE id = p_image_id;
    END;
  `);

  // Deletes an image for a tourist spot.
  await knex.raw(`
    CREATE PROCEDURE DeleteTouristSpotImage(
      IN p_tourist_spot_id CHAR(36),
      IN p_image_id CHAR(36)
    )
    BEGIN
      DELETE FROM tourist_spot_images WHERE id = p_image_id AND tourist_spot_id = p_tourist_spot_id;
      SELECT ROW_COUNT() AS affected_rows;
    END;
  `);

  // Sets a specific image as the primary image for a tourist spot.
  await knex.raw(`
    CREATE PROCEDURE SetPrimaryTouristSpotImage(
      IN p_tourist_spot_id CHAR(36),
      IN p_image_id CHAR(36)
    )
    BEGIN
      UPDATE tourist_spot_images SET is_primary = FALSE WHERE tourist_spot_id = p_tourist_spot_id;
      UPDATE tourist_spot_images SET is_primary = TRUE WHERE id = p_image_id AND tourist_spot_id = p_tourist_spot_id;
      SELECT ROW_COUNT() AS affected_rows;
    END;
  `);
}

async function dropImageProcedures(knex) {
  const names = [
    'GetTouristSpotImages', 'AddTouristSpotImage', 'UpdateTouristSpotImage', 'DeleteTouristSpotImage', 'SetPrimaryTouristSpotImage'
  ];
  for (const n of names) {
    await knex.raw(`DROP PROCEDURE IF EXISTS ${n};`);
  }
}

module.exports = { createImageProcedures, dropImageProcedures };
