/**
 * Product Stored Procedures
 * CRUD operations for product, product_stock, and stock_history tables
 */

/**
 * Create all product stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function createProductProcedures(sequelize) {
  // GetAllProducts - Get all products with category and business info
  await sequelize.query(`
    CREATE PROCEDURE GetAllProducts()
    BEGIN
      SELECT
        p.*,
        sc_primary.name AS primary_category_name,
        b.business_name,
        (
          SELECT COALESCE(
            CONCAT('[', GROUP_CONCAT(
              JSON_OBJECT(
                'id', pcm.category_id,
                'name', sc.name,
                'is_primary', pcm.is_primary,
                'display_order', sc.display_order
              ) SEPARATOR ','
            ), ']'),
            '[]'
          )
          FROM product_category_map pcm
          JOIN shop_category sc ON pcm.category_id = sc.id
          WHERE pcm.product_id = p.id
        ) AS categories
      FROM product p
      LEFT JOIN shop_category sc_primary ON p.shop_category_id = sc_primary.id
      LEFT JOIN business b ON p.business_id = b.id
      ORDER BY p.created_at DESC;
    END;
  `);

  // GetProductsByBusinessId - Get products for a specific business
  await sequelize.query(`
    CREATE PROCEDURE GetProductsByBusinessId(IN p_businessId CHAR(64))
    BEGIN
      SELECT
        p.*,
        sc_primary.name AS primary_category_name,
        ps.current_stock,
        ps.stock_unit,
        (
          SELECT COALESCE(
            CONCAT('[', GROUP_CONCAT(
              JSON_OBJECT(
                'id', pcm.category_id,
                'name', sc.name,
                'is_primary', pcm.is_primary,
                'display_order', sc.display_order
              ) SEPARATOR ','
            ), ']'),
            '[]'
          )
          FROM product_category_map pcm
          JOIN shop_category sc ON pcm.category_id = sc.id
          WHERE pcm.product_id = p.id
        ) AS categories
      FROM product p
      LEFT JOIN shop_category sc_primary ON p.shop_category_id = sc_primary.id
      LEFT JOIN product_stock ps ON p.id = ps.product_id
      WHERE p.business_id = p_businessId AND p.status IN ('active', 'out_of_stock')
      ORDER BY p.created_at DESC;
    END;
  `);

  // GetProductsByCategoryId - Get products in a specific category
  await sequelize.query(`
    CREATE PROCEDURE GetProductsByCategoryId(IN p_categoryId CHAR(64))
    BEGIN
      SELECT
        p.*,
        sc_primary.name AS primary_category_name,
        ps.current_stock,
        ps.stock_unit,
        (
          SELECT COALESCE(
            CONCAT('[', GROUP_CONCAT(
              JSON_OBJECT(
                'id', pcm.category_id,
                'name', sc.name,
                'is_primary', pcm.is_primary,
                'display_order', sc.display_order
              ) SEPARATOR ','
            ), ']'),
            '[]'
          )
          FROM product_category_map pcm
          JOIN shop_category sc ON pcm.category_id = sc.id
          WHERE pcm.product_id = p.id
        ) AS categories
      FROM product p
      LEFT JOIN shop_category sc_primary ON p.shop_category_id = sc_primary.id
      LEFT JOIN product_stock ps ON p.id = ps.product_id
      WHERE EXISTS (
        SELECT 1 FROM product_category_map pcm_filter
        WHERE pcm_filter.product_id = p.id AND pcm_filter.category_id = p_categoryId
      )
      AND p.status = 'active'
      ORDER BY p.name;
    END;
  `);

  // GetProductById - Get single product with full details
  await sequelize.query(`
    CREATE PROCEDURE GetProductById(IN p_productId CHAR(64))
    BEGIN
      SELECT
        p.*,
        sc_primary.name AS primary_category_name,
        b.business_name,
        ps.current_stock,
        ps.stock_unit,
        ps.minimum_stock,
        ps.maximum_stock,
        (
          SELECT COALESCE(
            CONCAT('[', GROUP_CONCAT(
              JSON_OBJECT(
                'id', pcm.category_id,
                'name', sc.name,
                'is_primary', pcm.is_primary,
                'display_order', sc.display_order
              ) SEPARATOR ','
            ), ']'),
            '[]'
          )
          FROM product_category_map pcm
          JOIN shop_category sc ON pcm.category_id = sc.id
          WHERE pcm.product_id = p.id
        ) AS categories
      FROM product p
      LEFT JOIN shop_category sc_primary ON p.shop_category_id = sc_primary.id
      LEFT JOIN business b ON p.business_id = b.id
      LEFT JOIN product_stock ps ON p.id = ps.product_id
      WHERE p.id = p_productId;
    END;
  `);

  // InsertProduct - Create a new product with stock entry
  await sequelize.query(`
    CREATE PROCEDURE InsertProduct(
      IN p_id CHAR(64),
      IN p_business_id CHAR(64),
      IN p_shop_category_id CHAR(64),
      IN p_name VARCHAR(255),
      IN p_description TEXT,
      IN p_price DECIMAL(10,2),
      IN p_image_url VARCHAR(500),
      IN p_status ENUM('active', 'inactive', 'out_of_stock'),
      IN p_stock_id CHAR(64)
    )
    BEGIN
      INSERT INTO product (id, business_id, shop_category_id, name, description, price, image_url, status)
      VALUES (p_id, p_business_id, p_shop_category_id, p_name, p_description, p_price, p_image_url, IFNULL(p_status, 'active'));

      INSERT INTO product_stock (id, product_id, current_stock, minimum_stock, stock_unit)
      VALUES (p_stock_id, p_id, 0, 0, 'pieces');

      SELECT p.*, sc.name as category_name, ps.current_stock, ps.stock_unit
      FROM product p
      LEFT JOIN shop_category sc ON p.shop_category_id = sc.id
      LEFT JOIN product_stock ps ON p.id = ps.product_id
      WHERE p.id = p_id;
    END;
  `);

  // UpdateProduct - Update product details
  await sequelize.query(`
    CREATE PROCEDURE UpdateProduct(
      IN p_id CHAR(64),
      IN p_shop_category_id CHAR(64),
      IN p_name VARCHAR(255),
      IN p_description TEXT,
      IN p_price DECIMAL(10,2),
      IN p_image_url VARCHAR(500),
      IN p_status ENUM('active', 'inactive', 'out_of_stock')
    )
    BEGIN
      UPDATE product SET
        shop_category_id = IFNULL(p_shop_category_id, shop_category_id),
        name = IFNULL(p_name, name),
        description = IFNULL(p_description, description),
        price = IFNULL(p_price, price),
        image_url = IFNULL(p_image_url, image_url),
        status = IFNULL(p_status, status),
        updated_at = NOW()
      WHERE id = p_id;

      SELECT p.*, sc.name as category_name, ps.current_stock, ps.stock_unit
      FROM product p
      LEFT JOIN shop_category sc ON p.shop_category_id = sc.id
      LEFT JOIN product_stock ps ON p.id = ps.product_id
      WHERE p.id = p_id;
    END;
  `);

  // DeleteProduct - Delete a product with order check
  await sequelize.query(`
    CREATE PROCEDURE DeleteProduct(IN p_productId CHAR(64))
    BEGIN
      DECLARE order_count INT DEFAULT 0;

      SELECT COUNT(*) INTO order_count FROM order_item WHERE product_id = p_productId;

      IF order_count > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot delete product that has been ordered';
      ELSE
        DELETE FROM product WHERE id = p_productId;
      END IF;
    END;
  `);

  // GetProductStock - Get stock information for a product
  await sequelize.query(`
    CREATE PROCEDURE GetProductStock(IN p_productId CHAR(64))
    BEGIN
      SELECT ps.*, p.name as product_name
      FROM product_stock ps
      LEFT JOIN product p ON ps.product_id = p.id
      WHERE ps.product_id = p_productId;
    END;
  `);

  // UpdateProductStock - Update stock with history tracking
  await sequelize.query(`
    CREATE PROCEDURE UpdateProductStock(
      IN p_productId CHAR(64),
      IN p_quantity_change INT,
      IN p_change_type ENUM('restock', 'sale', 'adjustment', 'expired'),
      IN p_notes TEXT,
      IN p_created_by CHAR(64),
      IN p_history_id CHAR(64)
    )
    BEGIN
      DECLARE current_stock_val INT DEFAULT 0;
      DECLARE new_stock_val INT DEFAULT 0;

      SELECT current_stock INTO current_stock_val FROM product_stock WHERE product_id = p_productId;
      SET new_stock_val = current_stock_val + p_quantity_change;

      IF new_stock_val < 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Insufficient stock for this operation';
      END IF;

      UPDATE product_stock SET
        current_stock = new_stock_val,
        updated_at = NOW()
      WHERE product_id = p_productId;

      INSERT INTO stock_history (id, product_id, change_type, quantity_change, previous_stock, new_stock, notes, created_by)
      VALUES (p_history_id, p_productId, p_change_type, p_quantity_change, current_stock_val, new_stock_val, p_notes, p_created_by);

      UPDATE product SET status = IF(new_stock_val = 0, 'out_of_stock', 'active') WHERE id = p_productId;

      SELECT ps.*, p.name as product_name
      FROM product_stock ps
      LEFT JOIN product p ON ps.product_id = p.id
      WHERE ps.product_id = p_productId;
    END;
  `);

  // GetProductStockHistory - Get stock change history
  await sequelize.query(`
    CREATE PROCEDURE GetProductStockHistory(IN p_productId CHAR(64))
    BEGIN
      SELECT sh.*, u.email as created_by_user
      FROM stock_history sh
      LEFT JOIN user u ON sh.created_by = u.id
      WHERE sh.product_id = p_productId
      ORDER BY sh.created_at DESC;
    END;
  `);
}

/**
 * Drop all product stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function dropProductProcedures(sequelize) {
  await sequelize.query('DROP PROCEDURE IF EXISTS GetAllProducts;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetProductsByBusinessId;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetProductsByCategoryId;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetProductById;');
  await sequelize.query('DROP PROCEDURE IF EXISTS InsertProduct;');
  await sequelize.query('DROP PROCEDURE IF EXISTS UpdateProduct;');
  await sequelize.query('DROP PROCEDURE IF EXISTS DeleteProduct;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetProductStock;');
  await sequelize.query('DROP PROCEDURE IF EXISTS UpdateProductStock;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetProductStockHistory;');
}
