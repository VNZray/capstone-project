/**
 * Order Stored Procedures
 * Handles order and order item operations
 */

/**
 * Create order-related stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function createOrderProcedures(sequelize) {
  // Insert a new order
  await sequelize.query(`
    CREATE PROCEDURE InsertOrder(
      IN p_id CHAR(64),
      IN p_business_id CHAR(64),
      IN p_user_id CHAR(64),
      IN p_order_number VARCHAR(50),
      IN p_subtotal DECIMAL(10, 2),
      IN p_discount_amount DECIMAL(10, 2),
      IN p_tax_amount DECIMAL(10, 2),
      IN p_total_amount DECIMAL(10, 2),
      IN p_discount_id CHAR(64),
      IN p_pickup_datetime DATETIME,
      IN p_special_instructions TEXT,
      IN p_arrival_code VARCHAR(10)
    )
    BEGIN
      INSERT INTO \`order\` (
        id, business_id, user_id, order_number, subtotal, discount_amount, tax_amount,
        total_amount, discount_id, pickup_datetime, special_instructions, arrival_code
      )
      VALUES (
        p_id, p_business_id, p_user_id, p_order_number, p_subtotal,
        IFNULL(p_discount_amount, 0), IFNULL(p_tax_amount, 0), p_total_amount,
        p_discount_id, p_pickup_datetime, p_special_instructions,
        IFNULL(p_arrival_code, '000000')
      );
      SELECT * FROM \`order\` WHERE id = p_id;
    END;
  `);

  // Get order by ID
  await sequelize.query(`
    CREATE PROCEDURE GetOrderById(IN p_id CHAR(64))
    BEGIN
      SELECT o.*, b.business_name
      FROM \`order\` o
      LEFT JOIN business b ON o.business_id = b.id
      WHERE o.id = p_id;
    END;
  `);

  // Get order by order number
  await sequelize.query(`
    CREATE PROCEDURE GetOrderByOrderNumber(IN p_order_number VARCHAR(50))
    BEGIN
      SELECT o.*, b.business_name
      FROM \`order\` o
      LEFT JOIN business b ON o.business_id = b.id
      WHERE o.order_number = p_order_number;
    END;
  `);

  // Get orders by business ID
  await sequelize.query(`
    CREATE PROCEDURE GetOrdersByBusinessId(IN p_business_id CHAR(64))
    BEGIN
      SELECT o.*
      FROM \`order\` o
      WHERE o.business_id = p_business_id
      ORDER BY o.created_at DESC;
    END;
  `);

  // Get orders by user ID
  await sequelize.query(`
    CREATE PROCEDURE GetOrdersByUserId(IN p_user_id CHAR(64))
    BEGIN
      SELECT o.*, b.business_name
      FROM \`order\` o
      LEFT JOIN business b ON o.business_id = b.id
      WHERE o.user_id = p_user_id
      ORDER BY o.created_at DESC;
    END;
  `);

  // Update order status
  await sequelize.query(`
    CREATE PROCEDURE UpdateOrderStatus(
      IN p_id CHAR(64),
      IN p_status ENUM('pending', 'accepted', 'preparing', 'ready_for_pickup', 'picked_up', 'cancelled_by_user', 'cancelled_by_business', 'failed_payment')
    )
    BEGIN
      UPDATE \`order\` SET status = p_status, updated_at = CURRENT_TIMESTAMP WHERE id = p_id;
      SELECT * FROM \`order\` WHERE id = p_id;
    END;
  `);

  // Insert order item
  await sequelize.query(`
    CREATE PROCEDURE InsertOrderItem(
      IN p_id CHAR(64),
      IN p_order_id CHAR(64),
      IN p_product_id CHAR(64),
      IN p_quantity INT,
      IN p_unit_price DECIMAL(10, 2),
      IN p_total_price DECIMAL(10, 2),
      IN p_special_requests TEXT
    )
    BEGIN
      INSERT INTO order_item (id, order_id, product_id, quantity, unit_price, total_price, special_requests)
      VALUES (p_id, p_order_id, p_product_id, p_quantity, p_unit_price, p_total_price, p_special_requests);
      SELECT * FROM order_item WHERE id = p_id;
    END;
  `);

  // Get order items by order ID
  await sequelize.query(`
    CREATE PROCEDURE GetOrderItemsByOrderId(IN p_order_id CHAR(64))
    BEGIN
      SELECT oi.*, p.name AS product_name
      FROM order_item oi
      LEFT JOIN product p ON oi.product_id = p.id
      WHERE oi.order_id = p_order_id;
    END;
  `);
}

/**
 * Drop order-related stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function dropOrderProcedures(sequelize) {
  const procedures = [
    'InsertOrder',
    'GetOrderById',
    'GetOrderByOrderNumber',
    'GetOrdersByBusinessId',
    'GetOrdersByUserId',
    'UpdateOrderStatus',
    'InsertOrderItem',
    'GetOrderItemsByOrderId'
  ];

  for (const proc of procedures) {
    await sequelize.query(`DROP PROCEDURE IF EXISTS ${proc};`);
  }
}
