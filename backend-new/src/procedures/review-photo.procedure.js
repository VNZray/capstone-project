/**
 * Review Photo Stored Procedures
 * Extracted from migration: 20250927000001-review-photo-table.cjs
 *
 * Procedures:
 * - InsertReviewPhoto: Insert a new review photo
 * - GetReviewPhotosByReviewId: Get all photos for a review
 * - DeleteReviewPhoto: Delete a single review photo
 * - DeleteReviewPhotosByReviewId: Delete all photos for a review
 */

/**
 * Create review photo stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function createReviewPhotoProcedures(sequelize) {
  // InsertReviewPhoto - Insert a new review photo
  await sequelize.query(`
    CREATE PROCEDURE InsertReviewPhoto(
      IN p_review_id CHAR(64),
      IN p_photo_url TEXT,
      IN p_caption VARCHAR(255)
    )
    BEGIN
      DECLARE new_id CHAR(64);
      SET new_id = UUID();
      INSERT INTO review_photo (id, review_id, photo_url, caption)
      VALUES (new_id, p_review_id, p_photo_url, p_caption);
      SELECT * FROM review_photo WHERE id = new_id;
    END;
  `);

  // GetReviewPhotosByReviewId - Get all photos for a review
  await sequelize.query(`
    CREATE PROCEDURE GetReviewPhotosByReviewId(IN p_review_id CHAR(64))
    BEGIN
      SELECT * FROM review_photo WHERE review_id = p_review_id ORDER BY created_at ASC;
    END;
  `);

  // DeleteReviewPhoto - Delete a single review photo
  await sequelize.query(`
    CREATE PROCEDURE DeleteReviewPhoto(IN p_id CHAR(64))
    BEGIN
      DELETE FROM review_photo WHERE id = p_id;
    END;
  `);

  // DeleteReviewPhotosByReviewId - Delete all photos for a review
  await sequelize.query(`
    CREATE PROCEDURE DeleteReviewPhotosByReviewId(IN p_review_id CHAR(64))
    BEGIN
      DELETE FROM review_photo WHERE review_id = p_review_id;
    END;
  `);
}

/**
 * Drop review photo stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function dropReviewPhotoProcedures(sequelize) {
  await sequelize.query('DROP PROCEDURE IF EXISTS InsertReviewPhoto;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetReviewPhotosByReviewId;');
  await sequelize.query('DROP PROCEDURE IF EXISTS DeleteReviewPhoto;');
  await sequelize.query('DROP PROCEDURE IF EXISTS DeleteReviewPhotosByReviewId;');
}
