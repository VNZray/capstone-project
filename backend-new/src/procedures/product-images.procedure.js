/**
 * Product Images Stored Procedures
 * Extracted from 20251013000001-product-images-table.cjs
 */

/**
 * Create product images stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function createProductImagesProcedures(sequelize) {
  // InsertProductImage - Insert a new product image
  await sequelize.query(`
    CREATE PROCEDURE InsertProductImage(
      IN p_product_id CHAR(64),
      IN p_image_url TEXT,
      IN p_alt_text VARCHAR(255),
      IN p_is_primary BOOLEAN,
      IN p_sort_order INT
    )
    BEGIN
      DECLARE new_id CHAR(64);
      SET new_id = UUID();

      -- If this is set as primary, unset other primary images
      IF p_is_primary = true THEN
        UPDATE product_image SET is_primary = false WHERE product_id = p_product_id;
      END IF;

      INSERT INTO product_image (id, product_id, image_url, alt_text, is_primary, sort_order)
      VALUES (new_id, p_product_id, p_image_url, p_alt_text, IFNULL(p_is_primary, false), IFNULL(p_sort_order, 0));
      SELECT * FROM product_image WHERE id = new_id;
    END;
  `);

  // GetProductImagesByProductId - Get all images for a product
  await sequelize.query(`
    CREATE PROCEDURE GetProductImagesByProductId(IN p_product_id CHAR(64))
    BEGIN
      SELECT * FROM product_image WHERE product_id = p_product_id ORDER BY is_primary DESC, sort_order ASC;
    END;
  `);

  // SetPrimaryProductImage - Set a specific image as primary
  await sequelize.query(`
    CREATE PROCEDURE SetPrimaryProductImage(IN p_id CHAR(64))
    BEGIN
      DECLARE v_product_id CHAR(64);
      SELECT product_id INTO v_product_id FROM product_image WHERE id = p_id;

      UPDATE product_image SET is_primary = false WHERE product_id = v_product_id;
      UPDATE product_image SET is_primary = true WHERE id = p_id;

      SELECT * FROM product_image WHERE id = p_id;
    END;
  `);

  // DeleteProductImage - Delete a product image
  await sequelize.query(`
    CREATE PROCEDURE DeleteProductImage(IN p_id CHAR(64))
    BEGIN
      DELETE FROM product_image WHERE id = p_id;
    END;
  `);

  // UpdateProductImageOrder - Update the sort order of a product image
  await sequelize.query(`
    CREATE PROCEDURE UpdateProductImageOrder(IN p_id CHAR(64), IN p_sort_order INT)
    BEGIN
      UPDATE product_image SET sort_order = p_sort_order WHERE id = p_id;
      SELECT * FROM product_image WHERE id = p_id;
    END;
  `);
}

/**
 * Drop product images stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function dropProductImagesProcedures(sequelize) {
  await sequelize.query('DROP PROCEDURE IF EXISTS InsertProductImage;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetProductImagesByProductId;');
  await sequelize.query('DROP PROCEDURE IF EXISTS SetPrimaryProductImage;');
  await sequelize.query('DROP PROCEDURE IF EXISTS DeleteProductImage;');
  await sequelize.query('DROP PROCEDURE IF EXISTS UpdateProductImageOrder;');
}
