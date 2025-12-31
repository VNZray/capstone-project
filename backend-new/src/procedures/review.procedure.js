/**
 * Review and Rating Stored Procedures
 * Handles review, rating and reply operations
 */

/**
 * Create review-related stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function createReviewProcedures(sequelize) {
  await sequelize.query(`
    CREATE PROCEDURE InsertReviewAndRating(
      IN p_id CHAR(64),
      IN p_review_type ENUM('Accommodation', 'Room', 'Shop', 'Event', 'Tourist Spot', 'Product', 'Service'),
      IN p_review_type_id CHAR(64),
      IN p_rating TINYINT,
      IN p_message TEXT,
      IN p_tourist_id CHAR(64)
    )
    BEGIN
      INSERT INTO review_and_rating (id, review_type, review_type_id, rating, message, tourist_id)
      VALUES (p_id, p_review_type, p_review_type_id, p_rating, p_message, p_tourist_id);
      SELECT * FROM review_and_rating WHERE id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetReviewAndRatingById(IN p_id CHAR(64))
    BEGIN
      SELECT r.*, t.first_name AS tourist_first_name, t.last_name AS tourist_last_name
      FROM review_and_rating r
      LEFT JOIN tourist t ON r.tourist_id = t.id
      WHERE r.id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetReviewsByTypeAndId(IN p_review_type VARCHAR(20), IN p_review_type_id CHAR(64))
    BEGIN
      SELECT r.*, t.first_name AS tourist_first_name, t.last_name AS tourist_last_name
      FROM review_and_rating r
      LEFT JOIN tourist t ON r.tourist_id = t.id
      WHERE r.review_type = p_review_type AND r.review_type_id = p_review_type_id
      ORDER BY r.created_at DESC;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetReviewsByTouristId(IN p_tourist_id CHAR(64))
    BEGIN
      SELECT * FROM review_and_rating WHERE tourist_id = p_tourist_id ORDER BY created_at DESC;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE UpdateReviewAndRating(
      IN p_id CHAR(64),
      IN p_rating TINYINT,
      IN p_message TEXT
    )
    BEGIN
      UPDATE review_and_rating SET
        rating = IFNULL(p_rating, rating),
        message = IFNULL(p_message, message)
      WHERE id = p_id;
      SELECT * FROM review_and_rating WHERE id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE DeleteReviewAndRating(IN p_id CHAR(64))
    BEGIN
      DELETE FROM review_and_rating WHERE id = p_id;
    END;
  `);

  // Reply procedures
  await sequelize.query(`
    CREATE PROCEDURE InsertReply(
      IN p_id CHAR(64),
      IN p_review_and_rating_id CHAR(64),
      IN p_message TEXT,
      IN p_responder_id CHAR(64)
    )
    BEGIN
      INSERT INTO reply (id, review_and_rating_id, message, responder_id)
      VALUES (p_id, p_review_and_rating_id, p_message, p_responder_id);
      SELECT * FROM reply WHERE id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetRepliesByReviewId(IN p_review_and_rating_id CHAR(64))
    BEGIN
      SELECT * FROM reply WHERE review_and_rating_id = p_review_and_rating_id ORDER BY created_at ASC;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE UpdateReply(
      IN p_id CHAR(64),
      IN p_message TEXT
    )
    BEGIN
      UPDATE reply SET message = IFNULL(p_message, message) WHERE id = p_id;
      SELECT * FROM reply WHERE id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE DeleteReply(IN p_id CHAR(64))
    BEGIN
      DELETE FROM reply WHERE id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetAverageRatingByTypeAndId(IN p_review_type VARCHAR(20), IN p_review_type_id CHAR(64))
    BEGIN
      SELECT
        COUNT(*) as total_reviews,
        AVG(rating) as average_rating
      FROM review_and_rating
      WHERE review_type = p_review_type AND review_type_id = p_review_type_id;
    END;
  `);
}

/**
 * Drop review-related stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function dropReviewProcedures(sequelize) {
  const procedures = [
    'InsertReviewAndRating',
    'GetReviewAndRatingById',
    'GetReviewsByTypeAndId',
    'GetReviewsByTouristId',
    'UpdateReviewAndRating',
    'DeleteReviewAndRating',
    'InsertReply',
    'GetRepliesByReviewId',
    'UpdateReply',
    'DeleteReply',
    'GetAverageRatingByTypeAndId'
  ];

  for (const proc of procedures) {
    await sequelize.query(`DROP PROCEDURE IF EXISTS ${proc};`);
  }
}
