async function createDiscountProcedures(knex) {
  // ==================== DISCOUNTS ====================

  // Get all discounts with business info
  await knex.raw(`
    CREATE PROCEDURE GetAllDiscounts()
    BEGIN
      SELECT d.*, b.business_name
      FROM discount d
      LEFT JOIN business b ON d.business_id = b.id
      ORDER BY d.created_at DESC;
    END;
  `);

  // Get discounts by business ID with product count
  await knex.raw(`
    CREATE PROCEDURE GetDiscountsByBusinessId(IN p_businessId CHAR(64))
    BEGIN
      SELECT d.*, COUNT(dp.product_id) as applicable_products_count
      FROM discount d
      LEFT JOIN discount_product dp ON d.id = dp.discount_id
      WHERE d.business_id = p_businessId
      GROUP BY d.id
      ORDER BY d.start_datetime DESC;
    END;
  `);

  // Get active discounts by business ID
  await knex.raw(`
    CREATE PROCEDURE GetActiveDiscountsByBusinessId(IN p_businessId CHAR(64))
    BEGIN
      SELECT d.*, COUNT(dp.product_id) as applicable_products_count
      FROM discount d
      LEFT JOIN discount_product dp ON d.id = dp.discount_id
      WHERE d.business_id = p_businessId
        AND d.status = 'active'
        AND d.start_datetime <= NOW()
        AND (d.end_datetime IS NULL OR d.end_datetime >= NOW())
      GROUP BY d.id
      ORDER BY d.start_datetime ASC;
    END;
  `);

  // Get discount by ID with applicable products (including stock and purchase limits)
  await knex.raw(`
    CREATE PROCEDURE GetDiscountById(IN p_discountId CHAR(64))
    BEGIN
      SELECT d.*, b.business_name
      FROM discount d
      LEFT JOIN business b ON d.business_id = b.id
      WHERE d.id = p_discountId;

      SELECT p.id, p.name, p.price, p.image_url,
             dp.discounted_price, dp.stock_limit, dp.current_stock_used, dp.purchase_limit
      FROM discount_product dp
      JOIN product p ON dp.product_id = p.id
      WHERE dp.discount_id = p_discountId;
    END;
  `);

  // Insert discount with simplified structure (removed discount_value, usage_limit)
  await knex.raw(`
    CREATE PROCEDURE InsertDiscount(
      IN p_id CHAR(64),
      IN p_business_id CHAR(64),
      IN p_name VARCHAR(255),
      IN p_description TEXT,
      IN p_start_datetime TIMESTAMP,
      IN p_end_datetime TIMESTAMP,
      IN p_status ENUM('active', 'inactive', 'expired', 'paused')
    )
    BEGIN
      INSERT INTO discount (
        id, business_id, name, description,
        start_datetime, end_datetime, status
      ) VALUES (
        p_id, p_business_id, p_name, p_description,
        p_start_datetime, p_end_datetime, IFNULL(p_status, 'active')
      );

      SELECT d.*, b.business_name
      FROM discount d
      LEFT JOIN business b ON d.business_id = b.id
      WHERE d.id = p_id;
    END;
  `);

  // Insert discount product association with stock and purchase limits
  await knex.raw(`
    CREATE PROCEDURE InsertDiscountProduct(
      IN p_id CHAR(64),
      IN p_discount_id CHAR(64),
      IN p_product_id CHAR(64),
      IN p_discounted_price DECIMAL(10,2),
      IN p_stock_limit INT,
      IN p_purchase_limit INT
    )
    BEGIN
      INSERT INTO discount_product (id, discount_id, product_id, discounted_price, stock_limit, purchase_limit)
      VALUES (p_id, p_discount_id, p_product_id, p_discounted_price, p_stock_limit, p_purchase_limit);
    END;
  `);

  // Delete discount products for a discount
  await knex.raw(`
    CREATE PROCEDURE DeleteDiscountProducts(IN p_discountId CHAR(64))
    BEGIN
      DELETE FROM discount_product WHERE discount_id = p_discountId;
    END;
  `);

  // Update discount (simplified structure - removed discount_value, usage_limit)
  await knex.raw(`
    CREATE PROCEDURE UpdateDiscount(
      IN p_id CHAR(64),
      IN p_name VARCHAR(255),
      IN p_description TEXT,
      IN p_start_datetime TIMESTAMP,
      IN p_end_datetime TIMESTAMP,
      IN p_status ENUM('active', 'inactive', 'expired', 'paused')
    )
    BEGIN
      UPDATE discount SET
        name = IFNULL(p_name, name),
        description = IFNULL(p_description, description),
        start_datetime = IFNULL(p_start_datetime, start_datetime),
        end_datetime = IFNULL(p_end_datetime, end_datetime),
        status = IFNULL(p_status, status),
        updated_at = NOW()
      WHERE id = p_id;

      SELECT d.*, b.business_name
      FROM discount d
      LEFT JOIN business b ON d.business_id = b.id
      WHERE d.id = p_id;
    END;
  `);

  // Delete discount
  await knex.raw(`
    CREATE PROCEDURE DeleteDiscount(IN p_discountId CHAR(64))
    BEGIN
      DECLARE order_count INT DEFAULT 0;

      SELECT COUNT(*) INTO order_count FROM \`order\` WHERE discount_id = p_discountId;

      IF order_count > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot delete discount that has been used in orders';
      ELSE
        DELETE FROM discount WHERE id = p_discountId;
      END IF;
    END;
  `);

  // Validate discount for order (simplified - removed usage_limit check)
  await knex.raw(`
    CREATE PROCEDURE ValidateDiscount(
      IN p_discountId CHAR(64),
      IN p_order_total DECIMAL(10,2),
      IN p_user_id CHAR(64)
    )
    BEGIN
      DECLARE discount_available INT DEFAULT 0;

      -- Check if discount is available
      SELECT COUNT(*) INTO discount_available
      FROM discount
      WHERE id = p_discountId
        AND status = 'active'
        AND start_datetime <= NOW()
        AND (end_datetime IS NULL OR end_datetime >= NOW());

      IF discount_available = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Discount is not available or conditions not met';
      END IF;

      -- Return discount details for calculation
      SELECT * FROM discount WHERE id = p_discountId;
    END;
  `);

  // Update discount product stock usage
  await knex.raw(`
    CREATE PROCEDURE UpdateDiscountProductStock(
      IN p_discount_id CHAR(64),
      IN p_product_id CHAR(64),
      IN p_quantity INT
    )
    BEGIN
      UPDATE discount_product
      SET current_stock_used = current_stock_used + p_quantity
      WHERE discount_id = p_discount_id AND product_id = p_product_id;
    END;
  `);

  // Batch update discount products (for setting stock and purchase limits)
  await knex.raw(`
    CREATE PROCEDURE BatchUpdateDiscountProducts(
      IN p_discount_id CHAR(64),
      IN p_stock_limit INT,
      IN p_purchase_limit INT
    )
    BEGIN
      UPDATE discount_product
      SET
        stock_limit = p_stock_limit,
        purchase_limit = p_purchase_limit
      WHERE discount_id = p_discount_id;
    END;
  `);

  // Get discount statistics
  await knex.raw(`
    CREATE PROCEDURE GetDiscountStats(IN p_discountId CHAR(64))
    BEGIN
      -- Get discount details
      SELECT * FROM discount WHERE id = p_discountId;

      -- Get usage statistics
      SELECT
        COUNT(*) as total_orders,
        SUM(discount_amount) as total_discount_given,
        SUM(total_amount) as total_revenue
      FROM \`order\`
      WHERE discount_id = p_discountId;

      -- Get recent orders
      SELECT o.id, o.order_number, o.total_amount, o.discount_amount, o.created_at, u.email as user_email
      FROM \`order\` o
      LEFT JOIN user u ON o.user_id = u.id
      WHERE o.discount_id = p_discountId
      ORDER BY o.created_at DESC
      LIMIT 10;
    END;
  `);

  // Update expired discounts - automatically mark discounts as 'expired' if end_datetime has passed
  await knex.raw(`
    CREATE PROCEDURE UpdateExpiredDiscounts()
    BEGIN
      UPDATE discount
      SET status = 'expired', updated_at = NOW()
      WHERE status != 'expired'
        AND end_datetime IS NOT NULL
        AND end_datetime < NOW();

      SELECT ROW_COUNT() as updated_count;
    END;
  `);
}

async function dropDiscountProcedures(knex) {
  await knex.raw("DROP PROCEDURE IF EXISTS GetAllDiscounts;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetDiscountsByBusinessId;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetActiveDiscountsByBusinessId;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetDiscountById;");
  await knex.raw("DROP PROCEDURE IF EXISTS InsertDiscount;");
  await knex.raw("DROP PROCEDURE IF EXISTS InsertDiscountProduct;");
  await knex.raw("DROP PROCEDURE IF EXISTS DeleteDiscountProducts;");
  await knex.raw("DROP PROCEDURE IF EXISTS UpdateDiscount;");
  await knex.raw("DROP PROCEDURE IF EXISTS DeleteDiscount;");
  await knex.raw("DROP PROCEDURE IF EXISTS ValidateDiscount;");
  await knex.raw("DROP PROCEDURE IF EXISTS UpdateDiscountProductStock;");
  await knex.raw("DROP PROCEDURE IF EXISTS BatchUpdateDiscountProducts;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetDiscountStats;");
  await knex.raw("DROP PROCEDURE IF EXISTS UpdateExpiredDiscounts;");
}

module.exports = { createDiscountProcedures, dropDiscountProcedures };
