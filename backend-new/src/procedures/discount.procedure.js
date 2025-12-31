/**
 * Discount Stored Procedures
 * Extracted from 20250921000002-discount-management-tables.cjs
 */

/**
 * Create all discount-related stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function createDiscountProcedures(sequelize) {
  await sequelize.query(`
    CREATE PROCEDURE InsertDiscount(
      IN p_business_id CHAR(64),
      IN p_name VARCHAR(100),
      IN p_description TEXT,
      IN p_discount_type ENUM('percentage', 'fixed'),
      IN p_value DECIMAL(10, 2),
      IN p_min_purchase DECIMAL(10, 2),
      IN p_max_discount DECIMAL(10, 2),
      IN p_start_date DATETIME,
      IN p_end_date DATETIME,
      IN p_is_active BOOLEAN,
      IN p_applies_to ENUM('all', 'product', 'category', 'room', 'service')
    )
    BEGIN
      DECLARE new_id CHAR(64);
      SET new_id = UUID();
      INSERT INTO discount (id, business_id, name, description, discount_type, value, min_purchase, max_discount, start_date, end_date, is_active, applies_to)
      VALUES (new_id, p_business_id, p_name, p_description, p_discount_type, p_value, p_min_purchase, p_max_discount, p_start_date, p_end_date, IFNULL(p_is_active, true), IFNULL(p_applies_to, 'all'));
      SELECT * FROM discount WHERE id = new_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetDiscountById(IN p_id CHAR(64))
    BEGIN
      SELECT * FROM discount WHERE id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetDiscountsByBusinessId(IN p_business_id CHAR(64))
    BEGIN
      SELECT * FROM discount WHERE business_id = p_business_id ORDER BY created_at DESC;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetActiveDiscountsByBusinessId(IN p_business_id CHAR(64))
    BEGIN
      SELECT * FROM discount
      WHERE business_id = p_business_id
        AND is_active = true
        AND (start_date IS NULL OR start_date <= NOW())
        AND (end_date IS NULL OR end_date >= NOW())
      ORDER BY created_at DESC;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE UpdateDiscount(
      IN p_id CHAR(64),
      IN p_name VARCHAR(100),
      IN p_description TEXT,
      IN p_discount_type ENUM('percentage', 'fixed'),
      IN p_value DECIMAL(10, 2),
      IN p_min_purchase DECIMAL(10, 2),
      IN p_max_discount DECIMAL(10, 2),
      IN p_start_date DATETIME,
      IN p_end_date DATETIME,
      IN p_is_active BOOLEAN,
      IN p_applies_to ENUM('all', 'product', 'category', 'room', 'service')
    )
    BEGIN
      UPDATE discount SET
        name = IFNULL(p_name, name),
        description = IFNULL(p_description, description),
        discount_type = IFNULL(p_discount_type, discount_type),
        value = IFNULL(p_value, value),
        min_purchase = IFNULL(p_min_purchase, min_purchase),
        max_discount = p_max_discount,
        start_date = p_start_date,
        end_date = p_end_date,
        is_active = IFNULL(p_is_active, is_active),
        applies_to = IFNULL(p_applies_to, applies_to)
      WHERE id = p_id;
      SELECT * FROM discount WHERE id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE DeleteDiscount(IN p_id CHAR(64))
    BEGIN
      DELETE FROM discount WHERE id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE AddDiscountItem(IN p_discount_id CHAR(64), IN p_item_type VARCHAR(20), IN p_item_id VARCHAR(64))
    BEGIN
      INSERT INTO discount_items (discount_id, item_type, item_id)
      VALUES (p_discount_id, p_item_type, p_item_id);
      SELECT * FROM discount_items WHERE discount_id = p_discount_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetDiscountItems(IN p_discount_id CHAR(64))
    BEGIN
      SELECT * FROM discount_items WHERE discount_id = p_discount_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE RemoveDiscountItem(IN p_discount_id CHAR(64), IN p_item_type VARCHAR(20), IN p_item_id VARCHAR(64))
    BEGIN
      DELETE FROM discount_items WHERE discount_id = p_discount_id AND item_type = p_item_type AND item_id = p_item_id;
    END;
  `);
}

/**
 * Drop all discount-related stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function dropDiscountProcedures(sequelize) {
  await sequelize.query('DROP PROCEDURE IF EXISTS InsertDiscount;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetDiscountById;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetDiscountsByBusinessId;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetActiveDiscountsByBusinessId;');
  await sequelize.query('DROP PROCEDURE IF EXISTS UpdateDiscount;');
  await sequelize.query('DROP PROCEDURE IF EXISTS DeleteDiscount;');
  await sequelize.query('DROP PROCEDURE IF EXISTS AddDiscountItem;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetDiscountItems;');
  await sequelize.query('DROP PROCEDURE IF EXISTS RemoveDiscountItem;');
}
