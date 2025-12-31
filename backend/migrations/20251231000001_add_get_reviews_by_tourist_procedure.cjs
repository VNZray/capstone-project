/**
 * Migration to add GetReviewsByTouristId stored procedure
 * This enables fetching all reviews made by a specific tourist
 */

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  // Create stored procedure to get reviews by tourist_id
  await knex.raw(`
    CREATE PROCEDURE GetReviewsByTouristId(IN p_tourist_id CHAR(64))
    BEGIN
      SELECT
        rar.*,
        CASE
          WHEN rar.review_type = 'Room' THEN r.room_number
          WHEN rar.review_type = 'Accommodation' THEN b.business_name
          WHEN rar.review_type = 'Shop' THEN b.business_name
          WHEN rar.review_type = 'Tourist Spot' THEN ts.name
          ELSE NULL
        END AS entity_name,
        CASE
          WHEN rar.review_type IN ('Room', 'Accommodation', 'Shop') THEN b.id
          ELSE NULL
        END AS business_id,
        CASE
          WHEN rar.review_type = 'Room' THEN b.business_name
          ELSE NULL
        END AS accommodation_name
      FROM review_and_rating rar
      LEFT JOIN room r ON rar.review_type = 'Room' AND rar.review_type_id = r.id
      LEFT JOIN business b ON (
        (rar.review_type IN ('Accommodation', 'Shop') AND rar.review_type_id = b.id)
        OR (rar.review_type = 'Room' AND r.business_id = b.id)
      )
      LEFT JOIN tourist_spots ts ON rar.review_type = 'Tourist Spot' AND rar.review_type_id = ts.id
      WHERE rar.tourist_id = p_tourist_id
      ORDER BY rar.created_at DESC;
    END;
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.raw(`DROP PROCEDURE IF EXISTS GetReviewsByTouristId`);
};
