async function createOrderProcedures(knex) {
  // ==================== ORDERS ====================
  // NOTE: Payment info is now fetched from the payment table via LEFT JOIN
  // Payment table is the single source of truth for payment status and PayMongo references

  // Get all orders with business, user, and payment info
  await knex.raw(`
    CREATE PROCEDURE GetAllOrders()
    BEGIN
      SELECT o.*, 
        b.business_name, 
        u.email as user_email, 
        d.name as discount_name,
        -- Payment info from payment table (single source of truth)
        p.status as payment_status,
        p.payment_method,
        p.paymongo_payment_id,
        p.payment_intent_id as paymongo_payment_intent_id
      FROM \`order\` o 
      LEFT JOIN business b ON o.business_id = b.id 
      LEFT JOIN user u ON o.user_id = u.id 
      LEFT JOIN discount d ON o.discount_id = d.id 
      LEFT JOIN payment p ON p.payment_for = 'order' AND p.payment_for_id = o.id
      ORDER BY o.created_at DESC;
    END;
  `);

  // Get orders by business ID
  // NOTE: Filters out unpaid PayMongo orders (only show after payment confirmation)
  await knex.raw(`
    CREATE PROCEDURE GetOrdersByBusinessId(IN p_businessId CHAR(64))
    BEGIN
      SELECT o.*, 
        u.email as user_email, 
        d.name as discount_name,
        COUNT(DISTINCT oi.id) as item_count,
        -- Payment info from payment table (single source of truth)
        p.status as payment_status,
        p.payment_method,
        p.paymongo_payment_id,
        p.payment_intent_id as paymongo_payment_intent_id
      FROM \`order\` o 
      LEFT JOIN user u ON o.user_id = u.id 
      LEFT JOIN discount d ON o.discount_id = d.id 
      LEFT JOIN order_item oi ON o.id = oi.order_id
      LEFT JOIN payment p ON p.payment_for = 'order' AND p.payment_for_id = o.id
      WHERE o.business_id = p_businessId
        -- Hide PayMongo orders until payment is confirmed (check payment table)
        AND (p.payment_method = 'cash_on_pickup' OR p.status = 'paid')
      GROUP BY o.id
      ORDER BY o.created_at DESC;
    END;
  `);

  // Get orders by user ID
  await knex.raw(`
    CREATE PROCEDURE GetOrdersByUserId(IN p_userId CHAR(64))
    BEGIN
      SELECT o.*, 
        b.business_name, 
        d.name as discount_name,
        COUNT(DISTINCT oi.id) as item_count,
        -- Payment info from payment table (single source of truth)
        p.status as payment_status,
        p.payment_method,
        p.paymongo_payment_id,
        p.payment_intent_id as paymongo_payment_intent_id
      FROM \`order\` o 
      LEFT JOIN business b ON o.business_id = b.id 
      LEFT JOIN discount d ON o.discount_id = d.id 
      LEFT JOIN order_item oi ON o.id = oi.order_id
      LEFT JOIN payment p ON p.payment_for = 'order' AND p.payment_for_id = o.id
      WHERE o.user_id = p_userId
      GROUP BY o.id
      ORDER BY o.created_at DESC;
    END;
  `);

  // Get order by ID with details
  await knex.raw(`
    CREATE PROCEDURE GetOrderById(IN p_orderId CHAR(64))
    BEGIN
      -- Get order details with payment info
      SELECT o.*, 
        b.business_name, 
        b.phone_number as business_phone, 
        u.email as user_email, 
        d.name as discount_name,
        -- Payment info from payment table (single source of truth)
        p.id as payment_id,
        p.status as payment_status,
        p.payment_method,
        p.paymongo_payment_id,
        p.payment_intent_id as paymongo_payment_intent_id,
        p.refund_reference as paymongo_refund_id,
        p.metadata as payment_metadata
      FROM \`order\` o 
      LEFT JOIN business b ON o.business_id = b.id 
      LEFT JOIN user u ON o.user_id = u.id 
      LEFT JOIN discount d ON o.discount_id = d.id 
      LEFT JOIN payment p ON p.payment_for = 'order' AND p.payment_for_id = o.id
      WHERE o.id = p_orderId;
      
      -- Get order items
      SELECT oi.*, p.name as product_name, p.image_url as product_image
      FROM order_item oi 
      LEFT JOIN product p ON oi.product_id = p.id 
      WHERE oi.order_id = p_orderId;
    END;
  `);

  // Insert order with items (complex transaction)
  // NOTE: Payment info (payment_method) is stored in the payment table
  await knex.raw(`
    CREATE PROCEDURE InsertOrder(
      IN p_id CHAR(64),
      IN p_business_id CHAR(64),
      IN p_user_id CHAR(64),
      IN p_order_number VARCHAR(50),
      IN p_subtotal DECIMAL(10,2),
      IN p_discount_amount DECIMAL(10,2),
      IN p_tax_amount DECIMAL(10,2),
      IN p_total_amount DECIMAL(10,2),
      IN p_discount_id CHAR(64),
      IN p_pickup_datetime DATETIME,
      IN p_special_instructions TEXT,
      IN p_arrival_code VARCHAR(10)
    )
    BEGIN
      INSERT INTO \`order\` (
        id, business_id, user_id, order_number, subtotal, discount_amount, tax_amount, 
        total_amount, discount_id, pickup_datetime, special_instructions, arrival_code
      ) VALUES (
        p_id, p_business_id, p_user_id, p_order_number, p_subtotal, p_discount_amount, 
        p_tax_amount, p_total_amount, p_discount_id, p_pickup_datetime, p_special_instructions, 
        p_arrival_code
      );
      
      SELECT o.*, b.business_name, u.email as user_email, d.name as discount_name
      FROM \`order\` o 
      LEFT JOIN business b ON o.business_id = b.id 
      LEFT JOIN user u ON o.user_id = u.id 
      LEFT JOIN discount d ON o.discount_id = d.id 
      WHERE o.id = p_id;
    END;
  `);

  // Insert order item
  await knex.raw(`
    CREATE PROCEDURE InsertOrderItem(
      IN p_id CHAR(64),
      IN p_order_id CHAR(64),
      IN p_product_id CHAR(64),
      IN p_quantity INT,
      IN p_unit_price DECIMAL(10,2),
      IN p_total_price DECIMAL(10,2),
      IN p_special_requests TEXT
    )
    BEGIN
      INSERT INTO order_item (
        id, order_id, product_id, quantity, unit_price, total_price, special_requests
      ) VALUES (
        p_id, p_order_id, p_product_id, p_quantity, p_unit_price, p_total_price, p_special_requests
      );
    END;
  `);

  // Update stock for order item with row-level locking to prevent race conditions
  await knex.raw(`
    CREATE PROCEDURE UpdateStockForOrder(
      IN p_product_id CHAR(64),
      IN p_quantity INT,
      IN p_order_number VARCHAR(50),
      IN p_user_id CHAR(64),
      IN p_history_id CHAR(64)
    )
    BEGIN
      DECLARE current_stock_val INT DEFAULT 0;
      DECLARE new_stock_val INT DEFAULT 0;
      
      -- Use SELECT FOR UPDATE to lock the row and prevent concurrent modifications
      -- This ensures atomic read-check-update operation
      SELECT current_stock INTO current_stock_val 
      FROM product_stock 
      WHERE product_id = p_product_id 
      FOR UPDATE;
      
      SET new_stock_val = current_stock_val - p_quantity;
      
      -- Double-check stock availability with locked row
      IF new_stock_val < 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Insufficient stock for this product';
      END IF;
      
      -- Update stock atomically while holding the lock
      UPDATE product_stock SET 
        current_stock = new_stock_val,
        updated_at = NOW()
      WHERE product_id = p_product_id;
      
      -- Record stock history
      INSERT INTO stock_history (id, product_id, change_type, quantity_change, previous_stock, new_stock, notes, created_by)
      VALUES (p_history_id, p_product_id, 'sale', -p_quantity, current_stock_val, new_stock_val, CONCAT('Order: ', p_order_number), p_user_id);
      
      -- Update product status based on remaining stock
      UPDATE product SET status = IF(new_stock_val = 0, 'out_of_stock', 'active') WHERE id = p_product_id;
    END;
  `);

  // Update order status
  await knex.raw(`
    CREATE PROCEDURE UpdateOrderStatus(
      IN p_orderId CHAR(64),
      IN p_status ENUM('pending', 'accepted', 'preparing', 'ready_for_pickup', 'picked_up', 'cancelled_by_user', 'cancelled_by_business', 'failed_payment')
    )
    BEGIN
      UPDATE \`order\` SET 
        status = p_status, 
        updated_at = NOW(),
        confirmed_at = CASE WHEN p_status = 'accepted' THEN NOW() ELSE confirmed_at END,
        preparation_started_at = CASE WHEN p_status = 'preparing' THEN NOW() ELSE preparation_started_at END,
        ready_at = CASE WHEN p_status = 'ready_for_pickup' THEN NOW() ELSE ready_at END,
        picked_up_at = CASE WHEN p_status = 'picked_up' THEN NOW() ELSE picked_up_at END,
        cancelled_at = CASE WHEN p_status IN ('cancelled_by_user', 'cancelled_by_business') THEN NOW() ELSE cancelled_at END
      WHERE id = p_orderId;
      
      SELECT o.*, 
        b.business_name, 
        u.email as user_email,
        p.status as payment_status,
        p.payment_method,
        p.paymongo_payment_id
      FROM \`order\` o 
      LEFT JOIN business b ON o.business_id = b.id 
      LEFT JOIN user u ON o.user_id = u.id 
      LEFT JOIN payment p ON p.payment_for = 'order' AND p.payment_for_id = o.id
      WHERE o.id = p_orderId;
    END;
  `);

  // Update payment status in payment table (single source of truth)
  // NOTE: This updates the payment table, not the order table
  await knex.raw(`
    CREATE PROCEDURE UpdatePaymentStatus(
      IN p_orderId CHAR(64),
      IN p_payment_status ENUM('pending', 'paid', 'failed', 'refunded')
    )
    BEGIN
      -- Update payment table (single source of truth for payment status)
      UPDATE payment 
      SET status = p_payment_status, 
          updated_at = NOW() 
      WHERE payment_for = 'order' AND payment_for_id = p_orderId;
      
      -- Return order with updated payment info
      SELECT o.*, 
        b.business_name, 
        u.email as user_email,
        p.status as payment_status,
        p.payment_method,
        p.paymongo_payment_id
      FROM \`order\` o 
      LEFT JOIN business b ON o.business_id = b.id 
      LEFT JOIN user u ON o.user_id = u.id 
      LEFT JOIN payment p ON p.payment_for = 'order' AND p.payment_for_id = o.id
      WHERE o.id = p_orderId;
    END;
  `);

  // Cancel order with stock restoration
  await knex.raw(`
    CREATE PROCEDURE CancelOrder(
      IN p_orderId CHAR(64),
      IN p_cancellation_reason TEXT,
      IN p_cancelled_by ENUM('user', 'business', 'system')
    )
    BEGIN
      DECLARE done INT DEFAULT FALSE;
      DECLARE v_product_id CHAR(64);
      DECLARE v_quantity INT;
      DECLARE v_order_number VARCHAR(50);
      DECLARE order_status VARCHAR(30);
      
      DECLARE order_items_cursor CURSOR FOR 
        SELECT oi.product_id, oi.quantity, o.order_number 
        FROM order_item oi 
        JOIN \`order\` o ON oi.order_id = o.id 
        WHERE oi.order_id = p_orderId;
      
      DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
      
      -- Check if order can be cancelled
      SELECT status INTO order_status FROM \`order\` WHERE id = p_orderId;
      
      IF order_status LIKE 'cancelled%' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Order is already cancelled';
      ELSEIF order_status = 'picked_up' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot cancel picked up order';
      END IF;
      
      -- Restore stock for each item
      OPEN order_items_cursor;
      read_loop: LOOP
        FETCH order_items_cursor INTO v_product_id, v_quantity, v_order_number;
        IF done THEN
          LEAVE read_loop;
        END IF;
        
        UPDATE product_stock SET current_stock = current_stock + v_quantity WHERE product_id = v_product_id;
        
        INSERT INTO stock_history (id, product_id, change_type, quantity_change, previous_stock, new_stock, notes)
        SELECT UUID(), v_product_id, 'adjustment', v_quantity, current_stock - v_quantity, current_stock, CONCAT('Order cancelled: ', v_order_number)
        FROM product_stock WHERE product_id = v_product_id;
      END LOOP;
      CLOSE order_items_cursor;
      
      -- Note: Discount usage restoration removed
      -- The discount table no longer has current_usage_count column (simplified MVP schema).
      -- Per-product discount stock is tracked in discount_product.current_stock_used.
      -- TODO: If needed, implement per-product discount stock restoration
      
      -- Update order with cancellation details
      UPDATE \`order\` SET 
        status = CASE 
          WHEN p_cancelled_by = 'user' THEN 'cancelled_by_user'
          WHEN p_cancelled_by = 'business' THEN 'cancelled_by_business'
          ELSE 'failed_payment'
        END,
        cancelled_at = NOW(),
        cancelled_by = p_cancelled_by,
        cancellation_reason = p_cancellation_reason,
        updated_at = NOW() 
      WHERE id = p_orderId;
      
      -- Update payment status to failed/refunded if applicable
      UPDATE payment 
      SET status = IF(p_cancelled_by = 'system', 'failed', status),
          updated_at = NOW()
      WHERE payment_for = 'order' AND payment_for_id = p_orderId;
      
      SELECT o.*, 
        b.business_name, 
        u.email as user_email,
        p.status as payment_status,
        p.payment_method,
        p.paymongo_payment_id
      FROM \`order\` o 
      LEFT JOIN business b ON o.business_id = b.id 
      LEFT JOIN user u ON o.user_id = u.id 
      LEFT JOIN payment p ON p.payment_for = 'order' AND p.payment_for_id = o.id
      WHERE o.id = p_orderId;
    END;
  `);

  // Get order statistics for business
  await knex.raw(`
    CREATE PROCEDURE GetOrderStatsByBusiness(
      IN p_businessId CHAR(64),
      IN p_period INT
    )
    BEGIN
      -- Overall statistics
      SELECT 
        COUNT(*) as total_orders,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status = 'accepted' THEN 1 END) as accepted_orders,
        COUNT(CASE WHEN status = 'preparing' THEN 1 END) as preparing_orders,
        COUNT(CASE WHEN status = 'ready_for_pickup' THEN 1 END) as ready_orders,
        COUNT(CASE WHEN status = 'picked_up' THEN 1 END) as completed_orders,
        COUNT(CASE WHEN status LIKE 'cancelled%' THEN 1 END) as cancelled_orders,
        SUM(total_amount) as total_revenue,
        AVG(total_amount) as average_order_value,
        SUM(discount_amount) as total_discounts_given
      FROM \`order\` 
      WHERE business_id = p_businessId 
        AND created_at >= DATE_SUB(NOW(), INTERVAL p_period DAY);
      
      -- Daily statistics
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as order_count,
        SUM(total_amount) as daily_revenue
      FROM \`order\` 
      WHERE business_id = p_businessId 
        AND created_at >= DATE_SUB(NOW(), INTERVAL p_period DAY)
      GROUP BY DATE(created_at)
      ORDER BY date DESC;
      
      -- Popular products
      SELECT 
        p.name as product_name,
        SUM(oi.quantity) as total_quantity,
        COUNT(DISTINCT oi.order_id) as order_count,
        SUM(oi.total_price) as revenue
      FROM order_item oi
      JOIN product p ON oi.product_id = p.id
      JOIN \`order\` o ON oi.order_id = o.id
      WHERE o.business_id = p_businessId 
        AND o.created_at >= DATE_SUB(NOW(), INTERVAL p_period DAY)
        AND o.status NOT LIKE 'cancelled%'
      GROUP BY p.id, p.name
      ORDER BY total_quantity DESC
      LIMIT 10;
    END;
  `);

  // Verify arrival code
  await knex.raw(`
    CREATE PROCEDURE VerifyArrivalCode(
      IN p_businessId CHAR(36),
      IN p_arrivalCode VARCHAR(10)
    )
    BEGIN
      SELECT o.*, 
        u.first_name, 
        u.last_name, 
        u.phone_number as user_phone,
        p.status as payment_status,
        p.payment_method,
        p.paymongo_payment_id
      FROM \`order\` o
      LEFT JOIN user u ON o.user_id = u.id
      LEFT JOIN payment p ON p.payment_for = 'order' AND p.payment_for_id = o.id
      WHERE o.business_id = p_businessId 
        AND o.arrival_code = p_arrivalCode
        AND o.status IN ('accepted', 'preparing', 'ready_for_pickup');
    END;
  `);

  // Mark customer as arrived
  await knex.raw(`
    CREATE PROCEDURE MarkCustomerArrivedForOrder(IN p_orderId CHAR(36))
    BEGIN
      UPDATE \`order\` 
      SET customer_arrived_at = NOW(),
          updated_at = NOW()
      WHERE id = p_orderId;
      
      SELECT o.*, 
        b.business_name, 
        u.email as user_email,
        p.status as payment_status,
        p.payment_method,
        p.paymongo_payment_id
      FROM \`order\` o 
      LEFT JOIN business b ON o.business_id = b.id 
      LEFT JOIN user u ON o.user_id = u.id 
      LEFT JOIN payment p ON p.payment_for = 'order' AND p.payment_for_id = o.id
      WHERE o.id = p_orderId;
    END;
  `);

  // Mark order as ready
  await knex.raw(`
    CREATE PROCEDURE MarkOrderAsReady(IN p_orderId CHAR(36))
    BEGIN
      UPDATE \`order\` 
      SET status = 'ready_for_pickup',
          ready_at = NOW(),
          updated_at = NOW()
      WHERE id = p_orderId;
      
      SELECT o.*, 
        b.business_name, 
        u.email as user_email,
        p.status as payment_status,
        p.payment_method,
        p.paymongo_payment_id
      FROM \`order\` o 
      LEFT JOIN business b ON o.business_id = b.id 
      LEFT JOIN user u ON o.user_id = u.id 
      LEFT JOIN payment p ON p.payment_for = 'order' AND p.payment_for_id = o.id
      WHERE o.id = p_orderId;
    END;
  `);

  // Mark order as picked up
  await knex.raw(`
    CREATE PROCEDURE MarkOrderAsPickedUp(IN p_orderId CHAR(36))
    BEGIN
      UPDATE \`order\` 
      SET status = 'picked_up',
          picked_up_at = NOW(),
          updated_at = NOW()
      WHERE id = p_orderId;
      
      SELECT o.*, 
        b.business_name, 
        u.email as user_email,
        p.status as payment_status,
        p.payment_method,
        p.paymongo_payment_id
      FROM \`order\` o 
      LEFT JOIN business b ON o.business_id = b.id 
      LEFT JOIN user u ON o.user_id = u.id 
      LEFT JOIN payment p ON p.payment_for = 'order' AND p.payment_for_id = o.id
      WHERE o.id = p_orderId;
    END;
  `);
}

async function dropOrderProcedures(knex) {
  await knex.raw("DROP PROCEDURE IF EXISTS GetAllOrders;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetOrdersByBusinessId;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetOrdersByUserId;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetOrderById;");
  await knex.raw("DROP PROCEDURE IF EXISTS InsertOrder;");
  await knex.raw("DROP PROCEDURE IF EXISTS InsertOrderItem;");
  await knex.raw("DROP PROCEDURE IF EXISTS UpdateStockForOrder;");
  await knex.raw("DROP PROCEDURE IF EXISTS UpdateOrderStatus;");
  await knex.raw("DROP PROCEDURE IF EXISTS UpdatePaymentStatus;");
  await knex.raw("DROP PROCEDURE IF EXISTS CancelOrder;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetOrderStatsByBusiness;");
  await knex.raw("DROP PROCEDURE IF EXISTS VerifyArrivalCode;");
  await knex.raw("DROP PROCEDURE IF EXISTS MarkCustomerArrivedForOrder;");
  await knex.raw("DROP PROCEDURE IF EXISTS MarkOrderAsReady;");
  await knex.raw("DROP PROCEDURE IF EXISTS MarkOrderAsPickedUp;");
}

export { createOrderProcedures, dropOrderProcedures };
