async function createReviewAndRatingTable(knex) {
  // Get all reviews
  await knex.raw(`
    CREATE PROCEDURE GetAllReviews()
    BEGIN
      SELECT * FROM review_and_rating ORDER BY created_at DESC;
    END;
  `);

  // Get single review by ID
  await knex.raw(`
    CREATE PROCEDURE GetReviewById(IN p_id CHAR(64))
    BEGIN
      SELECT * FROM review_and_rating WHERE id = p_id;
    END;
  `);

  // Get reviews by pair (review_type, review_type_id)
  await knex.raw(`
    CREATE PROCEDURE GetReviewsByTypeAndEntityId(
      IN p_review_type ENUM('Accommodation','Room','Shop','Event','Tourist Spot','Product','Service'),
      IN p_review_type_id CHAR(64)
    )
    BEGIN
      SELECT *
      FROM review_and_rating
      WHERE review_type = p_review_type
        AND review_type_id = p_review_type_id
      ORDER BY created_at DESC;
    END;
  `);

  // Insert review
  await knex.raw(`
    CREATE PROCEDURE InsertReview(
      IN p_id CHAR(64),
      IN p_review_type ENUM('Accommodation','Room','Shop','Event','Tourist Spot','Product','Service'),
      IN p_review_type_id CHAR(64),
      IN p_rating TINYINT,
      IN p_message TEXT,
      IN p_tourist_id CHAR(64)
    )
    BEGIN
      INSERT INTO review_and_rating(
        id, review_type, review_type_id, rating, message, tourist_id
      ) VALUES (
        p_id, p_review_type, p_review_type_id, p_rating, p_message, p_tourist_id
      );
      SELECT * FROM review_and_rating WHERE id = p_id;
    END;
  `);

  // Update review (partial update supported)
  await knex.raw(`
    CREATE PROCEDURE UpdateReview(
      IN p_id CHAR(64),
      IN p_review_type ENUM('Accommodation','Room','Shop','Event','Tourist Spot','Product','Service'),
      IN p_review_type_id CHAR(64),
      IN p_rating TINYINT,
      IN p_message TEXT
    )
    BEGIN
      UPDATE review_and_rating
      SET
        review_type   = IFNULL(p_review_type, review_type),
        review_type_id= IFNULL(p_review_type_id, review_type_id),
        rating        = IFNULL(p_rating, rating),
        message       = IFNULL(p_message, message)
      WHERE id = p_id;
      SELECT * FROM review_and_rating WHERE id = p_id;
    END;
  `);

  // Delete review
  await knex.raw(`
    CREATE PROCEDURE DeleteReview(IN p_id CHAR(64))
    BEGIN
      DELETE FROM review_and_rating WHERE id = p_id;
    END;
  `);

  // calculate average rating for a given (review_type, review_type_id)
  await knex.raw(`
    CREATE PROCEDURE CalculateAverageRating(
      IN p_review_type ENUM('Accommodation','Room','Shop','Event','Tourist Spot','Product','Service'),
      IN p_review_type_id CHAR(64)
    )
    BEGIN
      SELECT AVG(rating) AS average_rating
      FROM review_and_rating
      WHERE review_type = p_review_type
        AND review_type_id = p_review_type_id;
    END;
  `);

  // calculate total number of reviews for a given (review_type, review_type_id)
  await knex.raw(`
    CREATE PROCEDURE CalculateTotalReviews(
      IN p_review_type ENUM('Accommodation','Room','Shop','Event','Tourist Spot','Product','Service'),
      IN p_review_type_id CHAR(64)
    )
    BEGIN
      SELECT COUNT(*) AS total_reviews
      FROM review_and_rating
      WHERE review_type = p_review_type
        AND review_type_id = p_review_type_id;
    END;
  `);
}

async function dropReviewAndRatingTable(knex) {
  await knex.raw("DROP PROCEDURE IF EXISTS GetAllReviews;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetReviewById;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetReviewsByTypeAndEntityId;");
  await knex.raw("DROP PROCEDURE IF EXISTS InsertReview;");
  await knex.raw("DROP PROCEDURE IF EXISTS UpdateReview;");
  await knex.raw("DROP PROCEDURE IF EXISTS DeleteReview;");
  await knex.raw("DROP PROCEDURE IF EXISTS CalculateAverageRating;");
  await knex.raw("DROP PROCEDURE IF EXISTS CalculateTotalReviews;");
}

export { createReviewAndRatingTable, dropReviewAndRatingTable };
