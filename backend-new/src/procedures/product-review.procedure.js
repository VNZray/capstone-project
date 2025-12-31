/**
 * Product Review Stored Procedures
 * Extracted from 20250921000005-product-reviews-table.cjs
 */

/**
 * Create all product review-related stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function createProductReviewProcedures(sequelize) {
  await sequelize.query(`
    CREATE PROCEDURE InsertProductReview(
      IN p_product_id CHAR(64),
      IN p_tourist_id CHAR(64),
      IN p_order_id CHAR(64),
      IN p_rating INT,
      IN p_comment TEXT,
      IN p_is_verified_purchase BOOLEAN
    )
    BEGIN
      DECLARE new_id CHAR(64);
      SET new_id = UUID();
      INSERT INTO product_review (id, product_id, tourist_id, order_id, rating, comment, is_verified_purchase)
      VALUES (new_id, p_product_id, p_tourist_id, p_order_id, p_rating, p_comment, IFNULL(p_is_verified_purchase, false));
      SELECT * FROM product_review WHERE id = new_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetProductReviewById(IN p_id CHAR(64))
    BEGIN
      SELECT pr.*, t.first_name AS tourist_first_name, t.last_name AS tourist_last_name
      FROM product_review pr
      LEFT JOIN tourist t ON pr.tourist_id = t.id
      WHERE pr.id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetProductReviewsByProductId(IN p_product_id CHAR(64))
    BEGIN
      SELECT pr.*, t.first_name AS tourist_first_name, t.last_name AS tourist_last_name
      FROM product_review pr
      LEFT JOIN tourist t ON pr.tourist_id = t.id
      WHERE pr.product_id = p_product_id
      ORDER BY pr.created_at DESC;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetProductAverageRating(IN p_product_id CHAR(64))
    BEGIN
      SELECT AVG(rating) AS average_rating, COUNT(*) AS review_count
      FROM product_review
      WHERE product_id = p_product_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE UpdateProductReview(
      IN p_id CHAR(64),
      IN p_rating INT,
      IN p_comment TEXT
    )
    BEGIN
      UPDATE product_review SET
        rating = IFNULL(p_rating, rating),
        comment = IFNULL(p_comment, comment)
      WHERE id = p_id;
      SELECT * FROM product_review WHERE id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE DeleteProductReview(IN p_id CHAR(64))
    BEGIN
      DELETE FROM product_review WHERE id = p_id;
    END;
  `);
}

/**
 * Drop all product review-related stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function dropProductReviewProcedures(sequelize) {
  await sequelize.query('DROP PROCEDURE IF EXISTS InsertProductReview;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetProductReviewById;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetProductReviewsByProductId;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetProductAverageRating;');
  await sequelize.query('DROP PROCEDURE IF EXISTS UpdateProductReview;');
  await sequelize.query('DROP PROCEDURE IF EXISTS DeleteProductReview;');
}
