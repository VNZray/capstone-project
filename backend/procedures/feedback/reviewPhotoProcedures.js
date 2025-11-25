async function createProcedures(knex) {
  // Get photos by review id
  await knex.raw(`
    CREATE PROCEDURE GetReviewPhotosByReviewId(IN p_review_id CHAR(64))
    BEGIN
      SELECT * FROM review_photo WHERE review_and_rating_id = p_review_id ORDER BY created_at DESC;
    END;
  `);

  // Insert a review photo
  await knex.raw(`
    CREATE PROCEDURE InsertReviewPhoto(
      IN p_id CHAR(64),
      IN p_review_id CHAR(64),
      IN p_photo_url TEXT
    )
    BEGIN
      INSERT INTO review_photo(id, review_and_rating_id, photo_url)
      VALUES (p_id, p_review_id, p_photo_url);
      SELECT * FROM review_photo WHERE id = p_id;
    END;
  `);

  // Delete a review photo
  await knex.raw(`
    CREATE PROCEDURE DeleteReviewPhoto(IN p_id CHAR(64))
    BEGIN
      DELETE FROM review_photo WHERE id = p_id;
    END;
  `);
}

async function dropProcedures(knex) {
  await knex.raw("DROP PROCEDURE IF EXISTS GetReviewPhotosByReviewId;");
  await knex.raw("DROP PROCEDURE IF EXISTS InsertReviewPhoto;");
  await knex.raw("DROP PROCEDURE IF EXISTS DeleteReviewPhoto;");
}

export { createProcedures, dropProcedures };
